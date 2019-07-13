#include "lib/std.mi"

Function addInts(int a, int b);

System.onScriptLoaded()
{
    Int two = 2;
	Int sum = addInts(two, two);
    if (sum == 4) {
        messageBox("simple custom function", "Success", 0, "");
    } else {
        messageBox("simple custom function", "Fail", 1, "");
    }

    Double val = 2.2;
	sum = addInts(two, val);
    if (sum == 4) {
        messageBox("simple custom function with implicit cast", "Success", 0, "");
    } else {
        messageBox("simple custom function with implicit cast", "Fail", 1, "");
    }
}

addInts (int a, int b)
{
    Int sum = a + b;
    return sum;
}
