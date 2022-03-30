// ----------------------------------------------------------------------
// centerlayer.m
// ----------------------------------------------------------------------
// by Brennan
// Use like this :
// #define CENTER_VAR MyVar
// Global MyVar;
// #include "centerlayer.h"
// Layout l = getContainer("containername").getLayout("layoutname");
// MyVar = l.getObject("something");
// _MyVarInit(Layer MyVar, Layout l, int centerx, int centery);
// ----------------------------------------------------------------------

Global Layer _##CENTER_VAR##Layer;
Global Layout _##CENTER_VAR##Layout;	// parent Layout to center in
Global Int _##CENTER_VAR##centerx;	// should we center x?
Global Int _##CENTER_VAR##centery;	// should we center y?

Function _##CENTER_VAR##Init(Layer _layer, Layout parentLayout, int centerx, int centery);
Function _##CENTER_VAR##handleResize();

_##CENTER_VAR##Init(Layer _layer, Layout parentLayout, int centerx, int centery) {
  _##CENTER_VAR##Layer = _layer;
  _##CENTER_VAR##Layout = parentLayout;
  _##CENTER_VAR##centerx = centerx;
  _##CENTER_VAR##centery = centery;
  _##CENTER_VAR##handleResize();
}

_##CENTER_VAR##handleResize() {
  int myw = _##CENTER_VAR##Layout.getWidth();
  int myh = _##CENTER_VAR##Layout.getHeight();

  int layerw = _##CENTER_VAR##Layer.getWidth();
  int layerh = _##CENTER_VAR##Layer.getHeight();

  int x = _##CENTER_VAR##Layer.getLeft();
  int y = _##CENTER_VAR##Layer.getTop();
  if (_##CENTER_VAR##centerx) x = (myw - layerw)/2;
  if (_##CENTER_VAR##centery) y = (myh - layerh)/2;

  _##CENTER_VAR##Layer.resize(x, y, layerw, layerh);
}

_##CENTER_VAR##Layout.onResize(int x, int y, int w, int h) {
  _##CENTER_VAR##handleResize();
}
