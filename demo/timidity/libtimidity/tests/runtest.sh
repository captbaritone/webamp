#!/bin/sh

# Try to test library

[ "x$builddir" = "x" ] && builddir="."
[ "x$srcdir" = "x" ] && srcdir="."
midi_file="$srcdir/ame002.mid"
midi2raw_opts="-r 44100 -s 16 -c 2"
play_cmd=""

if [ -x "$builddir/playmidi" ]; then
	echo "Running: $builddir/playmidi $midi_file"
	exec "$builddir/playmidi" "$midi_file"
elif [ "x`which aplay 2>/dev/null`" != "x" ]; then
	play_cmd="aplay -f cd -"
elif [ "x`which play 2>/dev/null`" != "x" ]; then
	play_cmd="play -r 44100 -s -b 16 -c 2 -t raw -"
else
	echo "No command found for sound output!\n" >&2
	exit 1
fi

if [ "x$play_cmd" != "x" ]; then
	echo "Running: $builddir/midi2raw $midi2raw_opts $midi_file |$play_cmd"
	exec "$builddir/midi2raw" $midi2raw_opts "$midi_file" |$play_cmd
fi
