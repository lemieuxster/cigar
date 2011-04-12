//Cigar - it imports files
(function() {
    //The Cigar Object
    Cigar = {};

    //Queue of paths to load
    var cigar_queue = [],
    cigar_isrunning = false,

    //Wait while paths are added to the queue
    cigar_wait = null,

    //Paths imported
    cigar_paths = {},

    //Complete function
    cigar_complete = function(){},

    //Fail function
    cigar_fail = function(){},

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
    },
    
    //Run a callback method
    cigar_runCallback = function() {
      var callback = cigar_queue.shift();
      callback();
      return cigar_next();
    },

    //Do the next tag in the queue
    cigar_next = function() {
        cigar_isrunning = true;
        if (cigar_timeout) {
            clearTimeout(cigar_timeout);
        }
        if (cigar_queue.length > 0) {
            if (typeof cigar_queue[0] === "function") {
               return cigar_runCallback();
            } else {
               cigar_loadScript();
               cigar_timeout = setTimeout(cigar_error, 5000);
            }
        } else {
            cigar_isrunning = false;
            cigar_complete();
        }
        
        return Cigar;
    },

    //Error handler
    cigar_error = function() {
        if (cigar_timeout) {
            clearTimeout(cigar_timeout);
        }
        cigar_isrunning = false
        cigar_fail();
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
            tag.onload = cigar_next;
            tag.onerror = cigar_error;
            tag.onreadystatechange = function () {
                if (this.readyState == 'complete') {
                    cigar_next();
                } else if (this.readyState == 'error') {
                    cigar_error();
                }
            };

            cigar_paths[classPath] = scriptPath;
            if (!cigar_isrunning) {
               cigar_queue.push(tag);
               cigar_wait = setTimeout(cigar_next, 25);
            } else {
               cigar_queue.unshift(tag);
            }
        }

        return Cigar;
    };
    
    //Add a function in to the queue, called in sequence
    Cigar._tap = function(callbackFn) {
      if (typeof callbackFn === "function") {
         if (!cigar_isrunning) {
            cigar_queue.push(callbackFn);
         } else {
            cigar_queue.splice(1, 0, callbackFn);
         }
      }
      
      return Cigar;
    };

    //Set the complete callback function
    Cigar._complete = function(callbackFn) {
        cigar_complete = callbackFn;
        return Cigar;
    };

    //Set the error callback function
    Cigar._error = function(failFn) {
        cigar_fail = failFn;
        return Cigar;
    };

    _import = Cigar._import;
})();
