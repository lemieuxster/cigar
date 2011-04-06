//Cigar - it imports files
(function() {
    Cigar = {
        _paths : {}
    };

    Cigar._import = function(importPath, config) {
        if (!Cigar._paths[importPath]) {
            var scriptPath = importPath.replace(/\./g, "/") + ".js";

            var tag = document.createElement("script");
            tag.type = "text/javascript";
            if (config && config.async) {
                tag.setAttribute('async', 'true');
            }

            if (config && typeof config.cacheBust !== undefined && config.cacheBust != "") {
                scriptPath = scriptPath + "?" + config.cacheBust
            }

            tag.src = "/" + scriptPath;

            var head = document.documentElement.firstChild;
            if (!head || (head.nodeName && head.nodeName.toLowerCase().indexOf("comment")>-1)) {
                head = document.getElementsByTagName("head")[0];
            }
            head.appendChild(tag);
            Cigar._paths[importPath] = "1";
        }
    };

    _import = Cigar._import;
})();

/*
TODOS:
Chaining _import("path.to", {})._import ... 
Callbacks callback(bool)
Import Queue (read in list of chained imports, wait, load, do callbacks)
Final Callback (all complete) 
Set base script directory (classPath)
*/
