/* libTiMidity -- MIDI to WAVE converter library
 * libTiMidity is licensed under the terms of the GNU Lesser General
 * Public License: see COPYING for details.
 * Copyright (C) 1995 Tuukka Toivonen <toivonen@clinet.fi>
 * Copyright (C) 2004 Konstantin Korikov <lostclus@ua.fm>
 * Copyright (C) 2014 O.Sezer <sezero@users.sourceforge.net>
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

#ifndef LIBTIMIDITY_H
#define LIBTIMIDITY_H

#include <stdio.h>
#include <stdlib.h>

#ifdef __cplusplus
extern "C" {
#endif

#define LIBTIMIDITY_VERSION_MAJOR 0L
#define LIBTIMIDITY_VERSION_MINOR 2L
#define LIBTIMIDITY_PATCHLEVEL    6L

#define LIBTIMIDITY_VERSION               \
        ((LIBTIMIDITY_VERSION_MAJOR<<16)| \
         (LIBTIMIDITY_VERSION_MINOR<< 8)| \
         (LIBTIMIDITY_PATCHLEVEL))

/* Audio format flags (defaults to LSB byte order)
 */
#define MID_AUDIO_U8      0x0008  /* Unsigned 8-bit samples */
#define MID_AUDIO_S8      0x8008  /* Signed 8-bit samples */
#define MID_AUDIO_U16LSB  0x0010  /* Unsigned 16-bit samples */
#define MID_AUDIO_S16LSB  0x8010  /* Signed 16-bit samples */
#define MID_AUDIO_U16MSB  0x1010  /* As above, but big-endian byte order */
#define MID_AUDIO_S16MSB  0x9010  /* As above, but big-endian byte order */
#define MID_AUDIO_U16     MID_AUDIO_U16LSB
#define MID_AUDIO_S16     MID_AUDIO_S16LSB

/* Core Library Types
 */
#ifndef __amigaos4__
  typedef unsigned char uint8;
  typedef signed char sint8;
  typedef unsigned short uint16;
  typedef signed short sint16;
  typedef unsigned int uint32;
  typedef signed int sint32;
#else
#include <exec/types.h>
  typedef int8  sint8;
  typedef int16 sint16;
  typedef int32 sint32;
#endif

  typedef size_t (*MidIStreamReadFunc) (void *ctx, void *ptr, size_t size, size_t nmemb);
  typedef int    (*MidIStreamSeekFunc) (void *ctx, long offset, int whence);
  typedef long   (*MidIStreamTellFunc) (void *ctx);
  typedef int    (*MidIStreamCloseFunc)(void *ctx);

  typedef struct _MidIStream MidIStream;
  typedef struct _MidDLSPatches MidDLSPatches;
  typedef struct _MidSong MidSong;

  typedef struct _MidSongOptions MidSongOptions;
  struct _MidSongOptions
  {
    sint32 rate;        /* DSP frequency -- samples per second */
    uint16 format;      /* Audio data format */
    uint8 channels;     /* Number of channels: 1 mono, 2 stereo */
    uint8 _pad;
    uint16 buffer_size; /* Sample buffer size (in samples, not bytes) */
    uint16 _reserved;
  };

  typedef int MidSongMetaId;
#define MID_SONG_TEXT       0
#define MID_SONG_COPYRIGHT  1
#define MID_META_MAX        8


/* Compiler magic for shared libraries
 * ===================================
 */
#if defined(_WIN32) || defined(__CYGWIN__)
  /* if you are compiling for Windows and will link to the
   * static library, you must define TIMIDITY_STATIC in
   * your project. otherwise, dllimport will be assumed. */
# if defined(TIMIDITY_BUILD) && defined(DLL_EXPORT)       /* building libtimidity as a dll for windows */
#   define TIMI_EXPORT __declspec(dllexport)
# elif defined(TIMIDITY_BUILD) || defined(TIMIDITY_STATIC) /* building or using static libtimidity for windows */
#   define TIMI_EXPORT
# else
#   define TIMI_EXPORT __declspec(dllimport)                   /* using libtimidity dll for windows */
# endif
#elif defined(__OS2__) && defined(__WATCOMC__)
# if defined(TIMIDITY_BUILD) && defined(__SW_BD)          /* building libtimidity as a dll for os/2 */
#   define TIMI_EXPORT __declspec(dllexport)
# else
#   define TIMI_EXPORT                                    /* using dll or static libtimidity for os/2 */
# endif
/* SYM_VISIBILITY should be defined if both the compiler
 * and the target support the visibility attributes. the
 * configury does that automatically. for any standalone
 * makefiles, etc, the developer should add the required
 * flags, i.e.:  -DSYM_VISIBILITY -fvisibility=hidden  */
#elif defined(TIMIDITY_BUILD) && defined(SYM_VISIBILITY)
#   define TIMI_EXPORT __attribute__((visibility("default")))
#else
#   define TIMI_EXPORT
#endif

/* Core Library Functions
 * ======================
 */

/* Retrieve library version
 */
  TIMI_EXPORT extern long mid_get_version (void);

/* Initialize the library. If config_file is NULL
 * search for configuratin file in default directories
 */
  TIMI_EXPORT extern int mid_init (const char *config_file);

/* Initialize the library without reading any
 * configuratin file
 */
  TIMI_EXPORT extern int mid_init_no_config (void);

/* Shutdown the library
 */
  TIMI_EXPORT extern void mid_exit (void);


/* Input Stream Functions
 * ======================
 */

/* Create input stream from a file name
 */
  TIMI_EXPORT extern MidIStream *mid_istream_open_file (const char *file);

/* Create input stream from a file pointer
 */
  TIMI_EXPORT extern MidIStream *mid_istream_open_fp (FILE *fp, int autoclose);

/* Create input stream from memory
 */
  TIMI_EXPORT extern MidIStream *mid_istream_open_mem (void *mem, size_t size);

/* Create custom input stream
 */
  TIMI_EXPORT extern MidIStream *mid_istream_open_callbacks (MidIStreamReadFunc readfn,
                                                             MidIStreamSeekFunc seekfn,
                                                             MidIStreamTellFunc tellfn,
                                                             MidIStreamCloseFunc closefn,
                                                             void *context);

/* Read data from input stream
 */
  TIMI_EXPORT extern size_t mid_istream_read (MidIStream *stream, void *ptr, size_t size,
                                              size_t nmemb);

/* Seek to a position in the input stream
 */
  TIMI_EXPORT extern int mid_istream_seek (MidIStream *stream, long offset, int whence);

/* Tell the position of input stream
 */
  TIMI_EXPORT extern long mid_istream_tell (MidIStream *stream);

/* Skip data from input stream
 */
  TIMI_EXPORT extern int mid_istream_skip (MidIStream *stream, long len);

/* Close and destroy input stream
 */
  TIMI_EXPORT extern int mid_istream_close (MidIStream *stream);


/* DLS Patch Functions
 * ===================
 */

/* Load DLS patches - No longer supported:  Always returns NULL.
 */
  TIMI_EXPORT extern MidDLSPatches *mid_dlspatches_load (MidIStream *stream);

/* Destroy DLS patches
 */
  TIMI_EXPORT extern void mid_dlspatches_free (MidDLSPatches *data);


/* MIDI Song Functions
 * ===================
 */

/* Load MIDI song
 */
  TIMI_EXPORT extern MidSong *mid_song_load (MidIStream *stream,
                                             MidSongOptions *options);

/* Load MIDI song with specified DLS patches
 * No longer supported:  Always returns NULL.
 */
  TIMI_EXPORT extern MidSong *mid_song_load_dls (MidIStream *stream,
                                                 MidDLSPatches *dlspatches,
                                                 MidSongOptions *options);

/* Set song amplification value
 */
  TIMI_EXPORT extern void mid_song_set_volume (MidSong *song, int volume);

/* Seek song to the start position and initialize conversion
 */
  TIMI_EXPORT extern void mid_song_start (MidSong *song);

/* Read WAVE data
 */
  TIMI_EXPORT extern size_t mid_song_read_wave (MidSong *song, sint8 *ptr, size_t size);

/* Seek song to specified offset in milliseconds
 */
  TIMI_EXPORT extern void mid_song_seek (MidSong *song, uint32 ms);

/* Get total song time in milliseconds
 */
  TIMI_EXPORT extern uint32 mid_song_get_total_time (MidSong *song);

/* Get current song time in milliseconds
 */
  TIMI_EXPORT extern uint32 mid_song_get_time (MidSong *song);

/* Get song meta data. Return NULL if no meta data.
 */
  TIMI_EXPORT extern char *mid_song_get_meta (MidSong *song, MidSongMetaId what);

/* Destroy song
 */
  TIMI_EXPORT extern void mid_song_free (MidSong *song);

#ifdef __cplusplus
}
#endif

#endif /* LIBTIMIDITY_H */
