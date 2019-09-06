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
 */

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#ifdef HAVE_SYS_PARAM_H
#include <sys/param.h>
#endif

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "timidity_internal.h"
#include "common.h"
#include "instrum.h"
#include "playmidi.h"
#include "readmidi.h"
#include "output.h"
#include "tables.h"

#include "ospaths.h"

static MidToneBank *master_tonebank[128], *master_drumset[128];

static char def_instr_name[256] = "";

#define MAXWORDS 10
#define MAX_RCFCOUNT 50

/* Quick-and-dirty fgets() replacement. */

static char *timi_fgets(char *s, int size, FILE *fp)
{
    int num_read = 0;
    char *p = s;

    --size;/* so that we nul terminate properly */

    for (; num_read < size; ++p)
    {
	if (fread(p, 1, 1, fp) != 1)
	    break;

	num_read++;

	/* Unlike fgets(), don't store newline. Under Windows/DOS we'll
	 * probably get an extra blank line for every line that's being
	 * read, but that should be ok.
	 */
	if (*p == '\n' || *p == '\r')
	{
	    *p = '\0';
	    return s;
	}
    }

    *p = '\0';

    return (num_read != 0)? s : NULL;
}

static FILE **rcf_fp;

static int read_config_file(const char *name, int rcf_count)
{
  char  tmp[TIM_MAXPATH];
  char *w[MAXWORDS], *cp;
  MidToneBank *bank;
  int i, j, k, line, r, words;

  if (rcf_count >= MAX_RCFCOUNT)
  {
    DEBUG_MSG("Probable source loop in configuration files\n");
    return -1;
  }

  if (!(rcf_fp[rcf_count]=timi_openfile(name)))
    return -1;

  bank = NULL;
  line = 0;
  r = -1; /* start by assuming failure, */

  while (timi_fgets(tmp, sizeof(tmp), rcf_fp[rcf_count]))
  {
    line++;
    words=0;
    w[0]=strtok(tmp, " \t\240");
    if (!w[0]) continue;

    /* Originally the TiMidity++ extensions were prefixed like this */
    if (strcmp(w[0], "#extension") == 0)
    {
      w[0]=strtok(NULL, " \t\240");
      if (!w[0]) continue;
    }

    if (*w[0] == '#')
      continue;

    while (w[words] && *w[words] != '#') {
      if (++words == MAXWORDS) break;
      w[words]=strtok(NULL, " \t\240");
    }

    /* TiMidity++ adds a number of extensions to the config file format.
     * Many of them are completely irrelevant to SDL_sound, but at least
     * we shouldn't choke on them.
     *
     * Unfortunately the documentation for these extensions is often quite
     * vague, gramatically strange or completely absent.
     */
    if (!strcmp(w[0], "comm")      /* "comm" program second        */ ||
        !strcmp(w[0], "HTTPproxy") /* "HTTPproxy" hostname:port    */ ||
        !strcmp(w[0], "FTPproxy")  /* "FTPproxy" hostname:port     */ ||
        !strcmp(w[0], "mailaddr")  /* "mailaddr" your-mail-address */ ||
        !strcmp(w[0], "opt")       /* "opt" timidity-options       */  )
    {
      /* + "comm" sets some kind of comment -- the documentation is too
       *   vague for me to understand at this time.
       * + "HTTPproxy", "FTPproxy" and "mailaddr" are for reading data
       *   over a network, rather than from the file system.
       * + "opt" specifies default options for TiMidity++.
       *
       * Quite useless for us, so they can safely remain no-ops.
       */
    }
    else if (!strcmp(w[0], "timeout")) /* "timeout" program second */
    {
      /* Specifies a timeout value of the program. A number of seconds
       * before TiMidity kills the note. No urgent need for it.
       */
      DEBUG_MSG("FIXME: Implement \"timeout\" in TiMidity config.\n");
    }
    else if (!strcmp(w[0], "copydrumset")  /* "copydrumset" drumset */ ||
	     !strcmp(w[0], "copybank")) /* "copybank" bank       */
    {
      /* Copies all the settings of the specified drumset or bank to
       * the current drumset or bank. May be useful later, but not a
       * high priority.
       */
       DEBUG_MSG("FIXME: Implement \"%s\" in TiMidity config.\n", w[0]);
    }
    else if (!strcmp(w[0], "undef")) /* "undef" progno */
    {
      /* Undefines the tone "progno" of the current tone bank (or
       * drum set?). Not a high priority.
       */
      DEBUG_MSG("FIXME: Implement \"undef\" in TiMidity config.\n");
    }
    else if (!strcmp(w[0], "altassign")) /* "altassign" prog1 prog2 ... */
    {
      /* Sets the alternate assign for drum set. Whatever that's
       * supposed to mean.
       */
      DEBUG_MSG("FIXME: Implement \"altassign\" in TiMidity config.\n");
    }
    else if (!strcmp(w[0], "soundfont") ||
	     !strcmp(w[0], "font"))
    {
      /* "soundfont" sf_file "remove"
       * "soundfont" sf_file ["order=" order] ["cutoff=" cutoff]
       *                     ["reso=" reso] ["amp=" amp]
       * "font" "exclude" bank preset keynote
       * "font" "order" order bank preset keynote
       */
      DEBUG_MSG("FIXME: Implmement \"%s\" in TiMidity config.\n", w[0]);
    }
    else if (!strcmp(w[0], "progbase"))
    {
      /* The documentation for this makes absolutely no sense to me, but
       * apparently it sets some sort of base offset for tone numbers.
       */
      DEBUG_MSG("FIXME: Implement \"progbase\" in TiMidity config.\n");
    }
    else if (!strcmp(w[0], "map")) /* "map" name set1 elem1 set2 elem2 */
    {
      /* This one is used by the "eawpats". Looks like it's used
       * for remapping one instrument to another somehow.
       */
      DEBUG_MSG("FIXME: Implement \"map\" in TiMidity config.\n");
    }
    /* Standard TiMidity config */
    else if (!strcmp(w[0], "dir"))
    {
      if (words < 2)
      {
	DEBUG_MSG("%s: line %d: No directory given\n", name, line);
	goto fail;
      }
      for (i=1; i<words; i++) {
	if (timi_add_pathlist(w[i], strlen(w[i])) < 0)
	  goto fail;
      }
    }
    else if (!strcmp(w[0], "source"))
    {
      if (words < 2)
      {
	DEBUG_MSG("%s: line %d: No file name given\n", name, line);
	goto fail;
      }
      for (i=1; i<words; i++)
      {
	r = read_config_file(w[i], rcf_count + 1);
	if (r != 0)
	  goto fail;
      }
      r = -1; /* not finished yet, */
    }
    else if (!strcmp(w[0], "default"))
    {
      if (words != 2)
      {
	DEBUG_MSG("%s: line %d: Must specify exactly one patch name\n",
		name, line);
	goto fail;
      }
      strncpy(def_instr_name, w[1], 255);
      def_instr_name[255]='\0';
    }
    else if (!strcmp(w[0], "drumset"))
    {
      if (words < 2)
      {
	DEBUG_MSG("%s: line %d: No drum set number given\n", name, line);
	goto fail;
      }
      i=atoi(w[1]);
      if (i<0 || i>127)
      {
	DEBUG_MSG("%s: line %d: Drum set must be between 0 and 127\n",
		name, line);
	goto fail;
      }
      if (!master_drumset[i])
      {
	master_drumset[i] = (MidToneBank *) timi_calloc(sizeof(MidToneBank));
	if (!master_drumset[i]) goto fail;
	master_drumset[i]->tone = (MidToneBankElement *) timi_calloc(128 * sizeof(MidToneBankElement));
	if (!master_drumset[i]->tone) goto fail;
      }
      bank=master_drumset[i];
    }
    else if (!strcmp(w[0], "bank"))
    {
      if (words < 2)
      {
	DEBUG_MSG("%s: line %d: No bank number given\n", name, line);
	goto fail;
      }
      i=atoi(w[1]);
      if (i<0 || i>127)
      {
	DEBUG_MSG("%s: line %d: Tone bank must be between 0 and 127\n",
		name, line);
	goto fail;
      }
      if (!master_tonebank[i])
      {
	master_tonebank[i] = (MidToneBank *) timi_calloc(sizeof(MidToneBank));
	if (!master_tonebank[i]) goto fail;
	master_tonebank[i]->tone = (MidToneBankElement *) timi_calloc(128 * sizeof(MidToneBankElement));
	if (!master_tonebank[i]->tone) goto fail;
      }
      bank=master_tonebank[i];
    }
    else
    {
      if ((words < 2) || (*w[0] < '0' || *w[0] > '9'))
      {
	DEBUG_MSG("%s: line %d: syntax error\n", name, line);
	goto fail;
      }
      i=atoi(w[0]);
      if (i<0 || i>127)
      {
	DEBUG_MSG("%s: line %d: Program must be between 0 and 127\n",
		name, line);
	goto fail;
      }
      if (!bank)
      {
	DEBUG_MSG("%s: line %d: Must specify tone bank or drum set before assignment\n",
		name, line);
	goto fail;
      }
      timi_free(bank->tone[i].name);
      bank->tone[i].name=(char *) timi_calloc(strlen(w[1])+1);
      if (!bank->tone[i].name) goto fail;
      strcpy(bank->tone[i].name,w[1]);
      bank->tone[i].note=bank->tone[i].amp=bank->tone[i].pan=
      bank->tone[i].strip_loop=bank->tone[i].strip_envelope=
      bank->tone[i].strip_tail=-1;

      for (j=2; j<words; j++)
      {
	if (!(cp=strchr(w[j], '=')))
	{
	  DEBUG_MSG("%s: line %d: bad patch option %s\n", name, line, w[j]);
	  goto fail;
	}
	*cp++=0;
	if (!strcmp(w[j], "amp"))
	{
	  k=atoi(cp);
	  if ((k<0 || k>MAX_AMPLIFICATION) || (*cp < '0' || *cp > '9'))
	  {
	    DEBUG_MSG("%s: line %d: amplification must be between 0 and %d\n",
		    name, line, MAX_AMPLIFICATION);
	    goto fail;
	  }
	  bank->tone[i].amp=k;
	}
	else if (!strcmp(w[j], "note"))
	{
	  k=atoi(cp);
	  if ((k<0 || k>127) || (*cp < '0' || *cp > '9'))
	  {
	    DEBUG_MSG("%s: line %d: note must be between 0 and 127\n",
		    name, line);
	    goto fail;
	  }
	  bank->tone[i].note=k;
	}
	else if (!strcmp(w[j], "pan"))
	{
	  if (!strcmp(cp, "center"))
	    k=64;
	  else if (!strcmp(cp, "left"))
	    k=0;
	  else if (!strcmp(cp, "right"))
	    k=127;
	  else
	    k=((atoi(cp)+100) * 100) / 157;
	  if ((k<0 || k>127) || (k==0 && *cp!='-' && (*cp < '0' || *cp > '9')))
	  {
	    DEBUG_MSG("%s: line %d: panning must be left, right, center, or between -100 and 100\n",
		    name, line);
	    goto fail;
	  }
	  bank->tone[i].pan=k;
	}
	else if (!strcmp(w[j], "keep"))
	{
	  if (!strcmp(cp, "env"))
	    bank->tone[i].strip_envelope=0;
	  else if (!strcmp(cp, "loop"))
	    bank->tone[i].strip_loop=0;
	  else
	  {
	    DEBUG_MSG("%s: line %d: keep must be env or loop\n", name, line);
	    goto fail;
	  }
	}
	else if (!strcmp(w[j], "strip"))
	{
	  if (!strcmp(cp, "env"))
	    bank->tone[i].strip_envelope=1;
	  else if (!strcmp(cp, "loop"))
	    bank->tone[i].strip_loop=1;
	  else if (!strcmp(cp, "tail"))
	    bank->tone[i].strip_tail=1;
	  else
	  {
	    DEBUG_MSG("%s: line %d: strip must be env, loop, or tail\n",
		    name, line);
	    goto fail;
	  }
	}
	else
	{
	  DEBUG_MSG("%s: line %d: bad patch option %s\n", name, line, w[j]);
	  goto fail;
	}
      }
    }
  }

  r = 0; /* we're good. */
fail:
  fclose(rcf_fp[rcf_count]);
  rcf_fp[rcf_count] = NULL;
  return r;
}

static int init_alloc_banks (void)
{
  /* Allocate memory for the standard tonebank and drumset */
  master_tonebank[0] = (MidToneBank *) timi_calloc(sizeof(MidToneBank));
  if (!master_tonebank[0]) goto _nomem;
  master_tonebank[0]->tone = (MidToneBankElement *) timi_calloc(128 * sizeof(MidToneBankElement));
  if (!master_tonebank[0]->tone) goto _nomem;

  master_drumset[0] = (MidToneBank *) timi_calloc(sizeof(MidToneBank));
  if (!master_drumset[0]) goto _nomem;
  master_drumset[0]->tone = (MidToneBankElement *) timi_calloc(128 * sizeof(MidToneBankElement));
  if (!master_drumset[0]->tone) goto _nomem;

  return 0;
_nomem:
  DEBUG_MSG("Out of memory\n");
  mid_exit ();
  return -2;
}

static int init_begin_config(const char *cf)
{
  const char *p;

  rcf_fp = (FILE **) timi_calloc(MAX_RCFCOUNT * sizeof(FILE*));
  if (!rcf_fp)
      return -2;
  p = get_last_dirsep(cf);
  if (p != NULL)
      return timi_add_pathlist(cf, p - cf + 1); /* including DIRSEP */

  return 0;
}

static int init_with_config(const char *cf)
{
  int rc;

  rc = init_begin_config(cf);
  if (rc != 0) {
      mid_exit ();
      return rc;
  }
  rc = read_config_file(cf, 0);
  if (rc != 0)
      mid_exit ();
  else {
      timi_free(rcf_fp);
      rcf_fp = NULL;
  }
  return rc;
}

int mid_init_no_config(void)
{
  master_tonebank[0] = NULL;
  master_drumset[0] = NULL;
  rcf_fp = NULL;

  return init_alloc_banks();
}

int mid_init(const char *config_file)
{
  int rc = mid_init_no_config();
  if (rc != 0)
      return rc;

  if (config_file == NULL || *config_file == '\0')
      return init_with_config(TIMIDITY_CFG);

  return init_with_config(config_file);
}

static void do_song_load(MidIStream *stream, MidSongOptions *options, MidSong **out)
{
  MidSong *song;
  int i;

  *out = NULL;
  if (!stream) return;

  if (options->rate < MIN_OUTPUT_RATE || options->rate > MAX_OUTPUT_RATE) {
    DEBUG_MSG("Bad sample rate %d\n",options->rate);
    return;
  }
  if (options->channels != 1 && options->channels != 2) {
    DEBUG_MSG("Bad channels %u\n",options->channels);
    return;
  }
  switch (options->format) {
  case MID_AUDIO_S8:
  case MID_AUDIO_U8:
  case MID_AUDIO_S16LSB:
  case MID_AUDIO_S16MSB:
  case MID_AUDIO_U16LSB:
  case MID_AUDIO_U16MSB: break; /* supported */
  default:
    DEBUG_MSG("Bad audio format 0x%x\n",options->format);
    return;
  }

  /* Allocate memory for the song */
  song = (MidSong *)timi_calloc(sizeof(MidSong));
  if (!song) return;

  for (i = 0; i < 128; i++) {
    if (master_tonebank[i]) {
      song->tonebank[i] = (MidToneBank *) timi_calloc(sizeof(MidToneBank));
      if (!song->tonebank[i]) goto fail;
      song->tonebank[i]->tone = master_tonebank[i]->tone;
    }
    if (master_drumset[i]) {
      song->drumset[i] = (MidToneBank *) timi_calloc(sizeof(MidToneBank));
      if (!song->drumset[i]) goto fail;
      song->drumset[i]->tone = master_drumset[i]->tone;
    }
  }

  song->amplification = DEFAULT_AMPLIFICATION;
  song->voices = DEFAULT_VOICES;
  song->drumchannels = DEFAULT_DRUMCHANNELS;

  song->rate = options->rate;
  song->encoding = 0;
  if (options->format & 0x0010)
      song->encoding |= PE_16BIT;
  if (options->format & 0x8000)
      song->encoding |= PE_SIGNED;
  if (options->channels == 1)
      song->encoding |= PE_MONO;
  switch (options->format) {
  case MID_AUDIO_S8:
    song->write = timi_s32tos8;
    break;
  case MID_AUDIO_U8:
    song->write = timi_s32tou8;
    break;
  case MID_AUDIO_S16LSB:
    song->write = timi_s32tos16l;
    break;
  case MID_AUDIO_S16MSB:
    song->write = timi_s32tos16b;
    break;
  case MID_AUDIO_U16LSB:
    song->write = timi_s32tou16l;
    break;
  case MID_AUDIO_U16MSB:
    song->write = timi_s32tou16b;
    break;
  }

  song->buffer_size = options->buffer_size;
  song->resample_buffer = (sample_t *) timi_calloc(options->buffer_size * sizeof(sample_t));
  if (!song->resample_buffer) goto fail;
  song->common_buffer = (sint32 *) timi_calloc(options->buffer_size * 2 * sizeof(sint32));
  if (!song->common_buffer) goto fail;

  song->bytes_per_sample = 2;
  if (song->encoding & PE_16BIT)
    song->bytes_per_sample *= 2;
  if (song->encoding & PE_MONO)
    song->bytes_per_sample /= 2;

  song->control_ratio = options->rate / CONTROLS_PER_SECOND;
  if (song->control_ratio < 1)
      song->control_ratio = 1;
  else if (song->control_ratio > MAX_CONTROL_RATIO)
      song->control_ratio = MAX_CONTROL_RATIO;

  song->lost_notes = 0;
  song->cut_notes = 0;

  song->events = read_midi_file(stream, song, &(song->groomed_event_count),
				&song->samples);

  /* Make sure everything is okay */
  if (!song->events)
    goto fail;

  song->default_instrument = NULL;
  song->default_program = DEFAULT_PROGRAM;

  if (*def_instr_name)
    set_default_instrument(song, def_instr_name);

  load_missing_instruments(song);

  if (! song->oom)
      *out = song;
  else {
fail: mid_song_free (song);
  }
}

MidSong *mid_song_load(MidIStream *stream, MidSongOptions *options)
{
  MidSong *song;
  do_song_load(stream, options, &song);
  return song;
}

void mid_song_free(MidSong *song)
{
  int i;

  if (!song) return;

  free_instruments(song);

  for (i = 0; i < 128; i++) {
    timi_free(song->tonebank[i]);
    timi_free(song->drumset[i]);
  }

  timi_free(song->common_buffer);
  timi_free(song->resample_buffer);
  timi_free(song->events);

  for (i = 0; i < MID_META_MAX; i++) {
    timi_free(song->meta_data[i]);
  }

  timi_free(song);
}

void mid_exit(void)
{
  int i, j;

  if (rcf_fp) {
    for (i = 0; i < MAX_RCFCOUNT; i++) {
      if (rcf_fp[i])
	fclose(rcf_fp[i]);
    }
    timi_free(rcf_fp);
    rcf_fp = NULL;
  }

  for (i = 0; i < 128; i++) {
    if (master_tonebank[i]) {
      MidToneBankElement *e = master_tonebank[i]->tone;
      if (e != NULL) {
	for (j = 0; j < 128; j++) {
	  timi_free(e[j].name);
	}
	timi_free(e);
      }
      timi_free(master_tonebank[i]);
      master_tonebank[i] = NULL;
    }
    if (master_drumset[i]) {
      MidToneBankElement *e = master_drumset[i]->tone;
      if (e != NULL) {
	for (j = 0; j < 128; j++) {
	  timi_free(e[j].name);
	}
	timi_free(e);
      }
      timi_free(master_drumset[i]);
      master_drumset[i] = NULL;
    }
  }

  timi_free_pathlist();
}

long mid_get_version (void)
{
  return LIBTIMIDITY_VERSION;
}

/* ===== for libtimidity <= 0.2.x compatibility =====
 */
MidDLSPatches *mid_dlspatches_load (MidIStream *stream)
{
  return NULL;
}

void mid_dlspatches_free (MidDLSPatches *data)
{
}

MidSong *mid_song_load_dls(MidIStream *stream, MidDLSPatches *dlspatches, MidSongOptions *options)
{
  return NULL;
}
