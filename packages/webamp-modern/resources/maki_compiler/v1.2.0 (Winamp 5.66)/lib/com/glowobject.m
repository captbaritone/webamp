/**
 * glowobject.m
 *
 * @package	com.winamp.maki.lib.community.glowobject
 * @author	mpdeimos
 * @date	18/10/01
 * @version	1.0
 */


#ifndef included
#error This script can only be compiled as a #include
#endif

#define GLOW_TYPE_HOLD 0
#define GLOW_TYPE_FLASH 1
#define GLOW_TYPE_BOUNCE 2

Class GuiObject GlowLayer;
// {
	Member GuiObject GlowLayer.trigger;
// }

Class GuiObject GlowObject;
// {
	Member float GlowObject.fadeInSpeed;
	Member float GlowObject.fadeOutSpeed;
	Member int GlowObject.glowType;
	Member boolean GlowObject.glowing;

	Member GuiObject GlowObject.glow;

	/**
	 * constructor
	 * 
	 * @param GuiObject that will be used to trigger the glow on mouse entering it's region
	 * @param the glowing object
	 * @ret GlowObject object
	 */
	Function GlowObject GlowObject_construct(GlowObject trigger, GlowLayer glow);

	/**
	 * sets fade in time
	 * 
	 * @param GlowObject to act on
	 * @param milliseconds till the glow is at alpha 255
	 */
	Function GlowObject_setFadeInSpeed(GlowObject go, float ms);

	/**
	 * sets fade out time
	 * 
	 * @param GlowObject to act on
	 * @param milliseconds till the glow is at alpha 0
	 */
	Function GlowObject_setFadeOutSpeed(GlowObject go, float ms);

	/**
	 * sets the glowtype used by this glow button.
	 *
	 * @param GlowObject to act on
	 * @param glowType defined via GLOW_TYPE_*
	 */
	Function GlowObject_setGlowType(GlowObject go, int glowType);


	/*
	 * IMPLEMENTATION
	 */

	GlowObject GlowObject_construct(GlowObject trigger, GlowLayer glow)
	{
		if (trigger == null)
		{
			debug("trigger");
		}
		if (glow == NULL)
		{
			debug("glow");
		}
		
		GlowObject go = trigger;
		go.fadeInSpeed = 0.3;
		go.fadeOutSpeed = 0.5;
		go.glow = glow;
		go.glowType = GLOW_TYPE_HOLD;
		go.glowing = false;
		glow.trigger = trigger;
		return go;
	}

	GlowObject_setFadeInSpeed(GlowObject go, float ms)
	{
		go.fadeInSpeed = ms;
	}

	GlowObject_setFadeOutSpeed(GlowObject go, float ms)
	{
		go.fadeOutSpeed = ms;
	}

	GlowObject_setGlowType(GlowObject go, int glowType)
	{
		go.glowType = glowType;
	}

	GlowObject.onEnterArea ()
	{
		GlowObject.glowing = true;
		GlowObject.glow.cancelTarget();
		GlowObject.glow.setTargetA(255);
		GlowObject.glow.setTargetSpeed(GlowObject.fadeInSpeed);
		GlowObject.glow.gotoTarget();
	}

	GlowObject.onLeaveArea ()
	{
		GlowObject.glowing = false;
		if (GlowObject.glowType != GLOW_TYPE_FLASH)
		{
			GlowObject.glow.cancelTarget();
			GlowObject.glow.setTargetA(0);
			GlowObject.glow.setTargetSpeed(GlowObject.fadeOutSpeed);
			GlowObject.glow.gotoTarget();
		}
	}

	GlowLayer.onTargetReached ()
	{
		GlowObject go = GlowLayer.trigger;
		if (go.glowType == GLOW_TYPE_HOLD)
		{
			return;
		}
		else if (go.glowType == GLOW_TYPE_FLASH)
		{
			if (GlowLayer.getAlpha() == 255)
			{
				GlowLayer.cancelTarget();
				GlowLayer.setTargetA(0);
				GlowLayer.setTargetSpeed(GlowObject.fadeOutSpeed);
				GlowLayer.gotoTarget();
			}
		}
		else if (go.glowType == GLOW_TYPE_BOUNCE)
		{
			if (GlowLayer.getAlpha() == 255)
			{
				GlowLayer.cancelTarget();
				GlowLayer.setTargetA(0);
				GlowLayer.setTargetSpeed(GlowObject.fadeOutSpeed);
				GlowLayer.gotoTarget();
			}
			else if (GlowLayer.getAlpha() == 0 && go.glowing)
			{
				GlowLayer.cancelTarget();
				GlowLayer.setTargetA(255);
				GlowLayer.setTargetSpeed(GlowObject.fadeInSpeed);
				GlowLayer.gotoTarget();				
			}
		}		
	}
	
	GlowObject.onSetVisible (Boolean onoff)
	{
		if (onoff)
		{
			GlowObject.glow.show();
		}
		else
		{
			GlowObject.glow.hide();
		}
	
	}
// }
