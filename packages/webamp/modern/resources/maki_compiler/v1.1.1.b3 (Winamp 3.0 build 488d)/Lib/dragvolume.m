//----------------------------------------------------------------------------------------
//
// dragvolume.m
//
//----------------------------------------------------------------------------------------
// Use like this :
// #define DRAG_VOLUME_VAR MyVar
// #include "dragvolume.m"
//
//
//                       _MyVarInit(AnimatedLayer l);       // init dragvolume
//                       _MyVarSetMaxDistance(Int nPixels); // set 100% pixel distance
//



Global AnimatedLayer _##DRAG_VOLUME_VAR##AnimLayer;
Global Int _##DRAG_VOLUME_VAR##Clicked;
Global Int _##DRAG_VOLUME_VAR##Y;
Global Int _##DRAG_VOLUME_VAR##V;
Global Int _##DRAG_VOLUME_VAR##Max;

Function _##DRAG_VOLUME_VAR##Init(AnimatedLayer l);
Function _##DRAG_VOLUME_VAR##Update(int vol);
Function _##DRAG_VOLUME_VAR##SetMaxDistance(int pixels);
Function _##DRAG_VOLUME_VAR##UpdateY(int y);

_##DRAG_VOLUME_VAR##Init(AnimatedLayer l) {
  _##DRAG_VOLUME_VAR##AnimLayer = l;
  _##DRAG_VOLUME_VAR##Update(getVolume());
}

_##DRAG_VOLUME_VAR##AnimLayer.onLeftButtonDown(int x, int y) {
  _##DRAG_VOLUME_VAR##Clicked = 1;
  _##DRAG_VOLUME_VAR##Y = y;
  _##DRAG_VOLUME_VAR##V = getVolume();
}

_##DRAG_VOLUME_VAR##AnimLayer.onMouseMove(int x, int y) {
  if (_##DRAG_VOLUME_VAR##Clicked) {
    _##DRAG_VOLUME_VAR##updateY(y);
  }
}

_##DRAG_VOLUME_VAR##AnimLayer.onLeftButtonUp(int x, int y) {
  _##DRAG_VOLUME_VAR##Clicked = 0;
}

_##DRAG_VOLUME_VAR##SetMaxDistance(int npix) {
  _##DRAG_VOLUME_VAR##Max = npix;
}

_##DRAG_VOLUME_VAR##UpdateY(int y) {
  float p = (_##DRAG_VOLUME_VAR##Y - y) / _##DRAG_VOLUME_VAR##Max;
  SetVolume(_##DRAG_VOLUME_VAR##V + p * 255); // range is checked
}

_##DRAG_VOLUME_VAR##Update(int vol) {
  float p = vol / 255;
  _##DRAG_VOLUME_VAR##AnimLayer.gotoFrame(p * (_##DRAG_VOLUME_VAR##AnimLayer.getLength()-1)); 
}

#ifndef _##DRAG_VOLUME_VAR##NOSYSTEMHOOK
System.onVolumeChanged(int newvol) {
  _##DRAG_VOLUME_VAR##Update(newvol);
}
#endif
