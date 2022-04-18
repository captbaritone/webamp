#include "..\..\..\lib/std.mi"

Global AnimatedLayer volume;

Function setVolumeAnim(int volValue);

System.onScriptLoaded(){

    Group player = getScriptGroup();

    volume = player.getObject("volume"); //28 frames

    setVolumeAnim(System.getVolume());

}

System.onVolumeChanged(Int intVolume) {
  setVolumeAnim(intVolume);
}

setVolumeAnim(int Value) {
	int f = (Value * (volume.getLength()-1)) / 255;
    if (Value > 0) {
		volume.gotoFrame(f+1);
	}
	if (Value == 255) {
		volume.gotoFrame(f);
	}
	if (Value == 0) {
		volume.gotoFrame(0);
	}
}