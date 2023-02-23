/*---------------------------------------------------
-----------------------------------------------------
Filename:	_wa2-easylayout.m
Version:	1.0

Type:		maki/slider
Date:		30. Oct. 2012 - 23:11 
Author:		Pieter Nieuwoudt (pjn123)
E-Mail:		pjn123@outlook.com
Internet:	www.skinconsortium.com

Note:		Script can hide any object if the parent group are smaller than a certain w/h
			Furthermore you can also dynamicly change the x/y of the object as the layout resize.
			Use the offset to fine tune the position (if you don't want it to be 100% centered)

			Takes 7 parameters:
			param="id;hidew,hideh;center_x;center_y,offset_x,offset_y"

Examples:
			<layer id="pl.center.logo.inactive" image="wa2.pl.2.center.disabled" x="-100" y="0" activealpha="0"/>
			<script file="scripts/_wa2-easylayout.maki" param="pl.center.logo.inactive;0;0;1;0;0;0"/>

			<layer id="pl.vis.area" image="wa2.pl.8.vis" x="-225" y="-38" relatx="1" relaty="1"/>
			<script file="scripts/_wa2-easylayout.maki" param="pl.vis.area;350;0;0;0;0;0"/>

-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>

Global Group myGroup;
Global GuiObject myGuiObject;

Global boolean b_center_x, b_center_y;
//Global String temp;
Global int i_hide_w, i_hide_h, i_offset_x, i_offset_y;

System.onScriptLoaded()
{
	myGroup = getScriptGroup();
	myGuiObject = myGroup.getObject(getToken(getParam(),";",0));

	i_hide_w = stringToInteger(getToken(getParam(),";",1));
	i_hide_h = stringToInteger(getToken(getParam(),";",2));
	b_center_x = stringToInteger(getToken(getParam(),";",3));
	b_center_y = stringToInteger(getToken(getParam(),";",4));
	i_offset_x = stringToInteger(getToken(getParam(),";",5));
	i_offset_y = stringToInteger(getToken(getParam(),";",6));

	//debugint(b_center_x);
	
}

myGroup.onSetVisible(boolean onOff){
	if(onOff) myGroup.onResize(0, 0, myGroup.getWidth(), myGroup.getHeight());
}

myGroup.onResize(int x, int y, int w, int h)
{
	// Show or hide object
	if(w < i_hide_w || h < i_hide_h) myGuiObject.hide();
	else myGuiObject.show();
	
	if(b_center_x){
		myGuiObject.setXmlParam("x", integerToString(w/2 - (myGuiObject.getAutoWidth()/2) + i_offset_x));
	}

	if(b_center_y){
		myGuiObject.setXmlParam("y", integerToString(h/2 - (myGuiObject.getAutoHeight()/2) + i_offset_y));
	}

}