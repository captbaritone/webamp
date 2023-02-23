#include "../../../lib/fileio.mi"
#include "../../../lib/application.mi"

Function initDetector();

Global File myCheckerDoc;
Global boolean IsWACUP;
Global String wacuptest;

initDetector(){

    myCheckerDoc = new File;
    wacuptest = (Application.GetSettingsPath()+"/Plugins/dsp_wc.ini");
    myCheckerDoc.load (wacuptest);

    if(myCheckerDoc.exists())
    {
        IsWACUP = 1;
    }
    else
    {
        IsWACUP = 0;
    }
}