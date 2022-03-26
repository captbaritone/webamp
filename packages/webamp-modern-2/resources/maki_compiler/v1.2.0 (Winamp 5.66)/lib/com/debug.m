/*---------------------------------------------------
-----------------------------------------------------
Filename:	debug.m
Version:	1.2

Type:		maki/attrib loader
Date:		29. Aug. 2006 - 23:43 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#ifndef included
#error This script can only be compiled as a #include
#endif

#ifndef DEBUG
#define debugString //
#endif

#ifdef DEBUG

#define DEBUG_PREFIX "["+ FILE_NAME +": " + getTimeStamp() + "] " + 

Function String getTimeStamp();
String getTimeStamp()
{
	int msc = getTimeOfDay();
	int h = msc / 1000 / 3600;
	msc -= h * 1000 * 3600;
	int m = msc / 1000 / 60;
	msc -= m * 1000 * 60;
	int s = msc / 1000;
	msc -= s * 1000;
	string zeros = "";
	if (msc < 100)
	{	
		zeros += "0";
	}
	if (msc < 10)
	{	
		zeros += "0";
	}
	return integerToString(h)+":"+integerToString(m)+":"+integerToString(s)+"."+zeros+integerToString(msc);
}

#define D_WTF 9
#define D_NWTF 9

#endif