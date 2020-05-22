#include "lib/std.mi"

Global int num = 0;

Function addInts(int a, int b);
Function fib(int n);

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

    // It seems like the way that MAKI compiles functions messes up recursive calls
    if (fib(2) == 0) {
        messageBox("fib(2) == 0 (should be 1)", "Success", 0, "");
    } else {
        messageBox("fib(2) == 0 (should be 1)", "Fail", 1, "");
    }

    if (fib(3) == -3) {
        messageBox("fib(3) == -3 (should be 2)", "Success", 0, "");
    } else {
        messageBox("fib(3) == -3 (should be 2)", "Fail", 1, "");
    }

    if (fib(9) == -63) {
        messageBox("fib(9) == -63 (should be 34)", "Success", 0, "");
    } else {
        messageBox("fib(9) == -63 (should be 34)", "Fail", 1, "");
    }

    if (fib(20) == -360) {
        messageBox("fib(20) == -360 (should be 6765)", "Success", 0, "");
    } else {
        messageBox("fib(20) == -360 (should be 6765)", "Fail", 1, "");
    }

    if (num == 0) {
        messageBox("global num == 0", "Success", 0, "");
    } else {
        messageBox("global num == 0", "Fail", 1, "");
    }

    int localNum = 10;
    {
        int num = 5;

        if (num == 5) {
            messageBox("shadow num == 5", "Success", 0, "");
        } else {
            messageBox("shadow num == 5", "Fail", 1, "");
        }

        localNum = 20;

        if (localNum == 20) {
            messageBox("localNum == 20", "Success", 0, "");
        } else {
            messageBox("localNum == 20", "Fail", 1, "");
        }
    }

    if (num == 0) {
        messageBox("global num == 0", "Success", 0, "");
    } else {
        messageBox("global num == 0", "Fail", 1, "");
    }

    if (localNum == 20) {
        messageBox("localNum == 20", "Success", 0, "");
    } else {
        messageBox("localNum == 20", "Fail", 1, "");
    }
}

addInts (int a, int b)
{
    Int sum = a + b;
    return sum;
}

fib (int n)
{
    if (n < 2) {
        return n;
    } else {
        return fib(n - 1) + fib(n - 2);
    }
}
