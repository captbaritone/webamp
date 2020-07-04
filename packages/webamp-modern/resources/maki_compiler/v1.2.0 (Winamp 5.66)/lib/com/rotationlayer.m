//----------------------------------------------------------------------------------------
//
// rotationlayer.m
//
//----------------------------------------------------------------------------------------
// Use like this :
// #define ROTATION_LAYER_VAR MyVar
// #include "rotationlayer.m"
//
//                       _MyVarInit(Group parentgroup, String layername); // init rotationlayer
//                       _MyVarRotateDegree(double r);     // in degrees
//                       _MyVarRotate(double r);           // in radians
//                       double _MyVarGetRotationDegree(); // in degrees
//                       double _MyVarGetRotation();       // in radians
//

#ifndef PI
#define PI 3.1415926536
#endif

Global Double _##ROTATION_LAYER_VAR##R;
Global Layer _##ROTATION_LAYER_VAR##Layer;

Function _##ROTATION_LAYER_VAR##Init(Group parentgroup, String layername);
Function _##ROTATION_LAYER_VAR##RotateDegree(double r);
Function _##ROTATION_LAYER_VAR##Rotate(double r);
Function double _##ROTATION_LAYER_VAR##GetRotationDegree();
Function double _##ROTATION_LAYER_VAR##GetRotation();

_##ROTATION_LAYER_VAR##RotateDegree(double r) {
  _##ROTATION_LAYER_VAR##Rotate(r * PI / 180.0);
}

_##ROTATION_LAYER_VAR##Rotate(double r) {
  _##ROTATION_LAYER_VAR##R = r;
  _##ROTATION_LAYER_VAR##Layer.fx_update();
}

double _##ROTATION_LAYER_VAR##GetRotationDegree() {
  return _##ROTATION_LAYER_VAR##R * 180 / PI;
}

double _##ROTATION_LAYER_VAR##GetRotation() {
  return _##ROTATION_LAYER_VAR##R;
}

_##ROTATION_LAYER_VAR##Init(Group parentgroup, String layername) {
  _##ROTATION_LAYER_VAR##Layer = parentgroup.getObject(layername);
  _##ROTATION_LAYER_VAR##Layer.fx_setGridSize(1,1);
  _##ROTATION_LAYER_VAR##Layer.fx_setBgFx(0);
  _##ROTATION_LAYER_VAR##Layer.fx_setWrap(1);
  _##ROTATION_LAYER_VAR##Layer.fx_setBilinear(1);
  _##ROTATION_LAYER_VAR##Layer.fx_setRect(0);
  _##ROTATION_LAYER_VAR##Layer.fx_setClear(0);
  _##ROTATION_LAYER_VAR##Layer.fx_setLocalized(1);
  _##ROTATION_LAYER_VAR##Layer.fx_setRealtime(0);
  _##ROTATION_LAYER_VAR##Layer.fx_setEnabled(1);
}

_##ROTATION_LAYER_VAR##Layer.fx_onGetPixelR(double r, double d, double x, double y) {
  return r + _##ROTATION_LAYER_VAR##R;
}

//--------------------II-----------------
Global Double _##ROTATION_LAYER_VARII##R;
Global Layer _##ROTATION_LAYER_VARII##Layer;

Function _##ROTATION_LAYER_VARII##Init(Group parentgroup, String layername);
Function _##ROTATION_LAYER_VARII##RotateDegree(double r);
Function _##ROTATION_LAYER_VARII##Rotate(double r);
Function double _##ROTATION_LAYER_VARII##GetRotationDegree();
Function double _##ROTATION_LAYER_VARII##GetRotation();

_##ROTATION_LAYER_VARII##RotateDegree(double r) {
  _##ROTATION_LAYER_VARII##Rotate(r * PI / 180.0);
}

_##ROTATION_LAYER_VARII##Rotate(double r) {
  _##ROTATION_LAYER_VARII##R = r;
  _##ROTATION_LAYER_VARII##Layer.fx_update();
}

double _##ROTATION_LAYER_VARII##GetRotationDegree() {
  return _##ROTATION_LAYER_VARII##R * 180 / PI;
}

double _##ROTATION_LAYER_VARII##GetRotation() {
  return _##ROTATION_LAYER_VARII##R;
}

_##ROTATION_LAYER_VARII##Init(Group parentgroup, String layername) {
  _##ROTATION_LAYER_VARII##Layer = parentgroup.getObject(layername);
  _##ROTATION_LAYER_VARII##Layer.fx_setGridSize(1,1);
  _##ROTATION_LAYER_VARII##Layer.fx_setBgFx(0);
  _##ROTATION_LAYER_VARII##Layer.fx_setWrap(1);
  _##ROTATION_LAYER_VARII##Layer.fx_setBilinear(1);
  _##ROTATION_LAYER_VARII##Layer.fx_setRect(0);
  _##ROTATION_LAYER_VARII##Layer.fx_setClear(0);
  _##ROTATION_LAYER_VARII##Layer.fx_setLocalized(1);
  _##ROTATION_LAYER_VARII##Layer.fx_setRealtime(0);
  _##ROTATION_LAYER_VARII##Layer.fx_setEnabled(1);

}

_##ROTATION_LAYER_VARII##Layer.fx_onGetPixelR(double r, double d, double x, double y) {
  return r + _##ROTATION_LAYER_VAR##R;
}

