#include "lib/std.mi"

Global Button play_button;

play_button.onLeftClick () {
	messageBox("play_button.onLeftClick", "Success", 0, "");
}

System.onScriptLoaded()
{
	messageBox("onScriptLoaded", "Success", 0, "");

	play_button = getContainer("main").getLayout("normal").findObject("Play");

	play_button.leftClick();
}
