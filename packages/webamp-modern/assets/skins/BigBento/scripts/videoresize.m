/********************************************************\
**  Filename:	videoresize.m				**
**  Version:	1.0					**
**  Date:	23. Jan. 2008 - 11:23 			**
**********************************************************
**  Type:	winamp.wasabi/maki			**
**  Project:	Bento					**
**********************************************************
**  Author:	Martin Poehlmann aka Deimos		**
**  E-Mail:	martin@skinconsortium.com		**
**  Internet:	http://www.skinconsortium.com		**
**		http://home.cs.tum.edu/~poehlman	**
\********************************************************/


#include <lib/std.mi>
#include attribs/init_Autoresize.m

Function adjust(int x, int y);
Function fade(GuiObject o, int a);

Class GuiObject Mousetrap;

Global Mousetrap resizer;
Global Mousetrap wdh, outer, bg;
Global Group sg;

Global Int sx, sy, ox, oy, dx, dy;
Global Boolean move;

Global Timer refresh;

System.onScriptLoaded ()
{
	initAttribs_Autoresize();

	sg = getScriptGroup();
	wdh = sg.getObject("wdh");
	resizer = sg.getObject("wdh.drag");
	outer = sg.getObject("wdh.outer");
	bg = sg.getObject("bg");

	refresh = new Timer;
	refresh.setDelay(133);

	video_inframe_attrib.onDataChanged ();
}

System.onScriptUnloading ()
{
	refresh.stop();
	delete refresh;
}

resizer.onLeftButtonDown (int x, int y)
{
	move = true;
	sx = x;
	sy = y;
	ox = wdh.getGuiX();
	oy = wdh.getGuiY();
	refresh.start();
}

resizer.onLeftButtonUp (int x, int y)
{
	move = false;
	refresh.stop();
}

resizer.onMouseMove (int x, int y)
{
	if (!move) return;

	dx = sx - x;
	dy = sy - y;
}

// handle the resizing with a timer in order to prevent jittering
refresh.onTimer ()
{
	adjust(dx, dy);
}

adjust (int x, int y)
{
	int nx = ox + x;
	int ny = oy + y;

	// Ensure we don't get out of the bounds
	if (nx < 5)
	{
		nx = 5;
	}

	if (ny < 5)
	{
		ny = 5;	
	}

	// Minimum h/w: aligned with Nullsoft Video Symbol
	if (sg.getHeight() - 2*ny < 64)
	{
		ny = (64 - sg.getHeight())/(-2);
	}

	if (sg.getWidth() - 2*nx < 100)
	{
		nx = (100  - sg.getWidth())/(-2);
	}	
	
	outer.setXmlParam("x", integerToString(nx-1));
	outer.setXmlParam("w", integerToString(-2*(nx-1)));
	outer.setXmlParam("y", integerToString(ny-1));
	outer.setXmlParam("h", integerToString(-2*(ny-1)));

	wdh.setXmlParam("x", integerToString(nx));
	wdh.setXmlParam("w", integerToString(-(2*nx)));
	wdh.setXmlParam("y", integerToString(ny));
	wdh.setXmlParam("h", integerToString(-(2*ny)));

	resizer.setXmlParam("x", integerToString(-nx));
	resizer.setXmlParam("y", integerToString(-ny));
}

video_inframe_attrib.onDataChanged ()
{
	if (getData() == "1")
	{
		outer.show();
		resizer.show();

		outer.setXmlParam("x", integerToString(4));
		outer.setXmlParam("w", integerToString(-8));
		outer.setXmlParam("y", integerToString(4));
		outer.setXmlParam("h", integerToString(-8));

		wdh.setXmlParam("x", integerToString(5));
		wdh.setXmlParam("w", integerToString(-10));
		wdh.setXmlParam("y", integerToString(5));
		wdh.setXmlParam("h", integerToString(-10));

		resizer.setXmlParam("x", integerToString(-5));
		resizer.setXmlParam("y", integerToString(-5));

	}
	else
	{
		outer.hide();
		resizer.hide();

		wdh.setXmlParam("x", integerToString(0));
		wdh.setXmlParam("w", integerToString(0));
		wdh.setXmlParam("y", integerToString(0));
		wdh.setXmlParam("h", integerToString(0));		
	}
}

/*
Mousetrap.onEnterArea ()
{
	if (outer.getAlpha() == 255) return;
	if (video_inframe_attrib.getData() == "1")
	{
		fade(outer, 255);
		fade(resizer, 255);
	}
}

Mousetrap.onLeaveArea ()
{
	if (move) return;
	
	for ( int i = 0; i < sg.getNumObjects(); i++ )
	{
		if (sg.enumObject(i).isMouseOver(getMousePosX(), getMousePosY())) return;
	}
	
	if (video_inframe_attrib.getData() == "1")
	{
		fade(outer, 0);
		fade(resizer, 0);
	}
}

fade (GuiObject o, int a)
{
	o.cancelTarget();
	o.setTargetX(o.getGuiX());
	o.setTargetY(o.getGuiY());
	o.setTargetH(o.getGuiH());
	o.setTargetW(o.getGuiW());
	o.setTargetA(a);
	o.setTargetSpeed(0.3);
	o.gotoTarget();
}*/