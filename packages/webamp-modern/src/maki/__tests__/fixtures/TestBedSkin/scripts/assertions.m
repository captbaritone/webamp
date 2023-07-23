#include "lib/std.mi"
// To compile in VM:
// Navitage to the directory containing this file;
// Z:\projects\webamp\packages\webamp-modern\src\maki\__tests__\fixtures\TestBedSkin\scripts
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
	assert("Hello" + " world" == "Hello world", "String concatenation", "String concatenation works");
	assert(1024 << 2 == 4096, "1024 << 2 == 4096", "Left shift works");
	assert(1024 >> 2 == 256, "1024 >> 2 == 256", "Right shift works");
	assert(-5 == -5, "-5 == -5", "Unary negative");

	Int incrementMe = 5;
	assert(incrementMe++ == 5, "5++ == 5", "Postfix increment works");
	incrementMe = 5;
	assert((incrementMe += 1) == 6, "(incrementMe += 1) == 6", "Plus equals works");

	incrementMe = 5;
	assert((incrementMe -= 1) == 4, "(incrementMe -= 1) == 4", "Minus equals works");

	incrementMe = 5;
	assert((incrementMe /= 2) == 2.5, "(incrementMe /= 2) == 2.5", "Divide equals works");
	assert(incrementMe == 2.5, "(incrementMe /= 2) == 2.5", "Divide equals works");

	incrementMe = 5;
	assert(++incrementMe == 6, "++5 == 6", "Prefix increment works");


	// An opcode exists for this, but the compiler chokes on it.
	// assert(~5 == -6, "~5 == -6", "Bitwise negation works");

	// Assignment
	Int x = 10;
	Int y = x;
	assert(x == y, "x == y", "Assignment works");
	Int z = x = 100;
	assert(z == 100, "z == 10", "Assignment returns a value");
	assert(x == 100, "x == 10", "Assignment returns a value");

	// Mov semantics

	// Maybe primitivs go on the stack as values, and objects go on the stack as pointers?

	// 1
	// "Hello"
	// <memeory addres 12093211923> <-- Some object?

	// Move would not make sense on primitives?


	// If pushing an object onto the stack just pushes a pointer (variables table offset) then, to mov
	// woud look like:

	// mov 1, 2

	// What if the values on the stack are all offsets into to variables
	// but the value in the variables table is actualy a pointer to the heap?

	// In that case, a mov is saying lookup the pointer in variable 1 and set it
	// as the pointer in variable 2

	// For primitives, it could copy the actual values not pointers


	Group myGroup = System.getScriptGroup();
	Group myOtherGroup = myGroup;

	assert(myGroup.isLayout() == true, "myGroup.isLayout() == true", "isLayout works on original value");
	assert(myOtherGroup.isLayout() == true, "myOtherGroup.isLayout() == true", "isLayout works on moved value");

	// Question to answer: Are there such things as primitives which like
	// exclusively on the stack and never get assigned into the variables table?

	1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10;

	Int a = 12345;
	a++;

	// I believe the stack can be thought of as consisting of offsets into the
	// variables table. Every value that exists in maki has a place in the
	// variables table, including primitives and values not assigned to
	// variables.

	Double b = 12345.0;

	Int c = 155 + 255;

	Boolean x = new Group.isLayout();
}