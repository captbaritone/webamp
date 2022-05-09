#include "..\..\..\lib/std.mi"

Function isTitleValid(String toTest);

isTitleValid(String toTest){
    // lord forgive me for what i'm about to do
    int stringLength = System.strlen(toTest);

    for(int i = 0; i < stringLength; i++){
        String currentChar = System.strmid(toTest, i, 1);

        if(currentChar == "A") continue;
        else if(currentChar == "B") continue;
        else if(currentChar == "C") continue;
        else if(currentChar == "D") continue;
        else if(currentChar == "E") continue;
        else if(currentChar == "F") continue;
        else if(currentChar == "G") continue;
        else if(currentChar == "H") continue;
        else if(currentChar == "I") continue;
        else if(currentChar == "J") continue;
        else if(currentChar == "K") continue;
        else if(currentChar == "L") continue;
        else if(currentChar == "M") continue;
        else if(currentChar == "N") continue;
        else if(currentChar == "O") continue;
        else if(currentChar == "P") continue;
        else if(currentChar == "Q") continue;
        else if(currentChar == "R") continue;
        else if(currentChar == "S") continue;
        else if(currentChar == "T") continue;
        else if(currentChar == "U") continue;
        else if(currentChar == "V") continue;
        else if(currentChar == "W") continue;
        else if(currentChar == "X") continue;
        else if(currentChar == "Y") continue;
        else if(currentChar == "Z") continue;
        else if(currentChar == "0") continue;
        else if(currentChar == "1") continue;
        else if(currentChar == "2") continue;
        else if(currentChar == "3") continue;
        else if(currentChar == "4") continue;
        else if(currentChar == "5") continue;
        else if(currentChar == "6") continue;
        else if(currentChar == "7") continue;
        else if(currentChar == "8") continue;
        else if(currentChar == "9") continue;
        else if(currentChar == ".") continue;
        else if(currentChar == ",") continue;
        else if(currentChar == "_") continue;
        else if(currentChar == ":") continue;
        else if(currentChar == "(") continue;
        else if(currentChar == ")") continue;
        else if(currentChar == "-") continue;
        else if(currentChar == " ") continue;
        else return false;
    }

    return true; 
}