var LOG_OUT_STRING = "Logout";
var DEFAULT_ERROR = "Sorry, an error has ocurred.";
var SAVE_ERROR_MESSAGE = "Your data could not be saved. Please try again.";
var SAVE_SUCCESSFUL_MESSAGE = "Save Successful";
var DELETE_SUCCESSFUL_MESSAGE = "Delete Successful";
var DELETE_FAILED_MESSAGE = "Delete Failed. Please try again.";

var loadedJs = {};

window.addEventListener('DOMContentLoaded', function() {
    var pathAndParams = getConsistentPath(location.pathname) + location.search;

    // on pop state change the page
    window.onpopstate = function(event) { changePage(event.state.content, event.state.title, event.state.description, event.state.js, event.state.css, pathAndParams, true) };

    // Add the initial state
    var initialObject = createCacheObjectFromFullPage();
    window.history.replaceState( initialObject, "", pathAndParams );
    
    enableAjaxLinks();
    document.querySelector("body").setAttribute("data-path", pathAndParams);
});

/************** Functions ****************/

/**
 * Enable Ajax links.
 */
function enableAjaxLinks() {
    document.querySelectorAll(".ajax-link").forEach( function(el) {
        el.onclick = function(e) {
            e.preventDefault();
            var href = el.getAttribute("href");
            directPage(href);
        }
    } );
}

/**
 * Direct a page.
 * @param {string} href - The path to redirect to. 
 */
function directPage( href ) {
    // server request
    makeRequest( "GET", href, { "ajax": 1, "webp": document.querySelector(".webp") ? true : false }, function(response) {
        try {
            var json = JSON.parse(response);
            changePage( json.content, json.title, json.description, json.js, json.css, href );
        }
        catch(e) { console.log(e); window.location = href; } // this happens when we try to go to the dahsboard from the login screen
    } );
}

/**
 * Create a cache object from a full page.
 * This object is also used for popping states.
 * @returns {Object} The object that can be used in cache or pop state, the same on that is returned by ajax endpoints on the server.
 */
function createCacheObjectFromFullPage() {
    // Add the initial JavaScript
    var currentJs = document.querySelectorAll("script[src]");
    var thisPageJs = [];
    for( var i=0; i<currentJs.length; i++ ) {
        thisPageJs.push(currentJs[i].getAttribute("src"));
        loadedJs[currentJs[i].getAttribute("src")] = true;
    }
    // Initial css
    var currentCss = document.querySelectorAll("link[type='text/css']");
    var thisPageCss = [];
    for( var i=0; i<currentCss.length; i++ ) {
        thisPageCss.push(currentCss[i].getAttribute("href"));
    }
    return { 
        "content": document.querySelector("#content-wrapper").innerHTML, 
        "title": document.title, 
        "description": document.querySelector('meta[name="description"]').getAttribute("content"),
        "js": thisPageJs, 
        "css": thisPageCss 
    };
}

/**
 * Chage the page.
 * @param {String} content - The html to place inside the main element on the page.
 * @param {String} title - The new title.
 * @param {String} description - The new description.
 * @param {Array.<string>} jsFiles - The JavaScript files for the page.
 * @param {Array.<string>} cssFiles - The css files for the page.
 * @param {String} path - The current path.
 * @param {boolean} noPush - True if we should not push to history.
 */
function changePage( content, title, description, jsFiles, cssFiles, path, noPush ) {
   
    // Add css if not there.
    var linksToAdd = [];
    for( var i=0; i<cssFiles.length; i++ ) {
        if( !document.querySelector( "link[href='" + cssFiles[i] + "']" ) ) {
            var link = document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", cssFiles[i]);
            linksToAdd.push(link);
        }
    }

    if( linksToAdd.length ) {
        var linkLength = linksToAdd.length;
        for( var i=0; i<linksToAdd.length; i++ ) {
            var link = linksToAdd[i];
            document.getElementsByTagName("head")[0].appendChild(link);
            link.onload = function() {
                linkLength--;
                if( linkLength == 0 ) {
                    switchPage( content, title, description, jsFiles, cssFiles, path, noPush );
                }
            }
        }
    }
    else {
        switchPage( content, title, description, jsFiles, cssFiles, path, noPush );
    }
    
}

/**
 * Switch the page (after css loaded).
 * @param {String} content - The html to place inside the main element on the page.
 * @param {String} title - The new title.
 * @param {String} description - The new description.
 * @param {Array.<string>} jsFiles - The JavaScript files for the page.
 * @param {Array.<string>} cssFiles - The css files for the page.
 * @param {String} path - The current path.
 * @param {boolean} noPush - True if we should not push to history.
 */
function switchPage( content, title, description, jsFiles, cssFiles, path, noPush ) {
    // change the content, js, and address bar
    clearPageSpecificJS();
    document.querySelector("#content-wrapper").innerHTML = content;
    document.title = title ? title : "";
    document.querySelector('meta[name="description"]').setAttribute("content", description ? description : "");

    if( !noPush ) window.history.pushState( {"content": content, "title": title, "description": description, "js": jsFiles, "css": cssFiles }, title, path);
    addPageSpecificJS( jsFiles );

    // enable ajax
    enableAjaxLinks();

    window.scrollTo(0,0);

    document.querySelector("body").setAttribute("data-path", path);
}

/**
 * Add page-specific JS.
 */
function addPageSpecificJS( jsFiles ) {
    var totalFiles = jsFiles.length;
    var functionsToRun = [];
    jsFiles.forEach( function(jsFile) {
        var funcName = jsFile.match(/\/([a-z]+)\.min/)[1];
        funcName = funcName[0].toUpperCase() + funcName.slice(1);
        funcName = "load" + funcName;

        var runFunc = function() {
            functionsToRun.push( function() {
                try {
                    window[funcName]();
                    loadedJs[jsFile] = true;
                }
                catch(err) {}
            } );
            totalFiles --;

            if( totalFiles == 0 ) {
                for(var i=0; i<functionsToRun.length; i++) {
                    functionsToRun[i]();
                }
            }
        }

        if( loadedJs[jsFile] ) {
            runFunc();
        }
        else {
            var script = document.createElement("script");
            script.src = jsFile;
            script.onload = runFunc;
            document.body.appendChild(script);
        }
    } );
}

/**
 * Add form input events.
 * @param {HTMLElement} form - The form we are working with.
 */
function addFormInputEvents( form ) {
    var inputs = form.querySelectorAll("input, textarea");
    inputs.forEach( function(el) {
        if(el.value) el.classList.add("value");
        el.oninput = function() {
            if(this.value) {
                el.classList.add("value");
            }
            else {
                el.classList.remove("value");
            }
            formErrorCheck( form, true );
        }
        el.onfocus = function() {
            el.classList.add("looked-at");
        }
        el.onblur = function() { formErrorCheck(form, true); }
    } );
}

/**
 * Submit a form.
 * @param {Event} e - The event to submit.
 * @param {HTMLElement} form - The form we are working with.
 * @param {string} [redirect] - A url to redirect to after login.
 * @param {Object} [requestParameters] - The request parameters to submit.
 * @param {Function} [additionalSuccessCallback] - A function to call on success. It'll receive the response data.
 */
function formSubmit(e, form, redirect, requestParameters, additionalSuccessCallback) {
    e.preventDefault();
    formErrorCheck( form, false );

    // error check
    var invalidField = form.querySelector("input.invalid");
    if( invalidField ) {
        invalidField.focus();
        document.querySelector("form").reportValidity();
        return;
    };

    // nice display for buttons
    var button = form.querySelector("button:not(.close-modal)");
    var originalText = button.innerText;
    button.onclick = function(e) { e.preventDefault(); };
    var startTime = new Date().getTime();
    button.classList.add("submitting");
    var submittingTimeout = setTimeout( function() {
        button.innerText = "Submitting!";
    }, 1000 );

    if( !requestParameters ) {
        requestParameters = {};
        var inputs = form.querySelectorAll("input,textarea");
        for( var i=0; i<inputs.length; i++ ) {
            requestParameters[inputs[i].getAttribute("name")] = inputs[i].value;
        }
    }

    makeRequest( "POST", form.getAttribute("data-endpoint"), requestParameters, function(response) {

        var endTime = new Date().getTime();
        var totalTime = endTime - startTime;
        var timeInCycle = totalTime % 2000; // all these timings are based on 2s interval in the css
        var midpoint = 1000;
        clearTimeout( submittingTimeout ); // messes with the finished timeout
        if( timeInCycle > midpoint ) midpoint += 2000;
        var timeToNextMidpoint = midpoint - timeInCycle;

        setTimeout( function() {
            button.classList.remove("submitting");
            button.classList.add("submitted");
            button.innerText = "Thank You!";

            if( additionalSuccessCallback ) {
                additionalSuccessCallback( response );
            }

            if( redirect ) directPage(redirect);
        }, timeToNextMidpoint );

    }, function(response) {
        button.onclick = function(eNew) { formSubmit(eNew, form, redirect, null, additionalSuccessCallback) };
        button.innerText = originalText;
        button.classList.remove("submitting");
        clearTimeout(submittingTimeout);

        var errorMessage = "An error has occurred. Please try again later.";
        try {
            var responseObj = JSON.parse(response);
            if( responseObj.errorMessage ) errorMessage = responseObj.errorMessage;
        }
        catch(err) {}

        formDisplayError(form, errorMessage);
    } );
};

/**
 * Ensure a fixed element is a good color.
 * @param {HTMLElement} element - The element.
 * @param {Number} description - The position to start looking at the background color of elements in the list of elements at the position (avoid the current element).
 */
function ensureProperFixedElementColor( element, position ) {
    var foundElement = false;
    var currentElements = document.elementsFromPoint(Math.floor(element.getBoundingClientRect().left) + element.clientWidth/2, Math.floor(element.getBoundingClientRect().top) + element.clientHeight/2);
    for( var i=position; i<currentElements.length; i++ ) {
        var color = window.getComputedStyle(currentElements[i], null).getPropertyValue("background-color");
        var backgroundColor = color.match(/rgba?\((\d+), (\d+), (\d+),?\s?(0?\.?\d+)?\)/);
        if( backgroundColor && backgroundColor[4] != "0" ) {
            if( parseInt(backgroundColor[1]) > 200 && parseInt(backgroundColor[2]) > 200 && parseInt(backgroundColor[3]) > 200 ) {
                element.classList.add("dark");
                foundElement = true;
            }
            break;
        }
    }
    if( !foundElement ) {
        element.classList.remove("dark");
    }
}

/**
 * Get a consistent path key for cache (/amenities == /amenities/)
 * @param {String} path - The path.
 * @returns {String} The path. 
 */
function getConsistentPath(path) {
    if( path.substring(path.length-1) == "/" && path.length > 1 ) return path.substring(0, path.length - 1);
    return path;
}

/**
 * Clear page specific JS.
 */
function clearPageSpecificJS() {
    try {
        window.removeEventListener('wheel', sectionScrollWheel, {passive: false});
        window.removeEventListener('touchstart', recordStartPosition, {passive: false});
        window.removeEventListener('touchmove', recordPosition, {passive: false});
        window.removeEventListener('touchend', sectionScrollTouch, {passive: false});
    }
    catch(err) {}
    window.onkeydown = null;
    document.body.onscroll = null;
}

/**
 * Error check the contact form.
 * @param {boolean} lookedAt - True if we should only look at fields that have been focused previously.
 * @param {HTMLElement} form - The form we are working with.
 */
function formErrorCheck( form, lookedAt ) {
    var selector = "input, textarea";
    if( lookedAt ) selector =  "input.looked-at, textarea.looked-at";
    var fields = form.querySelectorAll(selector);

    var errorMessages = {
        required: [],
        pattern: []
    };
    var foundInvalid = false;

    fields.forEach( function(el) {
        if( !lookedAt ) el.classList.add("looked-at"); // on a submit, we look at everything
        // required
        if( (el.hasAttribute("required") && !el.value) ) {
            
            if( !lookedAt ) errorMessages.required.push(el.nextSibling.innerText);
            
            foundInvalid = true;
            el.classList.add("invalid");
            el.setAttribute("aria-invalid", "true");
            el.setAttribute("aria-describedby", "form-error-message");
        }
        // pattern
        else if ( el.hasAttribute("pattern") && !(new RegExp(el.getAttribute("pattern")).test(el.value)) ) {

            if( !lookedAt ) {
                errorMessages.pattern.push(el.nextSibling.innerText);
            }

            foundInvalid = true;
            el.classList.add("invalid");
            el.setAttribute("aria-invalid", "true");
            el.setAttribute("aria-describedby", "form-error-message");
        }
        else {
            el.classList.remove("invalid");
            el.setAttribute("aria-invalid", "false");
            el.removeAttribute("aria-describedby");
        }
    } );

    if( !foundInvalid ) {
        formClearError( form );
    }
    else if( !lookedAt ) {
        var displayErrorMessage = [];
        if( errorMessages.required.length ) {
            displayErrorMessage.push("Please include a " + grammaticalJoin(errorMessages.required) + ".");
        }
        if( errorMessages.pattern.length ) {
            displayErrorMessage.push("Please use a valid " + grammaticalJoin(errorMessages.pattern) + ".");
        }
        formDisplayError(form, grammaticalJoinSentances(displayErrorMessage));
    }
}

/**
 * Gramatically join sentances.
 * @param {Array.<string>} sentances - The sentances to join.
 * @returns {string} - The sentances gramatically joined.
 */
function grammaticalJoinSentances( sentances ) {
    var joiningWords = ["Also", "Additionally", "Furthermore"];
    var curJoiningWords = joiningWords
    for( var i=1; i<sentances.length; i++ ) {
        if( curJoiningWords.length == 0 ) curJoiningWords = joiningWords;

        sentances[i] = sentances[i].replace(/^\w/, function(chr) { return chr.toLowerCase()});
        var index = Math.floor(Math.random() * curJoiningWords.length);
        sentances[i] = curJoiningWords[index] + ", " + sentances[i];

        curJoiningWords.splice(index, 1);
    }
    return sentances.join(" ");
}

/**
 * Gramatically join a list.
 * @param {Array.<HTMLElement>} elements - A list of elements to gramatically join.
 * @param {[boolean]} noLowercase - True if the items shouldn't be lowercased.
 * @returns {string} - The elements gramatically joined.
 */
function grammaticalJoin( elements, noLowercase ) {

    if( !noLowercase ) for(var i=0; i<elements.length; i++) elements[i] = elements[i].toLowerCase();

    if( !elements.length ) return;
    if( elements.length == 1 ) return elements[0];
    else if( elements.length == 2 ) return elements[0] + " and " + elements[1];
    else {
        elements[elements.length - 1] = "and " + elements[elements.length - 1];
        return elements.join(", ");
    }
}

/**
 * Display an error on a form.
 * @param {HTMLElement} form - The form we are working with.
 * @param {string} message - the error to display.
 */
function formDisplayError( form, message ) {
    formClearError( form );
    var error = document.createElement("div");
    error.setAttribute("id", "form-error-message");
    error.setAttribute("aria-live", "polite");
    error.classList.add("error");
    error.innerText = message; // keep this inner text since message is server generated... if something ever happened there, we wouldn't want an xss attack
    form.insertBefore(error, form.querySelector("button:not(.close-modal)"));
}

/**
 * Clear all form errors.
 * @param {HTMLElement} form - The form we are working with.
 */
function formClearError( form ) {
    var error = form.querySelector(".error");
    if( error ) error.parentNode.removeChild(error);
}

/**
 * Set the action buttons in the header.
 * @param {Array} buttons - An array of objects with keys for name and action (a function).
 */
function setActionButtons( buttons ) {
    var buttonsSection = document.querySelector(".buttons");
    buttonsSection.innerHTML = "";
    for( var i=0; i<buttons.length; i++ ) {
        var button = document.createElement("button");
        button.innerText = buttons[i].name;
        button.onclick = buttons[i].action;
        buttonsSection.appendChild(button);
    }
}

/**
 * Set the user name.
 * @param {boolean} hideName - True if the name should be hidden.
 */
function setUserName( hideName ) {
    try {
        if( hideName ) throw new Error();
        var userId = JSON.parse(decodeURIComponent(getCookieValue("racecourse-id")));
        document.querySelector(".user-name").innerText = userId.first + " " + userId.last;
    }
    catch(err) {
        document.querySelector(".user-name").innerText = "";
        console.log(err);
    }
}

/**
 * Create a toast.
 * @param {string} message - The message to display in the toast.
 * @param {string} [type] - The type of toast (success or failure).
 * @param {boolean} [html] - True if the message is in HTML.
 */
function createToast(message, type, html) {
    var toast = document.createElement("div");
    toast.classList.add("toast");
    if( html ) toast.innerHTML = message;
    else toast.innerText = message;
    var appendElement = document.querySelector("main");
    if( !appendElement && (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) ) appendElement = document.querySelector(".screencast-wrapper");
    if( !appendElement ) appendElement = document.body;
    appendElement.appendChild(toast);
    setTimeout( function() { // Timeout for opacity
        toast.classList.add("toast-shown");
        setTimeout( function() { // Timeout until hiding
            toast.classList.remove("toast-shown");
            setTimeout( function() { // Timeout until removing
                toast.parentElement.removeChild(toast);
            }, 500 ); // Make sure this matches the css
        }, 4000 )
    }, 0 ); // Set timeout to add the opacity transition
}

/**
 * Capitalize the first letter.
 * https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
 * @param {string} string - The string to capitalize the first letter of. 
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Logout.
 */
function logout() {
    deleteCookies();
    window.location = "/login";
}

/**
 * Check if an element is in the viewport.
 * Taken from here: https://gomakethings.com/how-to-test-if-an-element-is-in-the-viewport-with-vanilla-javascript/.
 * @param {HTMLElement} elem - The element to determine if visible
 * @returns {boolean} - True if the element is visible.
 */
function isInViewport(elem) {
    var bounding = elem.getBoundingClientRect();
    return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

/**
 * Get a cookie's value.
 * https://stackoverflow.com/questions/5639346/what-is-the-shortest-function-for-reading-a-cookie-by-name-in-javascript
 * @param {string} a - The cookie. 
 */
function getCookieValue(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

/**
 * Delete cookies.
 * https://stackoverflow.com/questions/595228/how-can-i-delete-all-cookies-with-javascript
 */
function deleteCookies() {
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
}

/**
 * Make a request.
 * @param {string} type - "GET" or "POST".
 * @param {string} url - The url to make the request to.
 * @param {object} parameters - An object with keys being parameter keys and values being parameter values to send with the request.
 * @param {function} callback - Callback function to run upon request completion.
 * @param {boolean} useFormData - True if we should use form data instead of json.
 */
function makeRequest(type, url, parameters, callback, errorCallback, useFormData) {
    var parameterKeys = Object.keys(parameters);

    //url = "http://" + window.location.hostname + url;
    if( (type == "GET" || type == "DELETE") && parameterKeys.length ) {
        var parameterArray = [];
        for( var i=0; i<parameterKeys.length; i++ ) {
            parameterArray.push( parameterKeys[i] + "=" + parameters[parameterKeys[i]] );
        }
        url = url + (url.match(/\?/) ? "&" : "?") + parameterArray.join("&");
    }
   
    var xhttp = new XMLHttpRequest();
    xhttp.open(type, url, true);

    if( (type != "GET" && type != "DELETE") && parameterKeys.length ) {
        if( !useFormData ) {
            xhttp.setRequestHeader("Content-type", "application/json");
        }
    }

    xhttp.onreadystatechange = function() {
        if( this.readyState == 4 ) {
            if( this.status == 200 ) {
                if( callback ) { callback(this.responseText); }
            }
            else {
                if( errorCallback ) { errorCallback(this.responseText); }
            }
        }
    }    
    if( (type != "GET" && type != "DELETE") && Object.keys(parameters).length ) {
        var sendParameters;
        if( useFormData ) {
            sendParameters = new FormData();
            for ( var key in parameters ) {
                sendParameters.append(key, parameters[key]);
            }
        }
        else {
            sendParameters = JSON.stringify(parameters);
        }
        xhttp.send( sendParameters );
    }
    else {
        xhttp.send();
    }
}

// Node polyfill
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
 }

// object assign polyfil
if (typeof Object.assign !== 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
      value: function assign(target, varArgs) { // .length of function is 2
        'use strict';
        if (target === null || target === undefined) {
          throw new TypeError('Cannot convert undefined or null to object');
        }
  
        var to = Object(target);
  
        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];
  
          if (nextSource !== null && nextSource !== undefined) { 
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }
