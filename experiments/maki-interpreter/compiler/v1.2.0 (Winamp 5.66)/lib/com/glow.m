/*---------------------------------------------------
-----------------------------------------------------
Filename:	glow.m
Version:	1.0

Type:		maki/glow class
Date:		16. Jun. 2007 - 23:13 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu

Usage:		1: #include glow.m
		2: #define GLOW_OBJECT MyGlow
		3: call _MyGlow_GlowInit (someObj, otherObj)
		   to init the objects.
		You can also call _MyGlow_GlowInit (NULL, otherObj)
		and load a bunch of GuiObjects in _MyGlow_GlowTrigger
		or load up to 5 objects via _MyGlow_addTarget(obj);

-----------------------------------------------------
---------------------------------------------------*/

#ifndef included
#error This script can only be compiled as a #include
#endif

#ifndef GLOW_OBJECT
#error GLOW_OBJECT not defined!
#endif

Class GuiObject _##GLOW_OBJECT##_GlowTrigger;
Global _##GLOW_OBJECT##_GlowTrigger _##GLOW_OBJECT##_trigger0, _##GLOW_OBJECT##_trigger1, _##GLOW_OBJECT##_trigger2, _##GLOW_OBJECT##_trigger3, _##GLOW_OBJECT##_trigger4, _##GLOW_OBJECT##_trigger5;
Global GuiObject _##GLOW_OBJECT##_glow;
Global float _##GLOW_OBJECT##_fdoutspeed;
Global boolean _##GLOW_OBJECT##_mouseDown;

Function _##GLOW_OBJECT##_GlowInit (GuiObject triggerObject, GuiObject glowObject, float fdoutspeed);
Function _##GLOW_OBJECT##_addTrigger (GuiObject triggerObject);

_##GLOW_OBJECT##_GlowInit (GuiObject triggerObject, GuiObject glowObject, float fdoutspeed)
{
	if (triggerObject) _##GLOW_OBJECT##_trigger0 = triggerObject;
	if (glowObject) _##GLOW_OBJECT##_glow = glowObject;

	_##GLOW_OBJECT##_fdoutspeed = fdoutspeed;
}
 
_##GLOW_OBJECT##_addTrigger(GuiObject triggerObject)
{
	if (triggerObject)
	{
		if (!_##GLOW_OBJECT##_trigger1)
		{
			_##GLOW_OBJECT##_trigger1 = triggerObject;
			return;
		}
		if (!_##GLOW_OBJECT##_trigger2)
		{
			_##GLOW_OBJECT##_trigger2 = triggerObject;
			return;
		}
		if (!_##GLOW_OBJECT##_trigger3)
		{
			_##GLOW_OBJECT##_trigger3 = triggerObject;
			return;
		}
		if (!_##GLOW_OBJECT##_trigger4)
		{
			_##GLOW_OBJECT##_trigger4 = triggerObject;
			return;
		}
		if (!_##GLOW_OBJECT##_trigger5)
		{
			_##GLOW_OBJECT##_trigger5 = triggerObject;
			return;
		}	
	}
}

_##GLOW_OBJECT##_GlowTrigger.onEnterArea ()
{
	_##GLOW_OBJECT##_glow.cancelTarget();
	_##GLOW_OBJECT##_glow.setAlpha(255);
}

_##GLOW_OBJECT##_GlowTrigger.onLeftButtonDown (int x, int y)
{
	_##GLOW_OBJECT##_mouseDown = 1;
	_##GLOW_OBJECT##_glow.cancelTarget();
	_##GLOW_OBJECT##_glow.setAlpha(0);
}

_##GLOW_OBJECT##_GlowTrigger.onLeftButtonUp (int x, int y)
{
	_##GLOW_OBJECT##_mouseDown = 0;
	_##GLOW_OBJECT##_glow.cancelTarget();
	if (_##GLOW_OBJECT##_GlowTrigger.isMouseOverRect()) _##GLOW_OBJECT##_glow.setAlpha(255);
}

_##GLOW_OBJECT##_GlowTrigger.onLeaveArea ()
{
	if (_##GLOW_OBJECT##_mouseDown) return;
	_##GLOW_OBJECT##_glow.cancelTarget();
	_##GLOW_OBJECT##_glow.setTargetA(0);
	_##GLOW_OBJECT##_glow.setTargetX(_##GLOW_OBJECT##_glow.getGuiX());
	_##GLOW_OBJECT##_glow.setTargetSpeed(_##GLOW_OBJECT##_fdoutspeed);
	_##GLOW_OBJECT##_glow.gotoTarget();
}

#undef GLOW_OBJECT