# General UI

* Pixel perfect graphics:
    * CSS
    * Canvas

# Window Manager

* Windows are draggable
* Windows snap to eachother
* Windows snap to edges of browser window
* Dragging the min window drags all attached windows
    * Recursively

# Main Window

* As you drag the position handle, the change is displayed in the text box
* Easter egg mode
* Changing color as you change volume or balance
* Marquee effect on text
    * Click and drag marquee
* Double mode
* Visualizer
    * Bar mode uses colors from skin
    * Line mode
* Bar mode
    * Progress bar handle has three states
    * Visualization (Not implemented)
* Volume/Balance
    * Different skin sprites are used depending upon the value
    * Balance snaps to center

# Equalizer Window

* Pixel perfect vertical sliders (not possible with native CSS)
* Slider background uses a different sprite background depending upon value
* Shade mode with three states for each slider hande (center state should be wider for volume?)
* EQ levels actually effect the sound
* Parse and create binary .eqf files to import/export eq levels
* Set all bands to top/mid/bottom with a single click
* Splined visualization of EQ levels
