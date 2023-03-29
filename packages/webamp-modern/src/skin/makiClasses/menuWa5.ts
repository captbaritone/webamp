import PopupMenu, { MenuItem } from "./PopupMenu";

export function getWa5Popup(popupId: string): PopupMenu {
    if(['PE_Help', 'ML_Help'].includes(popupId)) popupId = 'Help';
    const res = wa5commonRes.includes(popupId) ? wa5commonRes : wa5miscRes.includes(popupId) ? popupId : '';
    // const popupJson =getPopupJson(popupId, res);
    // console.log('FOUND', popupId, popupJson)
    const popup =getPopupMenu(popupId, res);
    console.log('FOUND', popupId, popup)
    return popup;
}

function getPopupJson(popupId: string, res:string): MenuItem[] {
    const root = [];
    let container = root;
    let levelStack = [root];
    let popup: PopupMenu = null;
    let popupStack: PopupMenu[] = [];
    let found = false;
    // let currentItem = null

    // Looping setiap baris pada string menu
    for (let line of res.split('\n')) {
        line = line.trim()

        if(!found && !line.startsWith('POPUP'))     // skip until found popup
            continue;

        // Mengabaikan baris yang tidak penting
        if (!line || line.startsWith('//')) {
            continue;
        }

        // Mengambil level pada baris saat ini
        // const level = line.search(/\S/);

        // Mengecek apakah baris merupakan menu
        // const menuMatch = line.match(/\s*(POPUP|MENUITEM)\s+"([^"]+)"(?:\s*,\s*(\d+))?,\s*(\d+),\s*(\d+)/i);
        const menuMatch = line.match(/\s*(POPUP|MENUITEM)\s+(SEPARATOR|"([^"]*)")(?:\s*,\s*(\w+)[\s,]*(.*))?/i);
        if (menuMatch) {
            // console.log('match', menuMatch)
            // Mengambil informasi menu
            let [, tag, t1, t2, sid, flags] = menuMatch;
            const type = tag == 'POPUP' ? 'popup' : (t1 == 'SEPARATOR' || (flags || '').indexOf('MFT_SEPARATOR') >= 0) ? 'separator' : 'menuitem';
            const id = parseInt(sid)


            if(!found) {
                if(type=='popup' && t2 == popupId)   {
                    found = true;
                } else {
                    continue;    // skip
                }
            }

            flags = flags || ''
            // Membuat objek menu baru
            // @ts-ignore
            const menu: MenuItem = {
                type,
            };
            container.push(menu); // attach to prent
            switch (menu.type) {
                case 'popup':
                    const newPopup = new PopupMenu();
                    if(popup){  // if it is a sub-popup, attach to parent
                        popup.addsubmenu(newPopup, t2)
                    }
                    popup = newPopup;
                    popupStack.push(popup);
                    menu.popup = popup;
                    menu.caption = t2;
                    menu.children = [];
                    container = menu.children;
                    if (flags.indexOf('GRAYED') >= 0) menu.disabled = true;
                    levelStack.push(container)
                    break;
                case 'menuitem':
                    menu.caption = t2;
                    menu.id = id;
                    // if(flags.indexOf('GRAYED') >= 0) menu.disabled = true;
                    menu.disabled = flags.indexOf('GRAYED') >= 0;
                    popup.addcommand(t2, id, false, menu.disabled)
                    break;
                case 'separator':
                    popup.addseparator()
                    break;
            }
            // const id = type=='popup'? 65535: type == 'separator' ? 0 : parseInt(sid);

            // console.log('m', newMenu, '>>', flags)
            // @ts-ignore
            // menu.flags = flags;

            // console.log('m', menu)

        } else if (['}', 'END'].includes(line.trim())) {
            // Menutup menu saat ini
            levelStack.pop();
            container = levelStack[levelStack.length - 1];
            if(found) { 
                if(container == root)
                    break;

                popupStack.pop();
                popup = popupStack[popupStack.length - 1];
            }
        }
    }

    return root;
}

function getPopupMenu(popupId: string, res:string): PopupMenu {
    let root: PopupMenu;
    // let container = root;
    // let levelStack = [root];
    let popup: PopupMenu = null;
    let popupStack: PopupMenu[] = [];
    let found = false;
    // let currentItem = null

    // Looping setiap baris pada string menu
    for (let line of res.split('\n')) {
        line = line.trim()

        if(!found && !line.startsWith('POPUP'))     // skip until found popup
            continue;

        // Mengabaikan baris yang tidak penting
        if (!line || line.startsWith('//')) {
            continue;
        }

        // Mengambil level pada baris saat ini
        // const level = line.search(/\S/);

        // Mengecek apakah baris merupakan menu
        // const menuMatch = line.match(/\s*(POPUP|MENUITEM)\s+"([^"]+)"(?:\s*,\s*(\d+))?,\s*(\d+),\s*(\d+)/i);
        const menuMatch = line.match(/\s*(POPUP|MENUITEM)\s+(SEPARATOR|"([^"]*)")(?:\s*,\s*(\w+)[\s,]*(.*))?/i);
        if (menuMatch) {
            // console.log('match', menuMatch)
            // Mengambil informasi menu
            let [, tag, t1, t2, sid, flags] = menuMatch;
            const type = tag == 'POPUP' ? 'popup' : (t1 == 'SEPARATOR' || (flags || '').indexOf('MFT_SEPARATOR') >= 0) ? 'separator' : 'menuitem';
            const id = parseInt(sid)


            if(!found) {
                if(type=='popup' && t2 == popupId)   {
                    found = true;
                } else {
                    continue;    // skip
                }
            }

            flags = flags || ''
            // Membuat objek menu baru
            // @ts-ignore
            const menu: MenuItem = {
                type,
            };
            // container.push(menu); // attach to prent
            switch (menu.type) {
                case 'popup':
                    const newPopup = new PopupMenu();
                    if(popup){  // if it is a sub-popup, attach to parent
                        popup.addsubmenu(newPopup, t2)
                    } else {
                        root = newPopup
                    }
                    popup = newPopup;
                    popupStack.push(popup);
                    menu.popup = popup;
                    menu.caption = t2;
                    menu.children = [];
                    // container = menu.children;
                    if (flags.indexOf('GRAYED') >= 0) menu.disabled = true;
                    // levelStack.push(container)
                    break;
                case 'menuitem':
                    menu.caption = t2;
                    menu.id = id;
                    // if(flags.indexOf('GRAYED') >= 0) menu.disabled = true;
                    menu.disabled = flags.indexOf('GRAYED') >= 0;
                    popup.addcommand(t2, id, false, menu.disabled)
                    break;
                case 'separator':
                    popup.addseparator()
                    break;
            }
            // const id = type=='popup'? 65535: type == 'separator' ? 0 : parseInt(sid);

            // console.log('m', newMenu, '>>', flags)
            // @ts-ignore
            // menu.flags = flags;

            // console.log('m', menu)

        } else if (['}', 'END'].includes(line.trim())) {
            // Menutup menu saat ini
            // levelStack.pop();
            // container = levelStack[levelStack.length - 1];
            if(found) { 
                if(popup == root)
                    break;

                popupStack.pop();
                popup = popupStack[popupStack.length - 1];
            }
        }
    }

    return root;
}

const wa5commonRes = `256 MENUEX
LANGUAGE LANG_ENGLISH, SUBLANG_ENGLISH_US
{
  POPUP "File", 65535, MFT_STRING, MFS_ENABLED, 0
  {
    MENUITEM "Play &file...   	L", 40029, MFT_STRING, MFS_ENABLED
    MENUITEM "Play &URL...	Ctrl+L", 40185, MFT_STRING, MFS_ENABLED
    MENUITEM "Play &folder...	Shift+L", 40187, MFT_STRING, MFS_ENABLED
    POPUP "Play &bookmark", 65535, MFT_STRING, MFS_ENABLED, 0
    {
      MENUITEM "&Edit bookmarks...	Ctrl+Alt+I", 40320, MFT_STRING, MFS_ENABLED
      MENUITEM "&Add current as bookmark	Ctrl+Alt+B", 40321, MFT_STRING, MFS_ENABLED
      MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    }
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "Open &playlist	Ctrl+O", 40202, MFT_STRING, MFS_ENABLED
    MENUITEM "&Save playlist	Ctrl+S", 40204, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "&Add media to Library...", 40344, MFT_STRING, MFS_ENABLED
    MENUITEM "Add current playlist to Library", 40466, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "&View file info...	Alt+3", 40188, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "E&xit	Alt+F4", 40001, MFT_STRING, MFS_ENABLED
  }
  POPUP "Play", 65535, MFT_STRING, MFS_ENABLED, 0
  {
    MENUITEM "P&revious	Z", 40044, MFT_STRING, MFS_ENABLED
    MENUITEM "&Play	X", 40045, MFT_STRING, MFS_ENABLED
    MENUITEM "P&ause	C", 40046, MFT_STRING, MFS_ENABLED
    MENUITEM "&Stop	V", 40047, MFT_STRING, MFS_ENABLED
    MENUITEM "&Next              	B", 40048, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    POPUP "&Advanced Playback", 65535, MFT_STRING, MFS_ENABLED, 0
    {
      MENUITEM "&Start of list	Ctrl+Z", 40154, MFT_STRING, MFS_ENABLED
      MENUITEM "Stop w/ fa&deout	Shift+V", 40147, MFT_STRING, MFS_ENABLED
      MENUITEM "Stop after &current	Ctrl+V", 40157, MFT_STRING, MFS_ENABLED
    }
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    POPUP "&Jump to", 65535, MFT_STRING, MFS_ENABLED, 0
    {
      MENUITEM "Ju&mp to track	J", 40194, MFT_STRING, MFS_ENABLED
      MENUITEM "Jump 10 t&racks back	Num. 1", 40197, MFT_STRING, MFS_ENABLED
      MENUITEM "Jump 10 &tracks fwd	Num. 3", 40195, MFT_STRING, MFS_ENABLED
      MENUITEM "&Jump to time	Ctrl+J", 40193, MFT_STRING, MFS_ENABLED
      MENUITEM "&Start of list	Ctrl+Z", 40154, MFT_STRING, MFS_ENABLED
      MENUITEM "&End of list	Ctrl+B", 40158, MFT_STRING, MFS_ENABLED
    }
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "&Back 5 seconds	Left", 40144, MFT_STRING, MFS_ENABLED
    MENUITEM "&Fwd 5 seconds	Right", 40148, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "&Repeat	R", 40022, MFT_STRING, MFS_ENABLED
    MENUITEM "&Shuffle	S", 40023, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "Volume &Up	Up", 40351, MFT_STRING, MFS_ENABLED
    MENUITEM "Volume &Down	Down", 40352, MFT_STRING, MFS_ENABLED
  }
  POPUP "Options", 65535, MFT_STRING, MFS_ENABLED, 0
  {
    POPUP "&Skins", 65535, MFT_STRING, MFS_ENABLED, 0
    {
      MENUITEM "S&kin Browser...	Alt+S", 40219, MFT_STRING, MFS_ENABLED
      MENUITEM "<< Get more skins! >>", 40316, MFT_STRING, MFS_ENABLED
      MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
      MENUITEM "Winamp Classic", 32767, MFT_STRING, MFS_ENABLED
    }
    POPUP "&Visualization", 65535, MFT_STRING, MFS_ENABLED, 0
    {
      MENUITEM "Start/Stop &plug-in	Ctrl+Shift+K", 40192, MFT_STRING, MFS_ENABLED
      MENUITEM "&Configure plug-in... 	Alt+K", 40221, MFT_STRING, MFS_ENABLED
      MENUITEM "&Select plug-in...	Ctrl+K", 40191, MFT_STRING, MFS_ENABLED
    }
    POPUP "&Equalizer", 65535, MFT_STRING, MFS_ENABLED, 0
    {
      MENUITEM "&EQ enabled", 40244, MFT_STRING, MFS_ENABLED
      POPUP "&Load Preset", 65535, MFT_STRING, MFS_ENABLED, 0
      {
        MENUITEM "&Preset...", 40172, MFT_STRING, MFS_ENABLED
        MENUITEM "&Auto-load preset...", 40173, MFT_STRING, MFS_ENABLED
        MENUITEM "&Default", 40174, MFT_STRING, MFS_ENABLED
        MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
        MENUITEM "From &EQF...", 40253, MFT_STRING, MFS_ENABLED
      }
      POPUP "&Save Preset", 65535, MFT_STRING, MFS_ENABLED, 0
      {
        MENUITEM "&Preset...", 40175, MFT_STRING, MFS_ENABLED
        MENUITEM "&Auto-load preset...", 40176, MFT_STRING, MFS_ENABLED
        MENUITEM "&Default", 40177, MFT_STRING, MFS_ENABLED
        MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
        MENUITEM "To &EQF...", 40254, MFT_STRING, MFS_ENABLED
      }
      POPUP "&Delete Preset", 65535, MFT_STRING, MFS_ENABLED, 0
      {
        MENUITEM "&Preset...", 40178, MFT_STRING, MFS_ENABLED
        MENUITEM "&Auto-load preset...", 40180, MFT_STRING, MFS_ENABLED
      }
    }
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "Time &elapsed	Ctrl+T toggles", 40037, MFT_STRING, MFS_ENABLED
    MENUITEM "Time re&maining	Ctrl+T toggles", 40038, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "&Always On Top	Ctrl+A", 40019, MFT_STRING, MFS_ENABLED
    MENUITEM "&Double Size	Ctrl+D", 40165, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "&Preferences...    	Ctrl+P", 40012, MFT_STRING, MFS_ENABLED
  }
  POPUP "Windows", 65535, MFT_STRING, MFS_ENABLED, 0
  {
    MENUITEM "Playlist &Editor	Alt+E", 40040, MFT_STRING, MFS_ENABLED
    MENUITEM "&Video	Alt+V", 40328, MFT_STRING, MFS_ENABLED
    MENUITEM "Visualizations	Ctrl+Shift+K", 40192, MFT_STRING, MFS_ENABLED
  }
  POPUP "Help", 65535, MFT_STRING, MFS_ENABLED, 0
  {
    MENUITEM "Winamp Help	F1", 40347, MFT_STRING, MFS_ENABLED
    MENUITEM "Send &Feedback", 40464, MFT_STRING, MFS_ENABLED
    MENUITEM "&Register Winamp Pro", 40394, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "About &Winamp...", 40041, MFT_STRING, MFS_ENABLED
  }
  POPUP "PE_File", 65535, MFT_STRING, MFS_ENABLED, 0
  {
    MENUITEM "&New playlist (clear)	Ctrl+N", 40214, MFT_STRING, MFS_ENABLED
    MENUITEM "&Open playlist	Ctrl+O", 40202, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "&Add file(s)	L", 1032, MFT_STRING, MFS_ENABLED
    MENUITEM "Add &folder	Shift+L", 1036, MFT_STRING, MFS_ENABLED
    MENUITEM "Add UR&L	Ctrl+L", 1039, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "&Save playlist	Ctrl+S", 40204, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "File &info	Alt+3", 40188, MFT_STRING, MFS_ENABLED
    MENUITEM "Playlist &entry	Ctrl+E", 40255, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "&Close playlist editor	Alt+E", 40224, MFT_STRING, MFS_ENABLED
  }
  POPUP "PE_Playlist", 65535, MFT_STRING, MFS_ENABLED, 0
  {
    MENUITEM "Select &all	Ctrl+Alt+A", 40205, MFT_STRING, MFS_ENABLED
    MENUITEM "Select &none", 40207, MFT_STRING, MFS_ENABLED
    MENUITEM "&Invert selection	Ctrl+I", 40171, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "&Remove selected	Delete", 1034, MFT_STRING, MFS_ENABLED
    MENUITEM "&Crop selected	Ctrl+Delete", 1035, MFT_STRING, MFS_ENABLED
    MENUITEM "C&lear playlist	Ctrl+Shift+Delete", 40214, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "Remove &missing files from playlist	Alt+Delete", 40222, MFT_STRING, MFS_ENABLED
    MENUITEM "&Physically remove selected file(s)", 40223, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "Playlist pre&ferences...", 40358, MFT_STRING, MFS_ENABLED
  }
  POPUP "PE_Sort", 65535, MFT_STRING, MFS_ENABLED, 0
  {
    MENUITEM "Sort list by &title	Ctrl+Shift+1", 40209, MFT_STRING, MFS_ENABLED
    MENUITEM "Sort list by &filename	Ctrl+Shift+2", 40210, MFT_STRING, MFS_ENABLED
    MENUITEM "Sort list by &path and filename	Ctrl+Shift+3", 40211, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "R&everse list	Ctrl+R", 40213, MFT_STRING, MFS_ENABLED
    MENUITEM "&Randomize list	Ctrl+Shift+R", 40212, MFT_STRING, MFS_ENABLED
  }
  POPUP "ML_File", 65535, MFT_STRING, MFS_ENABLED, 0
  {
    MENUITEM "&New playlist	Shift+Ins", 40359, MFT_STRING, MFS_ENABLED
    MENUITEM "Import &current playlist", 40374, MFT_STRING, MFS_ENABLED
    MENUITEM "&Import playlist from file", 40360, MFT_STRING, MFS_ENABLED
    MENUITEM "&Export playlist", 40361, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "&Add media to Library...", 40344, MFT_STRING, MFS_ENABLED
    MENUITEM "Add current playlist to Library", 40466, MFT_STRING, MFS_ENABLED
    MENUITEM "", 0, MFT_SEPARATOR, MFS_ENABLED
    MENUITEM "&Close Media Library	Alt+L", 40380, MFT_STRING, MFS_ENABLED
  }
  POPUP "ML_View", 65535, MFT_STRING, MFS_ENABLED, 0
  {
    MENUITEM "Media Library &Preferences...", 40372, MFT_STRING | MFT_RIGHTJUSTIFY, MFS_ENABLED
  }
}
`;

const wa5miscRes = `101 MENU
LANGUAGE LANG_ENGLISH, SUBLANG_ENGLISH_US
{
  POPUP "Main"
  {
    MENUITEM "Nullsoft &Winamp...",  40041
    MENUITEM SEPARATOR
    POPUP "&Play"
    {
      MENUITEM "&File...   	L",  40029
      MENUITEM "&URL...	Ctrl+L",  40185
      MENUITEM "&Folder...	Shift+L",  40187
      MENUITEM SEPARATOR
      POPUP "&Bookmark"
      {
        MENUITEM "(no bookmarks)",  40322,  INACTIVE
      }
    }
    MENUITEM "View &file info...	Alt+3",  40188
    POPUP "&Bookmarks"
    {
      MENUITEM "&Edit bookmarks...	Ctrl+Alt+I",  40320
      MENUITEM "&Add current as bookmark	Ctrl+Alt+B",  40321
      MENUITEM SEPARATOR
    }
    MENUITEM SEPARATOR
    MENUITEM "&Main Window	Alt+W",  40258
    MENUITEM "Playlist &Editor	Alt+E",  40040
    MENUITEM "E&qualizer     	Alt+G",  40036
    MENUITEM "&Video	Alt+V",  40328
    MENUITEM SEPARATOR
    POPUP "&Options"
    {
      MENUITEM "&Preferences...    	Ctrl+P",  40012
      POPUP "Skins"
      {
        MENUITEM "S&kin Browser...	Alt+S",  40219
        MENUITEM "<< Get more skins! >>",  40316
        MENUITEM SEPARATOR
        MENUITEM "Winamp Classic",  32767
      }
      MENUITEM SEPARATOR
      MENUITEM "Time &elapsed	Ctrl+T toggles",  40037
      MENUITEM "Time re&maining	Ctrl+T toggles",  40038
      MENUITEM SEPARATOR
      MENUITEM "&Always On Top	Ctrl+A",  40019
      MENUITEM "&Double Size	Ctrl+D",  40165
      MENUITEM "&EasyMove	Ctrl+E",  40186
      MENUITEM SEPARATOR
      MENUITEM "&Repeat	R",  40022
      MENUITEM "&Shuffle	S",  40023
    }
    POPUP "Play&back"
    {
      MENUITEM "P&revious	Z",  40044
      MENUITEM "&Play	X",  40045
      MENUITEM "P&ause	C",  40046
      MENUITEM "&Stop	V",  40047
      MENUITEM "&Next              	B",  40048
      MENUITEM SEPARATOR
      MENUITEM "Stop w/ fa&deout	Shift+V",  40147
      MENUITEM "Stop after &current	Ctrl+V",  40157
      MENUITEM "&Back 5 seconds	Left",  40144
      MENUITEM "&Fwd 5 seconds	Right",  40148
      MENUITEM "&Start of list	Ctrl+Z",  40154
      MENUITEM "&End of list	Ctrl+B",  40158
      MENUITEM "10 t&racks back	Num. 1",  40197
      MENUITEM "10 &tracks fwd	Num. 3",  40195
      MENUITEM SEPARATOR
      MENUITEM "&Jump to time	Ctrl+J",  40193
      MENUITEM "Ju&mp to file	J",  40194
    }
    POPUP "&Visualization"
    {
      MENUITEM "Start/Stop &plug-in	Ctrl+Shift+K",  40192
      MENUITEM "&Configure plug-in... 	Alt+K",  40221
      MENUITEM "&Select plug-in...	Ctrl+K",  40191
    }
    POPUP "&Skins"
    {
      MENUITEM "S&kin Browser...	Alt+S",  40219
      MENUITEM "<< Get more skins! >>",  40316
      MENUITEM SEPARATOR
      MENUITEM "Winamp Classic",  32767
    }
    MENUITEM SEPARATOR
    MENUITEM "Winamp &Help	F1",  40347
    MENUITEM SEPARATOR
    MENUITEM "E&xit	Alt+F4",  40001
  }
  POPUP "EQpresets"
  {
    POPUP "Load"
    {
      MENUITEM "&Preset...",  40172
      MENUITEM "&Auto-load preset...",  40173
      MENUITEM "&Default",  40174
      MENUITEM SEPARATOR
      MENUITEM "From &EQF...",  40253
    }
    POPUP "Save"
    {
      MENUITEM "&Preset...",  40175
      MENUITEM "&Auto-load preset...",  40176
      MENUITEM "&Default",  40177
      MENUITEM SEPARATOR
      MENUITEM "To &EQF...",  40254
    }
    POPUP "Delete"
    {
      MENUITEM "&Preset...",  40178
      MENUITEM "&Auto-load preset...",  40180
    }
  }
  POPUP "PLContextMenu"
  {
    POPUP "MiscOpt"
    {
      POPUP "File info"
      {
        MENUITEM "F&ile info...	Alt+3",  40208
        MENUITEM "Playlist &entry...	Ctrl+E",  40255
      }
      POPUP "Sort"
      {
        MENUITEM "Sort list by &title	Ctrl+Shift+1",  40209
        MENUITEM "Sort list by &filename	Ctrl+Shift+2",  40210
        MENUITEM "Sort list by &path and filename	Ctrl+Shift+3",  40211
        MENUITEM SEPARATOR
        MENUITEM "R&everse list	Ctrl+R",  40213
        MENUITEM "&Randomize list	Ctrl+Shift+R",  40212
      }
      POPUP "Misc"
      {
        MENUITEM "&Generate HTML playlist	Ctrl+Alt+G",  40292
        MENUITEM SEPARATOR
        MENUITEM "&Read extended info on selection	Ctrl+Alt+E",  40293
      }
    }
    POPUP "Add"
    {
      MENUITEM "Add &file(s)	L",  1032
      MENUITEM "Add f&older	Shift+L",  1036
      MENUITEM "Add &URL	Ctrl+L",  1039
    }
    POPUP "Remove"
    {
      MENUITEM "&Remove selected	Delete",  1034
      MENUITEM "Crop &selected	Ctrl+Delete",  1035
      MENUITEM "&Clear playlist	Ctrl+Shift+Delete",  40214
      POPUP "Remove..."
      {
        MENUITEM "Remove &missing files from playlist	Alt+Delete",  40222
        MENUITEM "&Physically remove selected file(s)",  40223
      }
    }
    POPUP "Select"
    {
      MENUITEM "Select &all	Ctrl+A",  40205
      MENUITEM "Select &none",  40207
      MENUITEM "&Invert selection	Ctrl+I",  40171
    }
    POPUP "Playlist"
    {
      MENUITEM "&Open playlist...	Ctrl+O",  40202
      MENUITEM "&Save playlist...	Ctrl+S",  40204
      MENUITEM "&New playlist (clear)	Ctrl+N",  40214
    }
    POPUP "Context"
    {
      MENUITEM "&Play item(s)	Enter",  40184
      MENUITEM SEPARATOR
      MENUITEM "&Remove item(s)	Delete",  1034
      MENUITEM "&Crop files	Ctrl+Delete",  1035
      MENUITEM SEPARATOR
      MENUITEM "Edit &metadata for selection...	Shift+E",  40470
      MENUITEM "&View file info...	Alt+3",  40208
      MENUITEM "Playlist &entry	Ctrl+E",  40255
      MENUITEM "&Bookmark item(s)	Ctrl+Alt+B",  40319
      MENUITEM SEPARATOR
      POPUP "Rate &items"
      {
        MENUITEM "*****",  40402
        MENUITEM "****",  40403
        MENUITEM "***",  40404
        MENUITEM "**",  40405
        MENUITEM "*",  40406
        MENUITEM "No rating",  40407
      }
      MENUITEM SEPARATOR
      MENUITEM "Explore item(s) &folder	Ctrl+F",  40468
    }
  }
  POPUP "Context menus"
  {
    POPUP "Song title"
    {
      MENUITEM "View &file info...	Alt+3 or Dblclick",  40188
      MENUITEM "&Jump to file...	J",  40194
      MENUITEM "Jump to &time...	Ctrl+J",  40193
      MENUITEM "&Autoscroll songname",  40189
      MENUITEM SEPARATOR
      POPUP "&Rating"
      {
        MENUITEM "*****",  40396
        MENUITEM "****",  40397
        MENUITEM "***",  40398
        MENUITEM "**",  40399
        MENUITEM "*",  40400
        MENUITEM "No rating",  40401
      }
    }
    POPUP "Time display"
    {
      MENUITEM "Time &elapsed	Ctrl+T toggles",  40037
      MENUITEM "Time re&maining	Ctrl+T toggles",  40038
    }
    POPUP "Previous button"
    {
      MENUITEM "&Previous	Click",  40044
      MENUITEM "&Start of list	Ctrl+Click",  40154
      MENUITEM "&Rewind 5 seconds	Shift+Click",  40144
    }
    POPUP "Play Button"
    {
      MENUITEM "&Play/restart	Click",  40045
      MENUITEM "Open &URL...	Ctrl+Click",  40155
      MENUITEM "Open &file...	Shift+Click",  40145
    }
    POPUP "Pause button"
    {
      MENUITEM "&Pause/Unpause	Click",  40046
    }
    POPUP "Stop button"
    {
      MENUITEM "&Stop	Click",  40047
      MENUITEM "Stop w/&fadeout	Shift+Click",  40147
      MENUITEM "Stop after &current	Ctrl+Click",  40157
    }
    POPUP "Next button"
    {
      MENUITEM "&Next	Click",  40048
      MENUITEM "&Fastforward 5 seconds	Shift+Click",  40148
      MENUITEM "&End of list	Ctrl+Click",  40158
    }
    POPUP "Eject button"
    {
      MENUITEM "Open &file...	Click",  40029
      MENUITEM "Open f&older...	Shift+Click",  40187
      MENUITEM "Open &URL...	Ctrl+Click",  40185
    }
    POPUP "Seek bar"
    {
      MENUITEM "&Jump to time	Ctrl+J",  40193
      MENUITEM "&Rewind 5 seconds	Left Arrow",  40061
      MENUITEM "&Forward 5 seconds	Right Arrow",  40060
    }
    POPUP "Shuffle"
    {
      MENUITEM "&Shuffle	S",  40023
    }
    POPUP "Repeat"
    {
      MENUITEM "&Repeat	R",  40022
      MENUITEM "&Manual Playlist Advance	Shift+R",  40395
    }
    POPUP "EQ button"
    {
      MENUITEM "Graphical E&qualizer	Alt+G",  40036
    }
    POPUP "PE button"
    {
      MENUITEM "Playlist &Editor	Alt+E",  40040
    }
    POPUP "VideoWnd"
    {
      MENUITEM "&Fullscreen	Alt+Enter",  40329
      MENUITEM SEPARATOR
      MENUITEM "&Normal size	1",  40330
      MENUITEM "&Half size	&tilde; or 3",  40332
      MENUITEM "&Double size	2",  40331
      MENUITEM SEPARATOR
      MENUITEM "Vertically &flip	Shift+F",  40465
      MENUITEM SEPARATOR
      POPUP "&Audio track"
      {
        MENUITEM "Track 1",  40408
      }
      POPUP "&Video track"
      {
        MENUITEM "Track 1",  40424
      }
      MENUITEM SEPARATOR
      MENUITEM "Video &options...",  40333
    }
  }
  POPUP "EQContext"
  {
    POPUP "enbut"
    {
      MENUITEM "&EQ enabled	N",  40244
    }
    POPUP "albut"
    {
      MENUITEM "&EQ autoloading enabled	A",  40245
    }
  }
  POPUP "Prefs"
  {
    POPUP "Skin"
    {
      MENUITEM "&Switch to skin",  40386
      MENUITEM SEPARATOR

      MENUITEM "&Rename skin...",  40388
      MENUITEM "&Delete skin...",  40387
    }
    POPUP "Lang"
    {
      MENUITEM "&Switch to language pack",  40458
      MENUITEM SEPARATOR
      MENUITEM "&Rename language pack...",  40459
      MENUITEM "&Delete language pack...",  40460
    }
  }
}
`;