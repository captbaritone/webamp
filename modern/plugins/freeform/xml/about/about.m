#include <lib/std.mi>

Global Text section2;
Global Text section1;
Global Text codername2;
Global Text codername1;
Global Timer Timer6;
Global Int count;
Global Int Int8;
Global Int Int9;
Global Int Int10;
Global Int Int11;
Global Layer llamaanim;
Global Double smidge;


System.onScriptLoaded()
{
	Group sg;
	count = 0;
	sg = System.getScriptGroup();
	llamaanim = sg.findObject(( "logo"));
	llamaanim.fx_setBgFx(0);
	llamaanim.fx_setWrap(1);
	llamaanim.fx_setBilinear(1);
	llamaanim.fx_setAlphaMode(0);
	llamaanim.fx_setGridSize(1, 1);
	llamaanim.fx_setRect(0);
	llamaanim.fx_setClear(1);
	llamaanim.fx_setLocalized(1);
	llamaanim.fx_setRealtime(1);
	llamaanim.fx_setSpeed(50);
	llamaanim.fx_setEnabled(1);
	section2 = sg.findObject(( "txth1"));
	section1 = sg.findObject(( "txth2"));
	codername2 = sg.findObject(( "txtm1"));
	codername1 = sg.findObject(( "txtm2"));
	Int9 = section1.getGuiX();
	Int8 = section1.getGuiW();
	Int10 = section1.getGuiW();
	Int11 = section1.getGuiH();
	Timer6 = ( new Timer);
	Timer6.setDelay(6000);
	Timer6.start();
}

System.onScriptUnloading()
{
	delete Timer6;
}

Timer6.onTimer()
{
	String section;
	GuiObject GuiObject61;
	GuiObject GuiObject59;
	String codername;
	GuiObject GuiObject60;
	GuiObject GuiObject62;
	if(( count == 0)) {
		section1.setXmlParam(( "x"), System.integerToString(( - Int8)));
	}
	count ++;
	if(( count == 1)) {
		section = ( "Main Development");
		codername = ( "Ben Allison");
	}
	if(( count == 2)) {
		section = ( "Development");
		codername = ( "Martin Poehlmann");
	}
	if(( count == 3)) {
		section = ( "Product Management");
		codername = ( "Matt Callaway");
	}
	if(( count == 4)) {
		section = ( "Engineering Management");
		codername = ( "Ben London");
	}//Brennan Underwood, "Francis Gastellu"
	if(( count == 5)) {
		section = ( "Bento Skin");
		codername = ( "Martin Poehlmann, Taber Buhl");
	}
	if(( count == 6)) {
		section = ( "Modern Skin");
		codername = ( "Sven Kistner");
	}
	if(( count == 7)) {
		section = ( "Documentation");
		codername = ( "Ghislain Lacroix");
	}
	if(( count == 8)) {
		section = ( "Former Architecture Development");
		codername = ( "B Underwood, F Gastellu");
	}
	if(( count == 9)) {
		section = ( "Former Development");
		codername = ( "C Thibault, J Frankel, M Gerard");
	}
	if(( count == 10)) {
		count = 0;
		//count ++;
		section = ( "Powered by");
		codername = ( "Nullsoft Wasabi");
	}
		GuiObject59 = Null;
		GuiObject60 = Null;
		GuiObject61 = Null;
		GuiObject62 = Null;
	if(( System.frac(( count / 2)) != 0)) {
		GuiObject59 = section2;
		GuiObject60 = section1;
		GuiObject61 = codername2;
		GuiObject62 = codername1;
		section1.setText(section);
		codername1.setText(codername);
	} else {
		GuiObject59 = section1;
		GuiObject60 = section2;
		GuiObject61 = codername1;
		GuiObject62 = codername2;
		section2.setText(section);
		codername2.setText(codername);
	}
	GuiObject60.setTargetX(Int9);
	GuiObject59.setTargetX(( - Int8));
	GuiObject62.setTargetA(255);
	GuiObject61.setTargetA(0);
	GuiObject62.setTargetSpeed(2);
	GuiObject61.setTargetSpeed(2);
	GuiObject60.setTargetSpeed(2);
	GuiObject59.setTargetSpeed(2);
	GuiObject62.gotoTarget();
	GuiObject61.gotoTarget();
	GuiObject60.gotoTarget();
	GuiObject59.gotoTarget();
}

llamaanim.fx_onGetPixelR(double r, double d, double x, double y)
{
	return ( r + ( System.cos(smidge) * ( 0.5)));
}

llamaanim.fx_onFrame()
{
	smidge = ( smidge + ( 0.100000001490116));
}


