#include "lib/std.mi"

Function CustomFunction();

CustomFunction() {
	messageBox("Called a custom function", "Success", 0, "");
}
	
System.onScriptLoaded() {
	// Add a conditional so that the compiler does not inline the function
	if (1) CustomFunction(); 
}