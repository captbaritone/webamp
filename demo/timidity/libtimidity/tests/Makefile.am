
if HAVE_AO
  PLAYMIDI = playmidi
else
  PLAYMIDI =
endif

noinst_PROGRAMS = midi2raw $(PLAYMIDI)

AM_CPPFLAGS = -I$(top_srcdir) -I$(top_srcdir)/src
LDADD = $(top_builddir)/src/libtimidity.la @LIBTIMIDITY_LIBS@

midi2raw_SOURCES = midi2raw.c

playmidi_SOURCES = playmidi.c
playmidi_LDADD = $(LDADD) @AO_LIBS@
playmidi_CFLAGS = @AO_CFLAGS@

noinst_SCRIPTS = runtest.sh
TESTS = runtest.sh

EXTRA_DIST = ame002.mid runtest.sh
