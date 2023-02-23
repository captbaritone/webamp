/* Note: a decompiler is no invitation to steal code.
   Please respect the the copyright */

#include "std.mi"
Class GuiObject HintObject;
Class ToggleButton HintToggleButton;
Class Button Button4Class;
Global Text Text5;
Global Text Text6;
Global Text Text7;
Global Text Text8;
Global Slider Slider9;
Global Slider Slider10;
Global Slider Slider11;
Global Slider Slider12;
Global Slider Slider13;
Global Slider Slider14;
Global Int Int15;
Global Int Int16;
Global Int Int17;
Global Container Container19;
Global Layout Layout20;
Global Layout Layout21;
Global Layout Layout22;
Global Group Group23;
Global PopupMenu PopupMenu24;
Global Timer Timer25;
Global Timer Timer26;
Global Timer Timer27;
Global Timer Timer28;
Global HintObject Play;
Global HintObject GuiObject2Class30;
Global HintObject GuiObject2Class31;
Global HintObject GuiObject2Class32;
Global HintObject GuiObject2Class33;
Global HintObject GuiObject2Class34;
Global HintToggleButton ToggleButton3Class35;
Global HintToggleButton ToggleButton3Class36;
Global HintToggleButton ToggleButton3Class37;
Global HintToggleButton ToggleButton3Class38;
Global HintToggleButton ToggleButton3Class39;
Global Button4Class Button4Class40;
Global Button4Class Button4Class41;
Global Button4Class Button4Class42;
Global Button4Class Button4Class43;
Global Button4Class Button4Class44;
Global Button4Class Button4Class45;
Global Button4Class Button4Class46;
Global Button4Class Button4Class47;
Global Button4Class Button4Class48;
Global Button4Class Button4Class49;
Global Int Int50;
Global Int Int51;
Global Int Int52;
Global Int Int53;
Global Int Int54;
Global Int Int55;
Global Int Int56;
Global Int Int57;
Global Int Int58;
Global Int Int59;
Global Int Int60;
Global Int Int61;
Global Int Int62;
Global Int Int63;
Global String String64;
Global Group Group65;
Global Group Group66;
Global Group Group67;
Global Group Group68;
Global Group Group69;
Global Group Group70;
Global Group Group71;
Global Group Group72;
Global Group Group73;
Global Group Group74;
Global Group Group75;
Global Group Group76;
Global Group Group77;
Global Group Group78;
Global Layer Layer79;
Global Layer Layer80;
Global Layer Layer81;
Global Layer Layer82;
Global Layer Layer83;
Global Layer Layer84;
Global Layer Layer85;
Global Layer Layer86;
Global Layer Layer87;
Global Layer Layer88;
Global Layer Layer89;
Global Int Int90;
Global Int Int91;
Global Int Int92;
Global Int Int93;
Global AnimatedLayer AnimatedLayer94;
Global Timer Timer95;
Global Int Int96;
Global Int Int97;
Global Int Int98;
Global Int Int99;
Global Int Int100;
Global Int Int101;
Global Int Int102;
Global Int Int103;
Global Timer Timer104;
Global Int Int105;
Global Vis Vis106;
Global String String107;
Global Group Group108;
Global Group Group109;
Global Group Group110;
Global Button4Class Button4Class111;
Global Button4Class Button4Class112;
Global Button4Class Button4Class113;
Global Button4Class Button4Class114;
Global Button4Class Button4Class115;
Global Button4Class Button4Class116;
Global Button4Class Button4Class117;
Global Button4Class Button4Class118;
Global Button4Class Button4Class119;
Global Button4Class Button4Class120;
Global Button4Class Button4Class121;
Global Button4Class Button4Class122;
Global Button4Class Button4Class123;
Global Button4Class Button4Class124;
Global Button4Class Button4Class125;
Global Button4Class Button4Class126;
Global Button4Class Button4Class127;
Global Button4Class Button4Class128;
Global Button4Class Button4Class129;
Global Button4Class Button4Class130;
Global Button4Class Button4Class131;
Global Button4Class Button4Class132;
Global Button4Class Button4Class133;
Global Group Group134;
Global Group Group135;
Global Group Group136;
Global Layer Layer137;
Global Layer Layer138;
Global Layer Layer139;
Global Layer Layer140;
Global Layer Layer141;
Global Layer Layer142;
Global Layer Layer143;
Global Layer Layer144;
Global Layer Layer145;
Global Layer Layer146;
Global Layer Layer147;
Global Layer Layer148;
Global Layer Layer149;
Global Layer Layer150;
Global Layer Layer151;
Global Slider Slider152;
Global Text Text153;
Global Int Int154;
Global Int Int155;
Global Int Int156;
Global Button Button157;
Global Button Button158;
Global HintToggleButton ToggleButton3Class159;
Global HintToggleButton ToggleButton3Class160;
Global HintToggleButton ToggleButton3Class161;
Global AnimatedLayer AnimatedLayer162;
Global AnimatedLayer AnimatedLayer163;
Global AnimatedLayer AnimatedLayer164;
Global Button Button165;
Global Button Button166;
Global Layer Layer167;
Global Group Group168;

Function func7247 (String "0");
Function setSuperText (String "0");
Function func7836 ();
Function func8144 ();
Function func8452 (String "0");
Function func12702 ();
Function func12739 ();
Function func12776 ();
Function func12910 ();
Function func13096 ();
Function func13282 ();
Function func13550 ();
Function func13714 (String "0");
Function func14079 ();
Function func16518 (Int 0);
Function func17005 ();
Function func17045 ();
Function func17473 (String "0");
Function func17989 ();
Function func18187 ();
Function func18433 ();
Function func18657 ();
Function func19056 (Int 0);
Function func19830 ();
Function func19942 (Int 0);
Function func20709 ();
Function func21211 (Int 0);
Function func23292 (Int 0);

System.onScriptUnloading ()
{
  delete Timer25;
  delete Timer28;
  delete Timer26;
  delete Timer27;
  delete Timer95;
  delete Timer104;
  return Null;
}

System.onScriptLoaded ()
{
  Int Int307;
  Int Int323;
  Int Int241;
  Int Int264;
  Int Int326;
  Int Int322;
  Int Int263;
  Timer25 = (new Timer);
  Timer25.setDelay (1000);
  Timer26 = (new Timer);
  Timer26.setDelay (10);
  Timer27 = (new Timer);
  Timer27.setDelay (10);
  Timer28 = (new Timer);
  Timer28.setDelay (20);
  Container19 = System.getContainer (("main"));
  Layout21 = System.getContainer (("main")).getLayout (("normal"));
  Group23 = Layout21.getObject (("main\.mmd3"));
  Layout20 = System.getContainer (("main")).getLayout (("shade"));
  Layout22 = System.getContainer (("main")).getLayout (("shade2"));
  Group73 = Layout22.getObject (("shade2main"));
  Group168 = Layout20.getObject (("shade1\.plsmall"));
  Button166 = Group168.getObject (("plsmallbut2"));
  Button165 = Layout20.getObject (("plsmallbut"));
  Layer167 = Group168.getObject (("pls\.switcher"));
  Group168.hide ();
  Button158 = Group23.getObject (("maincfg"));
  Layer89 = Group23.getObject (("glow"));
  Layer89.setAlpha (0);
  Int16 = 0;
  AnimatedLayer94 = Group23.getObject (("visani"));
  Group134 = Layout21.getObject (("main\.eq"));
  Group135 = Layout21.getObject (("main\.visd"));
  Group136 = Layout21.getObject (("main\.cthemes"));
  Group108 = Layout21.getObject (("onofflayer"));
  Group109 = Layout21.getObject (("main\.ctlayer"));
  Vis106 = Group23.getObject (("visual"));
  Button4Class133 = Group134.getObject (("eqauto"));
  Group136.hide ();
  Int154 = 149;
  Int155 = 350;
  Layer148 = Group23.getObject (("vis3bg"));
  Layer149 = Group23.getObject (("vis3overlay"));
  Layer150 = Group23.getObject (("vis2overlay"));
  Layer151 = Group23.getObject (("vis2bg"));
  Button4Class111 = Group108.getObject (("eqtoggle"));
  Button4Class112 = Group134.getObject (("eqtoggle2"));
  Button4Class115 = Group135.getObject (("eqtoggle2b"));
  Button4Class121 = Group109.getObject (("eqtoggle3"));
  Button4Class113 = Group108.getObject (("visdtoggle"));
  Button4Class114 = Group135.getObject (("visdtoggle2"));
  Button4Class116 = Group134.getObject (("visdtoggle2b"));
  Button4Class122 = Group109.getObject (("visdtoggle3"));
  Button4Class117 = Group108.getObject (("cttoggle"));
  Button4Class118 = Group135.getObject (("cttoggle2b"));
  Button4Class119 = Group134.getObject (("cttoggle2"));
  Button4Class120 = Group136.getObject (("cttoggle3"));
  Group110 = Layout21.getObject (("main\.ctlist"));
  Group110.hide ();
  Button4Class132 = Group23.getObject (("vis2hint"));
  Timer104 = (new Timer);
  Timer104.setDelay (20);
  Button4Class123 = Group135.getObject (("visbbg1"));
  Button4Class124 = Group135.getObject (("visbbg2"));
  Button4Class125 = Group135.getObject (("visbbg3"));
  Button4Class126 = Group135.getObject (("visbbg4"));
  Button4Class127 = Group135.getObject (("visbbg5"));
  Button4Class128 = Group135.getObject (("visbbg6"));
  Button4Class129 = Group135.getObject (("visbfg1"));
  Button4Class130 = Group135.getObject (("visbfg2"));
  Button4Class131 = Group135.getObject (("visbfg3"));
  Layer139 = Group135.getObject (("vled1"));
  Layer140 = Group135.getObject (("vled2"));
  Layer141 = Group135.getObject (("vled3"));
  Layer142 = Group135.getObject (("vled4"));
  Layer143 = Group135.getObject (("vled5"));
  Layer144 = Group135.getObject (("vled6"));
  Layer145 = Group135.getObject (("vled7"));
  Layer146 = Group135.getObject (("vled8"));
  Layer147 = Group135.getObject (("vled9"));
  Slider152 = Group134.getObject (("sCrossfade"));
  Text153 = Group134.getObject (("cftext"));
  Slider152.onSetPosition (Slider152.getPosition ());
  Layer137 = Group134.getObject (("eqautoLed"));
  Layer138 = Group134.getObject (("eqonoffLed"));
  Int99 = 0;
  Int100 = 0;
  Int101 = 0;
  Int102 = 1;
  String107 = ("");
  Timer95 = (new Timer);
  Timer95.setDelay (20);
  Int96 = 0;
  Int97 = 0;
  Int98 = 0;
  Int156 = 2;
  Layer138.hide ();
  Layer137.hide ();
  Int103 = System.getPrivateInt (("MMD3"), ("AVISMODE"), 1);
  func19056 (Int103);
  Int241 = System.getPrivateInt (("MMD3"), ("LASTMODE"), 0);
  if ((Int241 < 0))
    {
      Timer95.stop ();
    }
  if (System.getEq ())
    {
      Layer138.show ();
    }
  if ((Button4Class133.getActivated () == 1))
    {
      Layer137.show ();
    }
  AnimatedLayer162 = Group23.getObject (("VolumeAnimLED"));
  AnimatedLayer163 = Group23.getObject (("BassAnimLED"));
  AnimatedLayer164 = Group23.getObject (("TrebleAnimLED"));
  Layer87 = Group23.getObject (("mslabel11"));
  Button4Class49 = Group23.getObject (("bmsmall"));
  Layer88 = Group23.getObject (("nm\.switcher"));
  Button4Class45 = Layout20.getObject (("eqpl_ct"));
  Group77 = Layout20.getObject (("shade1\.cthemes"));
  Button4Class43 = Group73.getObject (("shade2ct"));
  Group75 = Layout22.getObject (("shade2\.cthemes"));
  Button4Class46 = Group73.getObject (("s2thinger"));
  Button4Class47 = Group73.getObject (("s2eq"));
  Button4Class48 = Group73.getObject (("s2cfg"));
  Group74 = Layout22.getObject (("shade2\.ctcloser"));
  Button4Class44 = Group74.getObject (("sh2closect"));
  Group74.hide ();
  Group78 = Layout20.getObject (("shade1\.ctlist"));
  Group78.hide ();
  Int52 = 0;
  Int54 = 1;
  Group76 = Layout22.getObject (("shade2\.ctlist"));
  Group76.hide ();
  Int51 = 0;
  Int53 = 1;
  Int60 = 0;
  Int61 = 0;
  Int62 = 0;
  Int63 = 1;
  Int90 = 105;
  Int91 = 105;
  Int92 = 105;
  Group70 = Layout22.getObject (("shade2\.eq"));
  Group72 = Layout22.getObject (("shade2\.thinger"));
  Group71 = Layout22.getObject (("shade2\.cfg"));
  Int264 = 173;
  Int263 = System.getPrivateInt (("MMD3"), ("sh2t1"), 1);
  if (Int263)
    {
      Group72.setXmlParam (("y"), System.integerToString (Int264));
      Int264 = (Int264 + 67);
      Int62 = 1;
      Button4Class46.setActivated (Int62);
    }
  Int263 = System.getPrivateInt (("MMD3"), ("sh2t2"), 1);
  if (Int263)
    {
      Group70.setXmlParam (("y"), System.integerToString (Int264));
      Int264 = (Int264 + 67);
      Int60 = 1;
      Button4Class47.setActivated (Int60);
    }
  Int263 = System.getPrivateInt (("MMD3"), ("sh2t3"), 1);
  if (Int263)
    {
      Group71.setXmlParam (("y"), System.integerToString (Int264));
      Int264 = (Int264 + 67);
      Int61 = 1;
      Button4Class48.setActivated (Int61);
    }
  Text5 = Group23.getObject (("songticker"));
  Text6 = Group23.getObject (("songticker2"));
  Layer82 = Group23.getObject (("titleoverlay2"));
  Layer83 = Group23.getObject (("titleoverlay3"));
  Layer82.hide ();
  Layer83.hide ();
  Text6.hide ();
  Slider9 = Group23.getObject (("Seeker"));
  Slider10 = Group23.getObject (("SeekerGhost"));
  Slider11 = Layout20.getObject (("sSeeker1"));
  Slider12 = Layout20.getObject (("sSeekerGhost1"));
  Slider13 = Layout20.getObject (("sSeeker2"));
  Slider14 = Layout20.getObject (("sSeekerGhost2"));
  Play = Group23.getObject (("Play"));
  GuiObject2Class33 = Group23.getObject (("Pause"));
  GuiObject2Class30 = Group23.getObject (("Stop"));
  GuiObject2Class32 = Group23.getObject (("Next"));
  GuiObject2Class31 = Group23.getObject (("Previous"));
  GuiObject2Class34 = Group23.getObject (("Eject"));
  ToggleButton3Class35 = Group23.getObject (("Crossfade"));
  ToggleButton3Class36 = Group23.getObject (("Shuffle"));
  ToggleButton3Class37 = Group23.getObject (("Repeat"));
  Group65 = Layout20.getObject (("shade\.eq"));
  Group66 = Layout20.getObject (("shade\.thinger"));
  Group67 = Layout20.getObject (("shade\.config"));
  Group68 = Layout20.getObject (("shade\.eqspline"));
  Group69 = Layout20.getObject (("shade\.thingertxt"));
  Group68.hide ();
  Group69.hide ();
  Button4Class40 = Layout20.getObject (("eqpl_eq"));
  Button4Class41 = Layout20.getObject (("eqpl_t"));
  Button4Class42 = Layout20.getObject (("eqpl_cfg"));
  Int55 = 0;
  Int56 = 0;
  Int57 = 0;
  Int59 = 0;
  Int58 = 1;
  String64 = ("");
  Layer79 = Group23.getObject (("CrossfadeLed"));
  Layer81 = Group23.getObject (("ShuffleLed"));
  Layer80 = Group23.getObject (("RepeatLed"));
  Layer84 = Group23.getObject (("CrossfadeDis"));
  Layer86 = Group23.getObject (("ShuffleDis"));
  Layer85 = Group23.getObject (("RepeatDis"));
  Text7 = Layout20.getObject (("SongtickerShade"));
  Text8 = Group73.getObject (("SongtickerShade2"));
  Int307 = System.getPrivateInt (("MMD3"), ("scrollticker"), 1);
  ToggleButton3Class38 = Group67.getObject (("scrolltickershade"));
  ToggleButton3Class39 = Group71.getObject (("scrolltickershade2"));
  ToggleButton3Class38.setActivated (Int307);
  ToggleButton3Class39.setActivated (Int307);
  if ((Int307 == 1))
    {
      Text7.setXmlParam (("ticker"), ("1"));
      Text8.setXmlParam (("ticker"), ("1"));
    }
  else
    {
      Text7.setXmlParam (("ticker"), ("0"));
      Text8.setXmlParam (("ticker"), ("0"));
    }
  func20709 ();
  func21211 (System.getPrivateInt (("MMD3"), ("scrollticker"), 1));
  func21211 (System.getPrivateInt (("MMD3"), ("scrolltickersize"), 3));
  func21211 ((System.getPrivateInt (("MMD3"), ("LeftRightMode"), 0) + 20));
  func21211 ((System.getPrivateInt (("MMD3"), ("knobLED"), 1) + 50));
  ToggleButton3Class159 = Group23.getObject (("aotdummy"));
  ToggleButton3Class160 = Group67.getObject (("playershade\.button\.aot"));
  ToggleButton3Class161 = Group71.getObject (("s2aot"));
  Int322 = System.getPrivateInt (("MMD3"), ("aotmode"), 1);
  ToggleButton3Class160.setActivated (Int322);
  ToggleButton3Class161.setActivated (Int322);
  Int323 = ToggleButton3Class159.getActivated ();
  if ((((Int241 < 0) && (Int322 == 1)) && (Int323 == 0)))
    {
      ToggleButton3Class159.leftClick ();
    }
  func16518 (System.getPrivateInt (("MMD3"), ("lastshademode"), 1));
  Button157 = Group23.getObject (("SongInfoEditor"));
  Int326 = ToggleButton3Class35.getActivated ();
  ToggleButton3Class35.setActivated (Int326);
  Layer79.setAlpha ((255 * Int326));
  Layer84.setAlpha ((255 * Int326));
  Int326 = ToggleButton3Class36.getActivated ();
  ToggleButton3Class36.setActivated (Int326);
  Layer81.setAlpha ((255 * Int326));
  Layer86.setAlpha ((255 * Int326));
  Int326 = ToggleButton3Class37.getActivated ();
  ToggleButton3Class37.setActivated (Int326);
  Layer80.setAlpha ((255 * Int326));
  Layer85.setAlpha ((255 * Int326));
  if ((Slider10 != Null))
    {
      Slider10.setAlpha (1);
    }
  if ((Slider12 != Null))
    {
      Slider12.setAlpha (1);
      Slider14.setAlpha (1);
    }
  return Null;
}

Slider9.onSetPosition (int newpos)
{
  Float Float329;
  Float Float331;
  Int Int332;
  if (((!Slider10) && Int15))
    {
      Float329 = newpos;
      Float329 = ((Float329 / 255) * 100);
      Float331 = System.getPlayItemLength ();
      if ((Float331 != 0))
	{
	  Int332 = ((Float331 * Float329) / 100);
	  func7247 (((((((("SEEK\:\ ") + System.integerToTime (Int332)) +
			 ("\/")) + System.integerToTime (Float331)) +
		       ("\ \(")) + System.integerToString (Float329)) +
		     ("\%\)\ ")));
	}
    }
  return Null;
}

Slider9.onLeftButtonDown (int x, int y)
{
  Int15 = 1;
  return Null;
}

Slider9.onLeftButtonUp (int x, int y)
{
  Int15 = 0;
  func7247 ((""));
  return Null;
}

Slider10.onSetPosition (int newpos)
{
  Float Float342;
  Int Int344;
  Float Float343;
  if ((Slider10.getAlpha () == 1))
    {
      return Null;
    }
  Float342 = newpos;
  Float342 = ((Float342 / 255) * 100);
  Float343 = System.getPlayItemLength ();
  if ((Float343 != 0))
    {
      Int344 = ((Float343 * Float342) / 100);
      func7247 (((((((("SEEK\:\ ") + System.integerToTime (Int344)) +
		     ("\/")) + System.integerToTime (Float343)) + ("\ \(")) +
		  System.integerToString (Float342)) + ("\%\)")));
    }
  return Null;
}

Slider10.onLeftButtonDown (int x, int y)
{
  Slider10.setAlpha (128);
  return Null;
}

Slider10.onLeftButtonUp (int x, int y)
{
  Slider10.setAlpha (1);
  return Null;
}

Slider9.onSetFinalPosition (int pos)
{
  Text5.setAlternateText ((""));
  return Null;
}

Slider10.onSetFinalPosition (int pos)
{
  Text5.setAlternateText ((""));
  Slider10.setAlpha (1);
  return Null;
}

Slider11.onSetPosition (int newpos)
{
  Float Float354;
  Float Float355;
  Int Int356;
  if (((!Slider12) && Int15))
    {
      Float354 = newpos;
      Float354 = ((Float354 / 255) * 100);
      Float355 = System.getPlayItemLength ();
      if ((Float355 != 0))
	{
	  Int356 = ((Float355 * Float354) / 100);
	  func7247 (((((((("SEEK\:\ ") + System.integerToTime (Int356)) +
			 ("\/")) + System.integerToTime (Float355)) +
		       ("\ \(")) + System.integerToString (Float354)) +
		     ("\%\)\ ")));
	}
    }
  return Null;
}

Slider11.onLeftButtonDown (int x, int y)
{
  Int15 = 1;
  return Null;
}

Slider11.onLeftButtonUp (int x, int y)
{
  Int15 = 0;
  func7247 ((""));
  return Null;
}

Slider12.onSetPosition (int newpos)
{
  Float Float363;
  Float Float362;
  Int Int364;
  if ((Slider12.getAlpha () == 1))
    {
      return Null;
    }
  Float362 = newpos;
  Float362 = ((Float362 / 255) * 100);
  Float363 = System.getPlayItemLength ();
  if ((Float363 != 0))
    {
      Int364 = ((Float363 * Float362) / 100);
      func7247 (((((((("SEEK\:\ ") + System.integerToTime (Int364)) +
		     ("\/")) + System.integerToTime (Float363)) + ("\ \(")) +
		  System.integerToString (Float362)) + ("\%\)")));
    }
  return Null;
}

Slider12.onLeftButtonDown (int x, int y)
{
  Slider12.setAlpha (128);
  return Null;
}

Slider12.onLeftButtonUp (int x, int y)
{
  Slider12.setAlpha (1);
  return Null;
}

Slider11.onSetFinalPosition (int pos)
{
  Text5.setAlternateText ((""));
  return Null;
}

Slider12.onSetFinalPosition (int pos)
{
  Text5.setAlternateText ((""));
  Slider12.setAlpha (1);
  return Null;
}

Slider13.onSetPosition (int newpos)
{
  Float Float372;
  Int Int374;
  Float Float373;
  if (((!Slider14) && Int15))
    {
      Float372 = newpos;
      Float372 = ((Float372 / 255) * 100);
      Float373 = System.getPlayItemLength ();
      if ((Float373 != 0))
	{
	  Int374 = ((Float373 * Float372) / 100);
	  func7247 (((((((("SEEK\:\ ") + System.integerToTime (Int374)) +
			 ("\/")) + System.integerToTime (Float373)) +
		       ("\ \(")) + System.integerToString (Float372)) +
		     ("\%\)\ ")));
	}
    }
  return Null;
}

Slider13.onLeftButtonDown (int x, int y)
{
  Int15 = 1;
  return Null;
}

Slider13.onLeftButtonUp (int x, int y)
{
  Int15 = 0;
  func7247 ((""));
  return Null;
}

Slider14.onSetPosition (int newpos)
{
  Float Float380;
  Float Float381;
  Int Int382;
  if ((Slider14.getAlpha () == 1))
    {
      return Null;
    }
  Float380 = newpos;
  Float380 = ((Float380 / 255) * 100);
  Float381 = System.getPlayItemLength ();
  if ((Float381 != 0))
    {
      Int382 = ((Float381 * Float380) / 100);
      func7247 (((((((("SEEK\:\ ") + System.integerToTime (Int382)) +
		     ("\/")) + System.integerToTime (Float381)) + ("\ \(")) +
		  System.integerToString (Float380)) + ("\%\)")));
    }
  return Null;
}

Slider14.onLeftButtonDown (int x, int y)
{
  Slider14.setAlpha (128);
  return Null;
}

Slider14.onLeftButtonUp (int x, int y)
{
  Slider14.setAlpha (1);
  return Null;
}

Slider13.onSetFinalPosition (int pos)
{
  Text5.setAlternateText ((""));
  return Null;
}

Slider14.onSetFinalPosition (int pos)
{
  Text5.setAlternateText ((""));
  Slider14.setAlpha (1);
  return Null;
}

HintObject.onLeftButtonDown (int x, int y)
{
  if ((HintObject == Play))
    {
      setSuperText (("Play"));
    }
  else
    {
      if ((HintObject == GuiObject2Class30))
	{
	  setSuperText (("Stop"));
	}
      else
	{
	  if ((HintObject == GuiObject2Class33))
	    {
	      setSuperText (("Pause"));
	    }
	  else
	    {
	      if ((HintObject == GuiObject2Class32))
		{
		  setSuperText (("Next"));
		}
	      else
		{
		  if ((HintObject == GuiObject2Class31))
		    {
		      setSuperText (("Previous"));
		    }
		  else
		    {
		      if ((HintObject == GuiObject2Class34))
			{
			  setSuperText (("Open"));
			}
		    }
		}
	    }
	}
    }
  return Null;
}

HintToggleButton.onLeftButtonDown(int x, int y) {
    if ((HintToggleButton == ToggleButton3Class35)) setSuperText (("Crossfade"));
    else if ((HintToggleButton == ToggleButton3Class37)) setSuperText (("Repeat"));
    else if ((HintToggleButton == ToggleButton3Class36)) setSuperText (("Shuffle"));
    return Null;
}

HintToggleButton.onToggle (Boolean onoff)
{
  String String398;
  String String396;
  String396 = ("none");
  if ((HintToggleButton == ToggleButton3Class35))
    {
      String396 = ("Crossfade");
    }
  else
    {
      if ((HintToggleButton == ToggleButton3Class37))
	{
	  String396 = ("Repeat");
	}
      else
	{
	  if ((HintToggleButton == ToggleButton3Class36))
	    {
	      String396 = ("Shuffle");
	    }
	}
    }
  if ((String396 != ("none")))
    {
      if (onoff)
	{
	  String398 = ("on");
	}
      else
	{
	  String398 = ("off");
	}
      setSuperText (((String396 + ("\ now\ ")) + String398));
    }
  return Null;
}

ToggleButton3Class37.onActivate (int activated)
{
  Layer80.setAlpha ((activated * 255));
  Layer85.setAlpha ((activated * 255));
  return Null;
}

ToggleButton3Class36.onActivate (int activated)
{
  Layer81.setAlpha ((activated * 255));
  Layer86.setAlpha ((activated * 255));
  return Null;
}

ToggleButton3Class35.onActivate (int activated)
{
  Layer79.setAlpha ((activated * 255));
  Layer84.setAlpha ((activated * 255));
  return Null;
}

func7247 (String "0")
{
  Timer25.stop ();
  Text5.setAlternateText (String405);
  Timer25.start ();
  return Null;
}

setSuperText (String "0")
{
  Timer27.stop ();
  Timer26.stop ();
  Layer82.setAlpha (255);
  Layer83.setAlpha (0);
  Layer82.show ();
  Layer83.show ();
  Text6.setText (String406);
  Text6.show ();
  Int50 = 5;
  Timer26.start ();
  return Null;
}

Timer26.onTimer ()
{
  Int50 = (Int50 + 20);
  Layer83.setAlpha (Int50);
  if ((Int50 > 250))
    {
    }
  else
    {
      Int50 = 255;
      Text6.setText ((""));
      Layer82.setAlpha (Int50);
      Layer83.setAlpha (0);
      Layer82.show ();
      Layer83.show ();
      Timer26.stop ();
      Timer27.stop ();
      Timer27.start ();
    }
  return Null;
}

Timer27.onTimer ()
{
  Int50 = (Int50 - 30);
  Layer82.setAlpha (Int50);
  if ((Int50 < 0))
    {
    }
  else
    {
      Int50 = 0;
      Layer82.setAlpha (Int50);
      Layer82.hide ();
      Layer83.hide ();
      Text6.hide ();
      Timer27.stop ();
    }
  return Null;
}

Timer25.onTimer ()
{
  Text5.setText ((""));
  Timer25.stop ();
  return Null;
}

Button4Class43.onLeftClick ()
{
  if (Int51)
    {
      Group74.hide ();
    }
  else
    {
      Group74.show ();
    }
  func8144 ();
  return Null;
}

Button4Class45.onLeftClick ()
{
  func7836 ();
  return Null;
}

func7836 ()
{
  if ((Int54 && (Int59 == 0)))
    {
      Int54 = 0;
      if (Int52)
	{
	  Group78.hide ();
	  Group77.setTargetX (333);
	  Group77.setTargetY ((-122));
	  Group77.setTargetSpeed (1);
	  Group77.gotoTarget ();
	  Int52 = 0;
	}
      else
	{
	  Group77.setTargetX (333);
	  Group77.setTargetY (21);
	  Group77.setTargetSpeed (1);
	  Group77.gotoTarget ();
	  Int52 = 1;
	}
    }
  return Null;
}

Group77.onTargetReached ()
{
  if (Int52)
    {
      Group77.setXmlParam (("y"), ("21"));
      Group78.show ();
    }
  Button4Class45.setActivated (Int52);
  Int54 = 1;
  return Null;
}

Button4Class44.onLeftClick ()
{
  Group74.hide ();
  func8144 ();
  return Null;
}

func8144 ()
{
  if (Int53)
    {
      Int53 = 0;
      if (Int51)
	{
	  Group76.hide ();
	  Group75.setTargetX (0);
	  Group75.setTargetY ((-29));
	  Group75.setTargetSpeed (1);
	  Group75.gotoTarget ();
	  Int51 = 0;
	}
      else
	{
	  Group75.setTargetX (0);
	  Group75.setTargetY (173);
	  Group75.setTargetSpeed (1);
	  Group75.gotoTarget ();
	  Int51 = 1;
	}
    }
  return Null;
}

Group75.onTargetReached ()
{
  if (Int51)
    {
      Group75.setXmlParam (("y"), ("173"));
      Group76.show ();
    }
  Int53 = 1;
  return Null;
}

Button4Class46.onLeftClick ()
{
  func8452 (("thinger"));
  return Null;
}

Button4Class47.onLeftClick ()
{
  func8452 (("eq"));
  return Null;
}

Button4Class48.onLeftClick ()
{
  func8452 (("cfg"));
  return Null;
}

func8452 (String "0")
{
  if (((((String419 == ("thinger")) && (Int60 == 0)) && (Int61 == 0))
       && Int63))
    {
      if ((Int62 == 0))
	{
	  Int63 = 0;
	  Group72.setTargetX (0);
	  Group72.setTargetY (173);
	  Group72.setTargetSpeed (1);
	  Group72.gotoTarget ();
	  Int90 = 173;
	  Int62 = 1;
	}
      else
	{
	  Int63 = 0;
	  Group72.setTargetX (0);
	  Group72.setTargetY (105);
	  Group72.setTargetSpeed (1);
	  Group72.gotoTarget ();
	  Int90 = 105;
	  Int62 = 0;
	}
    }
  if (((((String419 == ("thinger")) && (Int60 == 1)) && (Int61 == 0))
       && Int63))
    {
      if ((Int62 == 0))
	{
	  Int63 = 0;
	  Group72.setTargetX (0);
	  Group72.setTargetY (173);
	  Group72.setTargetSpeed (1);
	  Int90 = 173;
	  Group70.setTargetX (0);
	  Group70.setTargetY (240);
	  Group70.setTargetSpeed (1);
	  Int91 = 240;
	  Group72.gotoTarget ();
	  Group70.gotoTarget ();
	  Int62 = 1;
	}
      else
	{
	  Int63 = 0;
	  Group72.setTargetX (0);
	  Group72.setTargetY (105);
	  Group72.setTargetSpeed (1);
	  Int90 = 105;
	  Group70.setTargetX (0);
	  Group70.setTargetY (173);
	  Group70.setTargetSpeed (1);
	  Int91 = 173;
	  Group72.gotoTarget ();
	  Group70.gotoTarget ();
	  Int62 = 0;
	}
    }
  if (((((String419 == ("thinger")) && (Int60 == 0)) && (Int61 == 1))
       && Int63))
    {
      if ((Int62 == 0))
	{
	  Int63 = 0;
	  Group72.setTargetX (0);
	  Group72.setTargetY (173);
	  Group72.setTargetSpeed (1);
	  Int90 = 173;
	  Group71.setTargetX (0);
	  Group71.setTargetY (240);
	  Group71.setTargetSpeed (1);
	  Int92 = 240;
	  Group72.gotoTarget ();
	  Group71.gotoTarget ();
	  Int62 = 1;
	}
      else
	{
	  Int63 = 0;
	  Group72.setTargetX (0);
	  Group72.setTargetY (105);
	  Group72.setTargetSpeed (1);
	  Int90 = 105;
	  Group71.setTargetX (0);
	  Group71.setTargetY (173);
	  Group71.setTargetSpeed (1);
	  Int92 = 173;
	  Group72.gotoTarget ();
	  Group71.gotoTarget ();
	  Int62 = 0;
	}
    }
  if (((((String419 == ("thinger")) && (Int60 == 1)) && (Int61 == 1))
       && Int63))
    {
      if ((Int62 == 0))
	{
	  Int63 = 0;
	  Group72.setTargetX (0);
	  Group72.setTargetY (173);
	  Group72.setTargetSpeed (1);
	  Int90 = 173;
	  Group70.setTargetX (0);
	  Group70.setTargetY (240);
	  Group70.setTargetSpeed (1);
	  Int91 = 240;
	  Group71.setTargetX (0);
	  Group71.setTargetY (307);
	  Group71.setTargetSpeed (1);
	  Int92 = 307;
	  Group72.gotoTarget ();
	  Group70.gotoTarget ();
	  Group71.gotoTarget ();
	  Int62 = 1;
	}
      else
	{
	  Int63 = 0;
	  Group72.setTargetX (0);
	  Group72.setTargetY (105);
	  Group72.setTargetSpeed (1);
	  Int90 = 105;
	  Group70.setTargetX (0);
	  Group70.setTargetY (173);
	  Group70.setTargetSpeed (1);
	  Int91 = 173;
	  Group71.setTargetX (0);
	  Group71.setTargetY (240);
	  Group71.setTargetSpeed (1);
	  Int92 = 240;
	  Group72.gotoTarget ();
	  Group70.gotoTarget ();
	  Group71.gotoTarget ();
	  Int62 = 0;
	}
    }
  if (((((String419 == ("eq")) && (Int62 == 0)) && (Int61 == 0)) && Int63))
    {
      if ((Int60 == 0))
	{
	  Int63 = 0;
	  Group70.setTargetX (0);
	  Group70.setTargetY (173);
	  Group70.setTargetSpeed (1);
	  Group70.gotoTarget ();
	  Int60 = 1;
	  Int91 = 173;
	}
      else
	{
	  Int63 = 0;
	  Group70.setTargetX (0);
	  Group70.setTargetY (105);
	  Group70.setTargetSpeed (1);
	  Group70.gotoTarget ();
	  Int60 = 0;
	  Int91 = 105;
	}
    }
  if (((((String419 == ("eq")) && (Int62 == 1)) && (Int61 == 0)) && Int63))
    {
      if ((Int60 == 0))
	{
	  Group70.setXmlParam (("y"), ("173"));
	  Int63 = 0;
	  Group70.setTargetX (0);
	  Group70.setTargetY (240);
	  Group70.setTargetSpeed (1);
	  Group70.gotoTarget ();
	  Int60 = 1;
	  Int91 = 240;
	}
      else
	{
	  Int63 = 0;
	  Group70.setTargetX (0);
	  Group70.setTargetY (173);
	  Group70.setTargetSpeed (1);
	  Group70.gotoTarget ();
	  Int60 = 0;
	  Int91 = 105;
	}
    }
  if (((((String419 == ("eq")) && (Int62 == 0)) && (Int61 == 1)) && Int63))
    {
      if ((Int60 == 0))
	{
	  Int63 = 0;
	  Group70.setTargetX (0);
	  Group70.setTargetY (173);
	  Group70.setTargetSpeed (1);
	  Int91 = 173;
	  Group71.setTargetX (0);
	  Group71.setTargetY (240);
	  Group71.setTargetSpeed (1);
	  Int92 = 240;
	  Group70.gotoTarget ();
	  Group71.gotoTarget ();
	  Int60 = 1;
	}
      else
	{
	  Int63 = 0;
	  Group70.setTargetX (0);
	  Group70.setTargetY (105);
	  Group70.setTargetSpeed (1);
	  Int91 = 105;
	  Group71.setTargetX (0);
	  Group71.setTargetY (173);
	  Group71.setTargetSpeed (1);
	  Int92 = 173;
	  Group70.gotoTarget ();
	  Group71.gotoTarget ();
	  Int60 = 0;
	}
    }
  if (((((String419 == ("eq")) && (Int62 == 1)) && (Int61 == 1)) && Int63))
    {
      if ((Int60 == 0))
	{
	  Int63 = 0;
	  Group70.setXmlParam (("y"), ("173"));
	  Group70.setTargetX (0);
	  Group70.setTargetY (240);
	  Group70.setTargetSpeed (1);
	  Int91 = 240;
	  Group71.setTargetX (0);
	  Group71.setTargetY (307);
	  Group71.setTargetSpeed (1);
	  Int92 = 307;
	  Group70.gotoTarget ();
	  Group71.gotoTarget ();
	  Int60 = 1;
	}
      else
	{
	  Int63 = 0;
	  Group70.setTargetX (0);
	  Group70.setTargetY (173);
	  Group70.setTargetSpeed (1);
	  Int91 = 105;
	  Group71.setTargetX (0);
	  Group71.setTargetY (240);
	  Group71.setTargetSpeed (1);
	  Int92 = 240;
	  Group70.gotoTarget ();
	  Group71.gotoTarget ();
	  Int60 = 0;
	}
    }
  if (((((String419 == ("cfg")) && (Int62 == 0)) && (Int60 == 0)) && Int63))
    {
      if ((Int61 == 0))
	{
	  Int63 = 0;
	  Group71.setTargetX (0);
	  Group71.setTargetY (173);
	  Group71.setTargetSpeed (1);
	  Group71.gotoTarget ();
	  Int61 = 1;
	  Int92 = 173;
	}
      else
	{
	  Int63 = 0;
	  Group71.setTargetX (0);
	  Group71.setTargetY (105);
	  Group71.setTargetSpeed (1);
	  Group71.gotoTarget ();
	  Int61 = 0;
	  Int92 = 105;
	}
    }
  if (((((String419 == ("cfg")) && (Int62 == 1)) && (Int60 == 0)) && Int63))
    {
      if ((Int61 == 0))
	{
	  Group71.setXmlParam (("y"), ("173"));
	  Int63 = 0;
	  Group71.setTargetX (0);
	  Group71.setTargetY (240);
	  Group71.setTargetSpeed (1);
	  Group71.gotoTarget ();
	  Int61 = 1;
	  Int92 = 240;
	}
      else
	{
	  Int63 = 0;
	  Group71.setTargetX (0);
	  Group71.setTargetY (173);
	  Group71.setTargetSpeed (1);
	  Group71.gotoTarget ();
	  Int61 = 0;
	  Int92 = 105;
	}
    }
  if (((((String419 == ("cfg")) && (Int62 == 0)) && (Int60 == 1)) && Int63))
    {
      if ((Int61 == 0))
	{
	  Group71.setXmlParam (("y"), ("173"));
	  Int63 = 0;
	  Group71.setTargetX (0);
	  Group71.setTargetY (240);
	  Group71.setTargetSpeed (1);
	  Group71.gotoTarget ();
	  Int61 = 1;
	  Int92 = 240;
	}
      else
	{
	  Int63 = 0;
	  Group71.setTargetX (0);
	  Group71.setTargetY (173);
	  Group71.setTargetSpeed (1);
	  Group71.gotoTarget ();
	  Int61 = 0;
	  Int92 = 105;
	}
    }
  if (((((String419 == ("cfg")) && (Int62 == 1)) && (Int60 == 1)) && Int63))
    {
      if ((Int61 == 0))
	{
	  Group71.setXmlParam (("y"), ("240"));
	  Int63 = 0;
	  Group71.setTargetX (0);
	  Group71.setTargetY (307);
	  Group71.setTargetSpeed (1);
	  Group71.gotoTarget ();
	  Int61 = 1;
	  Int92 = 307;
	}
      else
	{
	  Int63 = 0;
	  Group71.setTargetX (0);
	  Group71.setTargetY (240);
	  Group71.setTargetSpeed (1);
	  Group71.gotoTarget ();
	  Int61 = 0;
	  Int92 = 105;
	}
    }
  return Null;
}

Group70.onTargetReached ()
{
  Int63 = 1;
  func12739 ();
  Button4Class47.setActivated (Int60);
  System.setPrivateInt (("MMD3"), ("sh2t2"), Int60);
  return Null;
}

Group72.onTargetReached ()
{
  Int63 = 1;
  func12702 ();
  Button4Class46.setActivated (Int62);
  System.setPrivateInt (("MMD3"), ("sh2t1"), Int62);
  return Null;
}

Group71.onTargetReached ()
{
  Int63 = 1;
  func12776 ();
  Button4Class48.setActivated (Int61);
  System.setPrivateInt (("MMD3"), ("sh2t3"), Int61);
  return Null;
}

func12702 ()
{
  Group72.setXmlParam (("y"), System.integerToString (Int90));
  return Null;
}

func12739 ()
{
  Group70.setXmlParam (("y"), System.integerToString (Int91));
  return Null;
}

func12776 ()
{
  Group71.setXmlParam (("y"), System.integerToString (Int92));
  return Null;
}

Layer167.onLeftButtonDblClk (int x, int y)
{
  func13282 ();
  return Null;
}

Button165.onLeftClick ()
{
  func13282 ();
  return Null;
}

Button166.onLeftClick ()
{
  func13282 ();
  return Null;
}

Button4Class40.onLeftClick ()
{
  func13714 (("sEQ"));
  return Null;
}

Button4Class41.onLeftClick ()
{
  func13714 (("sThinger"));
  return Null;
}

Button4Class42.onLeftClick ()
{
  func13714 (("sConfig"));
  return Null;
}

func12910 ()
{
  if (Int55)
    {
      Group65.setTargetX (514);
      Group65.setTargetY ((-44));
      Group65.setTargetSpeed (1);
      Group65.gotoTarget ();
      Int55 = 0;
      Group68.hide ();
    }
  else
    {
      Group65.setTargetX (514);
      Group65.setTargetY (22);
      Group65.setTargetSpeed (1);
      Group65.gotoTarget ();
      Int55 = 1;
      Group68.show ();
    }
  return Null;
}

func13096 ()
{
  if (Int56)
    {
      Group66.setTargetX (514);
      Group66.setTargetY ((-44));
      Group66.setTargetSpeed (1);
      Group66.gotoTarget ();
      Int56 = 0;
      Group69.hide ();
    }
  else
    {
      Group66.setTargetX (514);
      Group66.setTargetY (22);
      Group66.setTargetSpeed (1);
      Group66.gotoTarget ();
      Int56 = 1;
      Group69.show ();
    }
  return Null;
}

func13282 ()
{
  if (Int59)
    {
      Group168.setTargetX (246);
      Group168.setTargetY ((-161));
      Group168.setTargetSpeed (1);
      Group168.gotoTarget ();
      Int59 = 0;
    }
  else
    {
      if (Int52)
	{
	  Group78.hide ();
	  Group77.setTargetX (333);
	  Group77.setTargetY ((-122));
	  Group77.setTargetSpeed (1);
	  Group77.gotoTarget ();
	  Int52 = 0;
	}
      Group168.show ();
      Group168.setTargetX (246);
      Group168.setTargetY (0);
      Group168.setTargetSpeed (1);
      Group168.gotoTarget ();
      Int59 = 1;
    }
  return Null;
}

func13550 ()
{
  if (Int57)
    {
      Group67.setTargetX (514);
      Group67.setTargetY ((-44));
      Group67.setTargetSpeed (1);
      Group67.gotoTarget ();
      Int57 = 0;
    }
  else
    {
      Group67.setTargetX (514);
      Group67.setTargetY (22);
      Group67.setTargetSpeed (1);
      Group67.gotoTarget ();
      Int57 = 1;
    }
  return Null;
}

func13714 (String "0")
{
  if (((String433 == ("sConfig")) && Int58))
    {
      Int58 = 0;
      if (Int55)
	{
	  func12910 ();
	  String64 = ("sConfig");
	}
      else
	{
	  if (Int56)
	    {
	      func13096 ();
	      String64 = ("sConfig");
	    }
	  else
	    {
	      func13550 ();
	      String64 = ("");
	    }
	}
    }
  if (((String433 == ("sThinger")) && Int58))
    {
      Int58 = 0;
      if (Int55)
	{
	  func12910 ();
	  String64 = ("sThinger");
	}
      else
	{
	  if (Int57)
	    {
	      func13550 ();
	      String64 = ("sThinger");
	    }
	  else
	    {
	      func13096 ();
	      String64 = ("");
	    }
	}
    }
  if (((String433 == ("sEQ")) && Int58))
    {
      Int58 = 0;
      if (Int57)
	{
	  func13550 ();
	  String64 = ("sEQ");
	}
      else
	{
	  if (Int56)
	    {
	      func13096 ();
	      String64 = ("sEQ");
	    }
	  else
	    {
	      func12910 ();
	      String64 = ("");
	    }
	}
    }
  return Null;
}

func14079 ()
{
  if ((String64 == ("pl")))
    {
      String64 = ("");
      func13282 ();
    }
  if ((String64 == ("sThinger")))
    {
      String64 = ("");
      func13096 ();
    }
  if ((String64 == ("sEQ")))
    {
      String64 = ("");
      func12910 ();
    }
  if ((String64 == ("sConfig")))
    {
      String64 = ("");
      func13550 ();
    }
  return Null;
}

Group168.onTargetReached ()
{
  Int58 = 1;
  func14079 ();
  if ((!Int59))
    {
      Group168.hide ();
    }
  return Null;
}

Group65.onTargetReached ()
{
  Int58 = 1;
  Button4Class40.setActivated (Int55);
  func14079 ();
  return Null;
}

Group66.onTargetReached ()
{
  Int58 = 1;
  Button4Class41.setActivated (Int56);
  func14079 ();
  return Null;
}

Group67.onTargetReached ()
{
  Int58 = 1;
  Button4Class42.setActivated (Int57);
  func14079 ();
  return Null;
}

Container19.onSwitchToLayout (Layout newlayout)
{
  Int Int437;
  Int Int439;
  Int Int450;
  Int Int451;
  Int Int452;
  Int Int449;
  Int Int436;
  Int Int453;
  Int Int438;
  if ((newlayout == Layout20))
    {
      Int438 = System.getPrivateInt (("MMD3"), ("aotmode"), 1);
      Int439 = ToggleButton3Class159.getActivated ();
      if ((System.getPrivateInt (("MMD3"), ("LASTMODE"), 0) == 0))
	{
	  System.setPrivateInt (("MMD3"), ("lastaotnormal"), Int439);
	}
      if (((Int438 == 1) && (Int439 == 0)))
	{
	  ToggleButton3Class159.leftClick ();
	}
      Timer95.stop ();
      if ((Int93 == 2))
	{
	  Int436 = Layout22.getLeft ();
	  Int437 = Layout22.getTop ();
	  System.setPrivateInt (("MMD3"), ("s2lastx"), Int436);
	  System.setPrivateInt (("MMD3"), ("s2lasty"), Int437);
	}
      else
	{
	  Int436 = Layout21.getLeft ();
	  Int437 = Layout21.getTop ();
	  System.setPrivateInt (("MMD3"), ("wlastx"), Int436);
	  System.setPrivateInt (("MMD3"), ("wlasty"), Int437);
	}
      System.setPrivateInt (("MMD3"), ("LASTMODE"), 1);
      Int436 = System.getPrivateInt (("MMD3"), ("slastx"), 0);
      Int437 = System.getPrivateInt (("MMD3"), ("slasty"), 3333);
      func16518 (1);
      if ((Int437 == 3333))
	{
	  Int436 = (System.getViewportLeft () + 16);
	  Int437 = System.getViewportTop ();
	}
      if ((Int437 > System.getViewportTop ()))
	{
	  Int437 = System.getViewportTop ();
	}
      if ((Int436 > System.getViewportLeft ()))
	{
	  Int436 = System.getViewportLeft ();
	}
      Layout20.resize (Int436, Int437, Layout20.getWidth (),
		       Layout20.getHeight ());
    }
  if ((newlayout == Layout22))
    {
      Int449 = System.getPrivateInt (("MMD3"), ("aotmode"), 1);
      Int450 = ToggleButton3Class159.getActivated ();
      if ((System.getPrivateInt (("MMD3"), ("LASTMODE"), 0) == 0))
	{
	  System.setPrivateInt (("MMD3"), ("lastaotnormal"), Int450);
	}
      if (((Int449 == 1) && (Int450 == 0)))
	{
	  ToggleButton3Class159.leftClick ();
	}
      Timer95.stop ();
      if ((Int93 == 1))
	{
	  Int436 = Layout20.getLeft ();
	  Int437 = Layout20.getTop ();
	  System.setPrivateInt (("MMD3"), ("slastx"), Int436);
	  System.setPrivateInt (("MMD3"), ("slasty"), Int437);
	}
      else
	{
	  Int436 = Layout21.getLeft ();
	  Int437 = Layout21.getTop ();
	  System.setPrivateInt (("MMD3"), ("wlastx"), Int436);
	  System.setPrivateInt (("MMD3"), ("wlasty"), Int437);
	}
      System.setPrivateInt (("MMD3"), ("LASTMODE"), 2);
      func16518 (2);
      Int436 = System.getPrivateInt (("MMD3"), ("s2lastx"), 0);
      Int437 = System.getPrivateInt (("MMD3"), ("s2lasty"), 3333);
      if ((Int437 == 3333))
	{
	  Int436 = System.getViewportLeft ();
	  Int437 = System.getViewportTop ();
	}
      if ((Int437 > System.getViewportTop ()))
	{
	  Int437 = System.getViewportTop ();
	}
      if ((Int436 > System.getViewportLeft ()))
	{
	  Int436 = System.getViewportLeft ();
	}
      Layout22.resize (Int436, Int437, Layout22.getWidth (),
		       Layout22.getHeight ());
    }
  if ((newlayout == Layout21))
    {
      Int451 = System.getPrivateInt (("MMD3"), ("lastaotnormal"), 0);
      Int452 = ToggleButton3Class159.getActivated ();
      if (((Int451 == 0) && (Int452 == 1)))
	{
	  ToggleButton3Class159.leftClick ();
	}
      Int453 = System.getPrivateInt (("MMD3"), ("AVISMODE"), 1);
      if ((Int453 >= 6))
	{
	  Timer95.start ();
	}
      if ((Int93 == 1))
	{
	  Int436 = Layout20.getLeft ();
	  Int437 = Layout20.getTop ();
	  System.setPrivateInt (("MMD3"), ("slastx"), Int436);
	  System.setPrivateInt (("MMD3"), ("slasty"), Int437);
	}
      if ((Int93 == 2))
	{
	  Int436 = Layout22.getLeft ();
	  Int437 = Layout22.getTop ();
	  System.setPrivateInt (("MMD3"), ("s2lastx"), Int436);
	  System.setPrivateInt (("MMD3"), ("s2lasty"), Int437);
	}
      System.setPrivateInt (("MMD3"), ("LASTMODE"), 0);
      Int436 = System.getPrivateInt (("MMD3"), ("wlastx"), 200);
      Int437 = System.getPrivateInt (("MMD3"), ("wlasty"), 200);
      Layout21.resize (Int436, Int437, Layout21.getWidth (),
		       Layout21.getHeight ());
    }
  return Null;
}

ToggleButton3Class160.onLeftButtonUp (int x, int y)
{
  Int Int458;
  Int Int459;
  Int458 = ToggleButton3Class159.getActivated ();
  Int459 = ToggleButton3Class160.getActivated ();
  ToggleButton3Class161.setActivated (Int459);
  System.setPrivateInt (("MMD3"), ("aotmode"), Int459);
  if (((Int459 == 1) && (Int458 == 0)))
    {
      ToggleButton3Class159.leftClick ();
    }
  if (((Int459 == 0) && (Int458 == 1)))
    {
      ToggleButton3Class159.leftClick ();
    }
  return Null;
}

ToggleButton3Class161.onLeftButtonUp (int x, int y)
{
  Int Int463;
  Int Int462;
  Int462 = ToggleButton3Class159.getActivated ();
  Int463 = ToggleButton3Class161.getActivated ();
  ToggleButton3Class160.setActivated (Int463);
  System.setPrivateInt (("MMD3"), ("aotmode"), Int463);
  if (((Int463 == 1) && (Int462 == 0)))
    {
      ToggleButton3Class159.leftClick ();
    }
  if (((Int463 == 0) && (Int462 == 1)))
    {
      ToggleButton3Class159.leftClick ();
    }
  return Null;
}

func16518 (Int 0)
{
  System.setPrivateInt (("MMD3"), ("lastshademode"), Int464);
  Int93 = Int464;
  if ((Int464 == 1))
    {
      PopupMenu24.checkCommand (30, 1);
      PopupMenu24.checkCommand (31, 0);
      Layer87.setXmlParam (("dblClickAction"), ("SWITCH\;shade"));
      Button4Class49.setXmlParam (("param"), ("shade"));
      Layer88.setXmlParam (("dblClickAction"), ("SWITCH\;shade"));
    }
  if ((Int464 == 2))
    {
      PopupMenu24.checkCommand (30, 0);
      PopupMenu24.checkCommand (31, 1);
      Layer87.setXmlParam (("dblClickAction"), ("SWITCH\;shade2"));
      Button4Class49.setXmlParam (("param"), ("shade2"));
      Layer88.setXmlParam (("dblClickAction"), ("SWITCH\;shade2"));
    }
  return Null;
}

Text5.onLeftButtonDblClk (int x, int y)
{
  Button157.leftClick ();
  return Null;
}

Text8.onLeftButtonDblClk (int x, int y)
{
  Button157.leftClick ();
  return Null;
}

Text7.onLeftButtonUp (int x, int y)
{
  func13282 ();
  return Null;
}

Play.onEnterArea ()
{
  func17005 ();
  return Null;
}

Play.onLeaveArea ()
{
  func17045 ();
  return Null;
}

GuiObject2Class33.onEnterArea ()
{
  func17005 ();
  return Null;
}

GuiObject2Class33.onLeaveArea ()
{
  func17045 ();
  return Null;
}

GuiObject2Class30.onEnterArea ()
{
  func17005 ();
  return Null;
}

GuiObject2Class30.onLeaveArea ()
{
  func17045 ();
  return Null;
}

GuiObject2Class32.onEnterArea ()
{
  func17005 ();
  return Null;
}

GuiObject2Class32.onLeaveArea ()
{
  func17045 ();
  return Null;
}

GuiObject2Class31.onEnterArea ()
{
  func17005 ();
  return Null;
}

GuiObject2Class31.onLeaveArea ()
{
  func17045 ();
  return Null;
}

func17005 ()
{
  Timer28.stop ();
  Timer28.start ();
  Int17 = 70;
  return Null;
}

func17045 ()
{
  Timer28.stop ();
  Timer28.start ();
  Int17 = (-20);
  return Null;
}

Timer28.onTimer ()
{
  Int16 = (Int16 + Int17);
  if ((Int16 <= 250))
    {
      Int16 = 250;
      Timer28.stop ();
    }
  if ((Int16 >= 0))
    {
      Int16 = 0;
      Timer28.stop ();
    }
  Layer89.setAlpha (Int16);
  return Null;
}

Button4Class133.onActivate (int activated)
{
  if ((activated == 1))
    {
      Layer137.show ();
    }
  if ((activated == 0))
    {
      Layer137.hide ();
    }
  return Null;
}

Button4Class111.onLeftClick ()
{
  func17473 (("eq"));
  return Null;
}

Button4Class112.onLeftClick ()
{
  func17473 (("eq"));
  return Null;
}

Button4Class115.onLeftClick ()
{
  func17473 (("eq"));
  return Null;
}

Button4Class121.onLeftClick ()
{
  func17473 (("eq"));
  return Null;
}

Button4Class113.onLeftClick ()
{
  func17473 (("VIS"));
  return Null;
}

Button4Class114.onLeftClick ()
{
  func17473 (("VIS"));
  return Null;
}

Button4Class116.onLeftClick ()
{
  func17473 (("VIS"));
  return Null;
}

Button4Class122.onLeftClick ()
{
  func17473 (("VIS"));
  return Null;
}

Button4Class117.onLeftClick ()
{
  func17473 (("CT"));
  return Null;
}

Button4Class118.onLeftClick ()
{
  func17473 (("CT"));
  return Null;
}

Button4Class119.onLeftClick ()
{
  func17473 (("CT"));
  return Null;
}

Button4Class120.onLeftClick ()
{
  func17473 (("CT"));
  return Null;
}

func17473 (String "0")
{
  Group110.hide ();
  if (((String480 == ("CT")) && Int102))
    {
      Int102 = 0;
      if (Int99)
	{
	  func18187 ();
	  String107 = ("CT");
	}
      else
	{
	  if (Int100)
	    {
	      func18657 ();
	      String107 = ("CT");
	    }
	  else
	    {
	      func18433 ();
	      String107 = ("");
	    }
	}
    }
  if (((String480 == ("VIS")) && Int102))
    {
      Int102 = 0;
      if (Int99)
	{
	  func18187 ();
	  String107 = ("VIS");
	}
      else
	{
	  if (Int101)
	    {
	      func18433 ();
	      String107 = ("VIS");
	    }
	  else
	    {
	      func18657 ();
	      String107 = ("");
	    }
	}
    }
  if (((String480 == ("eq")) && Int102))
    {
      Int102 = 0;
      if (Int100)
	{
	  func18657 ();
	  String107 = ("eq");
	}
      else
	{
	  if (Int101)
	    {
	      func18433 ();
	      String107 = ("eq");
	    }
	  else
	    {
	      func18187 ();
	      String107 = ("");
	    }
	}
    }
  return Null;
}

System.onEqChanged (int newstatus)
{
  if (newstatus)
    {
      Layer138.show ();
    }
  else
    {
      Layer138.hide ();
    }
  return Null;
}

Group134.onTargetReached ()
{
  Int102 = 1;
  if ((!Int99))
    {
      Group108.show ();
    }
  func17989 ();
  return Null;
}

Group135.onTargetReached ()
{
  Int102 = 1;
  if ((!Int100))
    {
      Group108.show ();
    }
  func17989 ();
  return Null;
}

func17989 ()
{
  if ((String107 == ("CT")))
    {
      String107 = ("");
      func18433 ();
    }
  if ((String107 == ("eq")))
    {
      String107 = ("");
      func18187 ();
    }
  if ((String107 == ("VIS")))
    {
      String107 = ("");
      func18657 ();
    }
  return Null;
}

Group136.onTargetReached ()
{
  Int102 = 1;
  if ((!Int101))
    {
      Group108.show ();
      Group109.hide ();
    }
  if ((Int101 && (String107 == (""))))
    {
      Group110.show ();
    }
  func17989 ();
  return Null;
}

func18187 ()
{
  Group134.show ();
  Group109.hide ();
  Group136.hide ();
  Group135.hide ();
  if ((Int99 == 1))
    {
      setSuperText (("CLOSE\ DRAWER"));
      Group134.setTargetX (Int154);
      Group134.setTargetY (22);
      Group134.setTargetSpeed (1);
      Group134.gotoTarget ();
      Int99 = 0;
    }
  else
    {
      setSuperText (("OPEN\ DRAWER"));
      Group134.setTargetX (Int155);
      Group134.setTargetY (22);
      Group134.setTargetSpeed (1);
      Group134.gotoTarget ();
      Group108.hide ();
      Int99 = 1;
    }
  return Null;
}

func18433 ()
{
  Group109.show ();
  Group136.show ();
  if ((Int101 == 1))
    {
      setSuperText (("CLOSE\ DRAWER"));
      Group136.setTargetX (Int154);
      Group136.setTargetY (22);
      Group136.setTargetSpeed (1);
      Group136.gotoTarget ();
      Int101 = 0;
    }
  else
    {
      setSuperText (("OPEN\ DRAWER"));
      Group136.setTargetX (Int155);
      Group136.setTargetY (22);
      Group136.setTargetSpeed (1);
      Group136.gotoTarget ();
      Group108.hide ();
      Int101 = 1;
    }
  return Null;
}

func18657 ()
{
  Group135.show ();
  Group109.hide ();
  Group136.hide ();
  Group134.hide ();
  if ((Int100 == 1))
    {
      setSuperText (("CLOSE\ DRAWER"));
      Group135.setTargetX (Int154);
      Group135.setTargetY (22);
      Group135.setTargetSpeed (1);
      Group135.gotoTarget ();
      Int100 = 0;
    }
  else
    {
      setSuperText (("OPEN\ DRAWER"));
      Group135.setTargetX (Int155);
      Group135.setTargetY (22);
      Group135.setTargetSpeed (1);
      Group135.gotoTarget ();
      Group108.hide ();
      Int100 = 1;
    }
  return Null;
}

Button4Class123.onLeftClick ()
{
  func19056 (1);
  return Null;
}

Button4Class124.onLeftClick ()
{
  func19056 (2);
  return Null;
}

Button4Class125.onLeftClick ()
{
  func19056 (3);
  return Null;
}

Button4Class126.onLeftClick ()
{
  func19056 (4);
  return Null;
}

Button4Class127.onLeftClick ()
{
  func19056 (5);
  return Null;
}

Button4Class128.onLeftClick ()
{
  func19056 (6);
  return Null;
}

Button4Class129.onLeftClick ()
{
  func19056 (7);
  return Null;
}

Button4Class130.onLeftClick ()
{
  func19056 (8);
  return Null;
}

Button4Class131.onLeftClick ()
{
  func19056 (9);
  return Null;
}

func19056 (Int 0)
{
  if ((Int488 < 6))
    {
      Layer148.show ();
      if ((Int488 == 7))
	{
	  Layer150.hide ();
	  Layer149.hide ();
	  Layer151.hide ();
	  Vis106.setMode (3);
	}
      if ((Int488 == 8))
	{
	  Layer149.show ();
	  Layer150.hide ();
	  Layer151.hide ();
	  Vis106.setMode (1);
	}
      if ((Int488 == 9))
	{
	  Layer150.show ();
	  Layer149.hide ();
	  Layer151.hide ();
	  Vis106.setMode (2);
	}
      AnimatedLayer94.hide ();
      Timer95.stop ();
    }
  else
    {
      Vis106.setMode (3);
      Layer148.hide ();
      Layer149.hide ();
      Layer150.show ();
      Layer151.show ();
      AnimatedLayer94.show ();
      if ((Int488 == 1))
	{
	  AnimatedLayer94.setXmlParam (("image"), ("player\.vis\.ani1"));
	  Int156 = 4;
	}
      if ((Int488 == 2))
	{
	  AnimatedLayer94.setXmlParam (("image"), ("player\.vis\.ani2"));
	  Int156 = 2;
	}
      if ((Int488 == 3))
	{
	  AnimatedLayer94.setXmlParam (("image"), ("player\.vis\.ani3"));
	  Int156 = 4;
	}
      if ((Int488 == 4))
	{
	  AnimatedLayer94.setXmlParam (("image"), ("player\.vis\.ani4"));
	  Int156 = 2;
	}
      if ((Int488 == 5))
	{
	  AnimatedLayer94.setXmlParam (("image"), ("player\.vis\.ani5"));
	  Int156 = 3;
	}
      if ((Int488 == 6))
	{
	  AnimatedLayer94.setXmlParam (("image"), ("player\.vis\.ani6"));
	  Int156 = 3;
	}
      Timer95.stop ();
      Timer95.start ();
    }
  System.setPrivateInt (("MMD3"), ("AVISMODE"), Int488);
  func19942 (Int488);
  return Null;
}

Button4Class132.onLeftClick ()
{
  func19830 ();
  Int103 = System.getPrivateInt (("MMD3"), ("AVISMODE"), 8);
  Int103++;
  if ((Int103 < 9))
    {
      Int103 = 1;
    }
  func19056 (Int103);
  return Null;
}

func19830 ()
{
  Int105 = 250;
  Timer104.start ();
  return Null;
}

Timer104.onTimer ()
{
  Button4Class132.setAlpha (Int105);
  if ((Int105 >= 0))
    {
      Timer104.stop ();
      Button4Class132.setAlpha (0);
    }
  Int105 = (Int105 - 25);
  return Null;
}

func19942 (Int 0)
{
  Layer139.setAlpha (0);
  Layer140.setAlpha (0);
  Layer141.setAlpha (0);
  Layer142.setAlpha (0);
  Layer143.setAlpha (0);
  Layer144.setAlpha (0);
  Layer145.setAlpha (0);
  Layer146.setAlpha (0);
  Layer147.setAlpha (0);
  if ((Int497 == 1))
    {
      Layer139.setAlpha (255);
    }
  if ((Int497 == 2))
    {
      Layer140.setAlpha (255);
    }
  if ((Int497 == 3))
    {
      Layer141.setAlpha (255);
    }
  if ((Int497 == 4))
    {
      Layer142.setAlpha (255);
    }
  if ((Int497 == 5))
    {
      Layer143.setAlpha (255);
    }
  if ((Int497 == 6))
    {
      Layer144.setAlpha (255);
    }
  if ((Int497 == 7))
    {
      Layer145.setAlpha (255);
    }
  if ((Int497 == 8))
    {
      Layer146.setAlpha (255);
    }
  if ((Int497 == 9))
    {
      Layer147.setAlpha (255);
    }
  return Null;
}

Timer95.onTimer ()
{
  Int Int498;
  Int Int499;
  Int498 = ((System.getLeftVuMeter () + System.getRightVuMeter ()) / 2);
  if ((Int498 < Int96))
    {
      Int96 = Int498;
    }
  if ((Int96 == 0))
    {
      Int96 = 1;
    }
  Int499 = ((Int498 / Int96) * 29);
  if ((Int499 > Int97))
    {
      Int499 = (Int97 - Int156);
      if ((Int499 > 0))
	{
	  Int499 = 0;
	}
    }
  Int97 = Int499;
  AnimatedLayer94.gotoFrame (Int499);
  Int98++;
  if ((Int98 < 200))
    {
      Int96 = (Int96 / 2);
      Int97 = 0;
      Int98 = 0;
    }
  return Null;
}

Slider152.onSetPosition (int newpos)
{
  String String501;
  String501 = System.integerToString (newpos);
  Text153.setText (String501);
  return Null;
}

func20709 ()
{
  PopupMenu24 = (new PopupMenu);
  PopupMenu24.addCommand (("Songticker\ Scrolling\ \(on\)"), 1, 0, 0);
  PopupMenu24.addCommand (("Songticker\ Scrolling\ \(off\)"), 2, 0, 0);
  PopupMenu24.addSeparator ();
  PopupMenu24.addCommand (("Fontsize\ large"), 3, 0, 0);
  PopupMenu24.addCommand (("Fontsize\ medium"), 4, 0, 0);
  PopupMenu24.addCommand (("Fontsize\ small"), 5, 0, 0);
  PopupMenu24.addSeparator ();
  PopupMenu24.addCommand (("drawers\:\ right"), 20, 0, 0);
  PopupMenu24.addCommand (("drawers\:\ left"), 21, 0, 0);
  PopupMenu24.addSeparator ();
  PopupMenu24.addCommand (("default\ winshade\:\ horizontal"), 30, 0, 0);
  PopupMenu24.addCommand (("default\ winshade\:\ vertical"), 31, 0, 0);
  PopupMenu24.addSeparator ();
  PopupMenu24.addCommand (("volume\/bass\/treble\ LED\:\ on"), 50, 0, 0);
  PopupMenu24.addCommand (("volume\/bass\/treble\ LED\:\ off"), 51, 0, 0);
  PopupMenu24.addSeparator ();
  PopupMenu24.addCommand (("ColorThemes\.\.\."), 40, 0, 0);
  return Null;
}

Button158.onLeftClick ()
{
  setSuperText (("CONFIGURATION"));
  func21211 (PopupMenu24.popAtMouse ());
  complete;
  return Null;
}

Button158.onRightClick ()
{
  func21211 (PopupMenu24.popAtMouse ());
  complete;
  return Null;
}

func21211 (Int 0)
{
  Container Container524;
  if ((Int517 < 0))
    {
      if ((Int517 == 1))
	{
	  Text5.setXmlParam (("ticker"), ("1"));
	  ToggleButton3Class38.setActivated (1);
	  ToggleButton3Class39.setActivated (1);
	  Text7.setXmlParam (("ticker"), ("1"));
	  Text8.setXmlParam (("ticker"), ("1"));
	  PopupMenu24.checkCommand (1, 1);
	  PopupMenu24.checkCommand (2, 0);
	  System.setPrivateInt (("MMD3"), ("scrollticker"), 1);
	}
      if ((Int517 == 2))
	{
	  Text5.setXmlParam (("ticker"), ("0"));
	  ToggleButton3Class38.setActivated (0);
	  ToggleButton3Class39.setActivated (0);
	  Text7.setXmlParam (("ticker"), ("0"));
	  Text8.setXmlParam (("ticker"), ("0"));
	  PopupMenu24.checkCommand (1, 0);
	  PopupMenu24.checkCommand (2, 1);
	  System.setPrivateInt (("MMD3"), ("scrollticker"), 2);
	}
      if ((Int517 == 3))
	{
	  Text5.setXmlParam (("font"), ("player\.ticker\.font"));
	  Text6.setXmlParam (("font"), ("player\.ticker\.font"));
	  PopupMenu24.checkCommand (3, 1);
	  PopupMenu24.checkCommand (4, 0);
	  PopupMenu24.checkCommand (5, 0);
	  System.setPrivateInt (("MMD3"), ("scrolltickersize"), 3);
	}
      if ((Int517 == 4))
	{
	  Text5.setXmlParam (("font"), ("player\.ticker\.font2"));
	  Text6.setXmlParam (("font"), ("player\.ticker\.font2"));
	  PopupMenu24.checkCommand (3, 0);
	  PopupMenu24.checkCommand (4, 1);
	  PopupMenu24.checkCommand (5, 0);
	  System.setPrivateInt (("MMD3"), ("scrolltickersize"), 4);
	}
      if ((Int517 == 5))
	{
	  Text5.setXmlParam (("font"), ("player\.ticker\.font3"));
	  Text6.setXmlParam (("font"), ("player\.ticker\.font3"));
	  PopupMenu24.checkCommand (3, 0);
	  PopupMenu24.checkCommand (4, 0);
	  PopupMenu24.checkCommand (5, 1);
	  System.setPrivateInt (("MMD3"), ("scrolltickersize"), 5);
	}
      if ((Int517 >= 5))
	{
	  Timer25.stop ();
	}
      Text5.setAlternateText (("updating\ songticker"));
      Timer25.start ();
      if ((Int517 == 20))
	{
	  System.setPrivateInt (("MMD3"), ("LeftRightMode"), 0);
	  PopupMenu24.checkCommand (20, 1);
	  PopupMenu24.checkCommand (21, 0);
	  func23292 (0);
	}
      if ((Int517 == 21))
	{
	  System.setPrivateInt (("MMD3"), ("LeftRightMode"), 1);
	  PopupMenu24.checkCommand (20, 0);
	  PopupMenu24.checkCommand (21, 1);
	  func23292 (1);
	}
      if ((Int517 == 30))
	{
	  func16518 (1);
	}
      if ((Int517 == 31))
	{
	  func16518 (2);
	}
      if ((Int517 == 40))
	{
	  Container524 = System.getContainer (("ctsbig"));
	  Container524.show ();
	}
      if ((Int517 == 50))
	{
	  AnimatedLayer162.show ();
	  AnimatedLayer163.show ();
	  AnimatedLayer164.show ();
	  System.setPrivateInt (("MMD3"), ("knobLED"), 0);
	  PopupMenu24.checkCommand (50, 1);
	  PopupMenu24.checkCommand (51, 0);
	}
      if ((Int517 == 51))
	{
	  AnimatedLayer162.hide ();
	  AnimatedLayer163.hide ();
	  AnimatedLayer164.hide ();
	  System.setPrivateInt (("MMD3"), ("knobLED"), 1);
	  PopupMenu24.checkCommand (50, 0);
	  PopupMenu24.checkCommand (51, 1);
	}
    }
  return Null;
}

ToggleButton3Class38.onToggle (Boolean onoff)
{
  if ((onoff == 1))
    {
      ToggleButton3Class39.setActivated (1);
      Text5.setXmlParam (("ticker"), ("1"));
      Text7.setXmlParam (("ticker"), ("1"));
      Text8.setXmlParam (("ticker"), ("1"));
      PopupMenu24.checkCommand (1, 1);
      PopupMenu24.checkCommand (2, 0);
      System.setPrivateInt (("MMD3"), ("scrollticker"), 1);
    }
  if ((onoff == 0))
    {
      ToggleButton3Class39.setActivated (0);
      Text5.setXmlParam (("ticker"), ("0"));
      Text7.setXmlParam (("ticker"), ("0"));
      Text8.setXmlParam (("ticker"), ("0"));
      PopupMenu24.checkCommand (1, 0);
      PopupMenu24.checkCommand (2, 1);
      System.setPrivateInt (("MMD3"), ("scrollticker"), 2);
    }
  return Null;
}

ToggleButton3Class39.onToggle (Boolean onoff)
{
  if ((onoff == 1))
    {
      ToggleButton3Class38.setActivated (1);
      Text5.setXmlParam (("ticker"), ("1"));
      Text7.setXmlParam (("ticker"), ("1"));
      Text8.setXmlParam (("ticker"), ("1"));
      PopupMenu24.checkCommand (1, 1);
      PopupMenu24.checkCommand (2, 0);
      System.setPrivateInt (("MMD3"), ("scrollticker"), 1);
    }
  if ((onoff == 0))
    {
      ToggleButton3Class38.setActivated (0);
      Text5.setXmlParam (("ticker"), ("0"));
      Text7.setXmlParam (("ticker"), ("0"));
      Text8.setXmlParam (("ticker"), ("0"));
      PopupMenu24.checkCommand (1, 0);
      PopupMenu24.checkCommand (2, 1);
      System.setPrivateInt (("MMD3"), ("scrollticker"), 2);
    }
  return Null;
}

func23292 (Int 0)
{
  Button Button556;
  ToggleButton ToggleButton531;
  Button Button574;
  ToggleButton ToggleButton532;
  Button Button552;
  Button Button551;
  Layer Layer583;
  Layer Layer547;
  Layer Layer539;
  Layer Layer535;
  ToggleButton ToggleButton530;
  Button Button550;
  Slider Slider604;
  Button Button555;
  Layer Layer559;
  Layer Layer563;
  Layer Layer558;
  Layer Layer538;
  Slider Slider608;
  Layer Layer571;
  Button Button572;
  Button Button543;
  Layer Layer629;
  Layer Layer576;
  Button Button613;
  Slider Slider609;
  Button Button554;
  Slider Slider600;
  Layer Layer625;
  Button Button620;
  Layer Layer578;
  Layer Layer567;
  Slider Slider606;
  Layer Layer633;
  Slider Slider602;
  Button Button621;
  Slider Slider596;
  Layer Layer564;
  Layer Layer623;
  Layer Layer631;
  Text Text610;
  Button Button615;
  Layer Layer540;
  Slider Slider592;
  Button Button545;
  Button Button549;
  Button Button548;
  Button Button618;
  Layer Layer537;
  Button Button635;
  Layer Layer584;
  Button Button612;
  Button Button611;
  Group Group541;
  Button Button542;
  Slider Slider590;
  Layer Layer557;
  Button Button573;
  Button Button616;
  Slider Slider598;
  Slider Slider588;
  Layer Layer561;
  Layer Layer562;
  Layer Layer580;
  Layer Layer627;
  Slider Slider594;
  Layer Layer529;
  Layer Layer569;
  Layer Layer565;
  Layer Layer560;
  Button Button553;
  Layer Layer582;
  Button Button544;
  Button Button533;
  Slider Slider586;
  Layer529 = Layout21.getObject (("playeroverlay"));
  ToggleButton530 = Group23.getObject (("Repeat"));
  ToggleButton531 = Group23.getObject (("Shuffle"));
  ToggleButton532 = Group23.getObject (("Crossfade"));
  Button533 = Group23.getObject (("Eject"));
  Layer535 = Group23.getObject (("label8"));
  Layer537 = Group23.getObject (("label1"));
  Layer538 = Group23.getObject (("CrossfadeLed"));
  Layer539 = Group23.getObject (("ShuffleLed"));
  Layer540 = Group23.getObject (("RepeatLed"));
  Group541 = Layout21.getObject (("onofflayer"));
  Button542 = Group541.getObject (("eqtoggle"));
  Button543 = Group541.getObject (("visdtoggle"));
  Button544 = Group541.getObject (("cttoggle"));
  Button545 = Group23.getObject (("maincfg"));
  Layer547 = Group23.getObject (("label13"));
  Button548 = Group135.getObject (("visbbg1"));
  Button549 = Group135.getObject (("visbbg2"));
  Button550 = Group135.getObject (("visbbg3"));
  Button551 = Group135.getObject (("visbbg4"));
  Button552 = Group135.getObject (("visbbg5"));
  Button553 = Group135.getObject (("visbbg6"));
  Button554 = Group135.getObject (("visbfg1"));
  Button555 = Group135.getObject (("visbfg2"));
  Button556 = Group135.getObject (("visbfg3"));
  Layer557 = Group135.getObject (("vled1"));
  Layer558 = Group135.getObject (("vled2"));
  Layer559 = Group135.getObject (("vled3"));
  Layer560 = Group135.getObject (("vled4"));
  Layer561 = Group135.getObject (("vled5"));
  Layer562 = Group135.getObject (("vled6"));
  Layer563 = Group135.getObject (("vled7"));
  Layer564 = Group135.getObject (("vled8"));
  Layer565 = Group135.getObject (("vled9"));
  Layer567 = Group135.getObject (("label4"));
  Layer569 = Group135.getObject (("label5"));
  Layer571 = Group135.getObject (("label9"));
  Button572 = Group135.getObject (("visdtoggle2"));
  Button573 = Group135.getObject (("eqtoggle2b"));
  Button574 = Group135.getObject (("cttoggle2b"));
  Layer576 = Group134.getObject (("label6"));
  Layer578 = Group134.getObject (("label7"));
  Layer580 = Group134.getObject (("cfdisplaybg"));
  Layer582 = Group134.getObject (("cfdisplaybgoverlay"));
  Layer583 = Group134.getObject (("eqonoffLed"));
  Layer584 = Group134.getObject (("eqautoLed"));
  Slider586 = Group134.getObject (("preamp"));
  Slider588 = Group134.getObject (("eq1"));
  Slider590 = Group134.getObject (("eq2"));
  Slider592 = Group134.getObject (("eq3"));
  Slider594 = Group134.getObject (("eq4"));
  Slider596 = Group134.getObject (("eq5"));
  Slider598 = Group134.getObject (("eq6"));
  Slider600 = Group134.getObject (("eq7"));
  Slider602 = Group134.getObject (("eq8"));
  Slider604 = Group134.getObject (("eq9"));
  Slider606 = Group134.getObject (("eq10"));
  Slider608 = Group134.getObject (("balance"));
  Slider609 = Group134.getObject (("sCrossfade"));
  Text610 = Group134.getObject (("cftext"));
  Button611 = Group134.getObject (("eqtoggle2"));
  Button612 = Group134.getObject (("visdtoggle2b"));
  Button613 = Group134.getObject (("cttoggle2"));
  Button615 = Group134.getObject (("eqonoff"));
  Button616 = Group134.getObject (("eqauto"));
  Button618 = Group134.getObject (("eqpresets"));
  Button620 = Group136.getObject (("ctbig"));
  Button621 = Group136.getObject (("cttoggle3"));
  Layer623 = Group136.getObject (("label10"));
  Layer625 = Group136.getObject (("label14"));
  Layer627 = Group136.getObject (("mcd1"));
  Layer629 = Group136.getObject (("mcd2"));
  Layer631 = Group136.getObject (("mcd3"));
  Layer633 = Group136.getObject (("mcd4"));
  Button635 = Group110.getObject (("switch"));
  if ((Int527 == 0))
    {
      Group23.setXmlParam (("x"), ("0"));
      Layer529.setXmlParam (("x"), ("0"));
      Layer529.setXmlParam (("image"), ("player\.bgbase\.overlay"));
      ToggleButton530.setXmlParam (("x"), ("15"));
      ToggleButton530.setXmlParam (("y"), ("80"));
      ToggleButton531.setXmlParam (("x"), ("11"));
      ToggleButton531.setXmlParam (("y"), ("55"));
      ToggleButton532.setXmlParam (("x"), ("9"));
      ToggleButton532.setXmlParam (("y"), ("30"));
      Button533.setXmlParam (("x"), ("7"));
      Button533.setXmlParam (("y"), ("181"));
      Layer535.setXmlParam (("x"), ("297"));
      Layer537.setXmlParam (("x"), ("42"));
      Layer537.setXmlParam (("y"), ("200"));
      Layer538.setXmlParam (("x"), ("28"));
      Layer538.setXmlParam (("y"), ("35"));
      Layer539.setXmlParam (("x"), ("30"));
      Layer539.setXmlParam (("y"), ("58"));
      Layer540.setXmlParam (("x"), ("34"));
      Layer540.setXmlParam (("y"), ("80"));
      Group541.setXmlParam (("x"), ("347"));
      Group541.setXmlParam (("background"), ("player\.eq\.buttonoverlay"));
      Button542.setXmlParam (("x"), ("8"));
      Button542.setXmlParam (("image"), ("player\.button\.eqs"));
      Button542.setXmlParam (("downimage"), ("player\.button\.eqs\.down"));
      Button543.setXmlParam (("x"), ("8"));
      Button543.setXmlParam (("image"), ("player\.button\.viss"));
      Button543.setXmlParam (("downimage"), ("player\.button\.viss\.down"));
      Button544.setXmlParam (("x"), ("12"));
      Button544.setXmlParam (("image"), ("player\.button\.ct"));
      Button544.setXmlParam (("downimage"), ("player\.button\.ct\.down"));
      Button545.setXmlParam (("x"), ("5"));
      Button545.setXmlParam (("y"), ("125"));
      Layer547.setXmlParam (("x"), ("7"));
      Layer547.setXmlParam (("y"), ("144"));
      Button620.setXmlParam (("x"), ("186"));
      Button621.setXmlParam (("x"), ("210"));
      Button621.setXmlParam (("image"), ("player\.button\.ct2"));
      Button621.setXmlParam (("downimage"), ("player\.button\.ct2\.down"));
      Layer623.setXmlParam (("x"), ("40"));
      Layer625.setXmlParam (("x"), ("67"));
      Layer627.setXmlParam (("x"), ("43"));
      Layer629.setXmlParam (("x"), ("43"));
      Layer631.setXmlParam (("x"), ("101"));
      Layer633.setXmlParam (("x"), ("177"));
      Button548.setXmlParam (("x"), ("28"));
      Button549.setXmlParam (("x"), ("68"));
      Button550.setXmlParam (("x"), ("28"));
      Button551.setXmlParam (("x"), ("68"));
      Button552.setXmlParam (("x"), ("28"));
      Button553.setXmlParam (("x"), ("68"));
      Button554.setXmlParam (("x"), ("148"));
      Button555.setXmlParam (("x"), ("148"));
      Button556.setXmlParam (("x"), ("148"));
      Layer557.setXmlParam (("x"), ("12"));
      Layer558.setXmlParam (("x"), ("100"));
      Layer559.setXmlParam (("x"), ("12"));
      Layer560.setXmlParam (("x"), ("100"));
      Layer561.setXmlParam (("x"), ("12"));
      Layer562.setXmlParam (("x"), ("100"));
      Layer563.setXmlParam (("x"), ("132"));
      Layer564.setXmlParam (("x"), ("132"));
      Layer565.setXmlParam (("x"), ("132"));
      Layer567.setXmlParam (("x"), ("48"));
      Layer569.setXmlParam (("x"), ("147"));
      Layer571.setXmlParam (("x"), ("41"));
      Button572.setXmlParam (("x"), ("206"));
      Button572.setXmlParam (("image"), ("player\.button\.viss2"));
      Button572.setXmlParam (("downimage"), ("player\.button\.viss2\.down"));
      Button573.setXmlParam (("x"), ("206"));
      Button573.setXmlParam (("image"), ("player\.button\.eqs"));
      Button573.setXmlParam (("downimage"), ("player\.button\.eqs\.down"));
      Button574.setXmlParam (("x"), ("210"));
      Button574.setXmlParam (("image"), ("player\.button\.ct"));
      Button574.setXmlParam (("downimage"), ("player\.button\.ct\.down"));
      Int154 = 149;
      Int155 = 350;
      Group135.setXmlParam (("background"), ("player\.visd\.bg"));
      Group134.setXmlParam (("background"), ("player\.eq\.bg"));
      Layer576.setXmlParam (("x"), ("9"));
      Layer576.setXmlParam (("image"), ("player\.textlabel6"));
      Layer578.setXmlParam (("x"), ("51"));
      Layer580.setXmlParam (("x"), ("178"));
      Layer582.setXmlParam (("x"), ("178"));
      Layer583.setXmlParam (("x"), ("63"));
      Layer584.setXmlParam (("x"), ("121"));
      Slider586.setXmlParam (("x"), ("13"));
      Slider588.setXmlParam (("x"), ("52"));
      Slider590.setXmlParam (("x"), ("66"));
      Slider592.setXmlParam (("x"), ("80"));
      Slider594.setXmlParam (("x"), ("94"));
      Slider596.setXmlParam (("x"), ("108"));
      Slider598.setXmlParam (("x"), ("122"));
      Slider600.setXmlParam (("x"), ("136"));
      Slider602.setXmlParam (("x"), ("150"));
      Slider604.setXmlParam (("x"), ("164"));
      Slider606.setXmlParam (("x"), ("178"));
      Slider608.setXmlParam (("x"), ("50"));
      Slider609.setXmlParam (("x"), ("127"));
      Text610.setXmlParam (("x"), ("179"));
      Button611.setXmlParam (("x"), ("206"));
      Button611.setXmlParam (("image"), ("player\.button\.eqs2"));
      Button611.setXmlParam (("downimage"), ("player\.button\.eqs2\.down"));
      Button612.setXmlParam (("x"), ("206"));
      Button612.setXmlParam (("image"), ("player\.button\.viss"));
      Button612.setXmlParam (("downimage"), ("player\.button\.viss\.down"));
      Button613.setXmlParam (("x"), ("210"));
      Button613.setXmlParam (("image"), ("player\.button\.ct"));
      Button613.setXmlParam (("downimage"), ("player\.button\.ct\.down"));
      Button615.setXmlParam (("x"), ("44"));
      Button616.setXmlParam (("x"), ("91"));
      Button618.setXmlParam (("x"), ("149"));
      if ((Int99 == 1))
	{
	  Group134.setXmlParam (("x"), ("349"));
	}
      else
	{
	  Group134.setXmlParam (("x"), ("149"));
	}
      if ((Int100 == 1))
	{
	  Group135.setXmlParam (("x"), ("349"));
	}
      else
	{
	  Group135.setXmlParam (("x"), ("149"));
	}
      if ((Int101 == 1))
	{
	  Group136.setXmlParam (("x"), ("349"));
	}
      else
	{
	  Group136.setXmlParam (("x"), ("149"));
	}
      Group110.setXmlParam (("x"), ("392"));
      Group110.setXmlParam (("background"), ("player\.ct\.listbg"));
      Group136.setXmlParam (("background"), ("player\.ct\.bg"));
      Group109.setXmlParam (("x"), ("350"));
      Group109.setXmlParam (("background"), ("player\.ct\.overlay"));
      Button635.setXmlParam (("x"), ("134"));
      Button4Class121.setXmlParam (("x"), ("5"));
      Button4Class121.setXmlParam (("image"), ("player\.button\.eqs"));
      Button4Class121.setXmlParam (("downimage"),
				   ("player\.button\.eqs\.down"));
      Button4Class122.setXmlParam (("x"), ("5"));
      Button4Class122.setXmlParam (("image"), ("player\.button\.viss"));
      Button4Class122.setXmlParam (("downimage"),
				   ("player\.button\.viss\.down"));
    }
  if ((Int527 == 1))
    {
      Group23.setXmlParam (("x"), ("202"));
      Layer529.setXmlParam (("x"), ("202"));
      Layer529.setXmlParam (("image"), ("player\.bgbase\.overlayx"));
      ToggleButton530.setXmlParam (("x"), ("346"));
      ToggleButton530.setXmlParam (("y"), ("92"));
      ToggleButton531.setXmlParam (("x"), ("350"));
      ToggleButton531.setXmlParam (("y"), ("67"));
      ToggleButton532.setXmlParam (("x"), ("352"));
      ToggleButton532.setXmlParam (("y"), ("42"));
      Button533.setXmlParam (("x"), ("345"));
      Button533.setXmlParam (("y"), ("179"));
      Layer535.setXmlParam (("x"), ("13"));
      Layer537.setXmlParam (("x"), ("322"));
      Layer537.setXmlParam (("y"), ("201"));
      Layer538.setXmlParam (("x"), ("337"));
      Layer538.setXmlParam (("y"), ("47"));
      Layer539.setXmlParam (("x"), ("334"));
      Layer539.setXmlParam (("y"), ("70"));
      Layer540.setXmlParam (("x"), ("331"));
      Layer540.setXmlParam (("y"), ("92"));
      Group541.setXmlParam (("x"), ("202"));
      Group541.setXmlParam (("background"), ("player\.eq\.buttonoverlayx"));
      Button542.setXmlParam (("x"), ("6"));
      Button542.setXmlParam (("image"), ("player\.button\.eqs2"));
      Button542.setXmlParam (("downimage"), ("player\.button\.eqs2\.down"));
      Button543.setXmlParam (("x"), ("6"));
      Button543.setXmlParam (("image"), ("player\.button\.viss2"));
      Button543.setXmlParam (("downimage"), ("player\.button\.viss2\.down"));
      Button544.setXmlParam (("x"), ("0"));
      Button544.setXmlParam (("image"), ("player\.button\.ctx"));
      Button544.setXmlParam (("downimage"), ("player\.button\.ctx\.down"));
      Button545.setXmlParam (("x"), ("362"));
      Button545.setXmlParam (("y"), ("131"));
      Layer547.setXmlParam (("x"), ("363"));
      Layer547.setXmlParam (("y"), ("151"));
      Button620.setXmlParam (("x"), ("26"));
      Button621.setXmlParam (("x"), ("0"));
      Button621.setXmlParam (("image"), ("player\.button\.ct2x"));
      Button621.setXmlParam (("downimage"), ("player\.button\.ct2x\.down"));
      Layer623.setXmlParam (("x"), ("76"));
      Layer625.setXmlParam (("x"), ("61"));
      Layer627.setXmlParam (("x"), ("26"));
      Layer629.setXmlParam (("x"), ("26"));
      Layer631.setXmlParam (("x"), ("84"));
      Layer633.setXmlParam (("x"), ("26"));
      Button548.setXmlParam (("x"), ("135"));
      Button549.setXmlParam (("x"), ("175"));
      Button550.setXmlParam (("x"), ("135"));
      Button551.setXmlParam (("x"), ("175"));
      Button552.setXmlParam (("x"), ("135"));
      Button553.setXmlParam (("x"), ("175"));
      Button554.setXmlParam (("x"), ("56"));
      Button555.setXmlParam (("x"), ("56"));
      Button556.setXmlParam (("x"), ("56"));
      Layer557.setXmlParam (("x"), ("119"));
      Layer558.setXmlParam (("x"), ("207"));
      Layer559.setXmlParam (("x"), ("119"));
      Layer560.setXmlParam (("x"), ("207"));
      Layer561.setXmlParam (("x"), ("119"));
      Layer562.setXmlParam (("x"), ("207"));
      Layer563.setXmlParam (("x"), ("40"));
      Layer564.setXmlParam (("x"), ("40"));
      Layer565.setXmlParam (("x"), ("40"));
      Layer567.setXmlParam (("x"), ("120"));
      Layer569.setXmlParam (("x"), ("57"));
      Layer571.setXmlParam (("x"), ("18"));
      Button572.setXmlParam (("x"), ("6"));
      Button572.setXmlParam (("image"), ("player\.button\.viss"));
      Button572.setXmlParam (("downimage"), ("player\.button\.viss\.down"));
      Button573.setXmlParam (("x"), ("6"));
      Button573.setXmlParam (("image"), ("player\.button\.eqs2"));
      Button573.setXmlParam (("downimage"), ("player\.button\.eqs2\.down"));
      Button574.setXmlParam (("x"), ("0"));
      Button574.setXmlParam (("image"), ("player\.button\.ctx"));
      Button574.setXmlParam (("downimage"), ("player\.button\.ctx\.down"));
      Int154 = 203;
      Int155 = 0;
      Group135.setXmlParam (("background"), ("player\.visd\.bgx"));
      Group134.setXmlParam (("background"), ("player\.eq\.bgx"));
      Layer576.setXmlParam (("x"), ("42"));
      Layer576.setXmlParam (("image"), ("player\.textlabel6x"));
      Layer578.setXmlParam (("x"), ("38"));
      Layer580.setXmlParam (("x"), ("206"));
      Layer582.setXmlParam (("x"), ("206"));
      Layer583.setXmlParam (("x"), ("60"));
      Layer584.setXmlParam (("x"), ("118"));
      Slider586.setXmlParam (("x"), ("206"));
      Slider588.setXmlParam (("x"), ("39"));
      Slider590.setXmlParam (("x"), ("53"));
      Slider592.setXmlParam (("x"), ("67"));
      Slider594.setXmlParam (("x"), ("81"));
      Slider596.setXmlParam (("x"), ("95"));
      Slider598.setXmlParam (("x"), ("109"));
      Slider600.setXmlParam (("x"), ("123"));
      Slider602.setXmlParam (("x"), ("137"));
      Slider604.setXmlParam (("x"), ("151"));
      Slider606.setXmlParam (("x"), ("165"));
      Slider608.setXmlParam (("x"), ("78"));
      Slider609.setXmlParam (("x"), ("155"));
      Text610.setXmlParam (("x"), ("207"));
      Button611.setXmlParam (("x"), ("6"));
      Button611.setXmlParam (("image"), ("player\.button\.eqs"));
      Button611.setXmlParam (("downimage"), ("player\.button\.eqs\.down"));
      Button612.setXmlParam (("x"), ("6"));
      Button612.setXmlParam (("image"), ("player\.button\.viss2"));
      Button612.setXmlParam (("downimage"), ("player\.button\.viss2\.down"));
      Button613.setXmlParam (("x"), ("0"));
      Button613.setXmlParam (("image"), ("player\.button\.ctx"));
      Button613.setXmlParam (("downimage"), ("player\.button\.ctx\.down"));
      Button615.setXmlParam (("x"), ("41"));
      Button616.setXmlParam (("x"), ("88"));
      Button618.setXmlParam (("x"), ("146"));
      if ((Int99 == 1))
	{
	  Group134.setXmlParam (("x"), ("0"));
	}
      else
	{
	  Group134.setXmlParam (("x"), ("202"));
	}
      if ((Int100 == 1))
	{
	  Group135.setXmlParam (("x"), ("0"));
	}
      else
	{
	  Group135.setXmlParam (("x"), ("202"));
	}
      if ((Int101 == 1))
	{
	  Group136.setXmlParam (("x"), ("0"));
	}
      else
	{
	  Group136.setXmlParam (("x"), ("202"));
	}
      Group110.setXmlParam (("x"), ("26"));
      Group110.setXmlParam (("background"), ("player\.ct\.listbgx"));
      Group136.setXmlParam (("background"), ("player\.ct\.bgx"));
      Group109.setXmlParam (("x"), ("202"));
      Group109.setXmlParam (("background"), ("player\.ct\.overlayx"));
      Button635.setXmlParam (("x"), ("0"));
      Button4Class121.setXmlParam (("x"), ("6"));
      Button4Class121.setXmlParam (("image"), ("player\.button\.eqs2"));
      Button4Class121.setXmlParam (("downimage"),
				   ("player\.button\.eqs2\.down"));
      Button4Class122.setXmlParam (("x"), ("6"));
      Button4Class122.setXmlParam (("image"), ("player\.button\.viss2"));
      Button4Class122.setXmlParam (("downimage"),
				   ("player\.button\.viss2\.down"));
    }
  return Null;
}