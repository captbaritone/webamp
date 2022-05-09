#include "..\..\..\lib/std.mi"

Global layer posbarbg, nums_ex;

System.onScriptLoaded(){

    Group player = getScriptGroup();

    posbarbg = player.findObject("posbarbg");
    nums_ex = player.findObject("nums_ex_disabled_dash");

    if(getStatus() == 1){
        posbarbg.setXmlParam("visible", "1");
        nums_ex.setXmlParam("visible", "1");
    }else if(getStatus() == -1){
        posbarbg.setXmlParam("visible", "1");
        nums_ex.setXmlParam("visible", "1");
    }else if(getStatus() == 0){
        posbarbg.setXmlParam("visible", "0");
        nums_ex.setXmlParam("visible", "0");
    }
}

System.onPlay(){
    posbarbg.setXmlParam("visible", "1");
    nums_ex.setXmlParam("visible", "1");
}

System.onStop(){
    posbarbg.setXmlParam("visible", "0");
    nums_ex.setXmlParam("visible", "0");
}