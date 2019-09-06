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
 * output.c
 * Audio output (to file / device) functions.
 */

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include "timidity_internal.h"
#include "output.h"

/*****************************************************************/
/* Some functions to convert signed 32-bit data to other formats */

void timi_s32tos8(void *dp, sint32 *lp, sint32 c)
{
  sint8 *cp=(sint8 *)(dp);
  sint32 l;
  while (c--)
    {
      l=(*lp++)>>(32-8-GUARD_BITS);
      if (l>127) l=127;
      else if (l<-128) l=-128;
      *cp++ = (sint8) (l);
    }
}

void timi_s32tou8(void *dp, sint32 *lp, sint32 c)
{
  uint8 *cp=(uint8 *)(dp);
  sint32 l;
  while (c--)
    {
      l=(*lp++)>>(32-8-GUARD_BITS);
      if (l>127) l=127;
      else if (l<-128) l=-128;
      *cp++ = 0x80 ^ ((uint8) l);
    }
}

void timi_s32tos16(void *dp, sint32 *lp, sint32 c)
{
  sint16 *sp=(sint16 *)(dp);
  sint32 l;
  while (c--)
    {
      l=(*lp++)>>(32-16-GUARD_BITS);
      if (l > 32767) l=32767;
      else if (l<-32768) l=-32768;
      *sp++ = (sint16)(l);
    }
}

void timi_s32tou16(void *dp, sint32 *lp, sint32 c)
{
  uint16 *sp=(uint16 *)(dp);
  sint32 l;
  while (c--)
    {
      l=(*lp++)>>(32-16-GUARD_BITS);
      if (l > 32767) l=32767;
      else if (l<-32768) l=-32768;
      *sp++ = 0x8000 ^ (uint16)(l);
    }
}

void timi_s32tos16x(void *dp, sint32 *lp, sint32 c)
{
  sint16 *sp=(sint16 *)(dp);
  sint32 l;
  while (c--)
    {
      l=(*lp++)>>(32-16-GUARD_BITS);
      if (l > 32767) l=32767;
      else if (l<-32768) l=-32768;
      *sp++ = XCHG_SHORT((sint16)(l));
    }
}

void timi_s32tou16x(void *dp, sint32 *lp, sint32 c)
{
  uint16 *sp=(uint16 *)(dp);
  sint32 l;
  while (c--)
    {
      l=(*lp++)>>(32-16-GUARD_BITS);
      if (l > 32767) l=32767;
      else if (l<-32768) l=-32768;
      *sp++ = XCHG_SHORT(0x8000 ^ (uint16)(l));
    }
}
