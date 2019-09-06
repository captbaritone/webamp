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
 * playmidi.c -- random stuff in need of rearrangement
 */

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "timidity_internal.h"
#include "instrum.h"
#include "playmidi.h"
#include "output.h"
#include "mix.h"
#include "tables.h"

static void adjust_amplification(MidSong *song)
{
  song->master_volume = (float)(song->amplification) / (float)100.0;
}

static void reset_voices(MidSong *song)
{
  int i;
  for (i=0; i<MID_MAX_VOICES; i++)
    song->voice[i].status=VOICE_FREE;
}

/* Process the Reset All Controllers event */
static void reset_controllers(MidSong *song, int c)
{
  song->channel[c].volume=90; /* Some standard says, although the SCC docs say 0. */
  song->channel[c].expression=127; /* SCC-1 does this. */
  song->channel[c].sustain=0;
  song->channel[c].pitchbend=0x2000;
  song->channel[c].pitchfactor=0; /* to be computed */
}

static void reset_midi(MidSong *song)
{
  int i;
  for (i=0; i<16; i++)
    {
      reset_controllers(song, i);
      /* The rest of these are unaffected by the Reset All Controllers event */
      song->channel[i].program=song->default_program;
      song->channel[i].panning=NO_PANNING;
      song->channel[i].pitchsens=2;
      song->channel[i].bank=0; /* tone bank or drum set */
    }
  reset_voices(song);
}

static void select_sample(MidSong *song, int v, MidInstrument *ip, int vel)
{
  sint32 f, cdiff, diff;
  int s,i;
  MidSample *sp, *closest;

  s=ip->samples;
  sp=ip->sample;

  if (s==1)
    {
      song->voice[v].sample=sp;
      return;
    }

  f=song->voice[v].orig_frequency;
  for (i=0; i<s; i++, sp++)
    {
      if (sp->low_freq <= f && sp->high_freq >= f)
	{
	  song->voice[v].sample=sp;
	  return;
	}
    }

  /*
     No suitable sample found! We'll select the sample whose root
     frequency is closest to the one we want. (Actually we should
     probably convert the low, high, and root frequencies to MIDI
     note values and compare those.)
   */
  cdiff=0x7FFFFFFF;
  closest=sp=ip->sample;
  for(i=0; i<s; i++, sp++)
    {
      diff=sp->root_freq - f;
      if (diff<0) diff=-diff;
      if (diff<cdiff)
	{
	  cdiff=diff;
	  closest=sp;
	}
    }
  song->voice[v].sample=closest;
}

static void recompute_freq(MidSong *song, int v)
{
  int 
    sign=(song->voice[v].sample_increment < 0), /* for bidirectional loops */
    pb=song->channel[song->voice[v].channel].pitchbend;
  double a;

  if (!song->voice[v].sample->sample_rate)
    return;

  if (song->voice[v].vibrato_control_ratio)
    {
      /* This instrument has vibrato. Invalidate any precomputed
         sample_increments. */

      int i=MID_VIBRATO_SAMPLE_INCREMENTS;
      while (i--)
	song->voice[v].vibrato_sample_increment[i]=0;
    }

  if (pb==0x2000 || pb<0 || pb>0x3FFF)
    song->voice[v].frequency = song->voice[v].orig_frequency;
  else
    {
      pb-=0x2000;
      if (!(song->channel[song->voice[v].channel].pitchfactor))
	{
	  /* Damn. Somebody bent the pitch. */
	  sint32 i=pb*song->channel[song->voice[v].channel].pitchsens;
	  if (pb<0)
	    i=-i;
	  song->channel[song->voice[v].channel].pitchfactor=
	    (float)(bend_fine[(i>>5) & 0xFF] * bend_coarse[i>>13]);
	}
      if (pb>0)
	song->voice[v].frequency=
	  (sint32)(song->channel[song->voice[v].channel].pitchfactor *
		  (double)(song->voice[v].orig_frequency));
      else
	song->voice[v].frequency=
	  (sint32)((double)(song->voice[v].orig_frequency) /
		  song->channel[song->voice[v].channel].pitchfactor);
    }

  a = TIM_FSCALE(((double)(song->voice[v].sample->sample_rate) *
		  (double)(song->voice[v].frequency)) /
		 ((double)(song->voice[v].sample->root_freq) *
		  (double)(song->rate)),
		 FRACTION_BITS);

  if (sign)
    a = -a; /* need to preserve the loop direction */

  song->voice[v].sample_increment = (sint32)(a);
}

static void recompute_amp(MidSong *song, int v)
{
  sint32 tempamp;

  /* TODO: use fscale */

  tempamp= (song->voice[v].velocity *
	    song->channel[song->voice[v].channel].volume * 
	    song->channel[song->voice[v].channel].expression); /* 21 bits */

  if (!(song->encoding & PE_MONO))
    {
      if (song->voice[v].panning > 60 && song->voice[v].panning < 68)
	{
	  song->voice[v].panned=PANNED_CENTER;

	  song->voice[v].left_amp=
	    TIM_FSCALENEG((double)(tempamp) * song->voice[v].sample->volume * song->master_volume,
			  21);
	}
      else if (song->voice[v].panning<5)
	{
	  song->voice[v].panned = PANNED_LEFT;

	  song->voice[v].left_amp=
	    TIM_FSCALENEG((double)(tempamp) * song->voice[v].sample->volume * song->master_volume,
			  20);
	}
      else if (song->voice[v].panning>123)
	{
	  song->voice[v].panned = PANNED_RIGHT;

	  song->voice[v].left_amp= /* left_amp will be used */
	    TIM_FSCALENEG((double)(tempamp) * song->voice[v].sample->volume * song->master_volume,
			  20);
	}
      else
	{
	  song->voice[v].panned = PANNED_MYSTERY;

	  song->voice[v].left_amp=
	    TIM_FSCALENEG((double)(tempamp) * song->voice[v].sample->volume * song->master_volume,
			  27);
	  song->voice[v].right_amp = song->voice[v].left_amp * (song->voice[v].panning);
	  song->voice[v].left_amp *= (float)(127 - song->voice[v].panning);
	}
    }
  else
    {
      song->voice[v].panned = PANNED_CENTER;

      song->voice[v].left_amp=
	TIM_FSCALENEG((double)(tempamp) * song->voice[v].sample->volume * song->master_volume,
		      21);
    }
}

static void start_note(MidSong *song, MidEvent *e, int i)
{
  MidInstrument *ip;
  int j;

  if (ISDRUMCHANNEL(song, e->channel))
    {
      if (!(ip=song->drumset[song->channel[e->channel].bank]->instrument[e->a]))
	{
	  if (!(ip=song->drumset[0]->instrument[e->a]))
	    return; /* No instrument? Then we can't play. */
	}
      if (ip->samples != 1)
	{
	  DEBUG_MSG("Strange: percussion instrument with %d samples!\n",
		  ip->samples);
	}

      if (ip->sample->note_to_use) /* Do we have a fixed pitch? */
	song->voice[i].orig_frequency = freq_table[(int)(ip->sample->note_to_use)];
      else
	song->voice[i].orig_frequency = freq_table[e->a & 0x7F];

      /* drums are supposed to have only one sample */
      song->voice[i].sample = ip->sample;
    }
  else
    {
      if (song->channel[e->channel].program == SPECIAL_PROGRAM)
	ip=song->default_instrument;
      else if (!(ip=song->tonebank[song->channel[e->channel].bank]->
		 instrument[song->channel[e->channel].program]))
	{
	  if (!(ip=song->tonebank[0]->instrument[song->channel[e->channel].program]))
	    return; /* No instrument? Then we can't play. */
	}

      if (ip->sample->note_to_use) /* Fixed-pitch instrument? */
	song->voice[i].orig_frequency = freq_table[(int)(ip->sample->note_to_use)];
      else
	song->voice[i].orig_frequency = freq_table[e->a & 0x7F];
      select_sample(song, i, ip, e->b);
    }

  song->voice[i].status = VOICE_ON;
  song->voice[i].channel = e->channel;
  song->voice[i].note = e->a;
  song->voice[i].velocity = e->b;
  song->voice[i].sample_offset = 0;
  song->voice[i].sample_increment = 0; /* make sure it isn't negative */

  song->voice[i].tremolo_phase = 0;
  song->voice[i].tremolo_phase_increment = song->voice[i].sample->tremolo_phase_increment;
  song->voice[i].tremolo_sweep = song->voice[i].sample->tremolo_sweep_increment;
  song->voice[i].tremolo_sweep_position = 0;

  song->voice[i].vibrato_sweep = song->voice[i].sample->vibrato_sweep_increment;
  song->voice[i].vibrato_sweep_position = 0;
  song->voice[i].vibrato_control_ratio = song->voice[i].sample->vibrato_control_ratio;
  song->voice[i].vibrato_control_counter = song->voice[i].vibrato_phase = 0;
  for (j=0; j<MID_VIBRATO_SAMPLE_INCREMENTS; j++)
    song->voice[i].vibrato_sample_increment[j] = 0;

  if (song->channel[e->channel].panning != NO_PANNING)
    song->voice[i].panning = song->channel[e->channel].panning;
  else
    song->voice[i].panning = song->voice[i].sample->panning;

  recompute_freq(song, i);
  recompute_amp(song, i);
  if (song->voice[i].sample->modes & MODES_ENVELOPE)
    {
      /* Ramp up from 0 */
      song->voice[i].envelope_stage = 0;
      song->voice[i].envelope_volume = 0;
      song->voice[i].control_counter = 0;
      recompute_envelope(song, i);
      apply_envelope_to_amp(song, i);
    }
  else
    {
      song->voice[i].envelope_increment = 0;
      apply_envelope_to_amp(song, i);
    }
}

static void kill_note(MidSong *song, int i)
{
  song->voice[i].status = VOICE_DIE;
}

/* Only one instance of a note can be playing on a single channel. */
static void note_on(MidSong *song)
{
  int i = song->voices, lowest=-1;
  sint32 lv=0x7FFFFFFF, v;
  MidEvent *e = song->current_event;

  while (i--)
    {
      if (song->voice[i].status == VOICE_FREE)
	lowest=i; /* Can't get a lower volume than silence */
      else if (song->voice[i].channel==e->channel && 
	       (song->voice[i].note==e->a || song->channel[song->voice[i].channel].mono))
	kill_note(song, i);
    }

  if (lowest != -1)
    {
      /* Found a free voice. */
      start_note(song,e,lowest);
      return;
    }

  /* Look for the decaying note with the lowest volume */
  i = song->voices;
  while (i--)
    {
      if ((song->voice[i].status != VOICE_ON) &&
	  (song->voice[i].status != VOICE_DIE))
	{
	  v = song->voice[i].left_mix;
	  if ((song->voice[i].panned == PANNED_MYSTERY)
	      && (song->voice[i].right_mix > v))
	    v = song->voice[i].right_mix;
	  if (v<lv)
	    {
	      lv=v;
	      lowest=i;
	    }
	}
    }

  if (lowest != -1)
    {
      /* This can still cause a click, but if we had a free voice to
	 spare for ramping down this note, we wouldn't need to kill it
	 in the first place... Still, this needs to be fixed. Perhaps
	 we could use a reserve of voices to play dying notes only. */

      song->cut_notes++;
      song->voice[lowest].status=VOICE_FREE;
      start_note(song,e,lowest);
    }
  else
    song->lost_notes++;
}

static void finish_note(MidSong *song, int i)
{
  if (song->voice[i].sample->modes & MODES_ENVELOPE)
    {
      /* We need to get the envelope out of Sustain stage */
      song->voice[i].envelope_stage = 3;
      song->voice[i].status = VOICE_OFF;
      recompute_envelope(song, i);
      apply_envelope_to_amp(song, i);
    }
  else
    {
      /* Set status to OFF so resample_voice() will let this voice out
	 of its loop, if any. In any case, this voice dies when it
	 hits the end of its data (ofs>=data_length). */
      song->voice[i].status = VOICE_OFF;
    }
}

static void note_off(MidSong *song)
{
  int i = song->voices;
  MidEvent *e = song->current_event;

  while (i--)
    if (song->voice[i].status == VOICE_ON &&
	song->voice[i].channel == e->channel &&
	song->voice[i].note == e->a)
      {
	if (song->channel[e->channel].sustain)
	  {
	    song->voice[i].status = VOICE_SUSTAINED;
	  }
	else
	  finish_note(song, i);
	return;
      }
}

/* Process the All Notes Off event */
static void all_notes_off(MidSong *song)
{
  int i = song->voices;
  int c = song->current_event->channel;

  DEBUG_MSG("All notes off on channel %d\n", c);
  while (i--)
    if (song->voice[i].status == VOICE_ON &&
	song->voice[i].channel == c)
      {
	if (song->channel[c].sustain) 
	  song->voice[i].status = VOICE_SUSTAINED;
	else
	  finish_note(song, i);
      }
}

/* Process the All Sounds Off event */
static void all_sounds_off(MidSong *song)
{
  int i = song->voices;
  int c = song->current_event->channel;

  while (i--)
    if (song->voice[i].channel == c && 
	song->voice[i].status != VOICE_FREE &&
	song->voice[i].status != VOICE_DIE)
      {
	kill_note(song, i);
      }
}

static void adjust_pressure(MidSong *song)
{
  MidEvent *e = song->current_event;
  int i = song->voices;

  while (i--)
    if (song->voice[i].status == VOICE_ON &&
	song->voice[i].channel == e->channel &&
	song->voice[i].note == e->a)
      {
	song->voice[i].velocity = e->b;
	recompute_amp(song, i);
	apply_envelope_to_amp(song, i);
	return;
      }
}

static void drop_sustain(MidSong *song)
{
  int i = song->voices;
  int c = song->current_event->channel;

  while (i--)
    if (song->voice[i].status == VOICE_SUSTAINED && song->voice[i].channel == c)
      finish_note(song, i);
}

static void adjust_pitchbend(MidSong *song)
{
  int c = song->current_event->channel;
  int i = song->voices;

  while (i--)
    if (song->voice[i].status != VOICE_FREE && song->voice[i].channel == c)
      {
	recompute_freq(song, i);
      }
}

static void adjust_volume(MidSong *song)
{
  int c = song->current_event->channel;
  int i = song->voices;

  while (i--)
    if (song->voice[i].channel == c &&
	(song->voice[i].status==VOICE_ON || song->voice[i].status==VOICE_SUSTAINED))
      {
	recompute_amp(song, i);
	apply_envelope_to_amp(song, i);
      }
}

static void seek_forward(MidSong *song, sint32 until_time)
{
  reset_voices(song);
  while (song->current_event->time < until_time)
    {
      switch(song->current_event->type)
	{
	  /* All notes stay off. Just handle the parameter changes. */

	case ME_PITCH_SENS:
	  song->channel[song->current_event->channel].pitchsens =
	    song->current_event->a;
	  song->channel[song->current_event->channel].pitchfactor = 0;
	  break;

	case ME_PITCHWHEEL:
	  song->channel[song->current_event->channel].pitchbend =
	    song->current_event->a + song->current_event->b * 128;
	  song->channel[song->current_event->channel].pitchfactor = 0;
	  break;

	case ME_MAINVOLUME:
	  song->channel[song->current_event->channel].volume =
	    song->current_event->a;
	  break;

	case ME_PAN:
	  song->channel[song->current_event->channel].panning =
	    song->current_event->a;
	  break;

	case ME_EXPRESSION:
	  song->channel[song->current_event->channel].expression =
	    song->current_event->a;
	  break;

	case ME_PROGRAM:
	  if (ISDRUMCHANNEL(song, song->current_event->channel))
	    /* Change drum set */
	    song->channel[song->current_event->channel].bank =
	      song->current_event->a;
	  else
	    song->channel[song->current_event->channel].program =
	      song->current_event->a;
	  break;

	case ME_SUSTAIN:
	  song->channel[song->current_event->channel].sustain =
	    song->current_event->a;
	  break;

	case ME_RESET_CONTROLLERS:
	  reset_controllers(song, song->current_event->channel);
	  break;

	case ME_TONE_BANK:
	  song->channel[song->current_event->channel].bank =
	    song->current_event->a;
	  break;

	case ME_EOT:
	  song->current_sample = song->current_event->time;
	  return;
	}
      song->current_event++;
    }
  /*song->current_sample=song->current_event->time;*/
  if (song->current_event != song->events)
    song->current_event--;
  song->current_sample=until_time;
}

static void skip_to(MidSong *song, sint32 until_time)
{
  if (song->current_sample > until_time)
    song->current_sample = 0;

  reset_midi(song);
  song->current_event = song->events;

  if (until_time)
    seek_forward(song, until_time);
}

static void do_compute_data(MidSong *song, sint32 count)
{
  int i;
  memset(song->common_buffer, 0,
	 (song->encoding & PE_MONO) ? (count * 4) : (count * 8));
  for (i = 0; i < song->voices; i++)
    {
      if(song->voice[i].status != VOICE_FREE)
	mix_voice(song, song->common_buffer, i, count);
    }
  song->current_sample += count;
}

/* count=0 means flush remaining buffered data to output device, then
   flush the device itself */
static void compute_data(MidSong *song, sint8 **stream, sint32 count)
{
  int channels;

  if ( song->encoding & PE_MONO )
    channels = 1;
  else
    channels = 2;

  while (count) {
    sint32 block = count;
    if (block > song->buffer_size)
      block = song->buffer_size;
    do_compute_data(song, block);
    song->write(*stream, song->common_buffer, channels * block);
    *stream += song->bytes_per_sample * block;
    count -= block;
  }
}

void mid_song_start(MidSong *song)
{
  song->playing = 1;
  adjust_amplification(song);
  skip_to(song, 0);
}

void mid_song_seek(MidSong *song, uint32 ms)
{
  skip_to(song, (ms * (song->rate / 100)) / 10);
}

uint32 mid_song_get_total_time(MidSong *song)
{
  MidEvent *last_event = &song->events[song->groomed_event_count - 1];
  /* We want last_event->time * 1000 / song->rate */
  uint32 retvalue = (last_event->time / song->rate) * 1000;
  retvalue       += (last_event->time % song->rate) * 1000 / song->rate;
  return retvalue;
}

uint32 mid_song_get_time(MidSong *song)
{
  uint32 retvalue = (song->current_sample / song->rate) * 1000;
  retvalue       += (song->current_sample % song->rate) * 1000 / song->rate;
  return retvalue;
}

char *mid_song_get_meta(MidSong *song, MidSongMetaId what)
{
  return (what < 0 || what >= MID_META_MAX)? NULL : song->meta_data[what];
}

size_t mid_song_read_wave(MidSong *song, sint8 *ptr, size_t size)
{
  sint32 start_sample, end_sample, samples;

  if (!song->playing)
    return 0;

  samples = size / song->bytes_per_sample;

  start_sample = song->current_sample;
  end_sample = song->current_sample+samples;
  while ( song->current_sample < end_sample ) {
    /* Handle all events that should happen at this time */
    while (song->current_event->time <= song->current_sample) {
      switch(song->current_event->type) {
	/* Effects affecting a single note */
	case ME_NOTEON:
	  if (!(song->current_event->b)) /* Velocity 0? */
	    note_off(song);
	  else
	    note_on(song);
	  break;

	case ME_NOTEOFF:
	  note_off(song);
	  break;

	case ME_KEYPRESSURE:
	  adjust_pressure(song);
	  break;

	/* Effects affecting a single channel */
	case ME_PITCH_SENS:
	  song->channel[song->current_event->channel].pitchsens =
	    song->current_event->a;
	  song->channel[song->current_event->channel].pitchfactor = 0;
	  break;

	case ME_PITCHWHEEL:
	  song->channel[song->current_event->channel].pitchbend =
	    song->current_event->a + song->current_event->b * 128;
	  song->channel[song->current_event->channel].pitchfactor = 0;
	  /* Adjust pitch for notes already playing */
	  adjust_pitchbend(song);
	  break;

	case ME_MAINVOLUME:
	  song->channel[song->current_event->channel].volume =
	    song->current_event->a;
	  adjust_volume(song);
	  break;

	case ME_PAN:
	  song->channel[song->current_event->channel].panning =
	    song->current_event->a;
	  break;

	case ME_EXPRESSION:
	  song->channel[song->current_event->channel].expression =
	    song->current_event->a;
	  adjust_volume(song);
	  break;

	case ME_PROGRAM:
	  if (ISDRUMCHANNEL(song, song->current_event->channel)) {
	    /* Change drum set */
	    song->channel[song->current_event->channel].bank =
	      song->current_event->a;
	  }
	  else
	    song->channel[song->current_event->channel].program =
	      song->current_event->a;
	  break;

	case ME_SUSTAIN:
	  song->channel[song->current_event->channel].sustain =
	    song->current_event->a;
	  if (!song->current_event->a)
	    drop_sustain(song);
	  break;

	case ME_RESET_CONTROLLERS:
	  reset_controllers(song, song->current_event->channel);
	  break;

	case ME_ALL_NOTES_OFF:
	  all_notes_off(song);
	  break;

	case ME_ALL_SOUNDS_OFF:
	  all_sounds_off(song);
	  break;

	case ME_TONE_BANK:
	  song->channel[song->current_event->channel].bank =
	    song->current_event->a;
	  break;

	case ME_EOT:
	  /* Give the last notes a couple of seconds to decay  */
	  DEBUG_MSG("Playing time: ~%d seconds\n",
		  song->current_sample/song->rate+2);
	  DEBUG_MSG("Notes cut: %d\n", song->cut_notes);
	  DEBUG_MSG("Notes lost totally: %d\n", song->lost_notes);
	  song->playing = 0;
	  return (song->current_sample - start_sample) * song->bytes_per_sample;
        }
      song->current_event++;
    }
    if (song->current_event->time > end_sample)
      compute_data(song, &ptr, end_sample-song->current_sample);
    else
      compute_data(song, &ptr, song->current_event->time-song->current_sample);
  }
  return samples * song->bytes_per_sample;
}

void mid_song_set_volume(MidSong *song, int volume)
{
  int i;
  if (volume > MAX_AMPLIFICATION)
    song->amplification = MAX_AMPLIFICATION;
  else
  if (volume < 0)
    song->amplification = 0;
  else
    song->amplification = volume;
  adjust_amplification(song);
  for (i = 0; i < song->voices; i++)
    if (song->voice[i].status != VOICE_FREE)
      {
	recompute_amp(song, i);
	apply_envelope_to_amp(song, i);
      }
}
