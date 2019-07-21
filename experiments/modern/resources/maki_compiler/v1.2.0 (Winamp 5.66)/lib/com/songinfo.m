/*---------------------------------------------------
-----------------------------------------------------
Filename:	songinfo.m
Version:	1.0

Type:		maki/songinfo loading
Date:		09. Sept. 2008 - 10:02
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
-----------------------------------------------------
---------------------------------------------------*/

/**
 *	This library is still in testing phase
 */

#ifndef included
#error This script can only be compiled as a #include
#endif

// use this function to reload songinfo (usually do this on system.onTitleChange())
Function songinfo_reload();

// use this vars to get song information (is faster than function calls)
Global String songinfo_title;
Global String songinfo_artist;
Global String songinfo_album;
Global String songinfo_location;	// url or path on your hd
Global String songinfo_displayTitle;

Global String songinfo_streamTitle;	// similar to display title
Global String songinfo_streamName;	// name of current stream (station title)
Global String songinfo_streamURL;
Global String songinfo_streamAlbumArt;	// _full_ URL to an image on the web, like http://images.play.it/amg/album/cov200/drh200/h238/h23853pph7b.jpg

Global Boolean songinfo_isStream;	// true if current song is a stream

Global Int songinfo_streamType;		// use in conjunction with the values below
#define SONGINFO_STREAMTYPE_SHOUTCAST	2
#define SONGINFO_STREAMTYPE_AOLRADIO	3
#define SONGINFO_STREAMTYPE_CBSRADIO	4
#define SONGINFO_STREAMTYPE_SHOUTCAST2	5
#define SONGINFO_STREAMTYPE_NOSTREAM	0
#define SONGINFO_STREAMTYPE_UNKNOWN	666

/////////////////////////////////////
// IMPLEMENTATION // DO NOT MODIFY //
/////////////////////////////////////

songinfo_reload()
{
	// Fill vars with data
	songinfo_location	= System.getPlayItemString();
	songinfo_displayTitle	= System.getPlayItemDisplayTitle();

	String metaPrefix	= ""; // used for streams

	// Check for a stream
	songinfo_streamType	= stringToInteger(getPlayItemMetaDataString("streamtype"));
	songinfo_isStream	= (songinfo_streamType > 0);
	if (songinfo_isStream) // STREAM!
	{
		if (!(songinfo_streamType == SONGINFO_STREAMTYPE_SHOUTCAST
			|| songinfo_streamType == SONGINFO_STREAMTYPE_AOLRADIO
			|| songinfo_streamType == SONGINFO_STREAMTYPE_CBSRADIO
			|| songinfo_streamType == SONGINFO_STREAMTYPE_SHOUTCAST2))
		{
			songinfo_streamType = SONGINFO_STREAMTYPE_UNKNOWN;
		}

		// read stream metadata
		songinfo_streamName	= getPlayItemMetaDataString("streamname");
		songinfo_streamTitle	= getPlayItemMetaDataString("streamtitle");
		songinfo_streamURL	= getPlayItemMetaDataString("streamurl");

		if (songinfo_streamType == SONGINFO_STREAMTYPE_AOLRADIO)
		{
			metaPrefix = "uvox/";
		}
		else if (songinfo_streamType == SONGINFO_STREAMTYPE_CBSRADIO)
		{
			metaPrefix = "cbs/";
		}

		songinfo_streamAlbumArt	= getPlayItemMetaDataString(metaPrefix + "albumart");
		if (songinfo_streamType == SONGINFO_STREAMTYPE_AOLRADIO)
		{
			songinfo_streamAlbumArt = "http://broadband-albumart.music.aol.com/scan/" + songinfo_streamAlbumArt;
		}
	}
	else //NO STREAM!
	{
		// resetting stream specific values
		songinfo_streamName	= "";
		songinfo_streamTitle	= "";
		songinfo_streamURL	= "";
		songinfo_streamAlbumArt	= "";
	}
	
	songinfo_title = getPlayItemMetaDataString(metaPrefix + "title");
	songinfo_artist = getPlayItemMetaDataString(metaPrefix + "artist");
	songinfo_album = getPlayItemMetaDataString(metaPrefix + "album");
}