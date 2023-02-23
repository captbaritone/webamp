/********************************************************\
**  Filename:	coverflow.m				**
**  Version:	1.0					**
**  Date:	20. Nov. 2007 - 15:25			**
**********************************************************
**  Type:	winamp.wasabi/maki			**
**  Project:	Cover Flow				**
**********************************************************
**  Author:	Martin Poehlmann aka Deimos		**
**  E-Mail:	martin@skinconsortium.com		**
**  Internet:	http://www.skinconsortium.com		**
**		http://home.cs.tum.edu/~poehlman	**
\********************************************************/


#include <lib/std.mi>
#include <lib/pldir.mi>

Function update();
Function fade (GuiObject o, int alpha, float s);

Class GuiObject AlbumCover;
Class AlbumCover playButton;

Global AlbumCover prev2, prev1, curr, next1, next2;
Global String sprev2, sprev1, scurr, snext1, snext2;
Global playButton bprev2, bprev1, bcurr, bnext1, bnext2;
Global text info;

#define CENTER_VAR SGrp
Global Group sg;
#include <lib/centerlayer.m>
#undef CENTER_VAR

Global PlEdit PleditListener;

Global Timer delay;


System.onScriptLoaded ()
{
	sg = getScriptGroup();

	PleditListener = new PlEdit;

	prev2 = sg.getObject("aa.prev2");
	prev1 = sg.getObject("aa.prev1");
	curr = sg.getObject("aa.curr");
	next1 = sg.getObject("aa.next1");
	next2 = sg.getObject("aa.next2");

	bprev2 = sg.getObject("play.prev2");
	bprev1 = sg.getObject("play.prev1");
	bcurr = sg.getObject("play.curr");
	bnext1 = sg.getObject("play.next1");
	bnext2 = sg.getObject("play.next2");

	info = sg.getParent().findObject("info");

	_SGrpInit(sg, sg.getParent(), 1, 0);

	delay = new Timer;
	delay.setDelay(10);

	update();
}

System.onScriptUnloading ()
{
	delete delay;
}

System.onTitleChange (String newtitle)
{
	update();
}

update ()
{
	int cur = PlEdit.getCurrentIndex();
	int max = PlEdit.getNumTracks();

	if (cur > 1) 
	{
		prev2.setXmlParam("source", PlEdit.getFileName(cur-2));
		prev2.show();
		sprev2 = PlEdit.getTitle(cur-2);
	}
	else	prev2.hide();

	if (cur > 0)
	{
		prev1.setXmlParam("source", PlEdit.getFileName(cur-1));
		prev1.show();
		sprev1 = PlEdit.getTitle(cur-1);
	}
	else	prev1.hide();

	scurr = PlEdit.getTitle(cur);
	
	if (cur < max-2) 
	{
		next2.setXmlParam("source", PlEdit.getFileName(cur+2));
		next2.show();
		snext2 = PlEdit.getTitle(cur+2);
	}
	else	next2.hide();

	if (cur < max-1)
	{
		next1.setXmlParam("source", PlEdit.getFileName(cur+1));
		next1.show();
		snext1 = PlEdit.getTitle(cur+1);
	}
	else	next1.hide();
}

PleditListener.onPleditModified ()
{
	if (delay) delay.start();
}

delay.onTimer ()
{
	delay.stop();
	update();
}


AlbumCover.onRightButtonDown (int x, int y)
{
	popupmenu p = new popupmenu;

	p.addCommand("Get Album Art", 1, 0, 0);
	p.addCommand("Refresh Album Art", 2, 0, 0);
	p.addCommand("Open Folder", 3, 0, 0);

	int result = p.popatmouse();
	delete p;

	String pis = getXmlParam("source");
	if (pis == "") pis = system.getPlayItemString();

	if (result == 1)
	{
		if (system.getAlbumArt(pis) > 0)
		{
			setXmlParam("notfoundimage", getXmlParam("notfoundimage")); // a nesty refresh - isn't it?
		}
	}
	else if (result == 2)
	{
		setXmlParam("notfoundimage", getXmlParam("notfoundimage")); // a nesty refresh - isn't it?
	}
	else if (result == 3)
	{
		System.navigateUrl(getPath(pis));
	}

}

AlbumCover.onLeftButtonDblClk (int x, int y)
{
	if (AlbumCover == playButton)
		return;

	String pis = getXmlParam("source");
	if (pis == "") pis = system.getPlayItemString();
	System.navigateUrl(getPath(pis));
}

AlbumCover.onEnterArea ()
{
	if (!findObject("aa." + getToken(getId(), ".", 1)).isVisible())
	{
		return;
	}

	int cur = PlEdit.getCurrentIndex();

	if (AlbumCover == prev2 || AlbumCover == bprev2)
		info.setText(sprev2);
	else if (AlbumCover == prev1 || AlbumCover == bprev1)
		info.setText(sprev1);
	else if (AlbumCover == curr || AlbumCover == bcurr)
		info.setText(scurr);
	else if (AlbumCover == next1 || AlbumCover == bnext1)
		info.setText(snext1);
	else if (AlbumCover == next2 || AlbumCover == bnext2)
		info.setText(snext2);
	
	GuiObject o = sg.findObject("play." + getToken(getId(), ".", 1));
	if (o )
	{
		fade(o, 255, 0.133);		
	}
	
}

AlbumCover.onLeaveArea ()
{
	info.setText("");

	GuiObject o = sg.findObject("play." + getToken(getId(), ".", 1));
	if (o)
	{
		fade(o, 0, 0.3);	
	}
}

playButton.onLeftButtonUp (int x, int y)
{
	int cur = PlEdit.getCurrentIndex();
	if (playButton == bprev2)
		PlEdit.playTrack(cur-2);
	else if (playButton == bprev1)
		PlEdit.playTrack(cur-1);
	else if (playButton == bnext1)
		PlEdit.playTrack(cur+1);
	else if (playButton == bnext2)
		PlEdit.playTrack(cur+2);

	setAlpha(0);
	info.setTexT("");
	
}

fade (GuiObject o, int alpha, float s)
{
	o.cancelTarget();
	o.setTargetA(alpha);
	o.setTargetSpeed(s);
	o.gotoTarget();
}