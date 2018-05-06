
var show_nothingness = true;
var menus = {
	"&MP3": [
		{
			item: "&Play...",
			action: ()=> {
				
			},
			enabled: false,
		},
		{
			item: "&Stop",
			action: ()=> {
				
			},
			enabled: false,
		},
		{
			item: "P&ause",
			action: ()=> {
				
			},
			enabled: false,
		},
		{
			item: "&Unpause",
			action: ()=> {
				
			},
			enabled: false,
		},
		$MenuBar.DIVIDER,
		{
			item: "E&xit",
			action: ()=> {
				
			},
			enabled: false,
		}
	],
	"&Help": [
		{
			item: "&About...",
			action: ()=> {
				var $about_window = $Window({ title: "About WinAMP" });
				$about_window.$content.html(`
					WinAMP v0.2a<br>
					Compiled on Apr 21 1997 at 22:42:06<br>
					Copyright (C) 1997, Nullsoft<br>
					This program is freeware -- for more information,<br>
					please read the included README.TXT
				`);
				$about_window.$Button("OK", function(){
					
				});
			}
		},
	]
};
var $menubar = new $MenuBar(menus);

TITLEBAR_ICON_SIZE = 16;

function $Icon(path, size){
	var $img = $("<img class='icon'/>");
	$img.attr({
		draggable: false,
		src: path,
		width: size,
		height: size,
	});
	return $img;
}

var $window = new $Window({title: "WinAMP v0.2a", icon: "winamp-0.2.png"});
$window.$content.append($menubar);
$window.width(220);

$window.on("close", (event)=> {
	event.preventDefault();
});

$window.center();
