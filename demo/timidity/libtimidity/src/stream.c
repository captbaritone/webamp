/* libTiMidity is licensed under the terms of the GNU Lesser General
 * Public License: see COPYING for details.
 *
 * Note that the included TiMidity source, based on timidity-0.2i, was
 * originally licensed under the GPL, but the author extended it so it
 * can also be used separately under the GNU LGPL or the Perl Artistic
 * License: see the notice by Tuukka Toivonen as it appears on the web
 * at http://ieee.uwaterloo.ca/sca/www.cgs.fi/tt/timidity/ .
 */

/* libTiMidity -- MIDI to WAVE converter library
 * Copyright (C) 2004 Konstantin Korikov <lostclus@gmail.com>
 * Copyright (C) 2014 O.Sezer <sezero@users.sourceforge.net>
 *
 * This library is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or (at
 * your option) any later version.
 *
 * This library is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser
 * General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this library; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include "string.h"

#include "timidity_internal.h"
#include "common.h"

struct _MidIStream
{
  MidIStreamReadFunc read;
  MidIStreamSeekFunc seek;
  MidIStreamTellFunc tell;
  MidIStreamCloseFunc close;
  void *ctx;
};

typedef struct StdIOContext
{
  FILE *fp;
  int autoclose;
} StdIOContext;

static size_t
stdio_istream_read (void *ctx, void *ptr, size_t size, size_t nmemb)
{
  return fread (ptr, size, nmemb, ((StdIOContext *) ctx)->fp);
}

static int
stdio_istream_seek (void *ctx, long offset, int whence)
{
  return fseek (((StdIOContext *) ctx)->fp, offset, whence);
}

static long
stdio_istream_tell (void *ctx)
{
  return ftell (((StdIOContext *) ctx)->fp);
}

static int
stdio_istream_close (void *ctx)
{
  int ret = 0;
  if (((StdIOContext *) ctx)->autoclose)
    ret = fclose (((StdIOContext *) ctx)->fp);
  timi_free (ctx);
  return ret;
}

typedef struct MemContext
{
  sint8 *base;
  sint8 *current;
  sint8 *end;
} MemContext;

static size_t
mem_istream_read (void *ctx, void *ptr, size_t size, size_t nmemb)
{
  MemContext *c;
  size_t count;

  c = (MemContext *) ctx;
  count = nmemb;

  if (c->current + count * size > c->end)
    count = (c->end - c->current) / size;

  if (count == 0)
    return 0;

  memcpy (ptr, c->current, count * size);
  c->current += count * size;

  return count;
}

static int
mem_istream_seek(void *ctx, long offset, int whence)
{
  MemContext *c = (MemContext *) ctx;

  switch (whence) {
  case SEEK_SET:
    break;
  case SEEK_CUR:
    offset += (c->current - c->base);
    break;
  case SEEK_END:
    offset += (c->end - c->base);
    break;
  default:
   return -1;
  }

  if (offset < 0)
    return -1;

  if (offset > c->end - c->base)	/* just seek to end */
    offset = c->end - c->base;

  c->current = c->base + offset;
  return 0;
}

static long
mem_istream_tell(void *ctx)
{
  MemContext *c = (MemContext *) ctx;
  return (c->current - c->base);
}

static int
mem_istream_close (void *ctx)
{
  timi_free (ctx);
  return 0;
}

MidIStream *
mid_istream_open_fp (FILE * fp, int autoclose)
{
  StdIOContext *ctx;
  MidIStream *stream;

  stream = (MidIStream *) timi_malloc(sizeof(MidIStream));
  if (stream == NULL)
    return NULL;

  ctx = (StdIOContext *) timi_malloc(sizeof(StdIOContext));
  if (ctx == NULL)
    {
      timi_free (stream);
      return NULL;
    }
  ctx->fp = fp;
  ctx->autoclose = autoclose;

  stream->ctx = ctx;
  stream->read = stdio_istream_read;
  stream->seek = stdio_istream_seek;
  stream->tell = stdio_istream_tell;
  stream->close = stdio_istream_close;

  return stream;
}

MidIStream *
mid_istream_open_file (const char *file)
{
  FILE *fp;

  fp = fopen (file, "rb");
  if (fp == NULL)
    return NULL;

  return mid_istream_open_fp (fp, 1);
}

MidIStream *
mid_istream_open_mem (void *mem, size_t size)
{
  MemContext *ctx;
  MidIStream *stream;

  stream = (MidIStream *) timi_malloc(sizeof(MidIStream));
  if (stream == NULL)
    return NULL;

  ctx = (MemContext *) timi_malloc(sizeof(MemContext));
  if (ctx == NULL)
    {
      timi_free (stream);
      return NULL;
    }
  ctx->base = (sint8 *) mem;
  ctx->current = (sint8 *) mem;
  ctx->end = ((sint8 *) mem) + size;

  stream->ctx = ctx;
  stream->read = mem_istream_read;
  stream->seek = mem_istream_seek;
  stream->tell = mem_istream_tell;
  stream->close = mem_istream_close;

  return stream;
}

MidIStream *
mid_istream_open_callbacks (MidIStreamReadFunc read,
			    MidIStreamSeekFunc seek,
			    MidIStreamTellFunc tell,
			    MidIStreamCloseFunc close, void *context)
{
  MidIStream *stream;

  stream = (MidIStream *) timi_malloc(sizeof(MidIStream));
  if (stream == NULL)
    return NULL;

  stream->ctx = context;
  stream->read = read;
  stream->seek = seek;
  stream->tell = tell;
  stream->close = close;

  return stream;
}

size_t
mid_istream_read (MidIStream * stream, void *ptr, size_t size, size_t nmemb)
{
  return stream->read (stream->ctx, ptr, size, nmemb);
}

int
mid_istream_seek (MidIStream * stream, long offset, int whence)
{
  return stream->seek (stream->ctx, offset, whence);
}

long
mid_istream_tell (MidIStream * stream)
{
  return stream->tell (stream->ctx);
}

int
mid_istream_skip (MidIStream * stream, long len)
{
  if (stream->seek (stream->ctx, len, SEEK_CUR) < 0)
    return -1;
  return 0;
}

int
mid_istream_close (MidIStream * stream)
{
  int ret = stream->close (stream->ctx);
  timi_free (stream);
  return ret;
}
