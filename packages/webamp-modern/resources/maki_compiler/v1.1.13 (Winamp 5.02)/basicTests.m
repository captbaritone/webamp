#include "lib/std.mi"

System.onScriptLoaded()
{
	Int sum = 2 + 2;
    if (sum == 4) {
        messageBox("2 + 2 = 4", "Success", 0, "");
    } else {
        messageBox("2 + 2 = 4", "Fail", 1, "");
    }

    Float sumFloat = 2.2 + 2.2;
    if (sumFloat == 4.4) {
        messageBox("2.2 + 2.2 = 4.4", "Success", 0, "");
    } else {
        messageBox("2.2 + 2.2 = 4.4", "Fail", 1, "");
    }

    if (sum + sumFloat == sumFloat + sum) {
        messageBox("4 + 4.4 = 4.4 + 4 (not implict casting)", "Success", 0, "");
    } else {
        messageBox("4 + 4.4 = 4.4 + 4 (not implict casting)", "Fail", 1, "");
    }

    if (true + true == 2) {
        messageBox("#t + #t = 2", "Success", 0, "");
    } else {
        messageBox("#t + #t = 2", "Fail", 1, "");
    }

    if (3 - 2 == 1) {
        messageBox("3 - 2 = 1", "Success", 0, "");
    } else {
        messageBox("3 - 2 = 1", "Fail", 1, "");
    }

    if (3 - -2 == 5) {
        messageBox("3 - -2 = 5", "Success", 0, "");
    } else {
        messageBox("3 - -2 = 5", "Fail", 1, "");
    }

    if (3.5 - 2 == 1.5) {
        messageBox("3.5 - 2 = 1.5", "Success", 0, "");
    } else {
        messageBox("3.5 - 2 = 1.5", "Fail", 1, "");
    }

    if (2 * 3 == 6) {
        messageBox("2 * 3 = 6", "Success", 0, "");
    } else {
        messageBox("2 * 3 = 6", "Fail", 1, "");
    }

    if (2 * 1.5 == 3) {
        messageBox("2 * 1.5 = 3", "Success", 0, "");
    } else {
        messageBox("2 * 1.5 = 3", "Fail", 1, "");
    }

    if (true * 3 == 3) {
        messageBox("#t * 3 = 3", "Success", 0, "");
    } else {
        messageBox("#t * 3 = 3", "Fail", 1, "");
    }

    if (false * 3 == 0) {
        messageBox("#f * 3 = 0", "Success", 0, "");
    } else {
        messageBox("#f * 3 = 0", "Fail", 1, "");
    }

    if (true * 0.25 == 0.25) {
        messageBox("#t * 0.25 = 0.25", "Success", 0, "");
    } else {
        messageBox("#t * 0.25 = 0.25", "Fail", 1, "");
    }

    if (0.25 * true == 0.25) {
        messageBox("0.25 * #t = 0.25", "Success", 0, "");
    } else {
        messageBox("0.25 * #t = 0.25", "Fail", 1, "");
    }

    if (false * 0.25 == 0) {
        messageBox("#f * 0.25 = 0", "Success", 0, "");
    } else {
        messageBox("#f * 0.25 = 0", "Fail", 1, "");
    }

    if (6 / 3 == 2) {
        messageBox("6 / 3 = 2", "Success", 0, "");
    } else {
        messageBox("6 / 3 = 2", "Fail", 1, "");
    }

    if (3 / 2 == 1.5) {
        messageBox("3 / 2 = 1.5", "Success", 0, "");
    } else {
        messageBox("3 / 2 = 1.5", "Fail", 1, "");
    }

    if (5 % 2 == 1) {
        messageBox("5 % 2 = 1", "Success", 0, "");
    } else {
        messageBox("5 % 2 = 1", "Fail", 1, "");
    }

    if (5.5 % 2 == 1) {
        messageBox("5.5 % 2 = 1 (implict casting)", "Success", 0, "");
    } else {
        messageBox("5.5 % 2 = 1 (implict casting)", "Fail", 1, "");
    }

    if (3 & 2 == 2) {
        messageBox("3 & 2 = 2", "Success", 0, "");
    } else {
        messageBox("3 & 2 = 2", "Fail", 1, "");
    }

    if (3 | 2 == 3) {
        messageBox("3 | 2 = 3", "Success", 0, "");
    } else {
        messageBox("3 | 2 = 3", "Fail", 1, "");
    }

    if (2 << 1 == 4) {
        messageBox("2 << 1 = 4", "Success", 0, "");
    } else {
        messageBox("2 << 1 = 4", "Fail", 1, "");
    }

    if (4 >> 1 == 2) {
        messageBox("4 >> 1 = 2", "Success", 0, "");
    } else {
        messageBox("4 >> 1 = 2", "Fail", 1, "");
    }

    if (2.5 << 1 == 4) {
        messageBox("2.5 << 1 = 4 (implict casting)", "Success", 0, "");
    } else {
        messageBox("2.5 << 1 = 4 (implict casting)", "Fail", 1, "");
    }

    if (4.5 >> 1 == 2) {
        messageBox("4.5 >> 1 = 2 (implict casting)", "Success", 0, "");
    } else {
        messageBox("4.5 >> 1 = 2 (implict casting)", "Fail", 1, "");
    }

    Int one = 1;
    Int two = 2;
    if (one != two) {
        messageBox("1 != 2", "Success", 0, "");
    } else {
        messageBox("1 != 2", "Fail", 1, "");
    }

    if (one < two) {
        messageBox("1 < 2", "Success", 0, "");
    } else {
        messageBox("1 < 2", "Fail", 1, "");
    }

    if (two > one) {
        messageBox("2 > 1", "Success", 0, "");
    } else {
        messageBox("2 > 1", "Fail", 1, "");
    }

    if (sum == sumFloat) {
        messageBox("[int] 4 = [float] 4.4 (autocasting types)", "Success", 0, "");
    } else {
        messageBox("[int] 4 = [float] 4.4 (autocasting types)", "Fail", 1, "");
    }

    if (!(sumFloat == sum)) {
        messageBox("! [float] 4.4 = [int] 4 (not autocasting types)", "Success", 0, "");
    } else {
        messageBox("! [float] 4.4 = [int] 4 (not autocasting types)", "Fail", 1, "");
    }

    if (sumFloat != sum) {
        messageBox("[float] 4.4 != [int] 4 (not autocasting types)", "Success", 0, "");
    } else {
        messageBox("[float] 4.4 != [int] 4 (not autocasting types)", "Fail", 1, "");
    }

    if (!(sum != sumFloat)) {
        messageBox("! [int] 4 != [float] 4.4 (autocasting types)", "Success", 0, "");
    } else {
        messageBox("! [int] 4 != [float] 4.4 (autocasting types)", "Fail", 1, "");
    }

    if (sum <= sumFloat) {
        messageBox("[int] 4 <= [float] 4.4 (autocasting types)", "Success", 0, "");
    } else {
        messageBox("[int] 4 <= [float] 4.4 (autocasting types)", "Fail", 1, "");
    }

    if (sum >= sumFloat) {
        messageBox("[int] 4 >= [float] 4.4 (autocasting types)", "Success", 0, "");
    } else {
        messageBox("[int] 4 >= [float] 4.4 (autocasting types)", "Fail", 1, "");
    }

    if (!(sumFloat <= sum)) {
        messageBox("! [float] 4.4 <= [int] 4 (not autocasting types)", "Success", 0, "");
    } else {
        messageBox("! [float] 4.4 <= [int] 4 (not autocasting types)", "Fail", 1, "");
    }

    if (sumFloat >= sum) {
        messageBox("[float] 4.4 >= [int] 4 (not autocasting types)", "Success", 0, "");
    } else {
        messageBox("[float] 4.4 >= [int] 4 (not autocasting types)", "Fail", 1, "");
    }


    if (!(sum < sumFloat)) {
        messageBox("! [int] 4 < [float] 4.4 (autocasting types)", "Success", 0, "");
    } else {
        messageBox("! [int] 4 < [float] 4.4 (autocasting types)", "Fail", 1, "");
    }

    if (!(sumFloat < sum)) {
        messageBox("! [float] 4.4 < [int] 4 (not autocasting types)", "Success", 0, "");
    } else {
        messageBox("! [float] 4.4 < [int] 4 (not autocasting types)", "Fail", 1, "");
    }

    if (!(sum > sumFloat)) {
        messageBox("! [int] 4 > [float] 4.4 (autocasting types)", "Success", 0, "");
    } else {
        messageBox("! [int] 4 > [float] 4.4 (autocasting types)", "Fail", 1, "");
    }

    if (sumFloat > sum) {
        messageBox("[float] 4.4 > [int] 4 (not autocasting types)", "Success", 0, "");
    } else {
        messageBox("[float] 4.4 > [int] 4 (not autocasting types)", "Fail", 1, "");
    }

    Int tempOne = 1;
    if (tempOne++ == one) {
        messageBox("1++ = 1", "Success", 0, "");
    } else {
        messageBox("1++ = 1", "Fail", 1, "");
    }

    if (tempOne == two) {
        messageBox("1++ (after incremeent) = 2", "Success", 0, "");
    } else {
        messageBox("1++ (after incremeent) = 2", "Fail", 1, "");
    }

    tempOne = 1;

    Int tempTwo = 2;
    if (tempTwo-- == two) {
        messageBox("2-- = 2", "Success", 0, "");
    } else {
        messageBox("2-- = 2", "Fail", 1, "");
    }

    if (tempTwo-- == one) {
        messageBox("2-- (after decrement) = 1", "Success", 0, "");
    } else {
        messageBox("2-- (after decrement) = 1", "Fail", 1, "");
    }

    tempTwo = 2;

    if (++tempOne == 2) {
        messageBox("++1 = 2", "Success", 0, "");
    } else {
        messageBox("++1 = 2", "Fail", 1, "");
    }

    tempOne = 1;

    // Fails to compile with: "Expression: cb != NULL"
    // ????
    // if (--tempOne == 0) {
    //     messageBox("++1 = 2", "Success", 0, "");
    // } else {
    //     messageBox("++1 = 2", "Fail", 1, "");
    // }

    Boolean f = false;
    if (!f) {
        messageBox("!#f", "Success", 0, "");
    } else {
        messageBox("!#f", "Fail", 1, "");
    }

    if (!0) {
        messageBox("!0", "Success", 0, "");
    } else {
        messageBox("!0", "Fail", 1, "");
    }

    if (!1 == false) {
        messageBox("!1 == #f", "Success", 0, "");
    } else {
        messageBox("!1 == #f", "Fail", 1, "");
    }

    if (1 == true) {
        messageBox("1 == #t", "Success", 0, "");
    } else {
        messageBox("1 == #t", "Fail", 1, "");
    }

    if (0 == false) {
        messageBox("0 == #f", "Success", 0, "");
    } else {
        messageBox("0 == #f", "Fail", 1, "");
    }

    if (true && true) {
        messageBox("#t && #t", "Success", 0, "");
    } else {
        messageBox("#t && #t", "Fail", 1, "");
    }

    if (!(true && false)) {
        messageBox("!(#t && #f)", "Success", 0, "");
    } else {
        messageBox("!(#t && #f)", "Fail", 1, "");
    }

    if (!(false && false)) {
        messageBox("!(#f && #f)", "Success", 0, "");
    } else {
        messageBox("!(#f && #f)", "Fail", 1, "");
    }

    if (true || true) {
        messageBox("#t || #t", "Success", 0, "");
    } else {
        messageBox("#t || #t", "Fail", 1, "");
    }

    if (true || false) {
        messageBox("#t || #f", "Success", 0, "");
    } else {
        messageBox("#t || #f", "Fail", 1, "");
    }

    if (false || true) {
        messageBox("#f || #t", "Success", 0, "");
    } else {
        messageBox("#f || #t", "Fail", 1, "");
    }

    if (!(false || false)) {
        messageBox("!(#f || #f)", "Success", 0, "");
    } else {
        messageBox("!(#f || #f)", "Fail", 1, "");
    }

    Int n = 1;
    if (true || ++n) {
        if (n == 2) {
            messageBox("#t || ++n (doesn't short circuit)", "Success", 0, "");
        } else {
            messageBox("#t || ++n (did short circuit)", "Fail", 1, "");
        }
    } else {
        messageBox("#t || ++n", "Fail", 1, "");
    }

    if (!(false && ++n)) {
        if (n == 3) {
            messageBox("!(#f && ++ n) (doesn't short circuit)", "Success", 0, "");
        } else {
            messageBox("!(#f && ++ n) (did short circuit)", "Fail", 1, "");
        }
    } else {
        messageBox("!(#f && ++ n)", "Fail", 1, "");
    }
}
