#include <lib/std.mi>

Function updateButton();
Function setIconState(int i);

Global Group XUIGroup;
Global Text myLabel;
Global Button myButton;
Global Layer myLayer;

Global Boolean smallsize, isMouseOver, busyWithClick, isGhost;
Global String savedLabel, iconId;

Global Int label_y , label_x;

System.onScriptLoaded(){
	XUIGroup = getScriptGroup();
	myLabel = XUIGroup.findObject("itb.text");
	myButton = XUIGroup.findObject("itb.button");
	myLayer = XUIGroup.findObject("itb.layer");

	myButton.setXmlParam("translate",XUIGroup.getXmlParam("translate"));
	myLabel.setXmlParam("translate",XUIGroup.getXmlParam("translate"));
	myButton.setXmlParam("translate",XUIGroup.getXmlParam("translate"));
	myButton.setXmlParam("tooltip",XUIGroup.getXmlParam("tooltip"));
	myButton.setXmlParam("ghost",XUIGroup.getXmlParam("ghost"));
}

System.onSetXuiParam(String param, String value)
{
	if (strlower(param) == "icon_id")
	{
		iconId = value;
		setIconState(1);
	}
	else if (strlower(param) == "label")
	{
		savedLabel = value;
		updateButton();
	}
	else if (strlower(param) == "label_translate")
	{
		myLabel.setXmlParam("translate", value);
	}
	else if (strlower(param) == "label_x")
	{
		label_x = stringToInteger(value);
		myLabel.setXmlParam("x", value);
	}
	else if (strlower(param) == "label_y")
	{
		label_y = stringToInteger(value);
		myLabel.setXmlParam("y", value);
	}
	else if (strlower(param) == "label_h")
	{
		myLabel.setXmlParam("h", value);
	}
	else if (strlower(param) == "label_color")
	{
		myLabel.setXmlParam("color", value);
	}
	else if (strlower(param) == "label_visible")
	{
		if (value == "0") smallsize=true;
		else smallsize=false;
		updateButton();
	}
}

myButton.onLeftButtonDown (int x, int y)
{
	myLabel.setXmlParam("y", integerToString(label_y+1));
	setIconState(3);
	busyWithClick=true;
}

myButton.onLeftButtonUp (int x, int y)
{
	myLabel.setXmlParam("y", integerToString(label_y));
	
	if (isMouseOver)	setIconState(2);
	else setIconState(1);

	busyWithClick=false;
}

myButton.onRightButtonDown (int x, int y)
{
	busyWithClick=false;
}

myButton.onEnterArea ()
{
	if (busyWithClick)
	{
		setIconState(3);
		myLabel.setXmlParam("y", integerToString(label_y+1));
	}
	else
	{
		setIconState(2);	
	}
	
	isMouseOver = true;
}

myButton.onLeaveArea ()
{
	setIconState(1);
	isMouseOver = false;
	myLabel.setXmlParam("y", integerToString(label_y));
}

updateButton ()
{
	if (smallsize)
		myLabel.setText(" ");
	else 
		myLabel.setText(savedLabel);
}

setIconState (int i)
{
	if	(i == 1) 
		myLayer.setXmlParam("image", iconId+".normal");
	else if (i == 2)
		myLayer.setXmlParam("image", iconId+".hover");
	else if (i ==3 )
		myLayer.setXmlParam("image", iconId+".down");
}

XUIGroup.onAction (String action, String param, Int x, int y, int p1, int p2, GuiObject source)
{
	if (strlower(action) == "getwidth")
	{
		int w = label_x + myLabel.getAutoWidth();
		XUIGroup.setXmlParam("w", integerToString(w));
		return w;
	}
}