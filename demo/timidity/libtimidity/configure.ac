#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

AC_PREREQ(2.59)
AC_INIT([libtimidity],[0.2.6])
LIBTIMIDITY_MAJOR_VERSION=0
LIBTIMIDITY_MINOR_VERSION=2
LIBTIMIDITY_MICRO_VERSION=6
LIBTIMIDITY_VERSION=$LIBTIMIDITY_MAJOR_VERSION.$LIBTIMIDITY_MINOR_VERSION.$LIBTIMIDITY_MICRO_VERSION

AC_CONFIG_AUX_DIR([autotools])
AC_CONFIG_SRCDIR([src/playmidi.c])
AM_INIT_AUTOMAKE([1.7 foreign])
AC_CONFIG_MACRO_DIR([m4])
AM_MAINTAINER_MODE

# Library versioning for libtool: CURRENT, REVISION, AGE
# - library source changed -> increment REVISION
# - interfaces added/removed/changed -> increment CURRENT, REVISION = 0
# - interfaces added -> increment AGE
# - interfaces removed -> AGE = 0
LIBTIMIDITY_LT_CURRENT=2
LIBTIMIDITY_LT_REVISION=1
LIBTIMIDITY_LT_AGE=0

AC_CANONICAL_HOST

AC_ARG_ENABLE([debug],[AS_HELP_STRING([--enable-debug],[enable debug mode [default=no]])],,[enable_debug=no])
if test x$enable_debug = xyes
then
	AC_DEFINE([TIMIDITY_DEBUG], 1, [Debug mode])
fi

AC_ARG_WITH([timidity-cfg], AS_HELP_STRING([--with-timidity-cfg=FILE], [Specify the full path to timidity.cfg [default="timidity.cfg"]]),
   timidity_cfg="$withval", timidity_cfg="timidity.cfg")
if test x$timidity_cfg = xyes || test x$timidity_cfg = xno
then
	timidity_cfg="timidity.cfg"
fi
AC_DEFINE_UNQUOTED(TIMIDITY_CFG, "$timidity_cfg", [Define the full path of timidity.cfg])

# Checks for programs.
AC_PROG_CC
AC_PROG_INSTALL
AC_PROG_LN_S
AC_PROG_MAKE_SET
#LT_INIT([win32-dll])
AC_LIBTOOL_WIN32_DLL
AC_PROG_LIBTOOL

if test $ac_cv_prog_gcc = yes
then
	CFLAGS="$CFLAGS -Wall"
fi

# Checks for libraries.
LIBTIMIDITY_LIBS=""
AC_CHECK_LIB([m], [pow], [LIBTIMIDITY_LIBS="$LIBTIMIDITY_LIBS -lm"])

have_ao=no
AC_ARG_ENABLE([ao],[AS_HELP_STRING([--disable-ao],[disable building libao-depending programs])],,[enable_ao=yes])
if test x$enable_ao = xyes
then
	XIPH_PATH_AO([have_ao=yes])
fi
AM_CONDITIONAL([HAVE_AO], [test $have_ao = yes])

# Checks for header files.
AC_HEADER_STDC
AC_CHECK_HEADERS([stdlib.h stdio.h string.h sys/param.h unistd.h math.h])

# Checks for typedefs, structures, and compiler characteristics.
AC_C_INLINE
AC_C_CONST
AC_TYPE_SIZE_T
AC_C_BIGENDIAN

# Checks for library functions.
#AC_FUNC_MALLOC
#AC_FUNC_MEMCMP
#AC_CHECK_FUNCS([memset pow strchr])

# symbol visibility
ac_save_CFLAGS="$CFLAGS"
CFLAGS="$CFLAGS -fvisibility=hidden -Werror"
AC_CACHE_CHECK([if compiler supports visibility attributes],[libtimidity_cv_gcc_visibility],
	AC_LANG_SAVE
	AC_LANG_C
	AC_TRY_COMPILE([void foo(void);
__attribute__((visibility("default"))) void foo(void) {}],
		[],
		[libtimidity_cv_gcc_visibility=yes],
		[libtimidity_cv_gcc_visibility=no])
	AC_LANG_RESTORE)
# we want symbol -fvisibility for elf targets, however it works
# with darwin/macho too.  other than that, windows, dos, os/2, amiga
# do not need it:  for any such targets, the -Werror switch is
# supposed to fail the above check. (I'm adding the manual test
# below nonetheless, just in case.)
case $host_os in
   mingw*|cygwin*|emx*|*djgpp|amigaos*|aros*|morphos*)
	libtimidity_cv_gcc_visibility=no
	;;
esac
CFLAGS="$ac_save_CFLAGS"
if test $libtimidity_cv_gcc_visibility = yes
then
   SYM_VISIBILITY="-DSYM_VISIBILITY -fvisibility=hidden"
fi

AC_SUBST(LIBTIMIDITY_MAJOR_VERSION)
AC_SUBST(LIBTIMIDITY_MINOR_VERSION)
AC_SUBST(LIBTIMIDITY_MICRO_VERSION)
AC_SUBST(LIBTIMIDITY_VERSION)
AC_SUBST(LIBTIMIDITY_LT_CURRENT)
AC_SUBST(LIBTIMIDITY_LT_REVISION)
AC_SUBST(LIBTIMIDITY_LT_AGE)

AC_SUBST(LIBTIMIDITY_LIBS)

AC_SUBST(SYM_VISIBILITY)

AC_CONFIG_FILES([Makefile
		 libtimidity.pc
		 libtimidity.spec
		 src/Makefile
		 tests/Makefile])
AC_CONFIG_HEADERS([config.h])
AC_OUTPUT
