/* libTiMidity -- MIDI to WAVE converter library
 * libTiMidity is licensed under the terms of the GNU Lesser General
 * Public License: see COPYING for details.
 * Copyright (C) 1995 Tuukka Toivonen <toivonen@clinet.fi>
 * Copyright (C) 2004 Konstantin Korikov <lostclus@ua.fm>
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

#ifndef TIMIDITY_INTERNAL_H
#define TIMIDITY_INTERNAL_H

/* hide private symbols by prefixing with "_timi_" */
#undef  TIMI_NAMESPACE
#define TIMI_NAMESPACE(x) _timi_ ## x

#if defined(__OS2__) || defined(__EMX__)
#include <os2.h>
#endif
#include "timidity.h"
#include "options.h"

#if defined(_MSC_VER) && !defined(__cplusplus) && !defined(HAVE_CONFIG_H)
#define inline __inline
#endif
#ifndef HAVE_CONFIG_H
#include "timi_endian.h"
#endif

/* Instrument files are little-endian, MIDI files big-endian, so we
   need to do some conversions. */
#if defined(__VBCC__) && defined(__M68K__)
uint16 XCHG_SHORT(__reg("d0") uint16) =
    "\trol.w\t#8,d0";
sint32 XCHG_LONG (__reg("d0") sint32) =
    "\trol.w\t#8,d0\n"
    "\tswap\td0\n"
    "\trol.w\t#8,d0";

#elif defined(__WATCOMC__) && defined(__386__)
extern uint16 XCHG_SHORT(uint16);
extern sint32 XCHG_LONG (sint32);
#ifndef __SW_3 /* 486+ */
#pragma aux XCHG_LONG = \
    "bswap eax"  \
    parm   [eax] \
    modify [eax];
#else  /* 386-only */
#pragma aux XCHG_LONG = \
    "xchg al, ah"  \
    "ror  eax, 16" \
    "xchg al, ah"  \
    parm   [eax]   \
    modify [eax];
#endif
#pragma aux XCHG_SHORT = \
    "xchg al, ah" \
    parm   [ax]   \
    modify [ax];

#else
#define XCHG_SHORT(x) ((((x)&0xFF)<<8) | (((x)>>8)&0xFF))
#ifdef __i486__
# define XCHG_LONG(x) \
     ({ sint32 __value; \
        asm ("bswap %1; movl %1,%0" : "=g" (__value) : "r" (x)); \
       __value; })
#else
# define XCHG_LONG(x) ((((x)&0xFF)<<24) | \
		      (((x)&0xFF00)<<8) | \
		      (((x)&0xFF0000)>>8) | \
		      (((x)>>24)&0xFF))
#endif
#endif

#if !defined(WORDS_BIGENDIAN)
#define SWAPLE16(x) x
#define SWAPLE32(x) x
#define SWAPBE16(x) XCHG_SHORT(x)
#define SWAPBE32(x) XCHG_LONG(x)
#else
#define SWAPBE16(x) x
#define SWAPBE32(x) x
#define SWAPLE16(x) XCHG_SHORT(x)
#define SWAPLE32(x) XCHG_LONG(x)
#endif

#if defined(__GNUC__) && !(defined(__STDC_VERSION__) && __STDC_VERSION__ >= 199901L)
/* this is more compatible with very old gcc */
#ifdef TIMIDITY_DEBUG
#define DEBUG_MSG(fmt, args...) fprintf(stderr, fmt, ##args)
#else
#define DEBUG_MSG(fmt, args...)
#endif
#else /* use C99 varargs macros */
#ifdef TIMIDITY_DEBUG
#define DEBUG_MSG(...) fprintf(stderr, __VA_ARGS__)
#else
#define DEBUG_MSG(...)
#endif
#endif


#define MID_VIBRATO_SAMPLE_INCREMENTS 32

/* Maximum polyphony. */
#define MID_MAX_VOICES	48

typedef sint16 sample_t;
typedef sint32 final_volume_t;

typedef struct _MidSample MidSample;
struct _MidSample
{
  sint32
    loop_start, loop_end, data_length,
    sample_rate,
    low_freq, high_freq, root_freq;
  sint32 envelope_rate[6], envelope_offset[6];
  float volume;
  sample_t *data;
  sint32
    tremolo_sweep_increment, tremolo_phase_increment,
    vibrato_sweep_increment, vibrato_control_ratio;
  uint8 tremolo_depth, vibrato_depth, modes;
  sint8 panning, note_to_use;
};

typedef struct _MidChannel MidChannel;
struct _MidChannel
{
  int bank, program, volume, sustain, panning, pitchbend, expression;
  int mono;	/* one note only on this channel -- not implemented yet */
  int pitchsens;
  /* chorus, reverb... Coming soon to a 300-MHz, eight-way superscalar
     processor near you */
  float pitchfactor; /* precomputed pitch bend factor to save some fdiv's */
};

typedef struct _MidVoice MidVoice;
struct _MidVoice
{
  uint8 status, channel, note, velocity;
  MidSample *sample;
  sint32
    orig_frequency, frequency,
    sample_offset, sample_increment,
    envelope_volume, envelope_target, envelope_increment,
    tremolo_sweep, tremolo_sweep_position,
    tremolo_phase, tremolo_phase_increment,
    vibrato_sweep, vibrato_sweep_position;

  final_volume_t left_mix, right_mix;

  float left_amp, right_amp, tremolo_volume;
    sint32 vibrato_sample_increment[MID_VIBRATO_SAMPLE_INCREMENTS];
  int
    vibrato_phase, vibrato_control_ratio, vibrato_control_counter,
    envelope_stage, control_counter, panning, panned;
};

typedef struct _MidInstrument MidInstrument;
struct _MidInstrument
{
  int samples;
  MidSample *sample;
};

typedef struct _MidToneBankElement MidToneBankElement;
struct _MidToneBankElement
{
  char *name;
  int note, amp, pan, strip_loop, strip_envelope, strip_tail;
};

typedef struct _MidToneBank MidToneBank;
struct _MidToneBank
{
  MidToneBankElement *tone;
  MidInstrument *instrument[128];
};

typedef struct _MidEvent MidEvent;
struct _MidEvent
{
  sint32 time;
  uint8 channel, type, a, b;
};

typedef struct _MidEventList MidEventList;
struct _MidEventList
{
  MidEvent event;
  struct _MidEventList *next;
};

struct _MidSong
{
  int oom; /* malloc() failed */
  int playing;
  sint32 rate;
  sint32 encoding;
  int bytes_per_sample;
  float master_volume;
  sint32 amplification;
  MidToneBank *tonebank[128];
  MidToneBank *drumset[128];
  MidInstrument *default_instrument;
  int default_program;
  void (*write) (void *dp, sint32 *lp, sint32 c);
  int buffer_size;
  sample_t *resample_buffer;
  sint32 *common_buffer;
  /* These would both fit into 32 bits, but they are often added in
     large multiples, so it's simpler to have two roomy ints */
  /* samples per MIDI delta-t */
  sint32 sample_increment;
  sint32 sample_correction;
  MidChannel channel[16];
  MidVoice voice[MID_MAX_VOICES];
  int voices;
  sint32 drumchannels;
  sint32 control_ratio;
  sint32 lost_notes;
  sint32 cut_notes;
  sint32 samples;
  MidEvent *events;
  MidEvent *current_event;
  MidEventList *evlist;
  sint32 current_sample;
  sint32 event_count;
  sint32 at;
  sint32 groomed_event_count;
  char *meta_data[MID_META_MAX];
};

#endif /* TIMIDITY_INTERNAL_H */
