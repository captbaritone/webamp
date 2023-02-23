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


Global GuiObject _BrandingLayer;
Global Group _BrandingGroup;	// parent Layout to center in
Global Int _Brandingcenterx;	// should we center x?
Global Int _Brandingcentery;	// should we center y?
Global Int _Brandingaddx = 0;
Global Int _Brandingaddy = 0;
Global Int _Brandingaddh = 0;
Global Int _Brandingaddw = 0;

Function _BrandingInit(GuiObject _layer, Group parentLayout, int centerx, int centery);
Function _BrandinghandleResize();
Function _BrandingsetXSpace(int val);
Function _BrandingsetYSpace(int val);
Function _BrandingsetWSpace(int val);
Function _BrandingsetHSpace(int val);
Function _BrandingsizeError(boolean iserror);

_BrandingInit(GuiObject _layer, Group parentLayout, int centerx, int centery) {
  _BrandingLayer = _layer;
  _BrandingGroup = parentLayout;
  _Brandingcenterx = centerx;
  _Brandingcentery = centery;
  _BrandinghandleResize();
}

_BrandingsetXSpace(int val)
{
	_Brandingaddx = val;
}

_BrandingsetYSpace(int val)
{
	_Brandingaddy = val;
}
_BrandingsetHSpace(int val)
{
	_Brandingaddh = val;
}
_BrandingsetWSpace(int val)
{
	_Brandingaddw = val;
}

_BrandinghandleResize() {
  int myw = _BrandingGroup.getWidth();
  int myh = _BrandingGroup.getHeight();

  int layerw = _BrandingLayer.getWidth();
  int layerh = _BrandingLayer.getHeight();

  int x = _BrandingLayer.getLeft();
  int y = _BrandingLayer.getTop();

  if (_Brandingcenterx) _BrandingLayer.setXmlParam("x", integerToString((myw - layerw)/2 + _Brandingaddx + _Brandingaddw));
  if (_Brandingcentery) _BrandingLayer.setXmlParam("y", integerToString((myh - layerh)/2 + _Brandingaddy + _Brandingaddh));

  if (myw < layerw + 2*_Brandingaddx - _Brandingaddw || myh < layerh + _Brandingaddy - _Brandingaddh)
  {
	_BrandingsizeError(TRUE);
  }
  else
  {
	_BrandingsizeError(FALSE);
  }
}

_BrandingsizeError(boolean iserror) {}

_BrandingGroup.onResize(int x, int y, int w, int h) {
  _BrandinghandleResize();
}
