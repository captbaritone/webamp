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

#ifndef TIMIDITY_COMMON_H
#define TIMIDITY_COMMON_H

extern FILE *timi_openfile(const char *name);

/* pathlist funcs only to be used during mid_init/mid_exit */
typedef struct _PathList PathList;
extern int  timi_add_pathlist(const char *s, size_t len);
extern void timi_free_pathlist(void);

/* in case someone wants to compile with a different malloc() than stdlib */
#define timi_malloc malloc
#define timi_free   free

/* timi_calloc() returns zero'ed memory using timi_malloc() */
extern void *timi_calloc(size_t count);

#endif /* TIMIDITY_COMMON_H */
