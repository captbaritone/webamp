//--------------------------------------------------------------------------------------------------
// AutoRepeatButton.m   Orginal Code By Will Fisher, Concept By Eric Moore, Rewritten By Will Fisher
//
// Use like this:
// #include </lib/AutoRepeatButton.m>
// Global AutoRepeatButton MyButton, MyOtherButton; 
// 
// Fill in the buttons function into MyButton.OnLeftClick() as normal.
//
// Use AutoRepeat_ClickType to find the type of call to MyButton.onLeftClick() where
//   AutoRepeat_ClickType==1 is the first call to onLeftClick
//   AutoRepeat_ClickType==2 is a subsequent call to onLeftClick
//   AutoRepeat_ClickType==0 is an erronious call to onLeftClick, you should usually ignore
//                           MyButton.onLeftClick() in this case
// See other functions below:
//--------------------------------------------------------------------------------------------------

Function AutoRepeat_Load(); // ALWAYS call this in System.OnScriptLoaded()
Function AutoRepeat_Unload(); // ALWAYS call this in System.OnScriptUnloading()
Function AutoRepeat_Stop();  // stop the current button from autorepeating

Function Button AutoRepeat_GetCurrentButton(); /* returns the currently autorepeating button,
                                                  returns NULL if no button is autorepeating */

Function AutoRepeat_SetInitalDelay(int millis);  /* set this for the first delay when the button is 
                                                    pressed, defaults to 800ms (no need to use this
                                                    unless other delay is required) */ 
												 
Function AutoRepeat_SetRepeatDelay(int millis);  /* set this for the subsequent delay, defaults to
                                                    80ms (no need to use this unless other delay is
						    required) */

Function Int AutoRepeat_GetInitalDelay();  // get the first delay length in millisecs 
Function Int AutoRepeat_GetRepeatDelay();  // get the subsequent delay in millisecs

Class Button AutoRepeatButton;

Global Timer _autorepeatTimer;
Global Int _InitialDelay;
Global Int _RepeatDelay;
Global Int AutoRepeat_ClickType;
Global Button _Latched;

AutoRepeatButton.onLeftButtonDown(int x, int y) {
  _Latched = AutoRepeatButton;
  AutoRepeat_ClickType = 1; // first click
  AutoRepeatButton.leftClick();
  AutoRepeat_ClickType = 0; // no click
  _autorepeatTimer.setDelay(_InitialDelay);
  _autorepeatTimer.start();
}

AutoRepeatButton.onLeftButtonUp(int x, int y) {
  _AutoRepeatTimer.Stop();
  _Latched = NULL;
}

_AutoRepeatTimer.onTimer() {
  if(_autorepeatTimer.getDelay() != _RepeatDelay) _autorepeatTimer.setDelay(_RepeatDelay);
  AutoRepeat_ClickType = 2; // AutoRepeat
  _Latched.LeftClick();
  AutoRepeat_ClickType = 0; // no click
}

AutoRepeat_Load() {
  _autoRepeatTimer = new Timer;
  _InitialDelay = 800;
  _RepeatDelay = 80;
  AutoRepeat_ClickType = 0;
}

AutoRepeat_Unload() {
  delete _autoRepeatTimer;
}

AutoRepeat_SetInitalDelay(int millis) {
  _InitialDelay = millis;
}


AutoRepeat_SetRepeatDelay(int millis) {
  _RepeatDelay = millis;
}

AutoRepeat_GetInitalDelay() {
  return _InitialDelay;
}

AutoRepeat_GetRepeatDelay() {
  return _repeatDelay;
}

AutoRepeat_Stop() {
  _autorepeatTimer.stop();
  _Latched = NULL;
}

AutoRepeat_GetCurrentButton() {
  return _Latched;
}
