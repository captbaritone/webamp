/*---------------------------------------------------
-----------------------------------------------------
Filename:	browser.m
Version:	4.1

Type:		maki
Date:		23. Jan. 2008 - 10:06 
Author:		Martin Poehlmann aka Deimos
E-Mail:		martin@skinconsortium.com
Internet:	www.skinconsortium.com
		www.martin.deimos.de.vu
-----------------------------------------------------
---------------------------------------------------*/

#include <lib/std.mi>
#include <lib/config.mi>
#include <lib/fileio.mi>
#include <lib/application.mi>
#include <lib/private.mi>

#define RELEASE
#define FILE_NAME "browser.m"
#include <lib/com/debug.m>

#define BROWSER_SCRIPT
Global String BROWSER_DEFAULT_HOME;

#include init_browser.m

Class PopupMenu AttribMenu;


Function AttribMenu createMenufromAttribList (List entries);
/**
	createMenufromAttribList() explanation
	the List "entries" MUST have the following style:
	item 0 - is a configItem, which represents the root item.
	all other items are ConfigAttributes, which will be autofilled
*/

Function loadInternalLinks();
Function checkForNewLinks();
Function retrieveStreamData();

Function boolean isUrl(String url);

Function string prepareWebString(string url, string replace);
Function string strReplace(string str, string replace, string by);
	
Function performWebSearch (string searchstring);
Function BrowserReload();

Function playListItem(int num);
Function enqueueListItem(int num);
Function downloadListItem(int num);


Global Container quicklink_name;
Global Layout normal, quicklink_name_layout;
Global Frame dualwnd;

Global Group scr_content, g_search, g_navurl, sg, scr_mode, dld_mode;

Global Browser brw;
Global Button bback, bffwd, bhome, bbrowse, brefresh, bstop, bsearch, blinks;
Global Button scr_open, scr_close, scr_rescan, scr_play, scr_download, switch_scr, switch_scr2, switch_dld, switch_dld2, dld_play, dld_settings;
Global Edit navurl, searchedit;

Global GuiList scr_list;

Global PopUpMenu scr_menu;
Global List internal_LinksTitle, internal_LinksUrl, internal_LinksSubmenus;
Global GuiObject scr_dldList;

Global boolean download;

Global Boolean isAutomatedSearch, xmlReadPassed;

Global Timer delay, playDelay, linkDelay;

#include "buttonpos.m"

System.onScriptLoaded ()
{
	initWaPrivateCalls();

	initAttribs_Browser();
	BROWSER_DEFAULT_HOME = "http://client.winamp.com/browser/welcome";

	download = true;

	sg = getScriptGroup();
	normal = sg.getParentLayout();
	dualwnd = sg.getObject("browser.dualwnd");
	g_search = dualwnd.findObject("browser.search");
	g_navurl = dualwnd.findObject("browser.navurl");
	brw = dualwnd.findObject("webbrowser");
	brw.setCancelIEErrorPage(TRUE);
	bback = dualwnd.findObject("browser.back");
	bffwd = dualwnd.findObject("browser.fwd");
	bhome = dualwnd.findObject("browser.home");
	bbrowse = g_navurl.findObject("browser.navigate");
	brefresh = dualwnd.findObject("browser.refresh");
	bstop = dualwnd.findObject("browser.stop");
	navurl = g_navurl.findObject("browser.hedit");
	bsearch = g_search.findObject("search.choose");
	blinks = dualwnd.findObject("browser.links");

	delay = new Timer;
	delay.setDelay(10);

	playDelay = new Timer;
	playDelay.setDelay(1000);

	linkDelay = new Timer;
	linkDelay.setDelay(10000);

	xmlReadPassed = false;

	internal_LinksTitle = new list;
	internal_LinksUrl = new list;
	internal_LinksSubmenus = new list;
	loadInternalLinks();

	browser_search_attrib.onDataChanged();

	searchedit = g_search.getObject("search.edit");

	scr_open = dualwnd.findObject("browser.scraper.show");
	scr_content = dualwnd.findObject("browser.scraper");

	scr_mode = scr_content.findObject("scraper.mode");
	dld_mode = scr_content.findObject("dlds.mode");

	dld_settings = scr_content.findObject("browser.dlds.settings");
	dld_play = scr_content.findObject("browser.dlds.play");

	scr_close = scr_content.findObject("browser.scraper.hide");
	scr_rescan= scr_mode.findObject("browser.scraper.rescan");
	scr_play = scr_mode.findObject("browser.scraper.play");
	scr_download = scr_mode.findObject("browser.scraper.download");
	scr_list = scr_mode.findObject("scraper.results");

	scr_dldList = dld_mode.findObject("scraper.downloads");

	switch_dld = scr_mode.findObject("dlds.switch");
	switch_scr = dld_mode.findObject("scraper.switch");
	switch_dld2 = dld_mode.findObject("dlds.switch");
	switch_scr2 = scr_mode.findObject("scraper.switch");

	String nu = getPrivateString("Winamp Bento", "Browser v2 Home", "");
	if (nu == "")
	{
		nu = BROWSER_DEFAULT_HOME;
	}

	navurl.setText(nu);

	if (getPrivateInt("Winamp Bento", "Browser DownloadMgr visible", 0) && !getPrivateInt("Winamp Bento", "Browser MediaMonitor autoswitch", 1))
	{
		scr_mode.hide();
		dld_mode.show();
	}

	scr_list.setColumnLabel(1, getString("nullsoft.browser", 17));

	initButtonPos();

	browser_scr_show_attrib.onDataChanged ();

	// CHASHCOW
	browser_search_winamp_web_attrib.setData("1");
}

System.onScriptUnloading ()
{
	if (browser_scr_show_attrib.getData() == "1") setPrivateInt(getSkinName(), "browser.frame.pos", dualwnd.getPosition());

	delete internal_LinksTitle;
	delete internal_LinksUrl;
	delete internal_LinksSubmenus;

	delete WaPrivateCall;

	delay.stop();
	delete delay;

	playDelay.stop();
	delete playDelay;

	linkDelay.stop();
	delete linkDelay;
}

//----------------------------------------------------------------------------------------------------------------
// Check if we should display a specific page on set visible (see suicore.maki)
//----------------------------------------------------------------------------------------------------------------

brw.onSetVisible (Boolean onoff)
{
	if (onoff)
	{
		if (getPrivateString(getSkinName(), "UrlXgive", "") != "")
		{
			navurl.setText(getPrivateString(getSkinName(), "UrlXgive", ""));
			browserReload();
			setPrivateString(getSkinName(), "UrlXgive", "");
			DebugStrinG("[browser.m] -> External Loading Completed",0);
			return;
		}
		else if (getPrivateString(getSkinName(), "Browser Open", "") != "")
		{
			navurl.setText(getPrivateString(getSkinName(), "Browser Open", ""));
			browserReload();
			setPrivateString(getSkinName(), "Browser Open", "");
			DebugString("[browser.m] -> Loading Completed",0);
			return;
		}
		browserReload();
		checkForNewLinks();
	}
}
Global boolean hasXuiHome;
System.onSetXuiParam (String param, String value)
{
	if ( strlower(param) == "home" )
	{
		hasXuiHome = true;
		BROWSER_DEFAULT_HOME = value;
		String navTo = getPrivateString("Winamp Bento", "Browser v2 Home", "");
			if (navTo == "")
			{
				navTo = BROWSER_DEFAULT_HOME;
			}
		navurl.setText(navTo);
	}
	if ( strlower(param) == "download")
	{
		download = stringToInteger(getparam());
		switch_scr.leftClick();
		hideDownloads ();
	}
}

//----------------------------------------------------------------------------------------------------------------
// All direct interaction w/ browser is recieved here.
// The actions are triggered by buttonclicks and suicore.maki.
// actions send to the XUI oject will be send to brw.
//----------------------------------------------------------------------------------------------------------------

sg.onAction (String action, String param, Int x, int y, int p1, int p2, GuiObject source)
{
	brw.onAction (action, param, x, y, p1, p2, source);
}


brw.onAction (String action, String param, Int x, int y, int p1, int p2, GuiObject source)
{
	// Open an URL
	if (strlower(action) == "openurl")
	{
		//param = prepareWebString(param, "+");
		navurl.setText(param);
		browserReload();
		return;
	}
	// Websearch
	if (strlower(action) == "search")
	{
		// start!
		if (strlower(param) == "go")
		{
			performWebSearch(searchedit.getText());
		}
		// set text and start!
		else
		{
			isAutomatedSearch = TRUE;
			searchedit.setText(param);
			performWebSearch(param);
			isAutomatedSearch = FALSE;
		}
	}
}

//----------------------------------------------------------------------------------------------------------------
// Browser main controls.
//----------------------------------------------------------------------------------------------------------------

bback.onLeftClick ()
{
	brw.back();
}
bffwd.onLeftClick ()
{
	brw.forward();
}

bbrowse.onLeftClick ()
{
	browserReload();
}

brefresh.onLeftClick ()
{
	browserReload();
}

bstop.onLeftClick ()
{
	brw.stop();
}

bhome.onLeftClick ()
{
	String nu = getPrivateString("Winamp Bento", "Browser v2 Home", "");
	if (nu == "")
	{
		nu = BROWSER_DEFAULT_HOME;
	}

	navurl.setText(nu);

	browserReload();
}

// set a custom default home
bhome.onRightButtonUp(int x, int y)
{
	popupmenu editmenu = new popupmenu;
	editmenu.addcommand("Set current Page as default Home",1, 0,0);
	editmenu.addcommand("Restore default Home",2, 0,0);

	int ret = editmenu.popatxy(clientToScreenX(bhome.getLeft()), clientToScreenY(bhome.getTop() + bhome.getHeight()));

	if (ret == 1) setPrivateString("Winamp Bento", "Browser v2 Home", navurl.getText());
	if (ret == 2) setPrivateString("Winamp Bento", "Browser v2 Home", "");

	delete editmenu;
	complete;
}

// Windows Vista Compatibility hack. w/ this we get not so much winamp crashes. nevertheless the editbox code must be changed in gen_ff
browserReload()
{
	if (!navurl) return;
	if (!brw) return;
	string t = navurl.getText();

	if (!isUrl(t))
		t = "http://search.winamp.com/search/search?invocationType=en00-winamp-553--clientpage&query=" + prepareWebString(t, "+");

	brw.navigateUrl(t);
}

navurl.onEnter ()
{
	string t = navurl.getText();

	if (t == "")
		return;

	if (isKeyDown(VK_SHIFT)) t = "www." + t + ".com";
	else if (isKeyDown(VK_CONTROL)) t = "www." + t + ".com";

	while (strleft(t, 1) == " ")
	{
		t = strright(t, strlen(t) -1);
		if (t == " ")
			return;
	}

	while (strright(t, 1) == " ")
	{
		t = strleft(t, strlen(t) -1);
		if (t == "")
			return;
	}

	if (!isUrl(t))
		t = "http://search.winamp.com/search/search?invocationType=en00-winamp-553--clientpage&query=" + prepareWebString(t, "+");

	navurl.setText(t);
	brw.navigateUrl(t);
}

Boolean isUrl (String t)
{
	if (t == "about:blank")
		return TRUE;

	String ttt = strleft(t, 10);
	// get basically any http:// ftp:// etc
	String slash = System.Strleft("/ ", 1); // the simple slash causes errors on some systems :(
	string backslash = System.Strleft("\\ ", 1);
	if (strsearch(ttt, ":" + slash + slash) > -1) 
		return TRUE;

	if (strsearch(ttt, ":" + slash) == 1)  // C:/
		return TRUE;

	if (strsearch(ttt, ":" + backslash) == 1){ // C:\
		return TRUE;
	}

	if (strleft(ttt, 2) == backslash+backslash)	// get \\martin-pc
		return TRUE;

	ttt = getToken(t, slash, 0); // get rid of sub dirs
	String v = strright(ttt, 5);
	if (strsearch(v, ".") > -1)
		return TRUE;

	ttt = getToken(t, backslash, 0); // get rid of sub dirs
	String v = strright(ttt, 5);
	if (strsearch(v, ".") > -1)
		return TRUE;

	return FALSE;
}

//----------------------------------------------------------------------------------------------------------------
// Enlarge searcheditbox if we have enough space
//----------------------------------------------------------------------------------------------------------------

sg.onResize (int x, int y, int w, int h)
{
	if(h<30)
		g_navurl.hide();
	else
		g_navurl.show();

	if (w > 580 && h>=30)
	{
		g_search.show();
		g_search.setXmlParam("x", "-267");
		g_search.setXmlParam("w", "263");
		g_navurl.setXmlParam("x", "134");
		g_navurl.setXmlParam("w", "-403");
	}
	else if (w > 400 && h>=30)
	{
		g_search.show();
		g_search.setXmlParam("x", "-167");
		g_search.setXmlParam("w", "163");
		g_navurl.setXmlParam("x", "134");
		g_navurl.setXmlParam("w", "-303");
	}
	else 
	{
		g_search.hide();
		g_navurl.setXmlParam("x", "134");
		g_navurl.setXmlParam("w", "-140");
	}
}


//----------------------------------------------------------------------------------------------------------------
// Web Search
//----------------------------------------------------------------------------------------------------------------

searchedit.onEnter ()
{
	performWebSearch(getText());
}

performWebSearch (string searchstring)
{
	while (strleft(searchstring, 1) == " ")
	{
		searchstring = strright(searchstring, strlen(searchstring) -1);
		if (searchstring == " ")
			return; // kill infinite loop
	}

	if (strlower(searchstring) == "")
	{
		return;
	}

	// check what the current websearch is
	if (browser_search_attrib.getData() == "Modern Skins") 
		searchstring = "http://www.winamp.com/skins/search/?s=m&q=" + prepareWebString(searchstring, "+");

	else if (browser_search_attrib.getData() == "Classic Skins") 
		searchstring = "http://www.winamp.com/skins/search/?s=c&q=" + prepareWebString(searchstring, "+");

	else if (browser_search_attrib.getData() == "Plug-ins") 
		searchstring = "http://www.winamp.com/plugins/search/?q=" + prepareWebString(searchstring, "+");

	else if (browser_search_attrib.getData() == "Web Search") 
	{
		if (isAutomatedSearch)
		{
			searchstring = "http://search.winamp.com/search/search?invocationType=enus-winamp-553--as&query=" + prepareWebString(searchstring, "+");
			//searchstring = "http://slirsredirect.search.aol.com/redirector/sredir?sredir=1841&invocationType=en00-winamp-55--as&query=" + prepareWebString(searchstring, "+");
		}
		else
		{
			searchstring = "http://search.winamp.com/search/search?invocationType=en00-winamp-553--ws&query=" + prepareWebString(searchstring, "+");
			//searchstring = "http://slirsredirect.search.aol.com/redirector/sredir?sredir=1840&invocationType=en00-winamp-55--ws&query=" + prepareWebString(searchstring, "+");
		}
	}

	else if (browser_search_attrib.getData() == "Pollstar") 
		searchstring = "http://www.pollstar.com/tour/searchall.pl?By=All&Content=" + prepareWebString(searchstring, "+");

	else if (browser_search_attrib.getData() == "Bandsintown") 
		searchstring = "http://www.bandsintown.com/" + prepareWebString(searchstring, "");

	else if (browser_search_attrib.getData() == "JamBase") 
		searchstring = "http://www.jambase.com/search.asp?band=" + prepareWebString(searchstring, "+");

	else if (browser_search_attrib.getData() == "Wikipedia Search") 
		searchstring = "http://en.wikipedia.org/wiki/Special:Search?search=" + prepareWebString(searchstring, "+") + "&go=Go";

	else //let's do the aol search :)
		searchstring = "http://search.aol.com/aol/search?query=" + prepareWebString(searchstring, "+");

	navurl.setText(searchstring);
	browserReload();
}

// Set the button image according to the current websearch
browser_search_attrib.onDataChanged ()
{
	if (getData() == "Bandsintown") bsearch.setXmlParam("image", "browser.button.search.bit.normal");
	else if (getData() == "JamBase") bsearch.setXmlParam("image", "browser.button.search.jambase.normal");
	else if (getData() == "Web Search") bsearch.setXmlParam("image", "browser.button.search.google.normal");
	else if (getData() == "Pollstar") bsearch.setXmlParam("image", "browser.button.search.pollstar.normal");
	else if (getData() == "Wikipedia Search") bsearch.setXmlParam("image", "browser.button.search.wiki.normal");
	else bsearch.setXmlParam("image", "browser.button.search.winamp.normal");

	if (brw.isVisible())
	{
		performWebSearch(searchedit.getText());
	}
}

// Show the Menu to choose a web search
bsearch.onLeftClick ()
{
	AttribMenu searchlist = createMenufromAttribList (SearchAttributeList);

	int ret = searchlist.popatxy(clientToScreenX(bsearch.getLeft()), clientToScreenY(bsearch.getTop() + bsearch.getHeight()));
	if (ret >= 0) 
	{
		configAttribute temp = SearchAttributeList.enumItem(ret);
		temp.setData("1");
	}

	delete searchlist;
	complete;
}

// This is the main function to create a menu out of configattributes
// Better leave this function as it is.
createMenufromAttribList (list entries)
{
	Boolean dummy = 0;
	ConfigAttribute temp;
	ConfigItem root = entries.enumItem(0);
	PopUpMenu _menu;
	list submenus, subroots;
	submenus = new list;
	submenus.removeAll();
	subroots = new list;
	subroots.removeAll();
	_menu = new PopUpMenu;
	for ( int i = 1; i < entries.getNumItems(); i++ )
	{
		temp = entries.enumItem(i);
		configItem parent = temp.getParentItem();
		if (parent == root)
		{
			_menu.addCommand (
				temp.getAttributeName(),
				i,
				temp.getData() == "1",
				0
			);
		}
		else
		{
			popupmenu submenu;
			boolean gotit = FALSE;
			for ( int j = 0; j < submenus.getNumItems(); j++ )
			{
				if (subroots.enumItem(j) == parent)
				{
					submenu = submenus.enumItem(j);
					submenus.removeItem(j);
					gotit = TRUE;
				}
			}
			if (gotit == FALSE)
			{
				subroots.addItem(parent);
				submenu = new popupmenu;
			}
			submenu.addCommand (
				temp.getAttributeName(),
				i,
				temp.getData() == "1",
				0
			);
			submenus.addItem(submenu);
		}
	}
	for ( int i = 0; i < submenus.getNumItems(); i++ )
	{
		if (dummy == 1) _menu.addSubMenu(submenus.enumItem(i), "Winamp.com Search"); //TODO ci.getName();
		else
		{
			_menu.addSubMenu(submenus.enumItem(i), "Concert Search"); //TODO ci.getName();
			dummy = 1;
		}
	}
	delete submenus;
	delete subroots;

	return _menu;
}

// perpare a webstring out of the searchedit input
// %artist% and %album% are special inputs and will be rendered
// " " will be replaced for browser compatability
string prepareWebString (string url, string replace)
{
	string artist = getPlayItemMetaDataString("artist");
	string album = getPlayItemMetaDataString("album");

	if (artist == "") artist = getPlayitemString();
	if (album == "") album = getPlayitemString();

	url = strReplace(url, "%artist%", artist);
	url = strReplace(url, "%album%", album);

	url = urlEncode(url);

	url = strReplace(url, "%20", replace);

	return url;
}

// a basic function to replace a substring inside a string
string strReplace(string str, string replace, string by)
{
	int pos;
	int len = strlen(replace);
	while (pos = strsearch(str, replace) > -1)
	{
		string str_ = "";
		String _str = "";

		if (pos > 0) str_ = strleft(str, pos);

		pos = strlen(str)-pos-len;
		if (pos > 0) _str = strright(str, pos);

		str = str_ + by + _str;
	}
	return str;
}


//----------------------------------------------------------------------------------------------------------------
// Quick Links
//----------------------------------------------------------------------------------------------------------------

Function storeInternalLink(string name, string url);
Function String enumListItem (List list_for_returnval, List list_to_search, String item_to_search);

Global String qversion = "1.00";

storeInternalLink (string name, string url)
{
	internal_LinksTitle.addItem(name);
	internal_LinksUrl.addItem(url);
}

Global XmlDoc links_xml;

// add [[beontop]TRUE] to get the menu before all other menus
loadInternalLinks ()
{
	links_xml = new XmlDoc;
	String filename = Application.GetSettingsPath() + "/links.xml";
	links_xml.load(filename);
	if (links_xml.getSize() > 0)
	{
		links_xml.parser_addCallback("WasabiXML/*");
		links_xml.parser_start();
		links_xml.parser_destroy();
	}
	xmlReadPassed = true;
	checkForNewLinks();
}

Global int submenu = 0;
Global boolean inSub = false;

WaPrivateCall.onLinksUpdated()
{

	internal_LinksSubmenus.removeAll();
	internal_LinksTitle.removeAll();
	internal_LinksUrl.removeAll();

	submenu = 0;
	inSub = false;

	links_xml = new XmlDoc;
	String filename = Application.GetSettingsPath() + "/links.xml";
	links_xml.load(filename);
	links_xml.parser_addCallback("WasabiXML/*");
	links_xml.parser_start();
	links_xml.parser_destroy();
}

checkForNewLinks ()
{
	if (!brw.isVisible() || !xmlReadPassed)
		return;

	/*int last = getPrivateInt("Winamp Browser", "linksupdate", 0);
	int dt = System.getDate();
	int now = (getDateYear(dt)-100)*1000+getDateDoy(dt);

	if (last >= now) return;
	setPrivateInt("Winamp Browser", "linksupdate", now);*/

	xmlReadPassed = false;

	linkDelay.start();
}

linkDelay.onTimer ()
{
	linkDelay.stop();
	WaPrivateCall.updateLinks(qversion, "0.1");
}

Global boolean languageFound;

links_xml.parser_onCallback (String xmlpath, String xmltag, list paramname, list paramvalue)
{
	if (strlower(xmltag) == "browserquicklinks")
	{
		qversion = enumListItem(paramvalue, paramname, "version");
	}

	else if (strlower(xmltag) == "link")
	{
		String store = enumListItem(paramvalue, paramname, "name");

		if (enumListItem(paramvalue, paramname, "ontop") == "1")
		{
			store = "[[beontop]TRUE]" + store;	
		}

		if (inSub)
		{
			store = "[[submenu]"+ integerToString(submenu) +"]" + store;
		}

		storeInternalLink(store, enumListItem(paramvalue, paramname, "url"));
	}

	else if (strlower(xmltag) == "submenu")
	{
		String store = enumListItem(paramvalue, paramname, "name");

		submenu++;
		inSub = true;

		if (enumListItem(paramvalue, paramname, "ontop") == "1")
		{
			store = "[[beontop]TRUE]" + store;	
		}

		internal_LinksSubmenus.addItem(store);
	}
	else if (!languageFound && !hasXuiHome && strlower(xmltag) == "home")
	{
		String lngId = enumListItem(paramvalue, paramname, "lngId");
		lngid = strupper(lngid);
		if ((lngId) == "DEFAULT")
		{
			BROWSER_DEFAULT_HOME = enumListItem(paramvalue, paramname, "url");
		}
		else if ((lngId) == strupper(getLanguageId()))
		{
			languageFound = true;
			BROWSER_DEFAULT_HOME = enumListItem(paramvalue, paramname, "url");
			/*for(int i; i < paramvalue.getnumItems(); i++)
			{
				String s = paramname.enumItem(i);
				debug(s);
				s = paramvalue.enumItem(i);
				debug(s);
			}*/
		}
	}
}

String enumListItem (List list_for_returnval, List list_to_search, String item_to_search)
{
	int pos = list_to_search.findItem(item_to_search);

	if (pos >= 0)
	{
		return list_for_returnval.enumItem(pos);
	}
	else
	{
		return "";
	}
}

Global boolean ha;
links_xml.parser_onCloseCallback (String xmlpath, String xmltag)
{
	if (strlower(xmltag) == "submenu")
	{
		inSub = false;
	}
}

// used to get the name of the quicklink and store it in a new subfolder
Function string convertQuickLinkTempName (string name, int subfolder);
string convertQuickLinkTempName (string name, int subfolder)
{
	if (strleft(name, 10) == "[[submenu]")
	{
		name = strright(name, strlen(name) - 10);
		name = getToken(name, "]", 1);
	}
	if (subfolder > 0)
	{
		name = "[[submenu]" + integerToString(subfolder) + "]" + name;
	}
	return name;
}

// returns  the current subfolder, zero if it is in root
Function getSubFolderNum(string name);
int getSubFolderNum (string name)
{
	if (strleft(name, 10) == "[[submenu]")
	{
		name = strright(name, strlen(name) - 10);
		return stringToInteger(getToken(name, "]", 0));
	}
	else
	{
		return 0;
	}
}

// if "blabla" is a subfolder, this function will return what subfolder num it has. -1 is returned for no success
Function getSubFolderNameToNum(string name);
int getSubFolderNameToNum (string name)
{
	int subItems = getPrivateInt("Winamp Browser QuickLinks SubMenus", "numItems", 0);

	for ( int i = 1; i <= subItems; i++ )
	{
		if (getPrivateString("Winamp Browser QuickLinks SubMenus", "itemText_" + integerToString(i), "ERROR") == name) return i;
	}
	return -1;
}

Function PopupMenu createCustomMenu (boolean wantAdd, int startVal);
Function showQLEdit(int item);
Global Boolean ql_edit_visible;
Global Int editItemNum;

Global Button edit_ok;
global edit qlname, qlurl;
global dropdownlist qlparent;

// Show the Quicklink Edit Box. also used to create a new quick link item
showQLEdit (int item)
{
	editItemNum = item;
	ql_edit_visible = 1;
	quicklink_name = newDynamicContainer("browser.quicklink.edit.dialog2");
	if (!quicklink_name) return;
	quicklink_name_layout = quicklink_name.getLayout("normal");
	if (!quicklink_name_layout) return;

	qlname = quicklink_name_layout.findObject("edit.name");
	qlurl = quicklink_name_layout.findObject("edit.url");
	qlparent = quicklink_name_layout.findObject("edit.parent");

	// predefined entry in subfolder selection
	qlparent.addItem("* root");
	qlparent.setXmlParam("select", "* root");

	int subItems = getPrivateInt("Winamp Browser QuickLinks SubMenus", "numItems", 0);

	// load all existing subfolders
	for ( int i = 1; i <= subItems; i++ )
	{
		qlparent.addItem(getPrivateString("Winamp Browser QuickLinks SubMenus", "itemText_" + integerToString(i), "ERROR"));
		if ( (item + 1000) * (-1) == i ) qlparent.setXmlParam("select", getPrivateString("Winamp Browser QuickLinks SubMenus", "itemText_" + integerToString(i), "ERROR"));
	}

	// standard text for a new folder
	qlparent.addItem("["+translate("new subfolder")+"]");

	edit_ok = quicklink_name_layout.findObject("return.values");

	// check if we should edit a quick link...
	if (item > 0)
	{
		string name = getPrivateString("Winamp Browser QuickLinks", "itemText_" + integerToString(item), "ERROR");
		int sf = getSubFolderNum(name);
		if (sf > 0)
		{
			qlparent.setXmlParam("select", getPrivateString("Winamp Browser QuickLinks SubMenus", "itemText_" + integerToString(sf), "ERROR"));
		}
		qlname.setText(convertQuickLinkTempName(name, 0));
		qlurl.setText(getPrivateString("Winamp Browser QuickLinks", "itemLink_" + integerToString(item), "ERROR"));
	}
	// ...or create a new one
	else
	{
		editItemNum += 1000;
		editItemNum *= -1;
		qlurl.setText(navurl.getText());
		qlname.setText(brw.getDocumentTitle());
		editItemNum = 0;
	}

	// show the window
	quicklink_name_layout.center();
	quicklink_name_layout.show();
	quicklink_name_layout.setfocus();
}

// Yay, OK has clicked - let's save the quick link
edit_ok.onLeftClick ()
{
	if (qlname.getText() == "")
	{
		qlname.setText("Please enter a name for your Quicklink!");
		return;
	}
	if (qlurl.getText() == "")
	{
		qlurl.setText("Please enter an URL for your Quicklink!");
		return;
	}

	// If we store a new quicklink let's insert it in the end of the list.
	if (editItemNum == 0) 
	{
		editItemNum = getPrivateInt("Winamp Browser QuickLinks", "numItems", -1) + 1;
		setPrivateInt("Winamp Browser QuickLinks", "numItems", editItemNum);
	}
	edit e = qlparent.findObject("combobox.edit");
	string sel = e.getText();

	//store as root item
	if (sel == "* root")
	{
		setPrivateString("Winamp Browser QuickLinks", "itemText_" + integerToString(editItemNum), qlname.getText());
	}
	// store in a subfolder
	else
	{
		int i = getSubFolderNameToNum (sel);
		// store in a existing subfolder
		if (i > 0)
		{
			setPrivateString("Winamp Browser QuickLinks", "itemText_" + integerToString(editItemNum), "[[submenu]" + integerToString(i) + "]" + qlname.getText());
		}
		// store in a new subfolder
		else
		{
			int subitems = getPrivateInt("Winamp Browser QuickLinks SubMenus", "numItems", 0);
			setPrivateString("Winamp Browser QuickLinks", "itemText_" + integerToString(editItemNum), "[[submenu]" + integerToString(subitems + 1) + "]" + qlname.getText());

			setPrivateInt("Winamp Browser QuickLinks SubMenus", "numItems", subitems + 1);
			setPrivateString("Winamp Browser QuickLinks SubMenus", "itemText_" + integerToString(subitems + 1), sel);
		}
	}
	// save link and close window
	setPrivateString("Winamp Browser QuickLinks", "itemLink_" + integerToString(editItemNum), qlurl.getText());
	quicklink_name_layout.hide(); 
}


Function showSMEdit(int item);
Global Boolean sm_edit_visible;
Global Int smEditItemNum;
Global Layout submenu_name_layout;
Global Container submenu_name;

Global Button sm_edit_ok;
global edit smname;

// Show Sub Menu Editbox
showSMEdit (int item)
{
	item += 20000;
	item *= -1;
	smEditItemNum = item;
	sm_edit_visible = 1;
	submenu_name = newDynamicContainer("browser.submenu.edit2");
	if (!submenu_name) return;
	submenu_name_layout = submenu_name.getLayout("normal");
	if (!submenu_name_layout) return;

	smname = submenu_name_layout.findObject("edit.name");
	sm_Edit_ok = submenu_name_layout.findObject("return.values");

	// load submenu text, if we edit
	if (smEditItemNum)
	{
		smname.setText(getPrivateString("Winamp Browser QuickLinks SubMenus", "itemText_" + integerToString(smEditItemNum), "ERROR"));
	}

	submenu_name_layout.center();
	submenu_name_layout.show();
	submenu_name_layout.setfocus();
}

sm_edit_ok.onLeftClick ()
{
	if (smname.getText() == "")
	{
		smname.setText("Please enter a Subfolder name!");
		return;
	}

	// is this a new submenu?
	if (smEditItemNum == 0) 
	{
		smEditItemNum = getPrivateInt("Winamp Browser QuickLinks SubMenus", "numItems", 0);
		smEditItemNum++;
		setPrivateInt("Winamp Browser QuickLinks SubMenus", "numItems", smEditItemNum);
	}
	setPrivateString("Winamp Browser QuickLinks SubMenus", "itemText_" + integerToString(smEditItemNum), smname.getText());
	submenu_name_layout.hide(); 
}


// Is one of the edit windows closed?
system.onHideLayout (Layout _layout)
{
	if (_layout == quicklink_name_layout) 
	{
		ql_edit_visible = 0;
		return;
	}
	else if (_layout == submenu_name_layout) 
	{
		sm_edit_visible = 0;
	}
}

/* Hey, someone has clicked on the quicklinks button.
   we will show a menu and return the users descision as int.
   Here is the range what is done for what return value
	]oo;-40000]	delete subfolder: abs(ret += 20000)
	]-40000;-20000]	edit submenu: abs(ret += 20000)
	]-20000;-1000]	add quicklink in subfolder: abs(ret += 1000)
	[1;10000[	browse quicklink: ret
	[10000;20000[	edit quicklink: ret -= 10000
	[20000;30000[	delete quicklink
	[40000;oo[	browse internal quicklink: ret -= 40000
*/

blinks.onLeftClick ()
{
	popupmenu quicklinks = new popupmenu;

	quicklinks = createCustomMenu (1 , 0);

	int ret = quicklinks.popatxy(clientToScreenX(blinks.getLeft()), clientToScreenY(blinks.getTop() + blinks.getHeight()));

	delete quicklinks;

	// see above
	if (ret <= -1000 && ret > -20000) showQLEdit(ret);
	if (ret <= -20000 && ret > -40000) showSMEdit(ret);
	if (ret <= -40000)
	{
		ret += 40000;
		ret *= -1;
		String msg = translate("Do you really want to delete this Subfolder?") + "\n" +
					 translate("All Quick Links stored in this folder will be") + "\n" +
					 translate("transfered to the root of the menu!");
		int answer = messageBox (msg, translate("Confirmation") , 4, "");
		if (answer == 4)
		{
			int Subitems = getPrivateInt("Winamp Browser QuickLinks Submenus", "numItems", -1);
			int items = getPrivateInt("Winamp Browser QuickLinks", "numItems", -1);

			setPrivateInt("Winamp Browser QuickLinks Submenus", "numItems", Subitems - 1);

			for ( int i = ret; i <= Subitems; i++ )
			{
				string set = getPrivateString("Winamp Browser QuickLinks Submenus", "itemText_" + integerToString(i+1), "ERROR");
				setPrivateString("Winamp Browser QuickLinks Submenus", "itemText_" + integerToString(i), set);
				string vv = "[[submenu]" + integerToString(i) + "]";
				for ( int ii = 1; ii <= items; ii++ )
				{
					string v = getPrivateString("Winamp Browser QuickLinks", "itemText_" + integerToString(ii), "ERROR");
					if (strleft (v, strlen(vv)) == vv)
					{
						v = strright(v, strlen(v) - strlen(vv));
						if (i == ret)
						{
							setPrivateString("Winamp Browser QuickLinks", "itemText_" + integerToString(ii), v);
						}
						else
						{
							v = "[[submenu]" + integerToString(i-1) + "]" + v;
							setPrivateString("Winamp Browser QuickLinks", "itemText_" + integerToString(ii), v);
						}
					}
				}
			}
		}
		return;
	}

	if (ret <= 0) return;

	int items = getPrivateInt("Winamp Browser QuickLinks", "numItems", -1);

	if (ret > items) 
	{
		if (ret > 10000 && ret < 20000) showQLEdit(ret - 10000);
		else if (ret > 20000 && ret < 30000) 
		{
			ret -= 20000;
			String msg = translate("Do You really want to delete this Quick Link?");
			int answer = messageBox (msg, translate("Confirmation") , 4, "");
			if (answer == 4)
			{
				int items = getPrivateInt("Winamp Browser QuickLinks", "numItems", -1);

				setPrivateInt("Winamp Browser QuickLinks", "numItems", items - 1);

				for ( int i = ret; i <= items; i++ )
				{
					string set = getPrivateString("Winamp Browser QuickLinks", "itemText_" + integerToString(i+1), "ERROR");
					setPrivateString("Winamp Browser QuickLinks", "itemText_" + integerToString(i), set);
					set = getPrivateString("Winamp Browser QuickLinks", "itemLink_" + integerToString(i+1), "ERROR");
					setPrivateString("Winamp Browser QuickLinks", "itemLink_" + integerToString(i), set);
				}
			}
		}
		else if (ret >= 40000)
		{
			navurl.setText (internal_LinksURL.enumItem(ret-40000));
			browserReload();
		}
		return;
	}
	else if (ret > 0 && ret <= items) 
	{
		navurl.setText (getPrivateString("Winamp Browser QuickLinks", "itemLink_" + integerToString(ret), "ERROR"));
		browserReload();
	}

	complete;
}

createCustomMenu (boolean wantAdd, int startVal)
{
	popupmenu _menu = new popupmenu;

	int subItems = getPrivateInt("Winamp Browser QuickLinks SubMenus", "numItems", 0);
	int items = getPrivateInt("Winamp Browser QuickLinks", "numItems", 0);
	int int_subItems = internal_LinksSubmenus.getNumItems();
	int int_items = internal_LinksTitle.getNumItems();

	/** load top SubMenus */
	for ( int i = 0; i < int_items; i++ )
	{
		string v = internal_LinksTitle.enumItem(i);
		if (strleft(v, strlen("[[beontop]TRUE]")) == "[[beontop]TRUE]")
		{
			v = strright(v, strlen(v) - strlen("[[beontop]TRUE]"));
			if (strleft(v, 10) != "[[submenu]")
			{
				_menu.addCommand (
					v,
					40000 + i,
					0,
					0
				);
			}
		}
	}
	for ( int i = 0; i < int_subItems ; i++ )
	{
		if (strleft(internal_LinksSubmenus.enumItem(i), strlen("[[beontop]TRUE]")) == "[[beontop]TRUE]")
		{
			popupmenu _sub = new popupmenu;
			for ( int ii = 0; ii < int_items; ii++ )
			{
				string v = internal_LinksTitle.enumItem(ii);
				string vv = "[[submenu]" + integerToString(i+1) + "]";
				if (strleft (v, strlen(vv)) == vv)
				{
					v = strright(v, strlen(v) - strlen(vv));
					_sub.addCommand (v, 40000 + ii, 0, 0);
				}
			}
			if (_sub.getNumCommands() < 1) _sub.addCommand ("No Quick Links Stored", 0, 0, 1);
			string tmp = internal_LinksSubmenus.enumItem(i);
			_menu.AddSubMenu (_sub, strright(tmp, strlen(tmp) - strlen("[[beontop]TRUE]")));
		}
	}

	if (_menu.getNumCommands() > 0) _menu.addSeparator();

	if (wantAdd == 1)
	{
		popupmenu editsub = new popupmenu;

		/** Edit Quick links */

		popupmenu editmenu = new popupmenu;

		if (subItems > 0)
		{
			for ( int i = 1; i <= subItems; i++ )
			{
				string vv = "[[submenu]" + integerToString(i) + "]";
				popupmenu _sub = new popupmenu;
				for ( int ii = 1; ii <= items; ii++ )
				{
					string v = getPrivateString("Winamp Browser QuickLinks", "itemText_" + integerToString(ii), "ERROR");
					if (strleft (v, strlen(vv)) == vv)
					{
						v = strright(v, strlen(v) - strlen(vv));
						_sub.addCommand (v, 10000 + ii, 0, 0);
					}
				}
				if (_sub.getNumCommands() < 1) _sub.addCommand ("No Quick Links Stored", 0, 0, 1);
				editmenu.AddSubMenu (_sub, getPrivateString("Winamp Browser QuickLinks SubMenus", "itemText_" + integerToString(i), "ERROR"));
			}
		}

		for ( int i = 1; i <= items; i++ )
		{
			string v = getPrivateString("Winamp Browser QuickLinks", "itemText_" + integerToString(i), "ERROR");
			if (strleft(v, 10) != "[[submenu]")
			{
				editmenu.addCommand (
					v,
					10000 + i,
					0,
					0
				);
			}
		}

		if (editmenu.getNumCommands() < 1) editmenu.addCommand ("No Quick Links Stored", 0, 0, 1);

		editsub.addSubMenu (editmenu, "Edit Quick Link");

		/** Delete SubMenus */

		popupmenu editmenu2 = new popupmenu;

		if (subItems > 0)
		{
			for ( int i = 1; i <= subItems; i++ )
			{
				popupmenu _sub = new popupmenu;
				for ( int ii = 1; ii <= items; ii++ )
				{
					string v = getPrivateString("Winamp Browser QuickLinks", "itemText_" + integerToString(ii), "ERROR");
					string vv = "[[submenu]" + integerToString(i) + "]";
					if (strleft (v, strlen(vv)) == vv)
					{
						v = strright(v, strlen(v) - strlen(vv));
						_sub.addCommand (v, 20000 + ii, 0, 0);
					}
				}
				if (_sub.getNumCommands() < 1) _sub.addCommand ("No Quick Links Stored", 0, 0, 1);
				editmenu2.AddSubMenu (_sub, getPrivateString("Winamp Browser QuickLinks SubMenus", "itemText_" + integerToString(i), "ERROR"));
			}
		}

		for ( int i = 1; i <= items; i++ )
		{
			string v = getPrivateString("Winamp Browser QuickLinks", "itemText_" + integerToString(i), "ERROR");
			if (strleft(v, 10) != "[[submenu]")
			{
				
				editmenu2.addCommand (
					v,
					20000 + i,
					0,
					0
				);
			}
		}

		if (editmenu2.getNumCommands() < 1) editmenu2.addCommand ("No Quick Links Stored", 0, 0, 1);
		editsub.addSubMenu (editmenu2, "Delete Quick Link");
		editsub.addSeparator();

		/** Edit SubMenus */

		popupmenu editmenu3 = new popupmenu;

		for ( int i = 1; i <= subItems; i++ )
		{
			editmenu3.addCommand (
				getPrivateString("Winamp Browser QuickLinks SubMenus", "itemText_" + integerToString(i), "ERROR"),
				-20000 - i,
				0,
				0
			);
		}
		if (editmenu3.getNumCommands() < 1) editmenu3.addCommand ("No Subfolders Stored", 0, 0, 1);
		editsub.addSubMenu (editmenu3, "Edit Subfolder");


		/** Delete SubMenus */

		popupmenu editmenu4 = new popupmenu;

		for ( int i = 1; i <= subItems; i++ )
		{
			editmenu4.addCommand (
				getPrivateString("Winamp Browser QuickLinks SubMenus", "itemText_" + integerToString(i), "ERROR"),
				-40000 - i,
				0,
				0
			);
		}
		if (editmenu4.getNumCommands() < 1) editmenu4.addCommand ("No Subfolders Stored", 0, 0, 1);
		editsub.addSubMenu (editmenu4, "Delete Subfolder");

		_menu.addSubMenu (editsub, "Manage Quick Links");
		_menu.addSeparator();
	}

	if (wantAdd == 1)
	{
		_menu.addCommand ("Add New Subfolder...", -20000, 0, 0);
		_menu.addCommand ("Add Current Page...", -1000, 0, 0);
		_menu.addSeparator();
	}

	/** load SubMenus */
	for ( int i = 0; i < int_subItems ; i++ )
	{
		if (strleft(internal_LinksSubmenus.enumItem(i), strlen("[[beontop]TRUE]")) != "[[beontop]TRUE]")
		{
			popupmenu _sub = new popupmenu;
			for ( int ii = 0; ii < int_items; ii++ )
			{
				string v = internal_LinksTitle.enumItem(ii);
				string vv = "[[submenu]" + integerToString(i+1) + "]";
				if (strleft (v, strlen(vv)) == vv)
				{
					v = strright(v, strlen(v) - strlen(vv));
					_sub.addCommand (v, 40000 + ii, 0, 0);
				}
			}
			if (_sub.getNumCommands() < 1) _sub.addCommand ("No Quick Links Stored", 0, 0, 1);
			_menu.AddSubMenu (_sub, internal_LinksSubmenus.enumItem(i));
		}
	}

	if (subItems > 0)
	{
		for ( int i = 1; i <= subItems; i++ )
		{
			popupmenu _sub = new popupmenu;
			if (wantAdd == 1) _sub.addCommand ("Add Current Page...", -1000 - i, 0, 0);
			_sub.addSeparator();
			for ( int ii = 1; ii <= items; ii++ )
			{
				string v = getPrivateString("Winamp Browser QuickLinks", "itemText_" + integerToString(ii), "ERROR");
				string vv = "[[submenu]" + integerToString(i) + "]";
				if (strleft (v, strlen(vv)) == vv)
				{
					v = strright(v, strlen(v) - strlen(vv));
					_sub.addCommand (v, startVal + ii, 0, 0);
				}
			}
			if (_sub.getNumCommands() < 3) _sub.addCommand ("No Quick Links Stored", 0, 0, 1);
			_menu.AddSubMenu (_sub, getPrivateString("Winamp Browser QuickLinks SubMenus", "itemText_" + integerToString(i), "ERROR"));
		}
	}
 
	// load internal entries
	for ( int i = 0; i < int_items; i++ )
	{
		string v = internal_LinksTitle.enumItem(i);
		if (strleft(v, strlen("[[beontop]TRUE]")) != "[[beontop]TRUE]")
		{
			if (strleft(v, 10) != "[[submenu]")
			{
				_menu.addCommand (
					v,
					40000 + i,
					0,
					0
				);
			}
		}
	}

	for ( int i = 1; i <= items; i++ )
	{
		string v = getPrivateString("Winamp Browser QuickLinks", "itemText_" + integerToString(i), "ERROR");
		if (strleft(v, 10) != "[[submenu]")
		{
			_menu.addCommand (
				v,
				startVal + i,
				0,
				0
			);
		}
	}
	if (_menu.getNumCommands() < 6) _menu.addCommand ("No Quick Links Stored", 0, 0, 1);
	return _menu;
}


//----------------------------------------------------------------------------------------------------------------
// Site Scraper
//----------------------------------------------------------------------------------------------------------------

Global String errorUrl;
/*
// scrape everytime the document does change and change navurl text
brw.onDocumentComplete (String url)
{
	//if (navurl.gettext() != url && url != "about:blank") navurl.setText(url);
	if (scr_list)
	{
		scr_list.deleteAllItems();
		brw.scrape();
	}
}*/

// Won't be called on iFrames
brw.onDocumentready (String url)
{
	if (navurl.gettext() != url && url != "about:blank")
	{
		navurl.setText(url);
	}
	if (scr_list)
	{
		scr_list.deleteAllItems();
		if (url != "about:blank") scr_list.setColumnLabel(0, getString("nullsoft.browser", 16) + " " + url);
		brw.scrape();
	}
}

Global String url_delayed;

brw.OnNavigateError(String url, int code)
{
	if (code >= 200 && code <= 299)
		return;

	if (code == 0)
		return;

	if (url == "" || strleft(url, strlen("http://search.winamp.com/")) == "http://search.winamp.com/")
		return;

	if (strleft(url, 11) == "javascript:")
		return;

	String t = "http://search.winamp.com/search/afe?query=" + prepareWebString(navurl.getText(), "+") + "&invocationType=en00-winamp-553--error";

	navurl.setText(t);
	url_delayed = t;
	delay.start();
}

delay.onTimer ()
{
	delay.stop();
	brw.navigateUrl(url_delayed);
}


// Handles for wasabi:farme: show, hide, resize
scr_open.onLeftClick ()
{
	browser_scr_show_attrib.setData("1");
}

scr_close.onLeftClick ()
{
	browser_scr_show_attrib.setData("0");
}

Global Boolean nocallback;
browser_scr_show_attrib.onDataChanged ()
{
	if (brw == NULL || nocallback) return;
	if (getData() == "1")
	{
		scr_close_xui.show();
		scr_open_xui.hide();
		if (download) scr_download_xui.show();
		scr_play.show();
		scr_rescan_xui.show();
		scr_play_xui.show();
		if (download) dld_play_xui.show();
		dualwnd.setPosition(getPrivateInt(getSkinName(), "browser.frame.pos", 100));
	}
	else
	{
		scr_close_xui.hide();
		scr_open_xui.show();
		if (download) scr_download_xui.hide();
		scr_play.hide();
		scr_rescan_xui.hide();
		scr_play_xui.hide();
		if (download) dld_play_xui.hide();
		if (dualwnd.getPosition() > 26) setPrivateInt(getSkinName(), "browser.frame.pos", dualwnd.getPosition());
		dualwnd.setPosition(26);
	}
}

scr_content.onResize (int x, int y, int w, int h)
{
	nocallback = TRUE;
	if (dualwnd.getPosition() <= 26)
	{
		browser_scr_show_attrib.setData("0");
		dualwnd.setPosition(26);
		scr_close_xui.hide();
		scr_open_xui.show();
		scr_content.show();
		if (download) scr_download_xui.hide();
		scr_play_xui.hide();
		scr_rescan_xui.hide();
		if (download) dld_play_xui.hide();
	}
	else
	{
		scr_close_xui.show();
		scr_open_xui.hide();
		if (download) scr_download_xui.show();
		scr_play_xui.show();
		scr_rescan_xui.show();
		if (download) dld_play_xui.show();
		browser_scr_show_attrib.setData("1");
	}
	nocallback = FALSE;	
}

// called everytime a media link is found. you must call brw.scrape to get them!
brw.onMediaLink (string url)
{
	if (getPrivateInt("Winamp Bento", "Browser MediaMonitor autoswitch", 1))
	{
		browser_scr_show_attrib.setData("1");
		setPrivateInt("Winamp Bento", "Browser DownloadMgr visible", 0);
		scr_mode.show();
		dld_mode.hide();
	}

	// check if the item exists already
	for ( int i = 0; i < scr_list.getNumItems() ; i++ )
	{
		if (scr_list.getSubItemText(i, 1) == url)
			return;
	}

	scr_list.addItem(urldecode(removePath(url)));
	scr_list.setSubItem(scr_list.getLastAddedItemPos(), 1, url);
	if (download) scr_list.setIconWidth(32);
	else scr_list.setIconWidth(16);
	scr_list.setIconHeight(12);
	scr_list.setShowIcons(1);
	if (download) scr_list.setItemIcon(scr_list.getLastAddedItemPos(), "browser.list.label");
	else scr_list.setItemIcon(scr_list.getLastAddedItemPos(), "browser.list.label2");

	retrieveStreamData();
}

System.onDownloadFinished (String url, boolean success, String filename)
{
	if (!success || url == "")
		return;

	for ( int i = 0; i < scr_list.getNumItems(); i++ )
	{
		if (scr_list.getSubItemText(i, 1) == url)
		{
			String a = getMetaDataString(filename, "artist");
			String t = getMetaDataString(filename, "title");
			String r;

			if (a == "" && t == "")
				return;
			else if (a == "")
				r = t;
			else if (t == "")
				r = a;
			else 
				r = a + " - " + t;

			scr_list.setItemLabel(i, r);
			scr_list.setSubItem(i,1, filename);
		}
	}
}

Global Boolean prevent = FALSE;

// List Right click menu
scr_list.onRightClick (int num)
{
	scr_menu = new PopUpMenu;

	scr_menu.addCommand(translate("Play selection")+"\t"+translate("Enter"), 1, 0, 0);
	scr_menu.addCommand("Enqueue selection"/*\tShift+Enter"*/, 2, 0, 0);
	if (download) scr_menu.addCommand("Download selection"/*\tShift+Enter"*/, 3, 0, 0);
	scr_menu.addCommand("Send to:"/*\tShift+Enter"*/, 4, 0, 1);

	scr_menu.addSeparator();
	scr_menu.addCommand("Play all"/*\tAlt+Enter"*/, 11, 0, 0);
	scr_menu.addCommand("Enqueue all"/*\tShift+Alt+Enter"*/, 12, 0, 0);
	if (download) scr_menu.addCommand("Download all"/*\tShift+Alt+Enter"*/, 13, 0, 0);

	scr_menu.addSeparator();
	scr_menu.addCommand(translate("Select all")+"\t"+translate("Ctrl+A"), 101, 0, 0);
	scr_menu.addCommand(translate("Remove selection")+"\t"+translate("Ctrl+R"), 201, 0, 0);

	int result = scr_menu.popAtMouse();

	if (result)
	{
		if (result == 1) playListItem(num);
		else if (result == 2) enqueueListItem(num);
		else if (result == 3) downloadListItem(num);
		else if (result == 11 )
		{
			boolean enqueue = 0;
			int v = scr_list.getNumItems();
			for ( int i = 0; i < v ; i++ )
			{
				if (enqueue == 0)
				{
					System.playFile(scr_list.getItemLabel(i,1));
					enqueue = 1;
				}
				else
				{
					System.enqueueFile(scr_list.getItemLabel(i,1));
				}
			}
		}
		else if (result == 12 )
		{
			int v = scr_list.getNumItems();
			for ( int i = 0; i < v ; i++ )
			{
				System.enqueueFile(scr_list.getItemLabel(i,1));
			}
		}
		else if (result == 13 )
		{
			downloadListItem(-2);

		}
		else if (result == 101) selectAll();
		else if (result == 201) 
		{
			if (getFirstItemSelected() == getNextItemSelected(getFirstItemSelected()))
			{
				deletebypos(getFirstItemSelected());
				if (scr_menu) delete scr_menu;
				return;
			}
			
			int v = scr_list.getNumItems();
			for ( int i = v-1; i >= 0 ; i-- )
			{
				if (getItemSelected(i)) deletebypos(i);
			}
		}
	}

	if (scr_menu) delete scr_menu;
}

scr_list.onIconLeftClick (int item, int x , int y)
{
	if (x < 12)
	{
		playListItem(item);
	}
	else if (x > 14 && x < 29 && download)
	{
		downloadListItem(item);
	}
}


// User Buttons
scr_download.onLeftClick ()
{
	if (scr_list.getFirstItemSelected() == -1)
	{
		downloadListItem(-2);
	}
	else
	{
		downloadListItem(-1);
	}
}

scr_play.onLeftClick ()
{/*enqueueFile("file://H:\\mp3 -\\Radio21Live.m3u");
	enqueueFile("file://H:\\mp3 -\\Nada_Surf_2008.mp3");
	//ebug("file://H:\\mp3 -\\Nada_Surf_2008.mp3");
	return;*/
	playListItem(-1);
}

scr_rescan.onLeftClick ()
{
	scr_list.deleteAllItems();
	brw.scrape();
}

scr_list.onDoubleClick (Int itemnum)
{
	playListItem(itemnum);
}

scr_list.onKeyDown (int code)
{
	if (code == 13) 
	{
		if (isKeyDown(VK_CONTROL))
		{
			enqueueListItem(scr_list.getItemFocused());
		}
		else
		{
			playListItem(scr_list.getItemFocused());
		}
		prevent = TRUE;
	}
	else if (code == 65 && isKeyDown(VK_CONTROL))
	{
		selectAll();
		prevent = TRUE;
	}
	else if (code == 82 && isKeyDown(VK_CONTROL))
	{
		if (getFirstItemSelected() == getNextItemSelected(getFirstItemSelected()))
		{
			deletebypos(getFirstItemSelected());
			if (scr_menu) delete scr_menu;
			return;
		}
		
		int v = scr_list.getNumItems();
		for ( int i = v-1; i >= 0 ; i-- )
		{
			if (getItemSelected(i)) deletebypos(i);
		}
	}
	complete;
}

// prevent this action to be reported to other scripts
System.onKeyDown (String key)
{
	if (prevent)
	{
		prevent = FALSE;
		complete;
	}
}

// play a list item
playListItem (int num)
{
	String slash = System.Strleft("/ ", 1);
	if (scr_list.getFirstItemSelected() == -1)
	{
		
		boolean enqueue = 0;
		int v = scr_list.getNumItems();
		for ( int i = 0; i < v ; i++ )
		{
			String play = scr_list.getItemLabel(i,1);
			if (strsearch(play, ":" + slash + slash) < 0)
				play = "file://" + play;
			
			if (enqueue == 0)
			{
				System.playFile(play);
				enqueue = 1;
			}
			else
			{
				System.enqueueFile(play);
			}
		}
		return;
	}
	
	int sel = scr_list.getFirstItemSelected();
	if (sel == scr_list.getNextItemSelected(sel))
	{
		String play = scr_list.getItemLabel(sel,1);
		if (strsearch(play, ":" + slash + slash) < 0)
			play = "file://" + play;

		System.playFile(play);
		return;
	}

	boolean enqueue = 0;
	int v = scr_list.getNumItems();
	for ( int i = 0; i < v ; i++ )
	{
		if (scr_list.getItemSelected(i))
		{
			String play = scr_list.getItemLabel(i,1);
			if (strsearch(play, ":" + slash + slash) < 0)
				play = "file://" + play;

			if (enqueue == 0)
			{
				System.playFile(play);
				enqueue = 1;
			}
			else
			{
				System.enqueueFile(play);
			}
		}
	}
}

// enqueue a list item
enqueueListItem (int num)
{
	String slash = System.Strleft("/ ", 1);
	int sel = scr_list.getFirstItemSelected();
	if (sel == scr_list.getNextItemSelected(sel))
	{
		String play = scr_list.getItemLabel(sel,1);
		if (strsearch(play, ":" + slash + slash) < 0)
			play = "file://" + play;

		System.enqueueFile(play);
		return;
	}

	int v = scr_list.getNumItems();
	for ( int i = 0; i < v ; i++ )
	{
		if (scr_list.getItemSelected(i))
		{
			String play = scr_list.getItemLabel(i,1);
			if (strsearch(play, ":" + slash + slash) < 0)
				play = "file://" + play;
			System.enqueueFile(play);
		}
	}
}

Function maybeShowDownloadManager();

// downlaod a list item
downloadListItem (int num)
{
	boolean storeInMl = getPrivateInt("Winamp Bento", "Store Browser Downloads in ML", 1);

	String storageDir = getPrivateString("Winamp Bento", "Save Browser Downloads Dir", "");
	if (getPrivateInt("Winamp Bento", "Save Browser Downloads in CD Ripping Dir", 0))
		storageDir = "";

	if (num > -1)
	{
		System.downloadMedia(scr_list.getItemLabel(num,1), storageDir, storeInMl, true);
		maybeShowDownloadManager();
		return;
	}

	int v = scr_list.getNumItems();	
	if (num == -2)
	{
		for ( int i = 0; i < v ; i++ )
			System.downloadMedia(scr_list.getItemLabel(i,1), storageDir, storeInMl, true);

		maybeShowDownloadManager();
		return;
	}

	int sel = scr_list.getFirstItemSelected();
	if (sel == scr_list.getNextItemSelected(sel))
	{
		System.downloadMedia(scr_list.getItemLabel(sel,1), storageDir, storeInMl, true);
		maybeShowDownloadManager();
		return;
	}
	
	for ( int i = 0; i < v ; i++ )
	{
		if (scr_list.getItemSelected(i)) System.downloadMedia(scr_list.getItemLabel(i,1), storageDir, storeInMl, true);
	}

	maybeShowDownloadManager();
}

maybeShowDownloadManager ()
{
	if (getPrivateInt("Winamp Bento", "Browser DownloadMgr autoopen", 1))
	{
		setPrivateInt("Winamp Bento", "Browser DownloadMgr visible", 1);
		scr_mode.hide();
		dld_mode.show();
	}
}

System.onPlay ()
{
	retrieveStreamData();
}

System.onTitleChange (String newtitle)
{
	retrieveStreamData();
}

retrieveStreamData ()
{
	String url = getPlayItemString();
	if (url == "")
		return;

	String left = strleft(url, 10);
	if (strsearch(left, "http://") < 0 &&  strsearch(left, "ftp://") < 0)
		return;

	// retrieve metadata
	playDelay.start();
}

playDelay.onTimer ()
{
	playDelay.stop();
	String url = getPlayItemString();
	for ( int i = 0; i < scr_list.getNumItems(); i++ )
	{
		if (scr_list.getSubItemText(i, 1) == url)
		{
			String r = System.getPlayItemDisplayTitle();
			scr_list.setItemLabel(i, r);
		}
	}
}


//----------------------------------------------------------------------------------------------------------------
// Download Config
//----------------------------------------------------------------------------------------------------------------


switch_scr.onLeftClick ()
{
	setPrivateInt("Winamp Bento", "Browser DownloadMgr visible", 0);

	scr_mode.show();
	dld_mode.hide();
}


switch_dld.onLeftClick ()
{
	setPrivateInt("Winamp Bento", "Browser DownloadMgr visible", 1);

	scr_mode.hide();
	dld_mode.show();
}

dld_settings.onleftclick ()
{

	/*boolean b = getPrivateInt("Winamp Bento", "Browser DownloadMgr visible", 0);
	PopupMenu pop = new PopupMenu;
	pop.addCommand("Media Monitor", 0, !b, false);
	pop.addCommand("Active Downloads", 1, b, false);*/
	PopupMenu spop = new PopupMenu;
	spop.addCommand("Autoopen Download Manager on downloading", 101, getPrivateInt("Winamp Bento", "Browser DownloadMgr autoopen", 1), false);
	spop.addCommand(getString("nullsoft.browser", 21), 102, getPrivateInt("Winamp Bento", "Browser MediaMonitor autoswitch", 1), false);
	spop.addSeparator();
	spop.addCommand("Add downloaded files to Media Library", 103, getPrivateInt("Winamp Bento", "Store Browser Downloads in ML", 1), false);

	PopupMenu spopout = new PopupMenu;
	spopout.addCommand("CD Ripping Directory", 110, getPrivateInt("Winamp Bento", "Save Browser Downloads in CD Ripping Dir", 1), false);
	spopout.addCommand("Custom Directory", 111, !getPrivateInt("Winamp Bento", "Save Browser Downloads in CD Ripping Dir", 1), false);
	spopout.addSeparator();
	spopout.addCommand("Alter CD Ripping Directory", 100, false, false);

	spop.addSubMenu(spopout, "Set Download Directory");

	int res = spop.popatxy(clientToScreenX(dld_settings.getLeft()), clientToScreenY(dld_settings.getTop() + dld_settings.getHeight()));
	if (res < 100 && res > -1)
	{
		setPrivateInt("Winamp Bento", "Browser DownloadMgr visible", res);
		if (res)
		{
			scr_mode.hide();
			dld_mode.show();
		}
		else
		{
			scr_mode.show();
			dld_mode.hide();
		}
	}
	
	else if (res == 100)
	{
		String path = getDownloadPath();
		path = selectFolder("", translate("Choose folder to store downloaded media.") + "\n" + translate("This will also alter the output folder for ripped tracks."), path);
		if (path == "")
			return;
		setDownloadPath(path);
	}
	else if (res == 101)
	{
		setPrivateInt("Winamp Bento", "Browser DownloadMgr autoopen", !getPrivateInt("Winamp Bento", "Browser DownloadMgr autoopen", 1));
	}
	else if (res == 102)
	{
		setPrivateInt("Winamp Bento", "Browser MediaMonitor autoswitch", !getPrivateInt("Winamp Bento", "Browser MediaMonitor autoswitch", 1));
	}
	else if (res == 103)
	{
		setPrivateInt("Winamp Bento", "Store Browser Downloads in ML", !getPrivateInt("Winamp Bento", "Store Browser Downloads in ML", 1));
	}
	else if (res == 110)
	{
		setPrivateInt("Winamp Bento", "Save Browser Downloads in CD Ripping Dir", 1);
	}
	else if (res == 111)
	{
		String path = getPrivateString("Winamp Bento", "Save Browser Downloads Dir", "");
		if (path == "") path = getDownloadPath();
		path = selectFolder("", "Choose folder to store downloaded media.", path);
		if (path == "")
			return;
		setPrivateInt("Winamp Bento", "Save Browser Downloads in CD Ripping Dir", 0);
		setPrivateString("Winamp Bento", "Save Browser Downloads Dir", path);
	}

	delete spop;
	complete;
}