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

/* I guess "rb" should be right for any libc */
#define OPEN_MODE "rb"

#include "timidity_internal.h"
#include "common.h"
#include "ospaths.h"

/* The paths in this list will be tried by timi_openfile() */
struct _PathList {
  char *path;
  struct _PathList *next;
};

static PathList *pathlist = NULL;

/* This is meant to find and open files for reading */
FILE *timi_openfile(const char *name)
{
  FILE *fp;

  if (!name || !(*name))
    {
      DEBUG_MSG("Attempted to open nameless file.\n");
      return NULL;
    }

  /* First try the given name */
  DEBUG_MSG("Trying to open %s\n", name);
  if ((fp = fopen(name, OPEN_MODE)) != NULL)
    return fp;

  if (!is_abspath(name))
  {
    char current_filename[TIM_MAXPATH];
    PathList *plp = pathlist;
    int l;

    while (plp) { /* Try along the path then */
	*current_filename = 0;
	l = strlen(plp->path);
	if(l)
	  {
	    strcpy(current_filename, plp->path);
	    if (!is_dirsep(current_filename[l - 1]))
	    {
	      current_filename[l] = CHAR_DIRSEP;
	      current_filename[l + 1] = '\0';
	    }
	  }
	strcat(current_filename, name);
	DEBUG_MSG("Trying to open %s\n", current_filename);
	if ((fp = fopen(current_filename, OPEN_MODE)) != NULL)
	  return fp;
	plp = plp->next;
    }
  }

  /* Nothing could be opened. */
  DEBUG_MSG("Could not open %s\n", name);
  return NULL;
}

/* This allocates memory and clears it. */
void *timi_calloc(size_t count)
{
  void *p = timi_malloc(count);
  if (p == NULL) {
    DEBUG_MSG("malloc() failed for %lu bytes.\n", (unsigned long)count);
    return NULL;
  }
  memset(p, 0, count);
  return p;
}

/* This adds a directory to the path list */
int timi_add_pathlist(const char *s, size_t l)
{
  PathList *plp = (PathList *) timi_malloc(sizeof(PathList));
  if (!plp) return -2;
  plp->path = (char *) timi_malloc(l + 1);
  if (!plp->path) {
    timi_free (plp);
    return -2;
  }
  plp->next = pathlist;
  pathlist = plp;
  strncpy(plp->path, s, l);
  plp->path[l] = 0;
  return 0;
}

void timi_free_pathlist(void)
{
    PathList *plp = pathlist;
    PathList *next;

    while (plp) {
	next = plp->next;
	timi_free(plp->path);
	timi_free(plp);
	plp = next;
    }
    pathlist = NULL;
}
