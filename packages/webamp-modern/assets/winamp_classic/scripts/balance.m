#include "..\..\..\lib/std.mi"

Global AnimatedLayer anlBalance;
Global Slider Balance;

System.onScriptLoaded() {
	Group player = getScriptGroup();

	anlBalance = player.getObject("balance");
	Balance = player.getObject("balancewa2");

  int v = Balance.GetPosition();
  
	if (v==127) anlBalance.gotoFrame(15);
	if (v<127) v = (27-(v/127)*27); 
	if (v>127) v = ((v-127)/127)*27;
	
  anlBalance.gotoFrame(v);
}

Balance.onSetPosition(int newpos)
{
  int v = newpos;
  
	if (newpos==127) anlBalance.gotoFrame(15);
	if (newpos<127) v = (27-(newpos/127)*27); 
	if (newpos>127) v = ((newpos-127)/127)*27;
	
  anlBalance.gotoFrame(v);
}
