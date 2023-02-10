/*---------------------------------------------------
-----------------------------------------------------
Filename:	video_handles.m
Version:	2.0

Type:		maki
Date:		28. Okt. 2006 - 16:30 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
Depending Files:
		scripts/suicore.maki
-----------------------------------------------------
---------------------------------------------------*/

#ifndef included
#error This script can only be compiled as a #include
#endif

#define SKINTWEAKS_CFGPAGE "{0542AFA4-48D9-4c9f-8900-5739D52C114F}"

Function initVideo();
Function disablePSOVC();
Function enablePSOVC();

Global Timer PSOVCTimer;
Global string psovc_save;

Global WinampConfigGroup cfg_Video;

Global Boolean lastWasVideo;

initVideo ()
{
	PSOVCTimer = new Timer;
	PSOVCTimer.setDelay(1000);

	cfg_Video = WinampConfig.getGroup("{2135E318-6919-4bcf-99D2-62BE3FCA8FA6}");
}

/** Prevent video playback to stop after the wnd is hidden */

disablePSOVC()
{
	debugString("[suicore.m] " + "--> disabling stop on video close",0 );
	ConfigItem item = Config.getItem(SKINTWEAKS_CFGPAGE);
	if (item)
	{
		ConfigAttribute attr = item.getAttribute("Prevent video playback Stop on video window Close");
		if (attr) psovc_save = attr.getData();
		if (attr) attr.setData("1");
	}
	PSOVCTimer.start();
	debugString("[suicore.m] " + "--> PSOVCTimer.started();",0 );
}

enablePSOVC()
{
	debugString("[suicore.m] " + "--> enabling stop on video close",0 );
	PSOVCTimer.stop();
	ConfigItem item = Config.getItem(SKINTWEAKS_CFGPAGE);
	if (item)
	{
		ConfigAttribute attr = item.getAttribute("Prevent video playback Stop on video window Close");
		if (attr) attr.setData(psovc_save);
	}
	debugString("[suicore.m] " + "--> PSOVCTimer.stopped();",0 );
}

PSOVCTimer.onTimer()
{
	enablePSOVC();
}
/* removed for debugging aims
System.onPlay ()
{
	if (isVideo() && cfg_Video.getBool("autoopen") && !sui_video.isVisible()) dc_showVideo();
}

System.onResume ()
{
	if (isVideo() && cfg_Video.getBool("autoopen") && !sui_video.isVisible()) dc_showVideo();
}

System.onTitleChange (String newtitle)
{
	if (startup)
	{
		lastWasVideo = isVideo();
		return;
	}
	
	if (isVideo() && cfg_Video.getBool("autoopen") && !sui_video.isVisible() && getStatus() != 0) dc_showVideo();
	else if (!isVideo() && cfg_Video.getBool("autoclose") && sui_video.isVisible() && lastWasVideo) showML();
	lastWasVideo = isVideo();
}
*/