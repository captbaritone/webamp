// ----------------------------------------------------------------------
// centerlayer.m
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

Global GuiObject _##CENTER_VAR##Layer;
Global Group _##CENTER_VAR##Group;	// parent Layout to center in
Global Int _##CENTER_VAR##centerx;	// should we center x?
Global Int _##CENTER_VAR##centery;	// should we center y?
Global Int _##CENTER_VAR##addx = 0;
Global Int _##CENTER_VAR##addy = 0;
Global Int _##CENTER_VAR##addh = 0;
Global Int _##CENTER_VAR##addw = 0;

Function _##CENTER_VAR##Init(GuiObject _layer, Group parentLayout, int centerx, int centery);
Function _##CENTER_VAR##handleResize();
Function _##CENTER_VAR##setXSpace(int val);
Function _##CENTER_VAR##setYSpace(int val);
Function _##CENTER_VAR##setWSpace(int val);
Function _##CENTER_VAR##setHSpace(int val);
Function _##CENTER_VAR##sizeError(boolean iserror);

_##CENTER_VAR##Init(GuiObject _layer, Group parentLayout, int centerx, int centery) {
  _##CENTER_VAR##Layer = _layer;
  _##CENTER_VAR##Group = parentLayout;
  _##CENTER_VAR##centerx = centerx;
  _##CENTER_VAR##centery = centery;
  _##CENTER_VAR##handleResize();
}

_##CENTER_VAR##setXSpace(int val)
{
	_##CENTER_VAR##addx = val;
}

_##CENTER_VAR##setYSpace(int val)
{
	_##CENTER_VAR##addy = val;
}
_##CENTER_VAR##setHSpace(int val)
{
	_##CENTER_VAR##addh = val;
}
_##CENTER_VAR##setWSpace(int val)
{
	_##CENTER_VAR##addw = val;
}

_##CENTER_VAR##handleResize() {
  int myw = _##CENTER_VAR##Group.getWidth();
  int myh = _##CENTER_VAR##Group.getHeight();

  int layerw = _##CENTER_VAR##Layer.getWidth();
  int layerh = _##CENTER_VAR##Layer.getHeight();

  int x = _##CENTER_VAR##Layer.getLeft();
  int y = _##CENTER_VAR##Layer.getTop();

  if (_##CENTER_VAR##centerx) _##CENTER_VAR##Layer.setXmlParam("x", integerToString((myw - layerw)/2 + _##CENTER_VAR##addx + _##CENTER_VAR##addw));
  if (_##CENTER_VAR##centery) _##CENTER_VAR##Layer.setXmlParam("y", integerToString((myh - layerh)/2 + _##CENTER_VAR##addy + _##CENTER_VAR##addh));

  if (myw < layerw + 2*_##CENTER_VAR##addx - _##CENTER_VAR##addw || myh < layerh + _##CENTER_VAR##addy - _##CENTER_VAR##addh)
  {
	_##CENTER_VAR##sizeError(TRUE);
  }
  else
  {
	_##CENTER_VAR##sizeError(FALSE);
  }
}

_##CENTER_VAR##sizeError(boolean iserror) {}

_##CENTER_VAR##Group.onResize(int x, int y, int w, int h) {
  _##CENTER_VAR##handleResize();
}
