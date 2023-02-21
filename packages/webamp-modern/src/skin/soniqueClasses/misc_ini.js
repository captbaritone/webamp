export const MISC = `
;*******************************************************
;
;	Skin.Ini Imports for sonique 1.05
;
;
;   Items imported via skin.ini
;
;   If you don't specify an item, the default value is used.
;   Therefor you only need to specify values which are different from the default.
;
;   [section] 
;	item = defaultvalue
;
;
;   enjoy
;     -  Andrew McCann (pX)
;		mccann@sonique.com
;		programmer/designer 
;
;*******************************************************



// 1.00.3  spec


;************************************************************************
;*  sonique colors
;************************************************************************
 
[sonique colors]

SystemColor_1		=	0xFF00FFFF
SystemColor_2		=	0xFFFFFF00
SystemColor_3		=	0xFF00FF00
BorderColor		=	0xFF000001

SystemBkColor_1		=	0xFF005500
SystemBkColor_2		=	0xFF002B45

PlayListColor_1		=	0xFF00FFFF
PlayListColor_2		=	0xFFFF00FF

ProgressColor_1		=	0xFF00FF00
ProgressColor_2		=	0xFFFFFF00
ProgressColor_3		=	0xFFFF0000

StatusBarBgColor	=	0xFF000000
StatusBarFgColor	=	0xFF005050
StatusBarTextColor	=	0xFF00FFFF

ProgressBkColor		=	0xFF606060
OpenFileColor		=	0xFFFF8000

AmpKnobColor		=	0xFF00FF00
BalKnobColor		=	0xFF6060FF
PitchKnobColor		=	0xFFFF3030
LogoColor		=	SystemColor_1
LogoRingColor		=	SystemColor_3
BlueBallsColor		=	SystemColor_2


;************************************************************************
;*  misc locations
;************************************************************************


;location x/y of "pushed" state for various buttons
;(from eg, misc.jpg)

[misc locations]
PAUSEON_x    =			90
PAUSEON_y    =			40
PREV_x    =			 0
PREV_y    =			40
NEXT_x    =			 0
NEXT_y    =			 0
STOPON_x    =		       130
STOPON_y    =		         0
STOPOFF_x    =		       130
STOPOFF_y    =			40
PLAYON_x    =			90
PLAYON_y    =			 0
SLIDERON_x    =		       170
SLIDERON_y    =			 0
SLIDEROFF_x    =               170
SLIDEROFF_y    =		20
CYANON_x    =			60
CYANON_y    =			20
CYANOFF_x    =			60
CYANOFF_y    =			 0
GREENON_x    =			30
GREENON_y    =			40
GREENON2_x    =			60
GREENON2_y    =			40
ORANGEON_x    =			30
ORANGEON_y    =			20
REDON_x    =			30
REDON_y    =			 0
BIGUP_x    =		       280
BIGUP_y    =			 0
DRAWER_x    =			 0
DRAWER_y    =			76


; NEW Documentation!!!!! ( but for Sonique 1.00.3 ) (and works for new versions also)
; Position of upperleft (0,0) corner of drawer mask relative to (0,0) of nav mask 
DRAWER_POS_x	=  29
DRAWER_POS_y	=  229


;************************************************************************
;*  misc values
;************************************************************************

// Misc values
[misc values]
MISC_DRAWER_POS_x			=	29
MISC_DRAWER_POS_y			=	229
MISC_DRAWER_SLIDER_ARRAY_POS_x  	=	22
MISC_DRAWER_SLIDER_ARRAY_POS_y  	=	20
MISC_DRAWER_SLIDER_SIZE_x		=   	8
MISC_DRAWER_SLIDER_SIZE_y		=	44
MISC_DRAWER_SLIDER_PITCH		=	14
MISC_DRAWER_DISTANCE_TOSLIDE    	=	75
MISC_VOLUME_KNOB_width			=	18
MISC_VOLUME_KNOB_images			=	37
MISC_SMALL_KNOB_width			=	13
MISC_SMALL_KNOB_images			=	37
MISC_SHUTTLE_KNOB_width			=	49
MISC_SHUTTLE_KNOB_images		=	13

;************************************************************************
;************************************************************************
;
;  Additions as of 1.05.x 
;
;************************************************************************
;************************************************************************


;************************************************************************
;*  skin
;************************************************************************

[skin]
; This is the skin version that sonique looks at to determin what features a skin can have.
; This is a 'specification version' not the revision version of your skin.
; This is 105 spec

; place 105 here to allow your skin to use some extra skin features
; this is here for compatibility mode
; You may or maynot need this to be 105 to take advantage of new skin features
; One such 'feature' is the round double line corner in the settings screen
; if version>=105 and the window shape will allow a more rectangle like double line

version			=	100

;use these to set skin to modify ONLY one particular mode		
; ie, turn off a 'mode' by setting it to 0
TouchNavMode		=	1	
TouchMidMode		=	1
TouchSmallMode		=	1


; These allow a skin to have links to a website
; (doubleclick) on the skin
; You also have to specify an extra region for each of these
;
; you can add these to yourskinname.dat 
; in the skinmaker project directory
; Then you will be allowed to specify a region
;
;  /rgn/nav/logoHREF  
;  /rgn/mid/logoHREF
;
; these are the corresponding URL to go to
; with 105 there is no default

nav_logo_href		=    http://no.default.url
mid_logo_href		=    http://no.default.url



;************************************************************************
;*  sonique colors
;************************************************************************

[sonique colors]

;color of internal vises.. Make them match your skin theme!
;BlendColor is bitwise 'OR' blended with the left or right color
InternalVisLeftColor	=	0xFF0000FF				
InternalVisRightColor	=	0xFFFF0000 
InternalVisBlendColor	=	0xFF00FF00 


;begining color of the logo and rings as they fade/slide in
LogoStartColor			=	0x00FF2200
LogoRingStartColor		=	0x000022FF



;************************************************************************
;*  misc locations
;************************************************************************

[misc locations]

; Because of the NAV_ defines you can now have buttons that are not the same
; in MID and Nav modes
;means that this defaults to the corresponding value from corresponding value from [misc locations]

BIGON_DOWN_x    =			BIGUP_x 				
BIGON_DOWN_y    =			BIGUP_y + 35			
NAV_CYANON_x    =			CYANON_x 
NAV_CYANON_y    =			CYANON_y 
NAV_CYANOFF_x    =			CYANOFF_x 
NAV_CYANOFF_y    =			CYANOFF_y 
NAV_GREENON_x    =			GREENON_x 
NAV_GREENON_y    =			GREENON_y 
NAV_GREENON2_x    =			GREENON2_x 
NAV_GREENON2_y    =			GREENON2_y 
NAV_ORANGEON_x    =			ORANGEON_x 
NAV_ORANGEON_y    =			ORANGEON_y 
NAV_REDON_x    =			REDON_x 
NAV_REDON_y    =			REDON_y 
NAV_PREV_x    =				PREV_x 
NAV_PREV_y    =				PREV_y 
NAV_NEXT_x    =				NEXT_x 
NAV_NEXT_y    =				NEXT_y 
NAV_STOPON_x    =			STOPON_x 
NAV_STOPON_y    =			STOPON_y 
NAV_STOPOFF_x    =			STOPOFF_x 
NAV_STOPOFF_y    =			STOPOFF_y 
NAV_PLAYON_x    =			PLAYON_x 
NAV_PLAYON_y    =			PLAYON_y 
NAV_PAUSEON_x    =			PAUSEON_x 
NAV_PAUSEON_y    =			PAUSEON_y 




;************************************************************************
;*  misc values 
;************************************************************************

[misc values]
MISC_DRAWER_SLIDER_HANDLE_SIZE_width		=		8				
MISC_DRAWER_SLIDER_HANDLE_SIZE_height		=		14			
MISC_NAV_VOLUME_KNOB_width			=		18
MISC_NAV_VOLUME_KNOB_images			=		37

; Original Documention placed these values here.. 
; but if you see above, I documented where they ACTUALLY were
; however, This was the intended placement.
; So, for skin versions 105 and up, use these values
; Position of upperleft (0,0) corner of drawer mask relative to (0,0) of nav mask 
MISC_DRAWER_POS_x	= 29
MISC_DRAWER_POS_y	= 229

; version must be >= 105
; number of pixels from right edge to place 'blue balls' in nav mode.. 
; (for these rounded TV looking windows that are a bit larger )
NC_BB_DIST_FROM_RIGHT = 5




;// 1 means regular 270 degree mode, 0 means full 360 of the ring
mid_playlistmode	=		1

;************************************************************************
;*  msm locations
;************************************************************************

[msm locations]
// end location of the 'blue balls' in middle mode
MSM_SINGLEUP_x    =		44	
MSM_SINGLEUP_y    =		01	
MSM_SINGLEDOWN_x  =		55	
MSM_SINGLEDOWN_y  =		03	
MSM_HELP_x	  =		65
MSM_HELP_y	  =		 8
MSM_MINIMIZE_x    =		73
MSM_MINIMIZE_y    =		16
MSM_CLOSE_x       =		79
MSM_CLOSE_y       =		26

`;
