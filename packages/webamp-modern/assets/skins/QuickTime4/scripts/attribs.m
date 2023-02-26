#ifndef included
#error This script can only be compiled as a #include
#endif

#ifndef __ATTRIBS_M
#define __ATTRIBS_M

#include <lib/config.mi>

// -----------------------------------------------------------------------------------------------------------------

// this is the page that maps its items to the options menu, you can add attribs or more pages (submenus)
#define CUSTOM_OPTIONSMENU_ITEMS "{1828D28F-78DD-4647-8532-EBA504B8FC04}"

// this is the page that maps its items to the windows menu (aka View), you can add attribs or more pages (submenus)
#define CUSTOM_WINDOWSMENU_ITEMS "{6559CA61-7EB2-4415-A8A9-A2AEEF762B7F}"

// custom options submenu item page, you can add more, just use guidgen and Config.newItem()
#define CUSTOM_PAGE "{26E26319-AECA-4433-B8F1-F4A5BF2A9ED5}"

// drawer config page
#define CUSTOM_PAGE_DRAWER "{C338B30F-2A04-4b10-871F-4E9D52D62806}"

// menubars config page
#define CUSTOM_PAGE_MENUBARS "{12ED320E-6813-45ac-9F8E-78EE5B2B5F6D}"

// main windowshade config page
#define CUSTOM_PAGE_WINDOWSHADE "{58F07E21-AE96-4899-B7BC-3640B40029FB}"

// vis button config page
#define CUSTOM_PAGE_VISCMD "{D70E3ABF-D2FF-4b82-9A70-4B5DF1A5D942}"

// notifier config page
#define CUSTOM_PAGE_NOTIFIER "{1AB968B3-8687-4a35-BA70-FCF6D92FB57F}"

// songticker config page
#define CUSTOM_PAGE_SONGTICKER "{7061FDE0-0E12-11D8-BB41-0050DA442EF3}"

// non exposed attribs page
#define CUSTOM_PAGE_NONEXPOSED "{E9C2D926-53CA-400f-9A4D-85E31755A4CF}"


// -----------------------------------------------------------------------------------------------------------------

Function initAttribs();

// -----------------------------------------------------------------------------------------------------------------

Global ConfigAttribute scrolldrawerattrib;
Global ConfigAttribute scrollconfigdrawerattrib;

Global ConfigAttribute vis_detach_attrib;
Global ConfigAttribute video_detach_attrib;

Global ConfigAttribute drawer_directiontop_attrib;
Global ConfigAttribute drawer_directionbottom_attrib;
Global ConfigAttribute drawer_directionbypass_attrib;

Global ConfigAttribute eq_visible_attrib, albumart_visible_attrib;

Global ConfigAttribute menubar_main_attrib;
Global ConfigAttribute menubar_pe_attrib;
Global ConfigAttribute menubar_ml_attrib;

Global ConfigAttribute windowshade_linkall_attrib;
Global ConfigAttribute windowshade_linkposition_attrib;
Global ConfigAttribute windowshade_linknone_attrib;

Global ConfigAttribute beatvisualization_attrib;

Global ConfigAttribute viscmd_config_attrib;
Global ConfigAttribute viscmd_menu_attrib;

Global ConfigAttribute notifier_minimized_attrib;
Global ConfigAttribute notifier_windowshade_attrib;
Global ConfigAttribute notifier_always_attrib;
Global ConfigAttribute notifier_never_attrib;
Global ConfigAttribute notifier_fadeintime_attrib;
Global ConfigAttribute notifier_fadeouttime_attrib;
Global ConfigAttribute notifier_holdtime_attrib;
Global ConfigAttribute notifier_disablefullscreen_attrib;

Class ConfigAttribute songticker_scrolling_attrib;
Global songticker_scrolling_attrib songticker_scrolling_modern_attrib;
Global songticker_scrolling_attrib songticker_scrolling_classic_attrib;
Global songticker_scrolling_attrib songticker_scrolling_disabled_attrib;

// -----------------------------------------------------------------------------------------------------------------

initAttribs() {

	// create the custom cfgpage for this session (if it does exist, it just returns it)
	ConfigItem custom_page = Config.newItem("Winamp Modern", CUSTOM_PAGE);
	ConfigItem custom_page_drawer = Config.newItem("Drawers", CUSTOM_PAGE_DRAWER);
	ConfigItem custom_page_menubars = Config.newItem("Menus", CUSTOM_PAGE_MENUBARS);
	ConfigItem custom_page_windowshade = Config.newItem("Main Windowshade Mode", CUSTOM_PAGE_WINDOWSHADE);
	ConfigItem custom_page_viscmd = Config.newItem("Vis Buttons", CUSTOM_PAGE_VISCMD);
	ConfigItem custom_page_notifier = Config.newItem("Notifications", CUSTOM_PAGE_NOTIFIER);
	ConfigItem custom_page_songticker = Config.newItem("Songticker", CUSTOM_PAGE_SONGTICKER);

	ConfigItem custom_page_nonexposed = Config.newItem("Hidden", CUSTOM_PAGE_NONEXPOSED);

	// load up the cfgpage in which we'll insert our custom page
	ConfigItem custom_options_page = Config.getItem(CUSTOM_OPTIONSMENU_ITEMS);
	ConfigItem custom_windows_page = Config.getItem(CUSTOM_WINDOWSMENU_ITEMS);

	// this creates a submenu for this attribute
	ConfigAttribute submenuattrib = custom_options_page.newAttribute("Winamp Modern", "");
	submenuattrib.setData(CUSTOM_PAGE); // discard any default value and point at our custom cfgpage

	ConfigAttribute drawersubmenu = custom_page.newAttribute("Drawers", "");
	drawersubmenu.setData(CUSTOM_PAGE_DRAWER);

	ConfigAttribute menubarssubmenu = custom_page.newAttribute("Menus", "");
	menubarssubmenu.setData(CUSTOM_PAGE_MENUBARS);

	ConfigAttribute windowshadesubmenu = custom_page.newAttribute("Main Windowshade Mode", "");
	windowshadesubmenu.setData(CUSTOM_PAGE_WINDOWSHADE);

	ConfigAttribute viscmdsubmenu = custom_page.newAttribute("Vis Shortcut Button", "");
	viscmdsubmenu.setData(CUSTOM_PAGE_VISCMD);

	ConfigAttribute notifiersubmenu = custom_page.newAttribute("Notifications", "");
	notifiersubmenu.setData(CUSTOM_PAGE_NOTIFIER);

	ConfigAttribute songtickersubmenu = custom_page.newAttribute("Songticker", "");
	songtickersubmenu.setData(CUSTOM_PAGE_SONGTICKER);


	scrolldrawerattrib = custom_page_drawer.newAttribute("Animate Video/Vis Drawer (disabled if opacity < 100%)", "0");
	scrollconfigdrawerattrib = custom_page_drawer.newAttribute("Animate Config Drawer", "0");
	ConfigAttribute sep = custom_page_drawer.newAttribute("sep1", ""); sep.setData("-");
	drawer_directiontop_attrib = custom_page_drawer.newAttribute("Open Video/Vis from the top", "0");
	drawer_directionbottom_attrib = custom_page_drawer.newAttribute("Open Video/Vis from the bottom", "1");
	drawer_directionbypass_attrib = custom_page_drawer.newAttribute("Bypass setting to keep in screen", "1");
	if (drawer_directiontop_attrib.getData() == "1") drawer_directiontop_attrib.onDataChanged(); else drawer_directionbottom_attrib.onDataChanged();

	menubar_main_attrib = custom_page_menubars.newAttribute("Show Menus in Main Window", "1");
	menubar_pe_attrib = custom_page_menubars.newAttribute("Show Menus in Playlist Editor", "1");
	menubar_ml_attrib = custom_page_menubars.newAttribute("Show Menus in Media Library", "1");

	// create an attribute for each of our options, if the attribute already exists, it is returned
	sep = custom_page.newAttribute("sep1", ""); sep.setData("-");
	vis_detach_attrib = custom_page.newAttribute("Detach Vis Window", "0");
	video_detach_attrib = custom_page.newAttribute("Detach Video Window", "0");
	eq_visible_attrib = custom_windows_page.newAttribute("Equalizer\tAlt+G", "0");
	albumart_visible_attrib = custom_windows_page.newAttribute("Album Art\tAlt+A", "1");

	sep = custom_page.newAttribute("sep2", ""); sep.setData("-");
	beatvisualization_attrib = custom_page.newAttribute("Enable Beat Visualization", "1");

	windowshade_linkall_attrib = custom_page_windowshade.newAttribute("Link Position and Width", "1");
	windowshade_linkposition_attrib = custom_page_windowshade.newAttribute("Link Position, Unlink Width", "0");
	windowshade_linknone_attrib = custom_page_windowshade.newAttribute("Unlink Position and Width", "0");

	viscmd_menu_attrib = custom_page_viscmd.newAttribute("Open Context Menu", "1");
	viscmd_config_attrib = custom_page_viscmd.newAttribute("Open Configuration", "0");

	notifier_always_attrib = custom_page_notifier.newAttribute("Show always", "0");
	notifier_windowshade_attrib = custom_page_notifier.newAttribute("Show with windowshade and when minimized", "0");
	notifier_minimized_attrib = custom_page_notifier.newAttribute("Show only when minimized", "0");
	notifier_never_attrib = custom_page_notifier.newAttribute("Never show", "1");
	sep = custom_page_notifier.newAttribute("sep1", ""); sep.setData("-");
	notifier_disablefullscreen_attrib = custom_page_notifier.newAttribute("Disable in fullscreen", "1");

	notifier_fadeintime_attrib = custom_page_nonexposed.newAttribute("Notifications fade in time", "1000");
	notifier_fadeouttime_attrib = custom_page_nonexposed.newAttribute("Notifications fade out time", "5000");
	notifier_holdtime_attrib = custom_page_nonexposed.newAttribute("Notifications display time", "2000");

	songticker_scrolling_disabled_attrib = custom_page_songticker.newAttribute("Disable Songticker scrolling", "0");
	if (songticker_scrolling_disabled_attrib.getData() == "0") songticker_scrolling_modern_attrib = custom_page_songticker.newAttribute("Modern Songticker scrolling", "1");
	else songticker_scrolling_modern_attrib = custom_page_songticker.newAttribute("Modern Songticker scrolling", "0");	
	songticker_scrolling_classic_attrib = custom_page_songticker.newAttribute("Classic Songticker scrolling", "0");
}

// -----------------------------------------------------------------------------------------------------------------

#ifdef MAIN_ATTRIBS_MGR

Global Int attribs_mychange;

#define NOOFF if (getData()=="0") { setData("1"); return; }

drawer_directiontop_attrib.onDataChanged() {
  if (attribs_mychange) return;
  NOOFF
  attribs_mychange = 1;
  drawer_directionbottom_attrib.setData("0");
  drawer_directiontop_attrib.setData("1");
  attribs_mychange = 0;
}

drawer_directionbottom_attrib.onDataChanged() {
  if (attribs_mychange) return;
  NOOFF
  attribs_mychange = 1;
  drawer_directiontop_attrib.setData("0");
  drawer_directionbottom_attrib.setData("1");
  attribs_mychange = 0;
}

windowshade_linkall_attrib.onDataChanged() {
  if (attribs_mychange) return;
  NOOFF
  attribs_mychange = 1;
  windowshade_linkposition_attrib.setData("0");
  windowshade_linknone_attrib.setData("0");
  attribs_mychange = 0;
}

windowshade_linkposition_attrib.onDataChanged() {
  if (attribs_mychange) return;
  NOOFF
  attribs_mychange = 1;
  windowshade_linkall_attrib.setData("0");
  windowshade_linknone_attrib.setData("0");
  attribs_mychange = 0;
}

windowshade_linknone_attrib.onDataChanged() {
  if (attribs_mychange) return;
  NOOFF
  attribs_mychange = 1;
  windowshade_linkall_attrib.setData("0");
  windowshade_linkposition_attrib.setData("0");
  attribs_mychange = 0;
}

viscmd_menu_attrib.onDataChanged() {
  if (attribs_mychange) return;
  NOOFF
  attribs_mychange = 1;
  viscmd_config_attrib.setData("0");
  attribs_mychange = 0;
  updateVisCmd();
}

viscmd_config_attrib.onDataChanged() {
  if (attribs_mychange) return;
  NOOFF
  attribs_mychange = 1;
  viscmd_menu_attrib.setData("0");
  attribs_mychange = 0;
  updateVisCmd();
}

notifier_always_attrib.onDataChanged() {
  if (attribs_mychange) return;
  NOOFF
  attribs_mychange = 1;
  notifier_never_attrib.setData("0");
  notifier_windowshade_attrib.setData("0");
  notifier_minimized_attrib.setData("0");
  attribs_mychange = 0;
}

notifier_never_attrib.onDataChanged() {
  if (attribs_mychange) return;
  NOOFF
  attribs_mychange = 1;
  notifier_always_attrib.setData("0");
  notifier_windowshade_attrib.setData("0");
  notifier_minimized_attrib.setData("0");
  attribs_mychange = 0;
}

notifier_minimized_attrib.onDataChanged() {
  if (attribs_mychange) return;
  NOOFF
  attribs_mychange = 1;
  notifier_never_attrib.setData("0");
  notifier_windowshade_attrib.setData("0");
  notifier_always_attrib.setData("0");
  attribs_mychange = 0;
}

notifier_windowshade_attrib.onDataChanged() {
  if (attribs_mychange) return;
  NOOFF
  attribs_mychange = 1;
  notifier_never_attrib.setData("0");
  notifier_always_attrib.setData("0");
  notifier_minimized_attrib.setData("0");
  attribs_mychange = 0;
}

songticker_scrolling_modern_attrib.onDataChanged() {
  if (attribs_mychange) return;
  NOOFF
  attribs_mychange = 1;
  songticker_scrolling_disabled_attrib.setData("0");
  songticker_scrolling_classic_attrib.setData("0");
  attribs_mychange = 0;
}
songticker_scrolling_disabled_attrib.onDataChanged() {
  if (attribs_mychange) return;
  NOOFF
  attribs_mychange = 1;
  songticker_scrolling_modern_attrib.setData("0");
  songticker_scrolling_classic_attrib.setData("0");
  attribs_mychange = 0;
}
songticker_scrolling_classic_attrib.onDataChanged() {
  if (attribs_mychange) return;
  NOOFF
  attribs_mychange = 1;
  songticker_scrolling_modern_attrib.setData("0");
  songticker_scrolling_disabled_attrib.setData("0");
  attribs_mychange = 0;
}
#endif

#endif
