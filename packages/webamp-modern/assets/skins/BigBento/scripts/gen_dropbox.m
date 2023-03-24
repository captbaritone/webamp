#include <lib/std.mi>

#define GUID_DROPBOX "{E2E4AD32-D87B-4B9E-BF58-46A1336DDC8F}"
#define GUID_DROPBOX_ "{E2E4AD32-D87B-4b9e-BF58-46A1336DDC8F}"
#define USE_BIG_HACK

Global Frame dualwnd;
Global Group sui_window;
Global Group dropbox;

Global Timer box_tmr;
Global windowholder dropbox_wdh;

Global Container main;

Global int MIN_WIDTH;

System.onScriptLoaded ()
{
	dualwnd = getScriptGroup().findObject("wdh.ml.dualwnd");
	sui_window = getScriptGroup().getParentLayout().findObject("sui.content");
	dropbox = dualwnd.findObject("wdh.ml.dualwnd.dropbox");
	dropbox_wdh = dropbox.findObject("wdh");

	main = dropbox.getParentLayout().getContainer();

	//showWindow(GUID_DROPBOX, "", false);

	MIN_WIDTH = stringToInteger(dualwnd.getXmlParam("minwidth"));
	dualwnd.setXmlParam("resizable", "0");
	dualwnd.setPosition(0);

	box_tmr = new Timer;
	box_tmr.setDelay(1);
}

System.onScriptUnloading ()
{
	delete box_tmr;
	
	int w = dualwnd.getPosition();
	if (w >= MIN_WIDTH)
	{
		setPrivateInt(getSkinName(), "gen_dropbox_poppler", w);			
	}
}
#ifdef 0
Global Boolean gettingclosed;

System.onGetCancelComponent (String guid, boolean goingvisible)
{
	
	if (guid != GUID_DROPBOX)
	{
		return FALSE;
	}

        if (goingvisible && !gettingclosed)
	{
		box_tmr.start();
		return TRUE;
	}
	else
	{
		if (gettingclosed)
		{
			gettingclosed = false;
		}
		else
		{
			
			/*int w = dualwnd.getPosition();
			if (w >= MIN_WIDTH)
			{
				setPrivateInt(getSkinName(), "gen_dropbox_poppler", w);			
			}
			dualwnd.setXmlParam("resizable", "0");
			dualwnd.setPosition(0);*/			
		}
		

	}
	

	RETURN FALSE;
}

box_tmr.onTimer ()
{
	box_tmr.stop();
	int w = getPrivateInt(getSkinName(), "gen_dropbox_poppler", 200);
	if (w < MIN_WIDTH)
		w = MIN_WIDTH;
		
	dualwnd.setXmlParam("resizable", "1");

	System.showWindow("{6B0EDF80-C9A5-11D3-9F26-00C04F39FFC6}", "", 0);
	//sui_window.sendAction("opentab", "ml", 0,0,0,0);

	dualwnd.setPosition(w);
	dropbox.hide();
	dropbox_wdh.hide();
	//dropbox_wdh.setXMLParam("hold", "");
	dropbox_wdh.show();
	//dropbox_wdh.setXMLParam("hold", "@all@");
	dropbox.show();
}

#ifdef USE_BIG_HACK

sui_window.onAction (String action, String param, Int x, int y, int p1, int p2, GuiObject source)
{
	if (action == "callback")
	{
		if (param == "onbeforehidesui")
		{
			/*//dualwnd.setPosition(0);
			//dropbox.findObject("wdh").setXmlParam("relatw", "0");
			//dropbox.findObject("wdh").setXmlParam("w", "0");
			int i = dualwnd.getLeft() + dualwnd.getWidth();
			dualwnd.setShaded(dualwnd.clientToScreenX(dualwnd.getLeft() +dualwnd.getWidth()),dualwnd.clientToScreenX(dualwnd.getLeft() + dualwnd.getWidth()-dualwnd.getPosition()-4));
			debugInt(dualwnd.clientToScreenX(dualwnd.getLeft() +dualwnd.getWidth()));*/
			dropbox.hide();
gettingclosed = true;
			//dualwnd.setPosition(0);
		}
		else if (param == "onshowsui")
		{
			//dualwnd.setPosition(200);		
		}		
	}
}

main.onBeforeSwitchToLayout (Layout oldlayout, Layout newlayout)
{
	if (newLayout.getID() == "shade")
	{
dropbox.hide();
gettingclosed = true;
	}
	
}

#endif
#endif
