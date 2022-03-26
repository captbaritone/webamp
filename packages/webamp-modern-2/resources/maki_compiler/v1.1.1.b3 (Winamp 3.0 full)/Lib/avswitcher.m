#include <lib/std.mi>
#include <lib/core.mi>


//
//  This script switches between layouts when the core calls back audio/video changes.
//
//  It also tests the scriptcore wac :)
//
//  Param syntax: param="container;list,of,layouts,for,audio;list,of,layouts,for,video"
//
//


Global Core switcherCore;
Global Int initialized;
Global Container theContainer;
Global String containerid;
Global String currentLayoutId;
Global String audio0, audio1, audio2, audio3, audio4, audio5, audio6, audio7, audio8, audio9;
Global String video0, video1, video2, video3, video4, video5, video6, video7, video8, video9;

Global Timer findContainerTimer;

Function changeToVideo();
Function changeToAudio();

System.onScriptLoaded() {
  initialized = 0;

  // Crack out the top level parameters, semicolon delimited
  String parm = getParam();
  containerid = getToken(parm, ";", 0);
  String audioids = getToken(parm, ";", 1);
  String videoids = getToken(parm, ";", 2);

  // Use a timer delay to get the container.  Weird.
  findContainerTimer = new Timer;
  findContainerTimer.setDelay(250);
  findContainerTimer.start();

  // Try to find the main core
  switcherCore = CoreAdmin.getNamedCore("main");
  if (!switcherCore) {
    // If we cannot find it,
    debugString("AVSWITCHER.M ==== Cannot find the main core\n",0);
    return;
  }

  Int i;
  for (i = 0; i < 10; i++) {
    // Crack out the audio and video layouts, comma delimited.
    String audiolayout = getToken(audioids, ",", i);
    if (i == 0) {
      audio0 = audiolayout;
    } else if (i == 1) {
      audio1 = audiolayout;
    } else if (i == 2) {
      audio2 = audiolayout;
    } else if (i == 3) {
      audio3 = audiolayout;
    } else if (i == 4) {
      audio4 = audiolayout;
    } else if (i == 5) {
      audio5 = audiolayout;
    } else if (i == 6) {
      audio6 = audiolayout;
    } else if (i == 7) {
      audio7 = audiolayout;
    } else if (i == 8) {
      audio8 = audiolayout;
    } else if (i == 9) {
      audio9 = audiolayout;
    }

    String videolayout = getToken(videoids, ",", i);
    if (i == 0) {
      video0 = videolayout;
    } else if (i == 1) {
      video1 = videolayout;
    } else if (i == 2) {
      video2 = videolayout;
    } else if (i == 3) {
      video3 = videolayout;
    } else if (i == 4) {
      video4 = videolayout;
    } else if (i == 5) {
      video5 = videolayout;
    } else if (i == 6) {
      video6 = videolayout;
    } else if (i == 7) {
      video7 = videolayout;
    } else if (i == 8) {
      video8 = videolayout;
    } else if (i == 9) {
      video9 = videolayout;
    }
  }

  initialized = 1;
}

theContainer.onSwitchToLayout(Layout newlayout) {
  currentLayoutId = newlayout.getId();
}

switcherCore.onMediaFamilyChange(String newfamily) {
  if (!initialized) return;

  if (newfamily == "Video") {
    changeToVideo();
  } else if (newfamily == "Audio") {
    changeToAudio();
  }
}

changeToAudio() {
  if (currentLayoutId == "") {
    theContainer.switchToLayout(audio0);
  } else {
    Int i;
    for (i = 0; i < 10; i++) {
      if (i == 0) {
        if (video0 == currentLayoutId) {
          theContainer.switchToLayout(audio0);
        }
      } else if (i == 1) {
        if (video1 == currentLayoutId) {
          theContainer.switchToLayout(audio1);
        }
      } else if (i == 2) {
        if (video2 == currentLayoutId) {
          theContainer.switchToLayout(audio2);
        }
      } else if (i == 3) {
        if (video3 == currentLayoutId) {
          theContainer.switchToLayout(audio3);
        }
      } else if (i == 4) {
        if (video4 == currentLayoutId) {
          theContainer.switchToLayout(audio4);
        }
      } else if (i == 5) {
        if (video5 == currentLayoutId) {
          theContainer.switchToLayout(audio5);
        }
      } else if (i == 6) {
        if (video6 == currentLayoutId) {
          theContainer.switchToLayout(audio6);
        }
      } else if (i == 7) {
        if (video7 == currentLayoutId) {
          theContainer.switchToLayout(audio7);
        }
      } else if (i == 8) {
        if (video8 == currentLayoutId) {
          theContainer.switchToLayout(audio8);
        }
      } else if (i == 9) {
        if (video9 == currentLayoutId) {
          theContainer.switchToLayout(audio9);
        }
      }
    }
  }
}

changeToVideo() {
  if (currentLayoutId == "") {
    theContainer.switchToLayout(video0);
  } else {
    Int i;
    for (i = 0; i < 10; i++) {
      if (i == 0) {
        if (audio0 == currentLayoutId) {
          theContainer.switchToLayout(video0);
        }
      } else if (i == 1) {
        if (audio1 == currentLayoutId) {
          theContainer.switchToLayout(video1);
        }
      } else if (i == 2) {
        if (audio2 == currentLayoutId) {
          theContainer.switchToLayout(video2);
        }
      } else if (i == 3) {
        if (audio3 == currentLayoutId) {
          theContainer.switchToLayout(video3);
        }
      } else if (i == 4) {
        if (audio4 == currentLayoutId) {
          theContainer.switchToLayout(video4);
        }
      } else if (i == 5) {
        if (audio5 == currentLayoutId) {
          theContainer.switchToLayout(video5);
        }
      } else if (i == 6) {
        if (audio6 == currentLayoutId) {
          theContainer.switchToLayout(video6);
        }
      } else if (i == 7) {
        if (audio7 == currentLayoutId) {
          theContainer.switchToLayout(video7);
        }
      } else if (i == 8) {
        if (audio8 == currentLayoutId) {
          theContainer.switchToLayout(video8);
        }
      } else if (i == 9) {
        if (audio9 == currentLayoutId) {
          theContainer.switchToLayout(video9);
        }
      }
    }
  }
}

findContainerTimer.onTimer() {
  if (theContainer == NULL) {
    theContainer = getContainer(containerid);
    if (theContainer == NULL) {
      debugString("AVSWITCHER.M ==== Cannot get a container named '"+containerid+"'\n",0);
      return;
    } else {
      debugString("AVSWITCHER.M ==== Found container named '"+containerid+"'\n",0);
      findContainerTimer.stop();
    }
  } else {
    findContainerTimer.stop();
  }
}