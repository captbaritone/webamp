function anchorArgument(argument, defaultValue) {
    args = [];
    pairs = window.location.hash.slice(1).split("&");
    for (var i = 0, len = pairs.length; i < len; i++) {
        pair = pairs[i];
        eq = pair.indexOf("=");
        if(eq) {
            key = decodeURIComponent(pair.slice(0, eq));
            value = decodeURIComponent(pair.slice(eq + 1));
            args[key] = value;
        }
    }
    return args[argument] ? args[argument] : defaultValue;
}
