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

#ifndef TIMIDITY_OUTPUT_H
#define TIMIDITY_OUTPUT_H

/* Data format encoding bits */

#define PE_MONO 	0x01  /* versus stereo */
#define PE_SIGNED	0x02  /* versus unsigned */
#define PE_16BIT 	0x04  /* versus 8-bit */

/* Conversion functions -- These overwrite the sint32 data in *lp with
   data in another format */

/* 8-bit signed and unsigned*/
extern void timi_s32tos8(void *dp, sint32 *lp, sint32 c);
extern void timi_s32tou8(void *dp, sint32 *lp, sint32 c);

/* 16-bit */
extern void timi_s32tos16(void *dp, sint32 *lp, sint32 c);
extern void timi_s32tou16(void *dp, sint32 *lp, sint32 c);

/* byte-exchanged 16-bit */
extern void timi_s32tos16x(void *dp, sint32 *lp, sint32 c);
extern void timi_s32tou16x(void *dp, sint32 *lp, sint32 c);

/* little-endian and big-endian specific */
#if !defined(WORDS_BIGENDIAN)
#define timi_s32tou16l timi_s32tou16
#define timi_s32tou16b timi_s32tou16x
#define timi_s32tos16l timi_s32tos16
#define timi_s32tos16b timi_s32tos16x
#else
#define timi_s32tou16l timi_s32tou16x
#define timi_s32tou16b timi_s32tou16
#define timi_s32tos16l timi_s32tos16x
#define timi_s32tos16b timi_s32tos16
#endif

#endif /* TIMIDITY_OUTPUT_H */
