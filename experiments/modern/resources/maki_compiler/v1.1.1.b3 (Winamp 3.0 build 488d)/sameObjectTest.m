#include "lib/std.mi"

Global Button play_button, pause_button, another_button;

play_button.onLeftClick () {
	System.messageBox("Play Button Click in sameObjectTest", "Hello Title", 1, "");
}
pause_button.onLeftClick () {
	System.messageBox("Pause Button Click in sameObjectTest", "Hello Title", 1, "");
}

System.onScriptLoaded()
{
    if (play_button == pause_button) {
        messageBox("empty object equal each other", "Success", 0, "");
    } else {
        messageBox("empty object equal each other", "Fail", 1, "");
    }

    Layout normal = getContainer("main").getLayout("normal");
	play_button = normal.findObject("Play");
	pause_button = normal.findObject("Play");
    if (play_button == pause_button) {
        messageBox("same object equal each other", "Success", 0, "");
    } else {
        messageBox("same object equal each other", "Fail", 1, "");
    }

	another_button = normal.findObject("Pause");
    if (play_button != another_button) {
        messageBox("different objects do not equal each other", "Success", 0, "");
    } else {
        messageBox("different objects do not equal each other", "Fail", 1, "");
    }
}
