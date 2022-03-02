#include "lib/std.mi"
// To compile in VM:
// From within this directoy (so the compiled .maki file ends up here)
// & '..\..\..\..\..\..\..\webamp-modern\resources\maki_compiler\v1.2.0 (Winamp 5.66)\mc.exe' .\assertions.m

Global GuiList resultsList;
Function Boolean assert(Boolean isTrue, String code, String description);

// This is our special test function we wraps messageBox for now.
// In the future this should be a function that renders a green/red box in a
// skin.
Boolean assert(Boolean isTrue, String code, String description) {
	String response;
	if(isTrue) {
		resultsList.addItem("SUCCESS");
	} else {
		resultsList.addItem("FAILURE");
	}
	
	Int i = resultsList.getLastAddedItemPos();
	resultsList.setSubItem(i, 1, code);
	resultsList.setSubItem(i, 2, description);
}

System.onScriptLoaded()
{ 
	Group systemGroup;
	systemGroup = System.getScriptGroup();
	if(systemGroup == null) {
		System.messageBox("Null", "Null", 0, "Null");
	}
	resultsList = systemGroup.getObject("results");

	assert(1 + 1 == 2, "1 + 1 == 2", "Summing two integers results in an integer");
	assert(3 / 2 == 1.5, "3 / 2 == 1.5", "Division of two integers results in a float");
	assert(1 + 1.5 == 2.5, "1 + 1.5 == 2.5", "Summing an integer and a float results in a float");
	assert(1.5 + 1 == 2.5, "1.5 + 1 == 2.5", "Summing a float and an integer results in a float");
}