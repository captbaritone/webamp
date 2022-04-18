#include "..\..\..\lib/std.mi"

Global layer posbarbg;

System.onScriptLoaded(){

    Group player = getScriptGroup();

    posbarbg = player.findObject("posbarbg");

    if(getStatus() == 1){
        posbarbg.setXmlParam("visible", "1");
    }else if(getStatus() == -1){
        posbarbg.setXmlParam("visible", "1");
    }else if(getStatus() == 0){
        posbarbg.setXmlParam("visible", "0");
    }
}

System.onPlay(){
    posbarbg.setXmlParam("visible", "1");
}

System.onStop(){
    posbarbg.setXmlParam("visible", "0");
}