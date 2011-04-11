//Cigar - it imports files
(function() {
    //The Cigar Object
    Cigar = {};

    //Queue of paths to load
    var cigar_queue = [],

    //Wait while paths are added to the queue
    cigar_wait = null,

    //Paths imported
    cigar_paths = {},

    //Complete function
    cigar_complete = function(){},

    //Wait for script to load (5 seconds)
    cigar_timeout = null,

    //Append script tag to head
    cigar_loadScript = function() {
        var tag = cigar_queue.shift();
        var head = document.documentElement.firstChild;
        if (!head || (head.nodeName && head.nodeName.toLowerCase().indexOf("comment")>-1)) {
            head = document.getElementsByTagName("head")[0];
        }
        head.appendChild(tag);
    };

    //Create script tag, add to queue, return Cigar for chaining
    Cigar._import = function(classPath, config) {
        if (!cigar_paths[classPath]) {
            if (cigar_wait) {
                clearTimeout(cigar_wait);
            }

            var scriptPath = classPath.replace(/\./g, "/") + ".js";
            if (config && typeof config.cacheBust !== undefined && config.cacheBust != "") {
                scriptPath = scriptPath + "?" + config.cacheBust
            }

            var tag = document.createElement("script");
            tag.type = "text/javascript";
            if (config && config.async) {
                tag.setAttribute('async', 'true');
            }
            tag.src = "/" + scriptPath;
            tag.onload = Cigar.next;
            tag.onreadystatechange = function () {
                if (this.readyState == 'complete') {
                    Cigar.next();
                }
            };

            cigar_paths[classPath] = scriptPath;
            cigar_queue.push(tag);
        }

        cigar_wait = setTimeout(Cigar.next, 73);

        return Cigar;
    };

    //Do the next tag in the queue
    Cigar.next = function() {
        if (cigar_timeout) {
            clearTimeout(cigar_timeout);
        }
        if (cigar_queue.length > 0) {
            cigar_loadScript();
            cigar_timeout = setTimeout(Cigar.next, 5000);
        } else {
            cigar_complete();
        }
        return Cigar;
    };

    //Set the complete callback function
    Cigar.complete = function(callbackFn) {
        cigar_complete = callbackFn;
        return Cigar;
    };

    _import = Cigar._import;
})();
