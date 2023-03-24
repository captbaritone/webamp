/*---------------------------------------------------
-----------------------------------------------------
Filename:	external_handles.m

Type:		maki
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


//----------------------------------------------------------------------------------------------------------------
// The main component switching as triggered by user menus, keyboard shortcuts, etc
//----------------------------------------------------------------------------------------------------------------

System.onGetCancelComponent(String guid, boolean goingvisible) {
	debugString(DEBUG_PREFIX "System.onGetCancelComponent ( "+ guid + " , " + integerToString(goingvisible) + " )  {", D_WTF);
	debugString(DEBUG_PREFIX "   [Last Content: " + getPrivateString(getSkinName(), "Component", "Media Library") + " ]", D_WTF);

	Boolean isShade = (player.getCurLayout() != normal);

	// Do Playlist Stuff First (is unlinked from SUI)

	if (guid == PL_GUID)
	{
		if (goingvisible && isShade)
		{
			debugString(DEBUG_PREFIX "   --> opening pl --- return from shade!", D_WTF);
			debugString(DEBUG_PREFIX "   return TRUE;", D_WTF);	
			debugString(DEBUG_PREFIX "}", D_WTF);
			switchToNoComp();
			player.switchToLayout("normal");
			normal.sendAction("load_comp", "pledit", 0,0,0,0);
			return TRUE;
		}
	}

	// Now we detect if suicore is already performing an action - if so we will return.

	if (bypasscancel)
	{
		debugString(DEBUG_PREFIX "   --> bypasscancel", D_WTF);
		debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);	
		debugString(DEBUG_PREFIX "}", D_WTF);

		return FALSE;
	}
	if (guid == ML_GUID && !goingvisible && hiding_ml)
	{
		debugString(DEBUG_PREFIX "   --> hiding_ml", D_WTF);
		debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);	
		debugString(DEBUG_PREFIX "}", D_WTF);

		return FALSE;
	}
	if (guid == VIDEO_GUID && !goingvisible && hiding_video)
	{
		debugString(DEBUG_PREFIX "   --> hiding_video", D_WTF);
		debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);	
		debugString(DEBUG_PREFIX "}", D_WTF);

		return FALSE;
	}
	if (guid == VIS_GUID && !goingvisible && hiding_vis)
	{
		debugString(DEBUG_PREFIX "   --> hiding_vis", D_WTF);
		debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);	
		debugString(DEBUG_PREFIX "}", D_WTF);

		return FALSE;
	}
	if (guid == ML_GUID && goingvisible && showing_ml)
	{
		debugString(DEBUG_PREFIX "   --> showing_ml", D_WTF);
		debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);	
		debugString(DEBUG_PREFIX "}", D_WTF);

		return FALSE;
	}
	if (guid == VIDEO_GUID && goingvisible && showing_video)
	{
		debugString(DEBUG_PREFIX "   --> showing_video", D_WTF);
		debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);	
		debugString(DEBUG_PREFIX "}", D_WTF);

		return FALSE;
	}
	if (guid == VIS_GUID && goingvisible && showing_vis)
	{
		debugString(DEBUG_PREFIX "   --> showing_vis", D_WTF);
		debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);	
		debugString(DEBUG_PREFIX "}", D_WTF);

		return FALSE;
	}

	
	// Let's get our current Content

	String window_content =  getPrivateString(getSkinName(), "Component", "Media Library");

	// If a window wants to hide but we are still in collapsed mode - return
	if (!goingvisible && window_content == "Hidden")
	{
		debugString(DEBUG_PREFIX "   --> SUI isn't visible", D_WTF);
		debugString(DEBUG_PREFIX "   return TRUE;", D_WTF);	
		debugString(DEBUG_PREFIX "}", D_WTF);
		return FALSE;
	}

	// All comps that want to be shown
	if (goingvisible) {
		if (guid == VIDEO_GUID && (window_content != "Video" || isShade)) {
			debugString(DEBUG_PREFIX "   --> external showing_video --- start Timer", D_WTF);
			debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);	
			debugString(DEBUG_PREFIX "}", D_WTF);

			if (isShade)
			{
				sui_video.hide();
				player.switchToLayout("normal");
			}

			//setPrivateString(getSkinName(), "Component", "Video");

			//--hideExp();
			hideBrw();
			hideVis();
			hideMl();
			//--hideCfg();

			if (window_content == "Hidden")
			{
				setPrivateString(getSkinName(), "Hidden Component", "Video");
				dc_showSUI ();
				return TRUE;
			}

			dc_showVideo();

			return TRUE;
		} else if (guid == VIS_GUID && (window_content != "Vis" || isShade)) {

			if (vis_inbig_attrib.getData() == "0")
			{
				debugString(DEBUG_PREFIX "   --> vis shouldn't be shown in big sui!", D_WTF);
				debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);	
				debugString(DEBUG_PREFIX "}", D_WTF);
				return FALSE;
			}

			debugString(DEBUG_PREFIX "   --> external showing_vis --- start Timer", D_WTF);
			debugString(DEBUG_PREFIX "   return TRUE;", D_WTF);	
			debugString(DEBUG_PREFIX "}", D_WTF);

			if (isShade)
			{
				sui_vis.hide();
				player.switchToLayout("normal");
			}

			//setPrivateString(getSkinName(), "Component", "Vis");

			disablePSOVC();
			hideVideo();
			hideMl();
			//--hideExp();
			hideBrw();
			//--hideCfg();
			if (window_content == "Hidden")
			{
				setPrivateString(getSkinName(), "Hidden Component", "Vis");
				dc_showSUI ();
				return TRUE;
			}
			dc_showVis();

			return TRUE;
		} else if (guid == ML_GUID && (window_content != "Media Library" || isShade)) {
			debugString(DEBUG_PREFIX "   --> external showing_ml --- start Timer", D_WTF);
			debugString(DEBUG_PREFIX "   return TRUE;", D_WTF);	
			debugString(DEBUG_PREFIX "}", D_WTF);

			if (isShade)
			{
				sui_ml.hide();
				player.switchToLayout("normal");
			}

			//setPrivateString(getSkinName(), "Component", "Media Library");

			disablePSOVC();
			hideVideo();
			hideVis();
			//--hideExp();
			hideBrw();
			//--hideCfg();
			if (window_content == "Hidden")
			{
				setPrivateString(getSkinName(), "Hidden Component", "Media Library");
				dc_showSUI ();
				return TRUE;
			}
			dc_showMl();

			return TRUE;
		}
	}
	
	// All comps that want to be hidden
	if (!goingvisible) {
		if (guid == VIDEO_GUID && window_content == "Video") {
			debugString(DEBUG_PREFIX "   --> external hiding_video", D_WTF);
			if (getStatus() == 1 && isVideo())
			{
				debugString(DEBUG_PREFIX "   --> video is playing", D_WTF);
				debugString(DEBUG_PREFIX "   return TRUE;", D_WTF);
				debugString(DEBUG_PREFIX "}", D_WTF);
				return true;

			}
			else
			{
				disablePSOVC();
				hideVideo();
				hideVis();
				//--hideExp();
				hideBrw();
				//--hideCfg();
				dc_showMl(); // normal Component
				debugString(DEBUG_PREFIX "   --> no video is playing", D_WTF);
				debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);
				debugString(DEBUG_PREFIX "}", D_WTF);
				return false;
			}
		}
		if (guid == VIS_GUID && window_content == "Vis") {
			if (vis_inbig_attrib.getData() == "0")
			{
				debugString(DEBUG_PREFIX "   --> vis shouldn't be closed in big sui!", D_WTF);
				debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);	
				debugString(DEBUG_PREFIX "}", D_WTF);
				return FALSE;
			}
			if (getStatus() != STATUS_STOPPED && system.isVideo())
			{
				debugString(DEBUG_PREFIX "   --> external hiding_vis --- open Video", D_WTF);
				hideMl();
				hideVis();
				//--hideExp();
				hideBrw();
				//--hideCfg();
				dc_showVideo();
			} 
			else 
			{
				debugString(DEBUG_PREFIX "   --> external hiding_video --- hide Video", D_WTF);
				hideVideo();
				hideVis();
				//--hideExp();
				hideBrw();
				//--hideCfg();
				dc_showMl(); // normal Component
			}
			debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);	
			debugString(DEBUG_PREFIX "}", D_WTF);
			return FALSE;
		}
		if (guid == ML_GUID && window_content == "Media Library") {
			if ((getStatus() == STATUS_PLAYING || getStatus() == STATUS_PAUSED) && isVideo())
			{
				debugString(DEBUG_PREFIX "   --> external hiding_ml --- open Video", D_WTF);
				debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);	
				debugString(DEBUG_PREFIX "}", D_WTF);
				hideMl();
				hideVis();
				//--hideExp();
				hideBrw();
				//--hideCfg();
				dc_showVideo();
				return FALSE;
			} 
			else 
			{
				debugString(DEBUG_PREFIX "   --> external hiding_ml --- switch to browser", D_WTF);
				debugString(DEBUG_PREFIX "   return flase;", D_WTF);	
				debugString(DEBUG_PREFIX "}", D_WTF);
				hideMl();
				hideVis();
				hideBrw();
				//--hideCfg();
				hideVideo();
				//--hideExp();
				dc_closeSUI();
				return false;
			}

		}
	}

	debugString(DEBUG_PREFIX "   --> Went thru", D_WTF);
	debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);
	debugString(DEBUG_PREFIX "}", D_WTF);

	return FALSE;
}


Player.onSwitchToLayout (Layout _layout)
{
	if (_layout.getId() != "normal")
	{
		mychange = 1;
		//--sui_explorer_attrib.setData("0");
		sui_browser_attrib.setData("0");
		//--sui_config_attrib.setData("0");
		mychange = 0;
	}
}

//----------------------------------------------------------------------------------------------------------------
// Windows that aren't registered with winamp will be handled here, the visibility state is linked to cfgattribs
//----------------------------------------------------------------------------------------------------------------

sui_browser_attrib.onDataChanged ()
{
	if (mychange) return;
	mychange = 1;
	String window_content = getPrivateString(getSkinName(), "Component", "Media Library");
	if (getData() == "1")
	{
		if (player.getCurLayout() != normal)
		{
			player.switchToLayout("normal");
			hideMl();
			hideVis();
			//--hideCfg();
			hideVideo();
			//--hideExp();
			dc_showBrw();
			return;
		}
		if (window_content == "Hidden")
		{
			setPrivateString(getSkinName(), "Hidden Component", "Browser");
			switchFromNoComp ();
			return;
		}
		switchToBrw();
	}
	else
	{
		if ((getStatus() == STATUS_PLAYING || getStatus() == STATUS_PAUSED) && isVideo())
		{
			hideBrw();
			dc_showVideo();
		} 
		else
		{
			hideBrw();
			dc_showml();			
		}
	}
	mychange = 0;
}

/*--sui_config_attrib.onDataChanged ()
{
	if (mychange) return;
	mychange = 1;
	String window_content = getPrivateString(getSkinName(), "Component", "Media Library");
	if (getData() == "1")
	{
		if (player.getCurLayout() != "normal")
		{
			player.switchToLayout("normal");
			hideMl();
			hideVis();
			hideBrw();
			hideCfg();
			hideVideo();
			hideExp();
			dc_showCfg();
			return;
		}
		if (window_content == "Hidden")
		{
			setPrivateString(getSkinName(), "Hidden Component", "Config");
			switchFromNoComp ();
			return;
		}
		switchToCfg();
	}
	else
	{
		if ((getStatus() == STATUS_PLAYING || getStatus() == STATUS_PAUSED) && isVideo())
		{
			hideCfg();
			dc_showVideo();
		} 
		else
		{
			hideCfg();
			dc_showml();			
		}
	}
	mychange = 0;
}


sui_explorer_attrib.onDataChanged ()
{
	if (mychange) return;
	mychange = 1;
	String window_content = getPrivateString(getSkinName(), "Component", "Media Library");
	if (getData() == "1")
	{
		if (player.getCurLayout() != normal)
		{
			player.switchToLayout("normal");
			hideMl();
			hideVis();
			hideBrw();
			//--hideCfg();
			hideVideo();
			dc_showExp();
			return;
		}
		if (window_content == "Hidden" )
		{
			setPrivateString(getSkinName(), "Hidden Component", "Explorer");
			switchFromNoComp ();
			return;
		}
		switchToExp();
	}
	else
	{
		if ((getStatus() == STATUS_PLAYING || getStatus() == STATUS_PAUSED) && isVideo())
		{
			hideExp();
			dc_showVideo();
		} 
		else
		{
			hideExp();
			dc_showml();			
		}
	}
	mychange = 0;
}
--*/


//----------------------------------------------------------------------------------------------------------------
// If a link is clicked within winamp this function *should* be called by wasabi core.
// returning 1 prevents winamp to open the url in an external browser
//----------------------------------------------------------------------------------------------------------------

System.onOpenUrl(string url)
{
	// If winamp is in shade mode
	if (player.getCurLayout() != normal) 
	{
		string comp = getPrivateString(getSkinName(), "Component", "Media Library"); // Get the current sui component

		// Can also happen, winamp is in shade - and normal wnd is collapsed
		if (comp == "Hidden")
		{
			player.switchToLayout("normal");
			setPrivateString(getSkinName(), "Hidden Component", "Browser");
			setPrivateString(getSkinName(), "UrlXgive", url);
			switchFromNoComp();
			return 1;
		}

		// The other case - sade & normal is not collapsed
		setPrivateString(getSkinName(), "UrlXgive", url);
		player.switchToLayout("normal");
		hideMl();
		hideVis();
		//--hideCfg();
		hideVideo();
		//--hideExp();
		dc_showBrw();
		return 1;
	}

	String window_content = getPrivateString(getSkinName(), "Component", "Media Library");

	// just deliver the url since the browser is already visible
	if (window_content == "Browser") 
	{
		browser brw = sui_brw.findObject("webbrowser");
		if (brw != NULL)
		{
			brw.sendAction ("openurl", url, 0, 0, 0, 0);			
		}
	}
	// Some other component is visible - so we store the url and show the browser
	else
	{
		setPrivateString(getSkinName(), "UrlXgive", url);
		debugString("System.onOpenUrl( "+url+" ); --> opening Browser", D_WTF);
		if (window_content == "Hidden")
		{
			setPrivateString(getSkinName(), "Hidden Component", "Browser");
			switchFromNoComp ();
			return 1;
		}
		switchToBrw();		
	}
	return 1;
}


//----------------------------------------------------------------------------------------------------------------
// the sui window can recieve messages from other scripts (mainly: fileinfo.maki) - we handle this here
//----------------------------------------------------------------------------------------------------------------

sui_window.onAction (String action, String param, Int x, int y, int p1, int p2, GuiObject source)
{
	// Perform a search in the browser
	if (strlower(action) == "browser_search")
	{
		browser brw = sui_brw.findObject("webbrowser");
		/*if (player.getCurLayout() != normal) // unlikely to happen!
		{
			//setPrivateString(getSkinName(), "UrlXgive", url);
			player.switchToLayout("normal");
			hideMl();
			hideVis();
			//--hideCfg();
			hideVideo();
			//--hideExp();
			dc_showBrw();
			brw.sendAction ("search", param, 0, 0, 0, 0);	
			return 1;
		}*/
		String window_content = getPrivateString(getSkinName(), "Component", "Media Library");
		if (window_content == "Browser")
		{
			if (brw != NULL)
			{
				brw.sendAction ("search", param, 0, 0, 0, 0);			
			}
		}
		else
		{
			//setPrivateString(getSkinName(), "UrlXgive", url);
			debugString("System.onOpenUrl( "+url+" ); --> opening Browser", D_WTF);
			if (window_content == "Hidden")
			{
				setPrivateString(getSkinName(), "Hidden Component", "Browser");
				switchFromNoComp ();
				brw.sendAction ("search", param, 0, 0, 0, 0);
				return 1;
			}
			switchToBrw();
			brw.sendAction ("search", param, 0, 0, 0, 0);	
		}
		return 1;
	}
	// Just naviagate to a site
	if (strlower(action) == "browser_navigate")
	{
		browser brw = sui_brw.findObject("webbrowser");
		if (player.getCurLayout() != normal)
		{
			//setPrivateString(getSkinName(), "UrlXgive", url);
			player.switchToLayout("normal");
			hideMl();
			hideVis();
			//--hideCfg();
			hideVideo();
			//--hideExp();
			dc_showBrw();
			brw.sendAction ("openurl", param, 0, 0, 0, 0);	
			return 1;
		}
		String window_content = getPrivateString(getSkinName(), "Component", "Media Library");
		if (window_content == "Browser")
		{
			if (brw != NULL)
			{
				brw.sendAction ("openurl", param, 0, 0, 0, 0);			
			}
		}
		else
		{
			//setPrivateString(getSkinName(), "UrlXgive", url);
			debugString("System.onOpenUrl( "+url+" ); --> opening Browser", D_WTF);
			if (window_content == "Hidden")
			{
				setPrivateString(getSkinName(), "Hidden Component", "Browser");
				brw.sendAction ("openurl", param, 0, 0, 0, 0);	
				switchFromNoComp ();
				return 1;
			}
			switchToBrw();
			brw.sendAction ("openurl", param, 0, 0, 0, 0);	
		}
		return 1;
	}
	if (strlower(action) == "opentab")
	{
		if (strlower(param) == "ml")
		{
			switchToMl();
		}
	}
}


//----------------------------------------------------------------------------------------------------------------
// Switching Vis Plugin between MCV and SUI
//----------------------------------------------------------------------------------------------------------------

vis_inbig_attrib.onDataChanged ()
{
	if (mychange) return;
	String window_content2 =  getPrivateString(getSkinName(), "Component", "Cover");
	String window_content =  getPrivateString(getSkinName(), "Component2", "Media Library");
	int xg = getPrivateInt(getSkinName(), "ComponentXgive", 0);
	if (getData() == "1" && (ic_vis.getData() == "1" || ic_vis_fileinfo.getData() == "1"  || xg))
	{
		if (xg) setPrivateInt(getSkinName(), "ComponentXgive", 0);
		switchToVis();
	}
	else if (getData() == "0" && sui_Vis.isVisible())
	{
		setPrivateInt(getSkinName(), "ComponentXgive", 1);
		hideVis();
		switchToMl();
	}
}

//----------------------------------------------------------------------------------------------------------------
// this one has only debug aims :)
//----------------------------------------------------------------------------------------------------------------

#ifdef DEBUG
System.onLookForComponent(String guid)
{
	debugString(DEBUG_PREFIX "System.onLookForComponent ( "+ guid + " )", D_WTF);
}
#endif