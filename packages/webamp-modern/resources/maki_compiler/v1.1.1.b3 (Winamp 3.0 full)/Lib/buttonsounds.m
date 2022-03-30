#include <lib/std.mi>
#include <lib/core.mi>


//
//  This script binds sounds to the actions of buttons.
//
//  It also tests the scriptcore wac :)
//
//  Param syntax: param="name of core;buttonid;activesound;hoversound"
//
//


// Activate this #define for 488 compatibility:
//#define COMPAT488


Global Core buttonCore;
Global Int initialized;
Global Button buttonHook;
Global String corename, buttonid, activesound, hoversound;

System.onScriptLoaded() {
  initialized = 0;

  Group g = getScriptGroup();
  if (!g) {
    debugString("BUTTONSOUNDS.M ==== Cannot find parent group for script.\n",0);
    return;
  }

  String parm = getParam();

  corename = getToken(parm, ";", 0);
  buttonid = getToken(parm, ";", 1);
  activesound = getToken(parm, ";", 2);
  hoversound = getToken(parm, ";", 3);

#ifdef COMPAT488
  // ScriptCore in 488 only handles creating a new core, not finding one already made.
  buttonCore = new Core;
#else
  // Try to find the requested core.
  buttonCore = CoreAdmin.getNamedCore(corename);
  if (!buttonCore) {
    // If we cannot find it,
    debugString("BUTTONSOUNDS.M ==== Cannot find a core named '"+corename+",' attempting to create...\n",0);
    // Try to create a new core with that name.
    buttonCore = CoreAdmin.newNamedCore(corename);
    if (!buttonCore) {
      debugString("BUTTONSOUNDS.M ==== Cannot create new core named '"+corename+"'.\n",0);
      return;
    } else {
      debugString("BUTTONSOUNDS.M ==== New core named '"+corename+"' created\n",0);
    }
  }
#endif

  buttonHook = g.findObject(buttonid);
  if (!buttonHook) {
    debugString("BUTTONSOUNDS.M ==== Cannot find button object named '"+buttonid+"'.\n",0);
    return;
  }

  hoversound = "skins/"+getSkinName()+"/"+hoversound;
  activesound = "skins/"+getSkinName()+"/"+activesound;

  initialized = 1;
}

buttonHook.onEnterArea() {
  if (!initialized) return;
  if (hoversound == "") return;

  buttonCore.playFile(hoversound);
}

buttonHook.onLeftButtonDown(Int x, Int y) {
  if (!initialized) return;
  if (activesound == "") return;

  buttonCore.playFile(activesound);
}
