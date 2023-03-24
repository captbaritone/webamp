// ----------------------------------------------------------------------
// original file: centerlayer.m
// ----------------------------------------------------------------------
// by Brennan
// Use like this :
// #define CENTER_VAR MyVar
// Global MyVar;
// #include "centerlayer.h"
// Group l = ;
// MyVar = l.getObject("something");
// _MyVarInit(Layer MyVar, Group l, int centerx, int centery);
// ----------------------------------------------------------------------
#include <lib/std.mi>


Global GuiObject _eqGroupLayer;
Global Group _eqGroupGroup;	// parent Layout to center in
Global Int _eqGroupcenterx;	// should we center x?
Global Int _eqGroupcentery;	// should we center y?
Global Int _eqGroupaddx = 0;
Global Int _eqGroupaddy = 0;
Global Int _eqGroupaddh = 0;
Global Int _eqGroupaddw = 0;

Function _eqGroupInit(GuiObject _layer, Group parentLayout, int centerx, int centery);
Function _eqGrouphandleResize();
Function _eqGroupsetXSpace(int val);
Function _eqGroupsetYSpace(int val);
Function _eqGroupsetWSpace(int val);
Function _eqGroupsetHSpace(int val);
Function _eqGroupsizeError(boolean iserror);

_eqGroupInit(GuiObject _layer, Group parentLayout, int centerx, int centery) {
  _eqGroupLayer = _layer;
  _eqGroupGroup = parentLayout;
  _eqGroupcenterx = centerx;
  _eqGroupcentery = centery;
  _eqGrouphandleResize();
}

_eqGroupsetXSpace(int val)
{
	_eqGroupaddx = val;
}

_eqGroupsetYSpace(int val)
{
	_eqGroupaddy = val;
}
_eqGroupsetHSpace(int val)
{
	_eqGroupaddh = val;
}
_eqGroupsetWSpace(int val)
{
	_eqGroupaddw = val;
}

_eqGrouphandleResize() {
  int myw = _eqGroupGroup.getWidth();
  int myh = _eqGroupGroup.getHeight();

  int layerw = _eqGroupLayer.getWidth();
  int layerh = _eqGroupLayer.getHeight();

  int x = _eqGroupLayer.getLeft();
  int y = _eqGroupLayer.getTop();

  if (_eqGroupcenterx) _eqGroupLayer.setXmlParam("x", integerToString((myw - layerw)/2 + _eqGroupaddx + _eqGroupaddw));
  if (_eqGroupcentery) _eqGroupLayer.setXmlParam("y", integerToString((myh - layerh)/2 + _eqGroupaddy + _eqGroupaddh));

  if (myw < layerw + 2*_eqGroupaddx - _eqGroupaddw || myh < layerh + _eqGroupaddy - _eqGroupaddh)
  {
	_eqGroupsizeError(TRUE);
  }
  else
  {
	_eqGroupsizeError(FALSE);
  }
}

_eqGroupsizeError(boolean iserror) {}

_eqGroupGroup.onResize(int x, int y, int w, int h) {
  _eqGrouphandleResize();
}
