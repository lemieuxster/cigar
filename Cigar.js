//Cigar - it imports files
(function() {
    Cigar = {
        _paths : {}
    };

    Cigar._import = function(classPath, config) {
        if (!Cigar._paths[classPath]) {
            var scriptPath = classPath.replace(/\./g, "/") + ".js";

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
            Cigar._paths[classPath] = "1";
        }
    };

    _import = Cigar._import;
})();
