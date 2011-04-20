//Cigar - it imports files
(function() {
    //The Cigar Object
    Cigar = {};

    //Stack of queues to process.
    var cigar_stack = [],

        //Current Queue of paths to buffer
            cigar_queue = [],

        //Queue is processing
            cigar_isRunning = false,

        //Wait while paths are added to the queue
            cigar_wait = null,

        //Paths imported
            cigar_paths = {},

        //Class path
            cigar_classPath = "",

        //Complete function
            cigar_complete = function() {
            },

        //Fail function
            cigar_fail = function() {
            },

        //Wait for script to load (5 seconds)
            cigar_timeout = null,

        //Start processing a queue
            cigar_start = function() {
                if (cigar_timeout) {
                    clearTimeout(cigar_timeout);
                }
                cigar_isRunning = true;
                var q = [].concat(cigar_queue);
                cigar_stack.unshift(q);
                cigar_queue = [];
                cigar_next();
                return Cigar;
            },

        //Interrupt a queue, load another
            cigar_interrupt = function() {
                cigar_isRunning = false;
                if (cigar_wait) {
                    clearTimeout(cigar_wait);
                }
                cigar_wait = setTimeout(cigar_start, 25);
                return Cigar;
            },

        //Do the next tag in the queue
            cigar_next = function() {
                if (cigar_timeout) {
                    clearTimeout(cigar_timeout);
                }
                if (cigar_isRunning) {
                    if (cigar_stack.length > 0) {
                        var q = cigar_stack[0];
                        if (q.length > 0) {
                            var nextQItem = q.shift();
                            if (typeof nextQItem === "function") {
                                return cigar_runCallback(nextQItem);
                            } else {
                                cigar_loadScript(nextQItem);
                                cigar_timeout = setTimeout(cigar_error, 5000);
                            }
                        } else {
                            cigar_stack.shift();
                            return cigar_next();
                        }
                    } else {
                        cigar_isRunning = false;
                        cigar_complete();
                    }
                }

                return Cigar;
            },

        //Append script tag to head
            cigar_loadScript = function(tag) {
                var head = document.documentElement.firstChild;
                if (!head || (head.nodeName && head.nodeName.toLowerCase().indexOf("comment") > -1)) {
                    head = document.getElementsByTagName("head")[0];
                }
                head.appendChild(tag);
                return Cigar;
            },

        //Run a callback method
            cigar_runCallback = function(callback) {
                callback();
                return cigar_next();
            },

        //Error handler
            cigar_error = function() {
                if (cigar_timeout) {
                    clearTimeout(cigar_timeout);
                }
                cigar_isRunning = false;
                cigar_fail();
                return Cigar
            };

    //Create script tag, add to queue, return Cigar for chaining
    Cigar._import = function(classPath, config) {
        if (!cigar_paths[classPath]) {
            if (cigar_wait) {
                clearTimeout(cigar_wait);
            }


            var scriptPath = classPath.replace(/\./g, "/") + ".js";
            if (config && typeof config.cacheBust !== undefined && config.cacheBust != "") {
                scriptPath = scriptPath + "?" + config.cacheBust;
            }

            var tag = document.createElement("script");
            tag.type = "text/javascript";
            if (config && config.async) {
                tag.setAttribute('async', 'true');
            }
            tag.src = cigar_classPath + "/" + scriptPath;
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
            cigar_queue.push(tag);
            if (!cigar_isRunning) {
                cigar_wait = setTimeout(cigar_start, 25);
            } else {
                //interrupt
                cigar_interrupt();
            }
        }

        return Cigar;
    };

    //Add a function in to the queue, called in sequence
    Cigar._tap = function(callbackFn) {
        if (typeof callbackFn === "function") {
            cigar_queue.push(callbackFn);
            if (cigar_isRunning) {
                cigar_interrupt();
            }
        }

        return Cigar;
    };

    //Set the complete callback function
    Cigar._complete = function(callbackFn) {
        //TODO make array, call last added (stack)
        cigar_complete = callbackFn;
        return Cigar;
    };

    //Set the error callback function
    Cigar._error = function(failFn) {
        //TODO make array, loop through
        cigar_fail = failFn;
        return Cigar;
    };

    //Set base "classPath"
    Cigar._classPath = function(path) {
        cigar_classPath = path;
        return Cigar;
    };

    _import = Cigar._import;
})();
