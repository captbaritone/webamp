/* libTiMidity is licensed under the terms of the GNU Lesser General
 * Public License: see COPYING for details.
 *
 * Note that the included TiMidity source, based on timidity-0.2i, was
 * originally licensed under the GPL, but the author extended it so it
 * can also be used separately under the GNU LGPL or the Perl Artistic
 * License: see the notice by Tuukka Toivonen as it appears on the web
 * at http://ieee.uwaterloo.ca/sca/www.cgs.fi/tt/timidity/ .
 */

/*
 * TiMidity -- Experimental MIDI to WAVE converter
 * Copyright (C) 1995 Tuukka Toivonen <toivonen@clinet.fi>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or (at
 * your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * instrum.c - Code to load and unload GUS-compatible instrument patches.
 */

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#ifdef HAVE_SYS_PARAM_H
#include <sys/param.h>
#endif
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include "timidity_internal.h"
#include "common.h"
#include "instrum.h"
#include "resample.h"
#include "tables.h"

static void free_instrument(MidInstrument *ip)
{
  MidSample *sp;
  int i;
  if (!ip) return;
  if (ip->sample) {
    for (i=0; i<ip->samples; i++) {
      sp=&(ip->sample[i]);
      timi_free(sp->data);
    }
    timi_free(ip->sample);
  }
  timi_free(ip);
}

static void free_bank(MidSong *song, int dr, int b)
{
  int i;
  MidToneBank *bank=((dr) ? song->drumset[b] : song->tonebank[b]);
  for (i=0; i<128; i++)
    if (bank->instrument[i])
      {
	if (bank->instrument[i] != MAGIC_LOAD_INSTRUMENT)
	  free_instrument(bank->instrument[i]);
	bank->instrument[i] = NULL;
      }
}

static sint32 convert_envelope_rate(MidSong *song, uint8 rate)
{
  sint32 r;

  r = 3 - ((rate >> 6) & 0x3);
  r *= 3;
  r = (sint32) (rate & 0x3f) << r; /* 6.9 fixed point */

  /* 15.15 fixed point. */
  r = ((r * 44100) / song->rate) * song->control_ratio;

#ifdef FAST_DECAY
  return r << 10;
#else
  return r << 9;
#endif
}

static sint32 convert_envelope_offset(uint8 offset)
{
  /* This is not too good... Can anyone tell me what these values mean?
     Are they GUS-style "exponential" volumes? And what does that mean? */

  /* 15.15 fixed point */
  return offset << (7+15);
}

static sint32 convert_tremolo_sweep(MidSong *song, uint8 sweep)
{
  if (!sweep)
    return 0;

  return
    ((song->control_ratio * SWEEP_TUNING) << SWEEP_SHIFT) /
      (song->rate * sweep);
}

static sint32 convert_vibrato_sweep(MidSong *song, uint8 sweep,
				    sint32 vib_control_ratio)
{
  if (!sweep)
    return 0;

  return
    (sint32) (TIM_FSCALE((double) (vib_control_ratio) * SWEEP_TUNING, SWEEP_SHIFT)
			 / (double)(song->rate * sweep));

  /* this was overflowing with seashore.pat

      ((vib_control_ratio * SWEEP_TUNING) << SWEEP_SHIFT) /
      (song->rate * sweep); */
}

static sint32 convert_tremolo_rate(MidSong *song, uint8 rate)
{
  return
    ((SINE_CYCLE_LENGTH * song->control_ratio * rate) << RATE_SHIFT) /
      (TREMOLO_RATE_TUNING * song->rate);
}

static sint32 convert_vibrato_rate(MidSong *song, uint8 rate)
{
  /* Return a suitable vibrato_control_ratio value */
  return
    (VIBRATO_RATE_TUNING * song->rate) / 
      (rate * 2 * MID_VIBRATO_SAMPLE_INCREMENTS);
}

static void reverse_data(sint16 *sp, sint32 ls, sint32 le)
{
  sint16 s, *ep=sp+le;
  sp+=ls;
  le-=ls;
  le/=2;
  while (le--)
    {
      s=*sp;
      *sp++=*ep;
      *ep--=s;
    }
}

/*
   If panning or note_to_use != -1, it will be used for all samples,
   instead of the sample-specific values in the instrument file. 

   For note_to_use, any value <0 or >127 will be forced to 0.

   For other parameters, 1 means yes, 0 means no, other values are
   undefined.

   TODO: do reverse loops right */
static void load_instrument(MidSong *song, const char *name,
				   MidInstrument **out,
				   int percussion, int panning,
				   int amp, int note_to_use,
				   int strip_loop, int strip_envelope,
				   int strip_tail)
{
#if (TIM_MAXPATH < 256)
#define TMPSIZE 256
#else
#define TMPSIZE TIM_MAXPATH
#endif
  MidInstrument *ip;
  MidSample *sp;
  FILE *fp;
  char tmp[TMPSIZE];
  int i,j;
  static const char *patch_ext[] = PATCH_EXT_LIST;

  *out = NULL;
  if (!name) return;

  /* Open patch file */
  if ((fp=timi_openfile(name)) == NULL)
    {
      /* Try with various extensions */
      for (i=0; patch_ext[i]; i++)
	{
	  if (strlen(name)+strlen(patch_ext[i])<sizeof(tmp))
	    {
	      strcpy(tmp, name);
	      strcat(tmp, patch_ext[i]);
	      if ((fp=timi_openfile(tmp)) != NULL)
		break;
	    }
	}
    }

  if (fp == NULL)
    {
      DEBUG_MSG("Instrument `%s' can't be found.\n", name);
      return;
    }

  DEBUG_MSG("Loading instrument %s\n", tmp);

  /* Read some headers and do cursory sanity checks. There are loads
     of magic offsets. This could be rewritten... */

  if ((239 != fread(tmp, 1, 239, fp)) ||
      (memcmp(tmp, "GF1PATCH110\0ID#000002", 22) &&
       memcmp(tmp, "GF1PATCH100\0ID#000002", 22))) /* don't know what the
						      differences are */
    {
      DEBUG_MSG("%s: not an instrument\n", name);
      goto badpat;
    }

  if (tmp[82] != 1 && tmp[82] != 0)  /* instruments. To some patch makers,
					0 means 1 */
    {
      DEBUG_MSG("Can't handle patches with %d instruments\n", tmp[82]);
      goto badpat;
    }

  if (tmp[151] != 1 && tmp[151] != 0) /* layers. What's a layer? */
    {
      DEBUG_MSG("Can't handle instruments with %d layers\n", tmp[151]);
      goto badpat;
    }

  *out = (MidInstrument *) timi_calloc(sizeof(MidInstrument));
  ip = *out;
  if (!ip) goto nomem;

  ip->samples = tmp[198];
  ip->sample = (MidSample *) timi_calloc(sizeof(MidSample) * ip->samples);
  if (!ip->sample) goto nomem;

  for (i=0; i<ip->samples; i++)
    {
      uint8 fractions;
      sint32 tmplong;
      uint16 tmpshort;
      uint8 tmpchar;

#define READ_CHAR(thing)				\
      if (1 != fread(&tmpchar, 1, 1, fp)) goto badread;	\
      thing = tmpchar;
#define READ_SHORT(thing)				\
      if (1 != fread(&tmpshort, 2, 1, fp)) goto badread;\
      thing = SWAPLE16(tmpshort);
#define READ_LONG(thing)				\
      if (1 != fread(&tmplong, 4, 1, fp)) goto badread;	\
      thing = SWAPLE32(tmplong);

      fseek(fp, 7, SEEK_CUR); /* Skip the wave name */

      if (1 != fread(&fractions, 1, 1, fp))
	goto badread;

      sp=&(ip->sample[i]);

      READ_LONG(sp->data_length);
      READ_LONG(sp->loop_start);
      READ_LONG(sp->loop_end);
      READ_SHORT(sp->sample_rate);
      READ_LONG(sp->low_freq);
      READ_LONG(sp->high_freq);
      READ_LONG(sp->root_freq);
      fseek(fp, 2, SEEK_CUR); /* Why have a "root frequency" and then
				* "tuning"?? */

      READ_CHAR(tmp[0]);

      if (panning==-1)
	sp->panning = (tmp[0] * 8 + 4) & 0x7f;
      else
	sp->panning = (uint8)(panning & 0x7F);

      /* envelope, tremolo, and vibrato */
      if (18 != fread(tmp, 1, 18, fp))
	goto badread;

      if (!tmp[13] || !tmp[14])
	{
	  sp->tremolo_sweep_increment=
	    sp->tremolo_phase_increment=sp->tremolo_depth=0;
	  DEBUG_MSG(" * no tremolo\n");
	}
      else
	{
	  sp->tremolo_sweep_increment=convert_tremolo_sweep(song, tmp[12]);
	  sp->tremolo_phase_increment=convert_tremolo_rate(song, tmp[13]);
	  sp->tremolo_depth=tmp[14];
	  DEBUG_MSG(" * tremolo: sweep %d, phase %d, depth %d\n",
	       sp->tremolo_sweep_increment, sp->tremolo_phase_increment,
	       sp->tremolo_depth);
	}

      if (!tmp[16] || !tmp[17])
	{
	  sp->vibrato_sweep_increment=
	    sp->vibrato_control_ratio=sp->vibrato_depth=0;
	  DEBUG_MSG(" * no vibrato\n");
	}
      else
	{
	  sp->vibrato_control_ratio=convert_vibrato_rate(song, tmp[16]);
	  sp->vibrato_sweep_increment=
	    convert_vibrato_sweep(song, tmp[15], sp->vibrato_control_ratio);
	  sp->vibrato_depth=tmp[17];
	  DEBUG_MSG(" * vibrato: sweep %d, ctl %d, depth %d\n",
	       sp->vibrato_sweep_increment, sp->vibrato_control_ratio,
	       sp->vibrato_depth);
	}

      READ_CHAR(sp->modes);

      fseek(fp, 40, SEEK_CUR); /* skip the useless scale frequency, scale
				  factor (what's it mean?), and reserved
				  space */

      /* Mark this as a fixed-pitch instrument if such a deed is desired. */
      if (note_to_use!=-1)
	sp->note_to_use=(uint8)(note_to_use);
      else
	sp->note_to_use=0;

      /* seashore.pat in the Midia patch set has no Sustain. I don't
	 understand why, and fixing it by adding the Sustain flag to
	 all looped patches probably breaks something else. We do it
	 anyway. */
      if (sp->modes & MODES_LOOPING)
	sp->modes |= MODES_SUSTAIN;

      /* Strip any loops and envelopes we're permitted to */
      if ((strip_loop==1) && 
	  (sp->modes & (MODES_SUSTAIN | MODES_LOOPING | 
			MODES_PINGPONG | MODES_REVERSE)))
	{
	  DEBUG_MSG(" - Removing loop and/or sustain\n");
	  sp->modes &=~(MODES_SUSTAIN | MODES_LOOPING | 
			MODES_PINGPONG | MODES_REVERSE);
	}

      if (strip_envelope==1)
	{
	  if (sp->modes & MODES_ENVELOPE) {
	    DEBUG_MSG(" - Removing envelope\n");
	  }
	  sp->modes &= ~MODES_ENVELOPE;
	}
      else if (strip_envelope != 0)
	{
	  /* Have to make a guess. */
	  if (!(sp->modes & (MODES_LOOPING | MODES_PINGPONG | MODES_REVERSE)))
	    {
	      /* No loop? Then what's there to sustain? No envelope needed
		 either... */
	      sp->modes &= ~(MODES_SUSTAIN|MODES_ENVELOPE);
	      DEBUG_MSG(" - No loop, removing sustain and envelope\n");
	    }
	  else if (!memcmp(tmp, "??????", 6) || tmp[11] >= 100) 
	    {
	      /* Envelope rates all maxed out? Envelope end at a high "offset"?
		 That's a weird envelope. Take it out. */
	      sp->modes &= ~MODES_ENVELOPE;
	      DEBUG_MSG(" - Weirdness, removing envelope\n");
	    }
	  else if (!(sp->modes & MODES_SUSTAIN))
	    {
	      /* No sustain? Then no envelope.  I don't know if this is
		 justified, but patches without sustain usually don't need the
		 envelope either... at least the Gravis ones. They're mostly
		 drums.  I think. */
	      sp->modes &= ~MODES_ENVELOPE;
	      DEBUG_MSG(" - No sustain, removing envelope\n");
	    }
	}

      for (j=0; j<6; j++)
	{
	  sp->envelope_rate[j]=
	    convert_envelope_rate(song, tmp[j]);
	  sp->envelope_offset[j]= 
	    convert_envelope_offset(tmp[6+j]);
	}

      /* Then read the sample data */
      sp->data = (sample_t *) timi_calloc(sp->data_length+4);
      if (!sp->data) goto nomem;

      if (1 != fread(sp->data, sp->data_length, 1, fp))
	goto badread;

      if (!(sp->modes & MODES_16BIT)) /* convert to 16-bit data */
	{
	  sint32 k=sp->data_length;
	  uint8 *cp=(uint8 *)(sp->data);
	  uint16 *tmp16,*new16;
	  sp->data_length *= 2;
	  sp->loop_start *= 2;
	  sp->loop_end *= 2;
	  tmp16 = new16 = (uint16 *) timi_calloc(sp->data_length+4);
	  if (!new16) goto nomem;
	  while (k--)
	    *tmp16++ = (uint16)(*cp++) << 8;
	  timi_free(sp->data);
	  sp->data = (sample_t *)new16;
	}
#if defined(WORDS_BIGENDIAN)
      else
	/* convert to machine byte order */
	{
	  sint32 k=sp->data_length/2;
	  sint16 *tmp16=(sint16 *)sp->data,s;
	  while (k--)
	    {
	      s=SWAPLE16(*tmp16);
	      *tmp16++=s;
	    }
	}
#endif

      if (sp->modes & MODES_UNSIGNED) /* convert to signed data */
	{
	  sint32 k=sp->data_length/2;
	  sint16 *tmp16=(sint16 *)sp->data;
	  while (k--)
	    *tmp16++ ^= 0x8000;
	}

      /* Reverse reverse loops and pass them off as normal loops */
      if (sp->modes & MODES_REVERSE)
	{
	  sint32 t;
	  /* The GUS apparently plays reverse loops by reversing the
	     whole sample. We do the same because the GUS does not SUCK. */

	  DEBUG_MSG("Reverse loop in %s\n", name);
	  reverse_data((sint16 *)sp->data, 0, sp->data_length/2);

	  t=sp->loop_start;
	  sp->loop_start=sp->data_length - sp->loop_end;
	  sp->loop_end=sp->data_length - t;

	  sp->modes &= ~MODES_REVERSE;
	  sp->modes |= MODES_LOOPING; /* just in case */
	}

#ifdef ADJUST_SAMPLE_VOLUMES
      if (amp!=-1)
	sp->volume=(float)((amp) / 100.0);
      else
	{
	  /* Try to determine a volume scaling factor for the sample.
	     This is a very crude adjustment, but things sound more
	     balanced with it. Still, this should be a runtime option. */
	  sint32 k=sp->data_length/2;
	  sint16 maxamp=0,a;
	  sint16 *tmp16=(sint16 *)sp->data;
	  while (k--)
	    {
	      a=*tmp16++;
	      if (a<0) a=-a;
	      if (a>maxamp)
		maxamp=a;
	    }
	  sp->volume=(float)(32768.0 / maxamp);
	  DEBUG_MSG(" * volume comp: %f\n", sp->volume);
	}
#else
      if (amp!=-1)
	sp->volume=(double)(amp) / 100.0;
      else
	sp->volume=1.0;
#endif

      sp->data_length /= 2; /* These are in bytes. Convert into samples. */
      sp->loop_start /= 2;
      sp->loop_end /= 2;

      /* initialize the 2 extra samples at the end (those +4 bytes) */
#if 0 /* no need - alloc'ed using timi_calloc() */
      sp->data[sp->data_length] = sp->data[sp->data_length+1] = 0;
#endif

      /* Then fractional samples */
      sp->data_length <<= FRACTION_BITS;
      sp->loop_start <<= FRACTION_BITS;
      sp->loop_end <<= FRACTION_BITS;

      /* Adjust for fractional loop points. This is a guess. Does anyone
	 know what "fractions" really stands for? */
      sp->loop_start |=
	(fractions & 0x0F) << (FRACTION_BITS-4);
      sp->loop_end |=
	((fractions>>4) & 0x0F) << (FRACTION_BITS-4);

      /* If this instrument will always be played on the same note,
	 and it's not looped, we can resample it now. */
      if (sp->note_to_use && !(sp->modes & MODES_LOOPING)) {
	pre_resample(song, sp);
	if (song->oom) goto fail;
      }

      if (strip_tail==1)
	{
	  /* Let's not really, just say we did. */
	  DEBUG_MSG(" - Stripping tail\n");
	  sp->data_length = sp->loop_end;
	}
    }

  fclose(fp);
  return;

nomem:
  song->oom=1;
  goto fail;
badread:
  DEBUG_MSG("Error reading sample %d\n", i);
fail:
  free_instrument (ip);
badpat:
  fclose(fp);
  *out = NULL;
}

static int fill_bank(MidSong *song, int dr, int b)
{
  int i, errors=0;
  MidToneBank *bank=((dr) ? song->drumset[b] : song->tonebank[b]);
  if (!bank)
    {
      DEBUG_MSG("Huh. Tried to load instruments in non-existent %s %d\n",
	   (dr) ? "drumset" : "tone bank", b);
      return 0;
    }
  for (i=0; i<128; i++)
    {
      if (bank->instrument[i]==MAGIC_LOAD_INSTRUMENT)
	{
	  if (!(bank->tone[i].name))
	    {
	      DEBUG_MSG("No instrument mapped to %s %d, program %d%s\n",
		   (dr)? "drum set" : "tone bank", b, i, 
		   (b!=0) ? "" : " - this instrument will not be heard");
	      if (b!=0)
		{
		  /* Mark the corresponding instrument in the default
		     bank / drumset for loading (if it isn't already) */
		  if (!dr)
		    {
		      if (!(song->tonebank[0]->instrument[i]))
			song->tonebank[0]->instrument[i] =
			  MAGIC_LOAD_INSTRUMENT;
		    }
		  else
		    {
		      if (!(song->drumset[0]->instrument[i]))
			song->drumset[0]->instrument[i] =
			  MAGIC_LOAD_INSTRUMENT;
		    }
		}
	      bank->instrument[i] = NULL;
	      errors++;
	    }
	  else
	    {
	      load_instrument(song,
				     bank->tone[i].name, 
				     &bank->instrument[i],
				     (dr) ? 1 : 0,
				     bank->tone[i].pan,
				     bank->tone[i].amp,
				     (bank->tone[i].note!=-1) ? 
				     bank->tone[i].note :
				     ((dr) ? i : -1),
				     (bank->tone[i].strip_loop!=-1) ?
				     bank->tone[i].strip_loop :
				     ((dr) ? 1 : -1),
				     (bank->tone[i].strip_envelope != -1) ? 
				     bank->tone[i].strip_envelope :
				     ((dr) ? 1 : -1),
				     bank->tone[i].strip_tail);
	      if (!bank->instrument[i]) {
		DEBUG_MSG("Couldn't load instrument %s (%s %d, program %d)\n",
		   bank->tone[i].name,
		   (dr)? "drum set" : "tone bank", b, i);
		errors++;
	      }
	    }
	}
    }
  return errors;
}

int load_missing_instruments(MidSong *song)
{
  int i=128,errors=0;
  while (i--)
    {
      if (song->tonebank[i])
	errors+=fill_bank(song,0,i);
      if (song->drumset[i])
	errors+=fill_bank(song,1,i);
    }
  return errors;
}

void free_instruments(MidSong *song)
{
  int i=128;
  while(i--)
    {
      if (song->tonebank[i])
	free_bank(song, 0, i);
      if (song->drumset[i])
	free_bank(song, 1, i);
    }
}

int set_default_instrument(MidSong *song, const char *name)
{
  load_instrument(song, name, &song->default_instrument, 0, -1, -1, -1, 0, 0, 0);
  if (!song->default_instrument)
    return -1;
  song->default_program = SPECIAL_PROGRAM;
  return 0;
}

