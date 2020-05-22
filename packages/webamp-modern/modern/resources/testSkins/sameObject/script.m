#include "lib/std.mi"

Global Button play_button, pause_button, another_button;

play_button.onLeftClick () {
	messageBox("play_button.onLeftClick", "Success", 0, "");
}
pause_button.onLeftClick () {
	messageBox("pause_button.onLeftClick", "Success", 0, "");
}

System.onScriptLoaded()
{
    if (play_button == another_button) {
        messageBox("empty object equal each other", "Success", 0, "");
    } else {
        messageBox("empty object equal each other", "Fail", 1, "");
    }

    Layout normal = getContainer("main").getLayout("normal");
	play_button = normal.findObject("Play");
	another_button = normal.findObject("Play");
    if (play_button == another_button) {
        messageBox("same object equal each other", "Success", 0, "");
    } else {
        messageBox("same object equal each other", "Fail", 1, "");
    }

	pause_button = normal.findObject("Pause");
    if (play_button != pause_button) {
        messageBox("different objects do not equal each other", "Success", 0, "");
    } else {
        messageBox("different objects do not equal each other", "Fail", 1, "");
    }
}
