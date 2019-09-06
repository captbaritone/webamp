/* macros and inlines to manipulate path names OS-specifically in libtimidity.
 * written by O. Sezer <sezero@users.sourceforge.net>  using public knowledge,
 * put into public domain.
 */

#ifndef OSPATHS_H
#define OSPATHS_H

#include <string.h>

/* ---------------------- Windows, DOS, OS2: ---------------------- */
#if defined(__MSDOS__) || defined(__DOS__) || defined(__DJGPP__) || \
    defined(_MSDOS) || defined(__OS2__) || defined(__EMX__) || \
    defined(_WIN32) || defined(_Windows) || defined(__WINDOWS__) || \
    defined(__NT__) || defined(__CYGWIN__)

#if defined(__DJGPP__)
#define CHAR_DIRSEP '/'
#else
#define CHAR_DIRSEP '\\'
#endif
#define is_dirsep(c) ((c) == '/' || (c) == '\\')
#define is_abspath(p) ((p)[0] == '/' || (p)[0] == '\\' || ((p)[0] && (p)[1] == ':'))

#ifndef __cplusplus
/* FIXME: What about C:FOO ? */
static inline char *get_last_dirsep (const char *p) {
    char *p1 = strrchr(p, '/');
    char *p2 = strrchr(p, '\\');
    if (!p1) return p2;
    if (!p2) return p1;
    return (p1 > p2)? p1 : p2;
}
#else
static inline char *get_last_dirsep (char *p) {
    char *p1 = strrchr(p, '/');
    char *p2 = strrchr(p, '\\');
    if (!p1) return p2;
    if (!p2) return p1;
    return (p1 > p2)? p1 : p2;
}
static inline const char *get_last_dirsep (const char *p) {
    const char *p1 = strrchr(p, '/');
    const char *p2 = strrchr(p, '\\');
    if (!p1) return p2;
    if (!p2) return p1;
    return (p1 > p2)? p1 : p2;
}
#endif /* C++ */

/* ----------------- AmigaOS, MorphOS, AROS, etc: ----------------- */
#elif defined(__MORPHOS__) || defined(__AROS__) || defined(AMIGAOS)	|| \
      defined(__amigaos__) || defined(__amigaos4__) ||defined(__amigados__) || \
      defined(AMIGA) || defined(_AMIGA) || defined(__AMIGA__)

#define CHAR_DIRSEP '/'
#define is_dirsep(c) ((c) == '/' || (c) == ':')
#define is_abspath(p) ((p)[0] == '/' || (strchr((p), ':') != NULL))

#ifndef __cplusplus
static inline char *get_last_dirsep (const char *p) {
    char *p1 = strrchr(p, '/');
    if (p1) return p1;
    return  strchr(p, ':');
}
#else
static inline char *get_last_dirsep (char *p) {
    char *p1 = strrchr(p, '/');
    if (p1) return p1;
    return  strchr(p, ':');
}
static inline const char *get_last_dirsep (const char *p) {
    const char *p1 = strrchr(p, '/');
    if (p1) return p1;
    return  strchr(p, ':');
}
#endif /* C++ */

/* ---------------------- assumed UNIX-ish : ---------------------- */
#else /* */

#define CHAR_DIRSEP '/'
#define is_dirsep(c) ((c) == '/')
#define is_abspath(p) ((p)[0] == '/')

#ifndef __cplusplus
static inline char *get_last_dirsep (const char *p) {
    return strrchr(p, '/');
}
#else
static inline char *get_last_dirsep (char *p) {
    return strrchr(p, '/');
}
static inline const char *get_last_dirsep (const char *p) {
    return strrchr(p, '/');
}
#endif /* C++ */

#endif

#endif /* OSPATHS_H */
