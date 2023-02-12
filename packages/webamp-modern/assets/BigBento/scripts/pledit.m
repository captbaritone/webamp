/*---------------------------------------------------
-----------------------------------------------------
Filename:	pledit.m
Version:	3.1

Type:		maki
Date:		18. Sep. 2007 - 19:42 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>

// #define DEBUG
#define FILE_NAME "pledit.m"
// #include <lib/debug.m>
// #define DEBUG_PREFIX "["+ FILE_NAME +": " + getTimeStamp() + "] " + 
#define DEBUG_PREFIX "" + 
#define D_WTF 9
#define D_NWTF 9

#define PL_GUID "{45F3F7C1-A6F3-4EE6-A15E-125E92FC3F8D}"
#define PLC_POPPLER_POS 200

#include attribs/init_playlist.m

Function fitContent (int playlistw, int playlistx);
Function fit (group g, int x, int rx, int y, int ry, int w, int rw, int h, int rh);
Function int updatePoppler(int w);
Function int updateMainPoppler(int w);

Global Frame dualwnd, pl_dualwnd, mainframe;

Global Group g_playlist, g_player, g_sui, g_buttons, g_mcv, g_cover, g_upper;
Global Button p_enlarge, p_small;
Global Button p_resize;
Global int down_x, down_gx, isresizing;
Global layout normal;
Global Container player;
Global WindowHolder wdh_pl;
Global Text pl_time;

Global Button pe_add, pe_rem, pe_sel, pe_misc, pe_manage;

Global Boolean startup, isBig, bypass_nocomp;

Global Timer dc_openPl, dc_closePl, dc_loadWnd;

Global Int COMP_Y, COMP_H, SUI_Y, SUI_H, BOTTOMSPACER, MAX_PL_H;
Global Int DEF_PL_W, SIDESPACER;

Global Int min_infowidth;


System.onScriptLoaded ()
{
	debugString("WELCOME TO PLEDIT COY", 9);
	initAttribs_Playlist();
	normal = getScriptGroup();
	player = normal.getContainer();

	isBig = (getParam() == "big");
	if (isBig)
	{
		mainframe = normal.getObject("player.mainframe.big");
	}
	else
	{
		mainframe = normal.getObject("player.mainframe");
	}

	dualwnd = mainframe.findObject("player.dualwnd");
	g_mcv = dualwnd.findObject("player.component.fileinfo");
	g_upper = dualwnd.findObject("player.component.playlist.frame");
	pl_dualwnd = dualwnd.findObject("playlist.dualwnd");
	g_playlist = pl_dualwnd.findObject("player.component.playlist");
	g_cover = pl_dualwnd.findObject("player.component.playlist.albumart");
	g_player = dualwnd.findObject("player.layout");
	g_sui = normal.getObject("sui.content");
	g_buttons = g_playlist.getObject("player.component.playlist.buttons");
	p_enlarge = g_buttons.getObject("player.playlist.enlarge");
	p_small = g_buttons.getObject("player.playlist.small");
	p_resize = g_playlist.getObject("player.resize");
	wdh_pl = g_playlist.getObject("wdh.playlist");
	pl_time = g_buttons.getObject("PLTime");

	pe_add = g_buttons.getObject("player.playlist.add");
	pe_rem = g_buttons.getObject("player.playlist.rem");
	pe_sel = g_buttons.getObject("player.playlist.sel");
	pe_misc = g_buttons.getObject("player.playlist.misc");
	pe_manage = g_buttons.getObject("player.playlist.manage");

	min_infowidth = stringtoInteger(dualwnd.getXmlParam("maxwidth"));	

	dc_openPl = new Timer;
	dc_openPl.setDelay(1);

	dc_closePl = new Timer;
	dc_closePl.setDelay(1);

	dc_loadWnd = new Timer;
	dc_loadWnd.setDelay(1);

	//	Global Definitions:

	DEF_PL_W = g_playlist.getGuiW(); // (-)
	SIDESPACER = g_sui.getGuiX(); // (+)
	COMP_Y = mainframe.getGuiY(); // (+)
	COMP_H = mainframe.getGuiH(); // (+)
	SUI_Y = g_sui.getGuiY(); // (+)
	SUI_H = g_sui.getGuiH(); // (-)
	BOTTOMSPACER = SUI_Y + SUI_H; // (-)
	MAX_PL_H = BOTTOMSPACER - COMP_Y; // (-)

	startup = 1;

	// show playlist album art if checked
	playlist_cover_attrib.onDataChanged();

	//Bento v0.8 hack
	if (mainframe.getPosition() < stringToInteger(mainframe.getXmlParam("minwidth")))
	{
		mainframe.setPosition(stringToInteger(mainframe.getXmlParam("minwidth")));
	}
}


system.onScriptUnloading ()
{
	int pos = pl_dualwnd.getPosition();
	if (pos > 0) setPrivateInt(getSkinName(), "playlist_cover_poppler", pos);
	delete dc_loadWnd;
}
playlist_enlarge_attrib.onDataChanged ()
{
	debugString("inside playlist_enlarge_attrib.onDataChanged!", 9);
	int pl_w = dualwnd.getPosition();

#ifdef DOHIDEMCV
	if (dualwnd.getXmlParam("from") == "left")
	{
		pl_w = dualwnd.getWidth() - 8;
	}
#endif	

	int pl_x = 0 - ( pl_w + SIDESPACER ); // (-)

	if (getData() == "1")
	{
		//? show the Large Vertical PL
		int sui_w = pl_x - SIDESPACER; // (-)

		dualwnd.setXmlParam("relath", "1");
		dualwnd.setXmlParam("h", integerToString(0));
		mainframe.setXmlParam("relath", "1");
		mainframe.setXmlParam("h", integerToString(MAX_PL_H));

		g_sui.setXmlParam("w", integerToString(sui_w-8));

		int pos = getPrivateInt(getSkinName(), "playlist_cover_poppler", PLC_POPPLER_POS);
		if (playlist_cover_attrib.getData() == "1" && pos > 0 && getPrivateString(getSkinName(), "Component", "Media Library") != "Hidden")
		{
			g_cover.show();
			pl_dualwnd.setPosition (pos);
		}
		else
		{
			pl_dualwnd.setPosition (0);
			g_cover.hide();
		}

		p_enlarge.hide(); //?button
		p_small.show();
	}
	else
	{
		int sui_w = 0 - SIDESPACER - SIDESPACER; // (-)
		int pc_w = pl_x - SIDESPACER; // (-)

		g_cover.hide();

		if (playlist_cover_attrib.getData() == "1")
		{
			int pos = pl_dualwnd.getPosition();
			if (pos > 0) setPrivateInt(getSkinName(), "playlist_cover_poppler", pos);			
		}
		pl_dualwnd.setPosition (0);

		dualwnd.setXmlParam("h", integerToString(COMP_H-3));
		dualwnd.setXmlParam("relath", "0");
		mainframe.setXmlParam("h", integerToString(COMP_H));
		mainframe.setXmlParam("relath", "0");

		g_sui.setXmlParam("w", integerToString(sui_w));
		p_enlarge.show();
		p_small.hide();
	}
}

dc_loadWnd.onTimer ()
{
	stop();
	int pos = dualwnd.getPosition();
	if (pos > 0) updatePoppler(pos);
	playlist_enlarge_attrib.onDataChanged();

	if (dualwnd.getPosition() > 0
#ifdef DOHIDEMCV
		|| dualwnd.getXMlParam("from") == "left"
#endif
		) dc_openPL.start();


	else wdh_pl.hide(); //hideWa2Component(PL_GUID);
}


g_playlist.onResize (int x, int y, int w, int h)
{
	int pos = dualwnd.getPosition();
	debugString(integerToString(pos), 9);
	updateMainPoppler(min_infowidth - pos - 8);

	if (pos > 0 
#ifdef DOHIDEMCV
		|| dualwnd.getXMlParam("from") == "left"
#endif
		) 
	{
		//setPrivateInt(getSkinName(), "pledit poppler width", dualwnd.getPosition());
		if (!wdh_pl.isVisible()) dc_openPl.start();

		if (isBig)
		{
			if (w > 189)
			{
				pe_add.show();
				pe_rem.show();
				pe_sel.show();
				pe_misc.show();
				pe_manage.show();
			}
			else if (w <= 189 && w >158)
			{
				pe_add.show();
				pe_rem.show();
				pe_sel.show();
				pe_misc.show();
				pe_manage.hide();
			}
			else if (w <= 158 && w >127)
			{
				pe_add.show();
				pe_rem.show();
				pe_sel.show();
				pe_misc.hide();
				pe_manage.hide();
			}
			else if (w <= 127 && w >96)
			{
				pe_add.show();
				pe_rem.show();
				pe_sel.hide();
				pe_misc.hide();
				pe_manage.hide();
			}
			else if (w <= 96 && w >65)
			{
				pe_add.show();
				pe_rem.hide();
				pe_sel.hide();
				pe_misc.hide();
				pe_manage.hide();
			}
			else
			{
				pe_add.hide();
				pe_rem.hide();
				pe_sel.hide();
				pe_misc.hide();
				pe_manage.hide();
			}			
		}
		else
		{
			if (w > 146)
			{
				pe_add.show();
				pe_rem.show();
				pe_sel.show();
				pe_misc.show();
				pe_manage.show();
			}
			else if (w <= 146 && w >122)
			{
				pe_add.show();
				pe_rem.show();
				pe_sel.show();
				pe_misc.show();
				pe_manage.hide();
			}
			else if (w <= 122 && w >98)
			{
				pe_add.show();
				pe_rem.show();
				pe_sel.show();
				pe_misc.hide();
				pe_manage.hide();
			}
			else if (w <= 98 && w >74)
			{
				pe_add.show();
				pe_rem.show();
				pe_sel.hide();
				pe_misc.hide();
				pe_manage.hide();
			}
			else if (w <= 74 && w >50)
			{
				pe_add.show();
				pe_rem.hide();
				pe_sel.hide();
				pe_misc.hide();
				pe_manage.hide();
			}
			else
			{
				pe_add.hide();
				pe_rem.hide();
				pe_sel.hide();
				pe_misc.hide();
				pe_manage.hide();
			}
		}
	}
	else wdh_pl.hide();
	if (playlist_enlarge_attrib.getdata() == "1")
	{
		int sui_w = - g_playlist.getWidth() - (2 * SIDESPACER) - 8;
		g_sui.setXmlParam("w", integerToString(sui_w));
		if (startup)
		{
			startup = 0;
			mainframe.setXmlParam("relath", "1");
			mainframe.setXmlParam("h", integerToString(MAX_PL_H));
			dualwnd.setXmlParam("relath", "1");
			dualwnd.setXmlParam("h", integerToString(0));
		}
	}
}

normal.onSetVisible (Boolean onoff)
{
	if (onoff)
	{
		playlist_enlarge_attrib.onDataChanged();
		int pos = dualwnd.getPosition();
		if (pos > 0 
#ifdef DOHIDEMCV
			|| dualwnd.getXMlParam("from") == "left"
#endif
			) 
		{
			updatePoppler(pos);
			dc_openPL.start();
		}
		else wdh_pl.hide();//hideWa2Component(PL_GUID);
	}
}

normal.onUserResize (int x, int y, int w, int h)
{
	int pos = dualwnd.getPosition();
	if (pos > 0) updatePoppler(pos);
}

/** Hide pl_time if it cannot be full displayed */

pl_time.onResize (int x, int y, int w, int h)
{
	if (w < getTextWidth())
	{
		hide();
	}
	else
	{
		show();
	}
}

pl_time.onTextChanged (String newtxt)
{
	if (getWidth() < getTextWidth())
	{
		hide();
	}
	else
	{
		show();
	}	
}

/** Playlist Component Handling */

System.onGetCancelComponent (String guid, boolean goingvisible)
{
	debugString(DEBUG_PREFIX "System.onGetCancelComponent ( "+ guid + " , " + integerToString(goingvisible) + " )", D_WTF);
	if (guid == PL_GUID)
	{
		Boolean isShade = player.getCurLayout() != normal;

		if (goingvisible == TRUE && !isShade)
		{
			int poppler_w = getPrivateInt(getSkinName(), "pledit poppler width", 200);
			g_playlist.show();
			updatePoppler(poppler_w);
			dc_openPl.start();
			return FALSE;
		}
		else
		{
			setPrivateInt(getSkinName(), "pledit poppler width", dualwnd.getPosition());
			wdh_pl.hide();
			dualwnd.setPosition(0);
			return FALSE;
		}
	}
}

normal.onAction (String action, String param, Int x, int y, int p1, int p2, GuiObject source)
{
	if (action == "load_comp" && param == "pledit")
	{
		int poppler_w = getPrivateInt(getSkinName(), "pledit poppler width", 200);
		if (dualwnd.getPosition() > 0) poppler_w = dualwnd.getPosition();
		updatePoppler(poppler_w);
		dc_openPl.start();
	}
	if (action == "pledit_posupdate")
	{
		int pos = dualwnd.getPosition();
		if (pos > 0) updatePoppler(pos);
	}
	if (action == "sui")
	{
		if (param == "tonocomp")
		{
			if (playlist_cover_attrib.getData() == "1")
			{
				int pos = pl_dualwnd.getPosition();
				if (pos > 0) setPrivateInt(getSkinName(), "playlist_cover_poppler", pos);			
			}
			bypass_nocomp = TRUE; //we need to add a bypass otherwise playlist_cover_attrib will be turned OFF
			pl_dualwnd.setPosition (0);
			g_cover.hide();
			bypass_nocomp = FALSE;
		}
		else if (param == "fromnocomp")
		{
			playlist_cover_attrib.onDataChanged ();
		}		
	}	
}

dualwnd.onAction (String action, String param, Int x, int y, int p1, int p2, GuiObject source)
{
	if (action == "set_maxwidth")
	{
		// update poppler for playlist/infocomp
		updatePoppler(dualwnd.getPosition());
		// update poppler bands for player/infocomp
		min_infowidth = x;
		updateMainPoppler(min_infowidth - dualwnd.getPosition() - 8);
	}
}

wdh_pl.onSetVisible (Boolean onoff)
{
	debugString("wdh_pl set visible: " + integerToString(onoff), 9);
	if (onoff)
	{
		playlist_cover_attrib.onDataChanged();
	}
	else
	{
		int pos = pl_dualwnd.getPosition();
		if (pos > 0) setPrivateInt(getSkinName(), "playlist_cover_poppler", pos);
	}
}

updatePoppler(int w)
{
	if (dualwnd.getPosition() == 0 && w == 0) return;
	int min_w = stringToInteger(dualwnd.getXmlParam("minwidth"));
	int max_w = stringToInteger(dualwnd.getXmlParam("maxwidth"));
	if (max_w < 0) max_w = dualwnd.getWidth() + max_w;
	debugString("max_w: " + integerToString(max_w), 9);
	boolean reset = FALSE;
	reset += (w == 0);
	reset += (w < min_w);
	if (reset) w = min_w;

	// Prevent the playlist from overlapping the player
	if (w > max_w) 
	{
		w = max_w;

		// Resize the player to get more space
		if (max_w < min_w)
		{
			w = min_w;
			int mainframe_pos = mainframe.getPosition() - (min_w - max_w); // I need to save this in a variable first, otherwise mainframe.setPos will crash...
			mainframe.setPosition(mainframe_pos);
		}
	}
	debugString("set poppler: " + integerToString(w), 9);
	dualwnd.setPosition(w);
}

updateMainPoppler (int w)
{
	mainframe.setXmlparam("maxwidth", integerToString(w));
}

dc_openPl.onTimer ()
{
	dc_openPl.stop();
	debugString("dc_openPl called!", 9);
	wdh_pl.show();
	g_playlist.show();
	g_upper.show();
	//if (!wdh_pl.isVisible()) debugInt(g_playlist.getWidth());
}

dc_closePl.onTimer ()
{
	dc_closePl.stop();
	wdh_pl.hide();
}

//----------------------------------------------------------------------------------------------------------------
// Playlist Album Art Handles
//----------------------------------------------------------------------------------------------------------------

Global boolean attrib_bypass = false;

playlist_cover_attrib.onDataChanged ()
{
	if (attrib_bypass)
		return;

	if (playlist_enlarge_attrib.getData() == "0")
		return;
	
	if (getData() == "1")
	{
		int pos = getPrivateInt(getSkinName(), "playlist_cover_poppler", PLC_POPPLER_POS);
		if (pos > 0 && getPrivateString(getSkinName(), "Component", "Media Library") != "Hidden")
		{
			pl_dualwnd.setPosition (pos);
			g_cover.show();
		}
		else
		{
			pl_dualwnd.setPosition (0);
			g_cover.hide();
		}
	}
	else
	{
		int pos = pl_dualwnd.getPosition();
		if (pos > 0) setPrivateInt(getSkinName(), "playlist_cover_poppler", pos);
		pl_dualwnd.setPosition(0);
		g_cover.hide();
	}	
}

Global Boolean bypass;

player.onBeforeSwitchToLayout (Layout oldlayout, Layout newlayout)
{
	if (oldlayout == normal)
	{
		bypass = 1;
	}
}

g_cover.onSetVisible (Boolean onoff)
{
	if (bypass)
	{
		bypass = 0;
		return;
	}
	
	if (!onoff && !bypass_nocomp && playlist_cover_attrib.getdata() == "1" && getPrivateString(getSkinName(), "Component", "Media Library") != "Hidden" && playlist_enlarge_attrib.getData() == "1" && dualwnd.getPosition() > 0)
	{
		playlist_cover_attrib.setdata("0");
	}
	else if (onoff && !bypass_nocomp && playlist_cover_attrib.getdata() == "0" && dualwnd.getPosition() > 0)
	{
		attrib_bypass = true;
		playlist_cover_attrib.setdata("1");
		attrib_bypass = false;
	}	
}