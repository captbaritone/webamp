/*---------------------------------------------------
-----------------------------------------------------
Filename:	maximize.m
Version:	3.4

Type:		maki
Date:		13. Sep. 2007 - 15:05 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>
#include attribs/init_Autoresize.m

Function setImages(boolean isMaximized);
Function maximizeShade(boolean save);
Function restoreShade();
Function maximizePlayer(boolean save);
Function restorePlayer();
Function setWndToScreen();

#define SAVEPOS_SHADE 2
#define SAVEPOS_NORMAL 1
#define SAVEPOS_ALL 0
Function savePos(int code);

Class GuiObject Mousetrap;

Global Button Maximize, MaximizeShade, Restore, RestoreShade;
Global Mousetrap noResizerTB, MousetrapTB, MousetrapShade, MousetrapMenu;
Global Layout normal, shade;
Global Boolean tgst;
Global Layer resizer, noResizer, resizerShade, resizerShade2, topResizer;
Global Container player;
Global GuiObject shadeticker, slamclose;

Global Group regions, regionsShade;
Global Layer regionBlack, regionBlackShade;

Global Int DEFAULT_PLAYER_H, DEFAULT_SHADE_H;
Global Int old_x, old_y, old_h, old_w;

System.onScriptLoaded ()
{
	initAttribs_Autoresize();

	player = System.getContainer("main");
	normal = player.getLayout("normal");

	Maximize = normal.findObject("player.titlebar.button.maximize");
	Restore = normal.findObject("player.titlebar.button.restore");
	MousetrapTB = normal.findObject("player.mousetrap.maximize");
	resizer = normal.findObject("player.resizer.bottomright");
	noResizer = normal.findObject("player.resizer.disable");
	noResizerTB = normal.findObject("titlebar.resizer.disable");
	regions = normal.findObject("window.background.regions");
	regionBlack = normal.findObject("window.background.maximize");
	topResizer = normal.findObject("titlebar.resizer.top");
	slamclose = normal.findObject("maximize.slam.close");
	MousetrapMenu = normal.findObject("menu.hidden.mousetrap");

	shade = player.getLayout("shade");
	shadeticker = shade.findObject("Songticker");

	MaximizeShade = shade.findObject("shade.button.maximize");
	RestoreShade = shade.findObject("shade.button.restore");
	resizerShade = shade.findObject("shade.resizer.right");
	resizerShade2 = shade.findObject("shade.resizer.right2");
	MousetrapShade = shade.findObject("shade.mousetrap");
	regionsShade = Shade.findObject("window.background.regions");
	regionBlackShade = Shade.findObject("window.background.maximize");

	DEFAULT_PLAYER_H = stringToInteger(getToken(getParam(), "," , 0));
	DEFAULT_SHADE_H = stringToInteger(getToken(getParam(), "," , 1));

	if (getPrivateInt(getSkinName(), "isMainWndMaximized", 0))
	{
		maximizePlayer (FALSE);
		maximizeShade (FALSE);
		setImages (1);
	}
	else
	{
		if (getPrivateInt(getSkinName(), "First Start", 1)) setWndToScreen();
		else
		{
			restorePlayer ();
			restoreShade ();			
		}
	}
}

// ------------------------------------------------------------------------------
// Save all our window positions on skin unloading
// ------------------------------------------------------------------------------

System.onScriptUnloading ()
{
//	if (player.getCurLayout() == normal) savePos(SAVEPOS_NORMAL);
//	else if (player.getCurLayout() == shade) savePos(SAVEPOS_SHADE);
}

// ------------------------------------------------------------------------------
// Prohibit autoresizing by Video if we're in maximized player (layout_normal)
// ------------------------------------------------------------------------------

sui_autorsize_attrib.onDataChanged ()
{
	if (getData() == "1")
	{
		normal.setXMLParam("lockminmax", "0");
	}
	else
	{
		double d = normal.getScale();
		if (normal.getLeft() == getViewportLeft() && normal.getTop() == getViewportTop() && normal.getWidth() == getViewPortWidthfromGuiObject(normal)/d && normal.getHeight() == getViewPortHeightfromGuiObject(normal)/d)
		{
			normal.setXMLParam("lockminmax", "1");
		}
	}
}

System.onKeyDown (String key)
{
	if (key == "ctrl+w" && (shade.isActive() || normal.isActive()))
	{
		if (shade != player.getCurLayout()) 
		{
			player.switchToLayout("shade");
		}
		else
		{
			player.switchToLayout("normal");
		}
		complete;
	}
}

// ------------------------------------------------------------------------------
// Button clicks
// ------------------------------------------------------------------------------

Maximize.onLeftClick ()
{
	if (!getPrivateInt(getSkinName(), "isMainWndMaximized", 0))
	{
		maximizePlayer (TRUE);
	}
}

Restore.onLeftClick ()
{
	if (getPrivateInt(getSkinName(), "isMainWndMaximized", 0))
	{
		restorePlayer ();
	}
}

MaximizeShade.onLeftClick ()
{
	if (getPrivateInt(getSkinName(), "isMainWndMaximized", 0))
	{
		restoreShade ();
	}
	else
	{
		maximizeShade (TRUE);
	}	
}

RestoreShade.onLeftClick ()
{
	if (getPrivateInt(getSkinName(), "isMainWndMaximized", 0))
	{
		restoreShade ();
	}
	else
	{
		maximizeShade (TRUE);
	}	
}

/** This will detect the second down click */

Mousetrap.onLeftButtonDblClk (int x, int y)
{
	tgst = true;
}

/** Once the button gets up, we'll toggle the maximized state */

mousetrap.onLeftButtonUp (int x, int y)
{
	if (tgst) 
	{
		if (shade == player.getCurLayout())
		{
			if (titlebar_dblclk_max_attib.getData() == "1")
			{
				if (!getPrivateInt(getSkinName(), "isMainWndMaximized", 0))
				{
					maximizeShade (TRUE);
				}
				else
				{
					restoreShade();
				}			
			}
			else
			{
				player.switchToLayout("normal");
			}			
		}
		else
		{
			if (titlebar_dblclk_max_attib.getData() == "1")
			{
				if (!getPrivateInt(getSkinName(), "isMainWndMaximized", 0))
				{
					maximizePlayer (TRUE);
				}
				else
				{
					restorePlayer();
				}			
			}
			else
			{
				player.switchToLayout("shade");
			}			
		}
	}
	tgst = false;
}

topResizer.onLeftButtonDblClk (int x, int y)
{
	if (titlebar_dblclk_max_attib.getData() == "1")
	{
		if (!getPrivateInt(getSkinName(), "isMainWndMaximized", 0))
		{
			maximizePlayer (TRUE);
		}
		else
		{
			restorePlayer();
		}			
	}
	else
	{
		player.switchToLayout("shade");
	}
}

// ------------------------------------------------------------------------------
// Detect maximized states on window resize
// ------------------------------------------------------------------------------

normal.onEndMove ()
{
	savePos(SAVEPOS_NORMAL);
}

normal.onResize (int x, int y, int w, int nh)
{
	//debugString("onResize("+integertoString(x)+","+integertoString(y)+","+integertoString(w)+","+integertoString(nh)+");", 9);
	y = normal.getTop();
	// prohibit to set nh = 0
	if (nh == 0 || w == 0)
	{
		//debug("error setting player_normal w=" + integerToString(w) + " , h=" + integerToString(nh));
		normal.resize(getLeft(), getTop(), getWidth(), DEFAULT_PLAYER_H);
		return;
	}

	if (normal != player.getCurLayout()) return;

	if (old_x == x && old_y == y && old_h = nh && old_w == w) return;
	old_x = x; old_y = y; old_h = nh; old_w = w;

	if (getPrivateString(getSkinName(), "Component", "Media Library") == "Hidden")
	{
		double d = normal.getScale();
		if (w == getViewPortWidthfromGuiObject(normal)/d && x == getViewportLeft() && y == getViewportTop())
		{
			//setPrivateInt(getSkinName(), "isMainWndMaximized", 1);
			//setImages (1);			
		}
		else
		{
			setPrivateInt(getSkinName(), "isMainWndMaximized", 0);
			setImages (0);	
		}		
	}
	else
	{
		double d = normal.getScale();
		if (x == getViewportLeft() && y == getViewportTop() && w == getViewPortWidthfromGuiObject(normal)/d && nh == getViewPortHeightfromGuiObject(normal)/d)
		{
			//setPrivateInt(getSkinName(), "isMainWndMaximized", 1);
			//setImages (1);		
		}
		else
		{
			setPrivateInt(getSkinName(), "isMainWndMaximized", 0);
			setImages (0);	
		}	
	}
	savePos(SAVEPOS_NORMAL);
}

shade.onEndMove ()
{
	savePos(SAVEPOS_SHADE);
}

shade.onResize (int x, int y, int w, int nh)
{
	y = shade.getTop();
	// prohibit to set nh = 0
	if (nh == 0 || w == 0)
	{
		debug("error setting player_shade w=" + integerToString(w) + " , h=" + integerToString(nh));
		shade.resize(getLeft(), getTop(), getWidth(), DEFAULT_SHADE_H);
		return;
	}

	if (shade != player.getCurLayout()) return;

	if (old_x == x && old_y == y && old_h = nh && old_w == w) return;
	old_x = x; old_y = y; old_h = nh; old_w = w;

	double d = shade.getScale();
	if (w == getViewPortWidthfromGuiObject(shade)/d && y == getViewportTop() && x == getViewportLeft())
	{
		//setPrivateInt(getSkinName(), "isMainWndMaximized", 1);
		//setImages (1);
	}
	else
	{
		setPrivateInt(getSkinName(), "isMainWndMaximized", 0);
		setImages (0);
	}
	savePos(SAVEPOS_SHADE);
}

// ------------------------------------------------------------------------------
// Resize our window on scale if we are maximized
// ------------------------------------------------------------------------------

normal.onScale (Double newscalevalue)
{
	if (normal != player.getCurLayout()) return;
	if (getPrivateInt(getSkinName(), "isMainWndMaximized", 0))
	{
		maximizePlayer(FALSE);
	}
	savePos(SAVEPOS_NORMAL);
}

shade.onScale (Double newscalevalue)
{
	if (shade != player.getCurLayout()) return;
	if (getPrivateInt(getSkinName(), "isMainWndMaximized", 0))
	{
		maximizeShade(FALSE);
	}
	savePos(SAVEPOS_SHADE);
}

// ------------------------------------------------------------------------------
// Before we switch between layouts, check all images and window sizes
// ------------------------------------------------------------------------------

player.onBeforeSwitchToLayout (Layout _layoutnow, Layout _layouttobe)
{
	if (_layoutnow == normal) savePos(SAVEPOS_NORMAL);
	else if (_layoutnow == shade) savePos(SAVEPOS_SHADE);
	if (getPrivateInt(getSkinName(), "isMainWndMaximized", 0))
	{
		if (_layouttobe == normal) maximizePlayer (FALSE);
		else if (_layouttobe == shade) maximizeShade (FALSE);
		setImages (1);
	}
	else
	{
		if (_layouttobe == normal) restorePlayer ();
		else if (_layouttobe == shade) restoreShade ();
	}
}

// ------------------------------------------------------------------------------
// Save wnd position before we go to collapsed state
// ------------------------------------------------------------------------------

normal.onAction (String action, String param, Int x, int y, int p1, int p2, GuiObject source)
{
	if (action == "sui" && param == "tonocomp" && x == 0)
	{
		savePos (SAVEPOS_NORMAL);
	}
}

// ******************************************************************************
// Our Function Handles
// ******************************************************************************

setImages (boolean isMaximized)
{
	if (isMaximized)
	{
		// Normal
		Maximize.hide();
		Restore.show();

		if (getPrivateString(getSkinName(), "Component", "Media Library") == "Hidden")
		{
			MousetrapTB.setXMLparam("move", "0");
			MousetrapMenu.setXMLparam("move", "0");
			noResizerTB.setXMLparam("ghost", "0");
		}
		else
		{
			MousetrapTB.setXMLparam("move", "0");
			MousetrapMenu.setXMLparam("move", "0");
			noResizerTB.setXMLparam("ghost", "0");
		}

		if (sui_autorsize_attrib.getData() == "0") normal.setXMLParam("lockminmax", "1");
		else normal.setXMLParam("lockminmax", "0");
		resizer.hide();
		noResizer.show();
		regions.hide();
		regionBlack.show();
		// Shade
		MousetrapShade.setXMLparam("move", "0");
		shadeticker.setXmlParam("move", "0");
		MaximizeShade.hide();
		RestoreShade.show();
		resizerShade.hide();
		regionsShade.hide();
		resizerShade2.hide();
		regionBlackShade.show();
		slamclose.show();
	}
	else
	{
		// Normal
		resizer.show();
		noResizer.hide();
		MousetrapTB.setXMLparam("move", "1");
		noResizerTB.setXMLparam("ghost", "1");
		MousetrapMenu.setXMLparam("move", "1");
		normal.setXMLParam("lockminmax", "0");
		Maximize.show();
		Restore.hide();
		regions.show();
		regionBlack.hide();
		// Shade
		MousetrapShade.setXMLparam("move", "1");
		shadeticker.setXmlParam("move", "1");
		resizerShade.show();
		resizerShade2.show();
		MaximizeShade.show();
		RestoreShade.hide();
		regionsShade.show();
		regionBlackShade.hide();
		slamclose.hide();
	}
}

maximizeShade (boolean save)
{
	if (save)
	{
		savePos(SAVEPOS_SHADE);

		setPrivateInt(getSkinName(), "isMainWndMaximized", 1);
		setImages (1);	
	}
	double newscalevalue = shade.getScale();
	int sh = shade.getHeight();
	if (sh < 1) sh = DEFAULT_SHADE_H;
	shade.resize(getViewPortLeftfromGuiObject(shade),getViewPortTopfromGuiObject(shade),getViewportWidthfromGuiObject(shade)/newscalevalue, sh);
}

restoreShade ()
{
	if (link_w_attrib.getData() == "0")
	{
		shade.resize(
			getPrivateInt(getSkinName(), "shade_nomax_x", shade.getLeft()),
			getPrivateInt(getSkinName(), "shade_nomax_y", shade.getTop()),
			getPrivateInt(getSkinName(), "shade_nomax_w", 500),
			DEFAULT_SHADE_H
		);
	}
	else
	{ 
		shade.resize(
			getPrivateInt(getSkinName(), "nomax_x", shade.getLeft()),
			getPrivateInt(getSkinName(), "nomax_y", shade.getTop()),
			getPrivateInt(getSkinName(), "nomax_w", 700),
			DEFAULT_SHADE_H
		);
	}
	setPrivateInt(getSkinName(), "isMainWndMaximized", 0);
	setImages (0);			
}

maximizePlayer (boolean save)
{
	if (save)
	{
		savePos(SAVEPOS_NORMAL);
		setPrivateInt(getSkinName(), "isMainWndMaximized", 1);
		setImages (1);			
	}
	double newscalevalue = normal.getScale();
	int nh, ny;
	if (getPrivateString(getSkinName(), "Component", "Media Library") == "Hidden")
	{
		nh = DEFAULT_PLAYER_H;
	}
	else
	{
		nh = getViewPortHeightfromGuiObject(normal)/newscalevalue;
	}
	if (nh < 1) nh = DEFAULT_PLAYER_H;
	normal.resize(getViewPortLeftfromGuiObject(normal), getViewPortTopfromGuiObject(normal), getViewPortWidthfromGuiObject(normal)/newscalevalue, nh);
}

restorePlayer ()
{
	int x, y, w, h;
	x = getPrivateInt(getSkinName(), "nomax_x", normal.getLeft());
	y = getPrivateInt(getSkinName(), "nomax_y", normal.getTop());
	w = getPrivateInt(getSkinName(), "nomax_w", normal.getWidth());

	if (getPrivateString(getSkinName(), "Component", "Media Library") == "Hidden")
	{
		h = DEFAULT_PLAYER_H;
	}
	else
	{
		h = getPrivateInt(getSkinName(), "nomax_h", normal.getHeight());

	}
	// check if player_w is too small
	if (w < stringToInteger(normal.getXmlParam("minimum_w"))) w = stringToInteger(normal.getXmlParam("minimum_w"));

	normal.resize(x, y, w, h);
	normal.sendAction("pledit_posupdate", "", 0,0,0,0);

	setPrivateInt(getSkinName(), "isMainWndMaximized", 0);
	setImages (0);		
}

savePos (int code)
{
	if (!getPrivateInt(getSkinName(), "isMainWndMaximized", 0))
	{
		if (code == SAVEPOS_NORMAL || code == SAVEPOS_ALL)
		{
			if (getPrivateString(getSkinName(), "Component", "Media Library") != "Hidden")
			{
				int nnh = normal.getHeight();

				//martin> i really dunno why i've added this code:
				//if (nnh > 0 && nnh < 200) setPrivateInt(getSkinName(), "nomax_h", normal.getHeight());
				//So lets try it again w/o switch in order to fix resizing - goto shade - goback - size not remembered bug
				if (nnh > 200) setPrivateInt(getSkinName(), "nomax_h", normal.getHeight());
				//      ^  otherwise we save in collapsed mode
			}
			setPrivateInt(getSkinName(), "nomax_x", normal.getLeft());
			setPrivateInt(getSkinName(), "nomax_y", normal.getTop());
			if (normal.getWidth() > 0) setPrivateInt(getSkinName(), "nomax_w", normal.getWidth());
			//debugInt(getPrivateInt(getSkinName(), "nomax_w", normal.getWidth()));
		}
		if (code == SAVEPOS_SHADE || code == SAVEPOS_ALL)
		{
			if (link_w_attrib.getData() == "0")
			{
				setPrivateInt(getSkinName(), "shade_nomax_x", shade.getLeft());
				setPrivateInt(getSkinName(), "shade_nomax_y", shade.getTop());
				if (shade.getWidth() > 0) setPrivateInt(getSkinName(), "shade_nomax_w", shade.getWidth());
			}
			else
			{
				if (shade.getWidth() > 0) setPrivateInt(getSkinName(), "nomax_w", shade.getWidth());
				setPrivateInt(getSkinName(), "nomax_x", shade.getLeft());
				setPrivateInt(getSkinName(), "nomax_y", shade.getTop());
			}
			//debugInt(getPrivateInt(getSkinName(), "nomax_w", shade.getWidth()));
			//debugInt(getPrivateInt(getSkinName(), "shade_nomax_w", shade.getWidth()));
		}
	}
	if (code == SAVEPOS_NORMAL || code == SAVEPOS_ALL)
	{
		if (getPrivateString(getSkinName(), "Component", "Media Library") == "Hidden") setPrivateInt(getSkinName(), "nomax_y_h", normal.getTop());
	}
	//debugInt(getPrivateInt(getSkinName(), "nomax_w", shade.getWidth()));
}

setWndToScreen ()
{
	int y = getViewPortTop();
	int x = getViewPortLeft();
	int h = getViewPortHeight();
	int w = getViewPortWidth();

	int sw = 0.8 * w;
	int sh = 0.85 * h;

	int mh = stringToInteger(normal.getXmlParam("minimum_h"));
	int mw = stringToInteger(normal.getXmlParam("minimum_w"));

	if (sh < mh) sh = mh;
	if (sw < mw) sw = mw;
	
/*	int sx = x + (w-sw)/2;
	int sy = y + (h-sh)/2;*/

	normal.resize(normal.getLeft(), normal.getTop(), sw, sh);

	setPrivateInt(getSkinName(), "First Start", 0);
	setPrivateInt(getSkinName(), "isMainWndMaximized", 0);
	setImages (0);	
}