/**
 * dispatch_ifc.m
 *
 * defines a function interface for dispatchable messaging
 * define DISPATCH before loading if you are a message reciever
 *
 * @author mpdeimos
 * @date 2008/10/25
 * @version 0.1
 */

#ifndef included
#error This script can only be compiled as a #include
#endif

Function initDispatcher();			// Call this function on startup to set the parent layout as dispatcher
Function setDispatcher(GuiObject dispatcher);	// Call this function instead if you want to define a custom

#ifndef DISPATCH
// Sends a message to the parent layout
Function int sendMessage(int message, int i0, int i1, int i2, String s0, String s1, GuiObject obj);
Function int sendMessageI(int message, int i0);	
Function int sendMessageI2(int message, int i0, int i1);	
Function int sendMessageS(int message, String s0);	
Function int sendMessageO(int message, GuiObject obj);
Function int sendMessageV(int message);
#endif

#ifdef DISPATCH
// Recieves Messages
Function int onMessage(int message, int i0, int i1, int i2, String s0, String s1, GuiObject obj);
int onMessage(int message, int i0, int i1, int i2, String s0, String s1, GuiObject obj) {} // STUB! Implement this in your code
#endif


///
///	IMPLEMENTATION
///


Global GuiObject dispatcher;

initDispatcher()
{
	dispatcher = getScriptGroup().getParentLayout();
}

setDispatcher(GuiObject go)
{
	dispatcher = go;
}


#ifndef DISPATCH

int sendMessage(int message, int i0, int i1, int i2, String s0, String s1, GuiObject obj)
{
	return dispatcher.onAction (s0, s1, message, i0, i1, i2, obj);
}

int sendMessageI(int message, int i0)
{
	GuiObject obj = NULL;
	return sendMessage(message, i0, i1, 0, "", "", obj);
}

int sendMessageI2(int message, int i0, int i1)
{
	GuiObject obj = NULL;
	return sendMessage(message, i0, 0, 0, "", "", obj);
}

int sendMessageS(int message, String s0)
{
	GuiObject obj = NULL;
	return sendMessage(message, 0, 0, 0, s0, "", obj);
}

int sendMessageO(int message, GuiObject obj)
{
	return sendMessage(message, 0, 0, 0, "", "", obj);
}

int sendMessageV(int messagej)
{
	GuiObject obj = NULL;
	return sendMessage(message, 0, 0, 0, "", "", obj);
}

#endif

#ifdef DISPATCH

dispatcher.onAction(String action, String param, Int message, int y, int p1, int p2, GuiObject source)
{
	return onMessage(message, y, p1, p2, action, param, source);
}

#endif