/**
 * fillbar.m
 *
 * Manages custom fillbars.
 *
 * @package	com.winamp.maki.lib.community.fillbar
 * @author	mpdeimos
 * @date	08/10/01
 * @version	1.0
 */

#ifndef included
#error This script can only be compiled as a #include
#endif

Class Layer FillBar;
// {
	Member Map FillBar.fillmap;
	Member int FillBar.pos;
	Member boolean Fillbar.reverse;

	// User dragging stuff
	Member boolean Fillbar.dragable;
	Member boolean Fillbar.dragging;

	/**
	 * constructor
	 * 
	 * @param layer that should be handled like a fillbar
	 * @param bitmapID that should be used as region map
	 * @ret FillBar object
	 */
	Function FillBar FillBar_construct(Layer l, String bitmapID);
	Function FillBar_setMap(FillBar fb, String bitmapID);

	/**
	 * destructor, always call on script unloading
	 * 
	 */
	Function FillBar_destruct(FillBar fb);

	/**
	 * sets the region
	 * 
	 * @param fillbar to act on
	 * @param threshold of the map to generate a region
	 */
	Function FillBar_setPosition(FillBar fb, int threshold);

	/**
	 * called each time the users drags the fillbar
	 * 
	 * @param The dragged FillBar
	 * @param The alue the FillBar was dragged to.
	 * @ret FALSE if you do not want to allow dragging.
	 */
	Function boolean FillBar_onDrag(FillBar fb, int pos);

	/*
	 * called each time the users ends dragging the fillbar
	 * 
	 * @param The dragged FillBar
	 * @param The alue the FillBar was dragged to.
	 * @ret FALSE if you do not want to allow dragging.
	 */
	Function boolean FillBar_onEndDrag(FillBar fb, int pos);


	/*
	 * IMPLEMENTATION
	 */

	FillBar FillBar_construct(Layer l, String bitmapID)
	{
		FillBar fb = l;
		fb.reverse = TRUE;
		fb.fillmap = new Map;
		fb.fillmap.loadMap(bitmapID);
		return fb;
	}

	FillBar_setMap(Fillbar fb, String bitmapID)
	{
		if (fb.fillmap != NULL)
		{
			delete fb.fillmap;
		}
		
		fb.fillmap = new Map;
		fb.fillmap.loadMap(bitmapID);
	}

	FillBar_destruct(FillBar fb)
	{
		Map tmp = fb.fillmap;
		delete tmp;
	}

	FillBar_setPosition(FillBar fb, int threshold)
	{
		fb.pos = threshold;
		fb.setRegionFromMap(fb.fillmap, threshold, fb.reverse);
	}


	// User dragging handles

	FillBar.onLeftButtonDown (int x, int y)
	{
		if (!FillBar.dragable)
		{
			return;
		}
		
		Fillbar.dragging = TRUE;
	}

	FillBar.onMouseMove (int x, int y)
	{
		if (!FillBar.dragable || !Fillbar.dragging)
		{
			return;
		}

		int mouseLeft = x - FillBar.getLeft();
		int mouseTop = y - Fillbar.getTop();

		if (!FillBar.fillMap.inRegion(mouseLeft, mouseTop))
		{
			return;
		}
		
		int position = FillBar.fillMap.getValue(mouseLeft, mouseTop);

		int update = FillBar_onDrag(FillBar, position);
		
		if (update)
		{
			FillBar_setPosition(FillBar, position);
		}
	}
	
	Fillbar.onLeftButtonUp (int x, int y)
	{
		if (!FillBar.dragable || !Fillbar.dragging)
		{
			return;
		}

		int mouseLeft = x - FillBar.getLeft();
		int mouseTop = y - Fillbar.getTop();

		int position = FillBar.fillMap.getValue(mouseLeft, mouseTop);

		if (!FillBar.fillMap.inRegion(mouseLeft, mouseTop))
		{
			position = fb.pos;
		}

		int update = FillBar_onEndDrag(FillBar, position);
		
		if (update)
		{
			FillBar_setPosition(FillBar, position);
		}

		Fillbar.dragging = FALSE;
	}
	
	// Callback Stubs
	boolean FillBar_onDrag(Fillbar fb, int pos) {  return TRUE; }
	boolean FillBar_onEndDrag(Fillbar fb, int pos) { return TRUE; }
// }
