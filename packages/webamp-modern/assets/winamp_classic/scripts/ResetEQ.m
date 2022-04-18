#include "..\..\..\lib/std.mi"

Global Group EQg;
Global Button btnreset, btnclose;
Global int eq1, eq2, eq3, eq4, eq5, eq6, eq7, eq8;

System.onScriptLoaded(){

    EQg = getScriptGroup();
	btnreset = EQg.findObject("reset");
    btnclose = EQg.findObject("close");

    eq1 = getEqBand(0);
    eq2 = getEqBand(1);
    eq3 = getEqBand(2);
    eq4 = getEqBand(3);
    eq5 = getEqBand(4);
    eq6 = getEqBand(5);
    eq7 = getEqBand(6);
    eq8 = getEqBand(7);

}

btnreset.onLeftClick() {
	setEqBand(0, eq1);
    setEqBand(1, eq2);
    setEqBand(2, eq3);
    setEqBand(3, eq4);
    setEqBand(4, eq5);
    setEqBand(5, eq6);
    setEqBand(6, eq7);
    setEqBand(7, eq8);
}

btnclose.onLeftClick(){
    eq1 = getEqBand(0);
    eq2 = getEqBand(1);
    eq3 = getEqBand(2);
    eq4 = getEqBand(3);
    eq5 = getEqBand(4);
    eq6 = getEqBand(5);
    eq7 = getEqBand(6);
    eq8 = getEqBand(7);
}

System.onHideLayout(Layout EQ){
    eq1 = getEqBand(0);
    eq2 = getEqBand(1);
    eq3 = getEqBand(2);
    eq4 = getEqBand(3);
    eq5 = getEqBand(4);
    eq6 = getEqBand(5);
    eq7 = getEqBand(6);
    eq8 = getEqBand(7);
}