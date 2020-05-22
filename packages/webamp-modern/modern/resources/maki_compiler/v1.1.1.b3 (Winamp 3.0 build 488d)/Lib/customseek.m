//----------------------------------------------------------------------------------------
//
// customseek.m
//
//----------------------------------------------------------------------------------------
// Use like this :
// #define CUSTOM_SEEK_VAR MyVar
// #include "customseek.m"
//
//
// What you need :  
//                       _MyVarInit(Layer seeksurface, Layer seekghost, Map seekmap); 
//                       _MyVarShutdown(); 
//



Global Layer _##CUSTOM_SEEK_VAR##Surface;
Global Layer _##CUSTOM_SEEK_VAR##Ghost;
Global Map _##CUSTOM_SEEK_VAR##Map;
Global Int _##CUSTOM_SEEK_VAR##Clicked;
Global Timer _##CUSTOM_SEEK_VAR##Timer;
Global Int _##CUSTOM_SEEK_VAR##CurPos;

Function _##CUSTOM_SEEK_VAR##Init(Layer s, Layer g, Map m);
Function _##CUSTOM_SEEK_VAR##Update(int newpos);
Function _##CUSTOM_SEEK_VAR##UpdateXY(int x, int y);
Function _##CUSTOM_SEEK_VAR##SeekTo(int x, int y);
Function _##CUSTOM_SEEK_VAR##Shutdown();

_##CUSTOM_SEEK_VAR##Init(Layer s, Layer g, Map m) {
  _##CUSTOM_SEEK_VAR##Surface = s;
  _##CUSTOM_SEEK_VAR##Ghost = g;
  _##CUSTOM_SEEK_VAR##Map = m;
  _##CUSTOM_SEEK_VAR##Update(0);
  _##CUSTOM_SEEK_VAR##Timer = new Timer;
  _##CUSTOM_SEEK_VAR##Timer.setDelay(500);
  _##CUSTOM_SEEK_VAR##Timer.start();
}

_##CUSTOM_SEEK_VAR##Shutdown() {
  delete _##CUSTOM_SEEK_VAR##Timer;
}

_##CUSTOM_SEEK_VAR##Surface.onLeftButtonDown(int x, int y) {
  if (getPlayItemLength() <= 0) return;
  if (Strleft(getPlayItemString(), 4) == "http") return;
  _##CUSTOM_SEEK_VAR##Clicked = 1;
  _##CUSTOM_SEEK_VAR##UpdateXY(x, y);
}

_##CUSTOM_SEEK_VAR##Surface.onMouseMove(int x, int y) {
  if (_##CUSTOM_SEEK_VAR##Clicked) {
    if (getPlayItemLength() == 0) {
      _##CUSTOM_SEEK_VAR##Clicked = 0;
      return;
    }
    _##CUSTOM_SEEK_VAR##UpdateXY(x, y);
  }
}

_##CUSTOM_SEEK_VAR##Surface.onLeftButtonUp(int x, int y) {
  if (!_##CUSTOM_SEEK_VAR##Clicked) return;  
  _##CUSTOM_SEEK_VAR##Clicked = 0;
  _##CUSTOM_SEEK_VAR##SeekTo(x, y);
}

_##CUSTOM_SEEK_VAR##SeekTo(int x, int y) {
  int n = _##CUSTOM_SEEK_VAR##Map.getValue(x, y);
  seekTo(getPlayItemLength() * (n / 255));
}

_##CUSTOM_SEEK_VAR##UpdateXY(int x, int y) {
  int n = _##CUSTOM_SEEK_VAR##Map.getValue(x, y);
  Region r = new Region;
  r.loadFromMap(_##CUSTOM_SEEK_VAR##Map, n, 1);
  r.offset(-_##CUSTOM_SEEK_VAR##Ghost.getLeft(), -_##CUSTOM_SEEK_VAR##Ghost.getTop());
  _##CUSTOM_SEEK_VAR##Ghost.setRegion(r);
  #ifdef CUSTOM_SEEK_CALLBACK
  int n = _##CUSTOM_SEEK_VAR##Map.getValue(x, y);
  _##CUSTOM_SEEK_VAR##OnUpdate(r, getPlayItemLength() * (n / 255));
  #endif
  delete r;
}

_##CUSTOM_SEEK_VAR##Update(int newpos) {
  float p;
  int l = getPlayItemLength();
  if (l == 0) p = 0;
  else p = newpos / l * 255;
  Region r = new Region;
  r.loadFromMap(_##CUSTOM_SEEK_VAR##Map, p, 1);
  _##CUSTOM_SEEK_VAR##CurPos = p;
  r.offset(-_##CUSTOM_SEEK_VAR##Ghost.getLeft(), -_##CUSTOM_SEEK_VAR##Ghost.getTop());
  _##CUSTOM_SEEK_VAR##Ghost.setRegion(r);
  #ifdef CUSTOM_SEEK_CALLBACK
  _##CUSTOM_SEEK_VAR##OnUpdate(r, newpos);
  #endif
  delete r;
}

_##CUSTOM_SEEK_VAR##Timer.onTimer() {
  if (_##CUSTOM_SEEK_VAR##Clicked) return;
  int l = getPlayItemLength();
  if (l > 0) {
    int p = getPosition() / l * 255;
    if (p != _##CUSTOM_SEEK_VAR##CurPos) {
      _##CUSTOM_SEEK_VAR##Update(getPosition());
    }
  } else {
    if (_##CUSTOM_SEEK_VAR##CurPos != 0)
      _##CUSTOM_SEEK_VAR##Update(0);
      _##CUSTOM_SEEK_VAR##CurPos = 0;
  }
}



