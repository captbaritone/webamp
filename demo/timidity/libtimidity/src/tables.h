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

#ifndef TIMIDITY_TABLES_H
#define TIMIDITY_TABLES_H

#include <math.h>

#define timi_sine(x) (sin((2*M_PI/1024.0) * (x)))

#define SINE_CYCLE_LENGTH 1024

#define freq_table TIMI_NAMESPACE(freq_table)
#define vol_table TIMI_NAMESPACE(vol_table)
#define bend_fine TIMI_NAMESPACE(bend_fine)
#define bend_coarse TIMI_NAMESPACE(bend_coarse)

extern const sint32 freq_table[];
extern const double vol_table[];
extern const double bend_fine[];
extern const double bend_coarse[];

#endif /* TIMIDITY_TABLES_H */
