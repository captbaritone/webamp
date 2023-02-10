/*---------------------------------------------------
-----------------------------------------------------
Filename:	external_handles.m
Version:	1.0

Type:		maki
Date:		29. Nov. 2006 - 15:57 
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

#ifdef DEBUG
/** has only debug aims :) */
/*
System.onLookForComponent(String guid) {
debugString(DEBUG_PREFIX "System.onLookForComponent ( "+ guid + " )", D_WTF);
}*/
#endif

#ifdef IC_COVERFLOW
#define ACTIONPERFORMED showing_Fi || hiding_Fi || showing_Cover || hiding_Cover || showing_Vis || hiding_Vis || showing_Vis_Full || hiding_Vis_Full || hiding_eq || showing_eq || hiding_cfg || showing_cfg || _plsc_hiding || _plsc_showing || _cflow_hiding || _cflow_showing
#endif
#ifndef IC_COVERFLOW
#define ACTIONPERFORMED showing_Fi || hiding_Fi || showing_Cover || hiding_Cover || showing_Vis || hiding_Vis || showing_Vis_Full || hiding_Vis_Full || hiding_eq || showing_eq || hiding_cfg || showing_cfg || _plsc_hiding || _plsc_showing
#endif
/** the component switching */

System.onGetCancelComponent(String guid, boolean goingvisible) {
	debugString(DEBUG_PREFIX "System.onGetCancelComponent ( "+ guid + " , " + integerToString(goingvisible) + " )  {", D_WTF);

	if (bypasscancel)
	{
		debugString(DEBUG_PREFIX "   --> bypasscancel", 0);
		debugString(DEBUG_PREFIX "   return FALSE;", 0);	
		debugString(DEBUG_PREFIX "}", 0);

		return FALSE;
	}
	if (guid == VIS_GUID && !goingvisible && hiding_vis)
	{
		debugString(DEBUG_PREFIX "   --> hiding_vis", D_WTF);
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
	if (guid == VIS_GUID && !goingvisible && hiding_vis_full)
	{
		debugString(DEBUG_PREFIX "   --> hiding_vis", D_WTF);
		debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);	
		debugString(DEBUG_PREFIX "}", D_WTF);

		return FALSE;
	}
	if (guid == VIS_GUID && goingvisible && showing_vis_full)
	{
		debugString(DEBUG_PREFIX "   --> showing_vis", D_WTF);
		debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);	
		debugString(DEBUG_PREFIX "}", D_WTF);

		return FALSE;
	}

	if (!main.isVisible())
	{
		debugString(DEBUG_PREFIX "   --> main layout isn't visible", 0);
		debugString(DEBUG_PREFIX "   return FALSE;", 0);	
		debugString(DEBUG_PREFIX "}", 0);

		return FALSE;
	}

	if (goingvisible) {
		if (guid == VIS_GUID)
		{
			if (vis_inbig_attrib.getData() == "1") return FALSE;
			debugString(DEBUG_PREFIX "   --> external showing_vis --- start Timer", D_WTF);
			if (vis_lefttoplayer_attrib.getData() == "1" &&  !sui_vis.isVisible())
			{
				dc_showVis();
				debugString(DEBUG_PREFIX "   --> open SMALL", D_WTF);
				debugString(DEBUG_PREFIX "   return TRUE;", D_WTF);	
				debugString(DEBUG_PREFIX "}", D_WTF);
				return TRUE;
			}
			if (vis_lefttoplayer_full_attrib.getData() == "1" && !sui_vis_full.isVisible())
			{
				dc_showVis_Full();
				debugString(DEBUG_PREFIX "   --> open FULL", D_WTF);
				debugString(DEBUG_PREFIX "   return TRUE;", D_WTF);	
				debugString(DEBUG_PREFIX "}", D_WTF);
				return TRUE;
			}
			debugString(DEBUG_PREFIX "   return FALSE; (other handle?)", D_WTF);	
			debugString(DEBUG_PREFIX "}", D_WTF);
			return FALSE;
		}
	}
	if (!goingvisible) {
		if (guid == VIS_GUID && (sui_vis.isVisible() || sui_vis_full.isVisible())) {
			if (vis_inbig_attrib.getData() == "1") return FALSE;
			debugString(DEBUG_PREFIX "   --> external hiding_vis", D_WTF);

			if (ic_vis.getdata() == "1")
			{
				ic_fileinfo.setdata("1");
			}
			
			ic_vis_fileinfo.setData("0");

			debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);	
			debugString(DEBUG_PREFIX "}", D_WTF);
			return FALSE;
		}
	}

	debugString(DEBUG_PREFIX "   --> Went thru", D_WTF);
	debugString(DEBUG_PREFIX "   return FALSE;", D_WTF);
	debugString(DEBUG_PREFIX "}", D_WTF);

	return FALSE;
}

ic_cover_fileinfo.onDataChanged ()
{
	if (ic_fileinfo.getData() == "0") return;
	if ( ACTIONPERFORMED ) return;
	if (mychange) return;
	mychange = 1;
	updateFileInfo();
	mychange = 0;
}

ic_fileinfo.onDataChanged ()
{
	if ( ACTIONPERFORMED ) return;
	if (mychange) return;
	mychange = 1;
	if (getData() == "1")
	{
		updateFileInfo();
	}
	mychange = 0;
}

ic_eq.onDataChanged ()
{
	if ( ACTIONPERFORMED ) return;
	if (mychange) return;
	mychange = 1;
	if (getData() == "1")
	{
		switchToEq();
	}
	mychange = 0;
}

ic_config.onDataChanged ()
{
	if ( ACTIONPERFORMED ) return;
	if (mychange) return;
	mychange = 1;
	if (getData() == "1")
	{
		switchToCfg();
	}
	mychange = 0;
}

_plsc_ic_attrib.onDataChanged ()
{
	if ( ACTIONPERFORMED ) return;
	if (mychange) return;
	mychange = 1;
	if (getData() == "1")
	{
		_Plsc_switchTo();
	}
	mychange = 0;
}

#ifdef IC_COVERFLOW
_cflow_ic_attrib.onDataChanged ()
{
	if ( ACTIONPERFORMED ) return;
	if (mychange) return;
	mychange = 1;
	if (getData() == "1")
	{
		_Cflow_switchTo();
	}
	mychange = 0;
}
#endif

ic_vis.onDataChanged ()
{
	if ( ACTIONPERFORMED  ) return;
	if (mychange) return;
	mychange = 1;
	if (getData() == "1")
	{
		switchToVis_Full();
	}
	mychange = 0;
}

ic_vis_fileinfo.onDataChanged ()
{
	if (ic_fileinfo.getData() == "0") return;
	if ( ACTIONPERFORMED  ) return;
	if (mychange) return;
	mychange = 1;
	updateFileInfo();
	mychange = 0;
}
#ifdef DOHIDEMCV
ic_hidden.onDataChanged ()
{
	if ( ACTIONPERFORMED  ) return;
	if (mychange) return;
	mychange = 1;
	if (getData() == "1")
	{
		hideMCV();
	}
	mychange = 0;
}
#endif
vis_lefttoplayer_attrib.onDataChanged ()
{
	if (mychange) return;
	String window_content =  getPrivateString(getSkinName(), "Component", "Media Library");
	int xg = getPrivateInt(getSkinName(), "ComponentXgive", 0);
	if (getData() == "1" && (window_content == "Vis" || ic_vis.getData() == "1"  || xg))
	{
		if (xg) setPrivateInt(getSkinName(), "ComponentXgive", 0);
		ic_vis_fileinfo.setData("1");
		ic_fileinfo.setData("0");
	}
	else if (getData() == "0" && sui_vis.isVisible() && vis_lefttoplayer_full_attrib.getData() != "1")
	{
		setPrivateInt(getSkinName(), "ComponentXgive", 1);
		ic_vis_fileinfo.setData("0");
	}
}

vis_lefttoplayer_full_attrib.onDataChanged ()
{
	if (mychange) return;
	String window_content =  getPrivateString(getSkinName(), "Component", "Media Library");
	int xg = getPrivateInt(getSkinName(), "ComponentXgive", 0);
	if (getData() == "1" && (window_content == "Vis" || ic_vis_fileinfo.getData() == "1" || xg))
	{
		if (xg) setPrivateInt(getSkinName(), "ComponentXgive", 0);
		switchToVis_Full();
	}
	else if (getData() == "0" && sui_vis_full.isVisible() && vis_lefttoplayer_attrib.getData() != "1")
	{
		setPrivateInt(getSkinName(), "ComponentXgive", 1);
		updateFileInfo();
	}
}
