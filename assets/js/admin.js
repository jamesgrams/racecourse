window.addEventListener('DOMContentLoaded', loadAdmin);

var ADMIN_USER_FIELDS = [
    "first",
    "last",
    "email",
    "password",
    "is_global_admin"
];
var ADMIN_CLASS_FIELDS = [
    "name"
];
var ADMIN_NEW_ROW_VALUES = {
    "/api/user": {
        "id": "new",
        "first": "New",
        "last": "User",
        "email": "new@grams.family",
        "password": "",
        "is_global_admin": 0
    },
    "/api/class": {
        "id": "new",
        "name": "New Class"
    }
};
var ADMIN_PASSWORD_PLACEHOLDER = "*******";

var adminMakingRequest;

/**
 * Load the login page.
 */
function loadAdmin() {
    setUserName();
    setActionButtons( [
    {
        "name": "Users",
        "action": function() { directPage("/admin?type=user") }
    },
    {
        "name": "Classes",
        "action": function() { directPage("/admin?type=class") }
    },
    {
        "name": LOG_OUT_STRING,
        "action": logout
    }
    ] );
    adminMakingRequest = false;

    var type = new URLSearchParams(window.location.search).get("type");
    if( type == "user" ) {
        adminLoadTable("/api/user", ADMIN_USER_FIELDS);
    }
    else {
        adminLoadTable("/api/class", ADMIN_CLASS_FIELDS);
    }
}


/**
 * Load an admin table.
 * @param {string} endpoint - The endpoint to load the table from.
 * @param {Array} keys - The fields to show.
 */
function adminLoadTable( endpoint, keys ) {
    var table = document.querySelector("table");
    table.innerHTML = "";

    // make the request
    makeRequest("GET", endpoint, {}, function(data) {
        try {
            var items = JSON.parse(data).items;
            if( items.length ) {
                keys = keys ? keys : Object.keys( ADMIN_NEW_ROW_VALUES[endpoint] );
                var thead = document.createElement("thead");
                var tr = document.createElement("tr");
                thead.appendChild(tr);

                for( var i=0; i<keys.length; i++ ) {
                    var th = document.createElement("th");
                    var parts = keys[i].split("_");
                    var newParts = [];
                    for( var j=0; j<parts.length; j++ ) newParts.push(capitalizeFirstLetter(parts[j]));
                    th.innerText = newParts.join(" ");
                    tr.appendChild(th);
                }
                // create the action header
                var th = document.createElement("th");
                th.innerText = "Actions";
                tr.appendChild(th);
                table.appendChild(thead);

                var tbody = document.createElement("tbody");
                for( var i=0; i<items.length; i++ ) {
                    adminCreateRow(items[i], keys, tbody, endpoint);
                }

                adminCreateRow( ADMIN_NEW_ROW_VALUES[endpoint], keys, tbody, endpoint );
                table.appendChild(tbody);
            }
        }
        catch(err) {
            createToast(DEFAULT_ERROR);
            console.log(err);
        }
    } );
}

/**
 * 
 * @param {Object} item - The item to create the row for. 
 * @param {Array} keys - The keys to display.
 * @param {HTMLElement} tr - The tbody element to append the cell to. 
 * @param {string} endpoint - The endpoint to load the table from.
 */
function adminCreateRow( item, keys, tbody, endpoint ) {
    var tr = document.createElement("tr");
    tr.setAttribute("data-id", item.id);
    for( var j=0; j<keys.length; j++ ) {
        adminCreateCell( keys[j], item[keys[j]], tr, endpoint );
    }
    // create the action cell
    var td = document.createElement("td");
    td.classList.add("action-cell");

    var deleteButton = document.createElement("button");
    if( item.id == "new" ) deleteButton.classList.add("hidden");
    deleteButton.innerText = "❌";
    deleteButton.onclick = function() {
        if( !adminMakingRequest && window.confirm( "Are you sure you want to delete this entry?") ) {
            adminMakingRequest = true;
            var id = deleteButton.parentNode.parentNode.getAttribute("data-id");
            makeRequest("DELETE", endpoint, { "id": id }, function() {
                deleteButton.parentNode.parentNode.parentNode.removeChild(deleteButton.parentNode.parentNode);
                createToast(DELETE_SUCCESSFUL_MESSAGE);
                adminMakingRequest = false;
            }, function() {
                createToast(DELETE_FAILED_MESSAGE);
                adminMakingRequest = false;
            });
        }
    }
    
    if( endpoint === "/api/user" ) {
        var addClassesButton = document.createElement("button");
        if( item.id == "new" ) addClassesButton.classList.add("hidden");
        addClassesButton.innerText = "📖";
        addClassesButton.onclick = function() {
            if( !adminMakingRequest ) {
                if( addClassesButton.parentNode.querySelector(".registration") ) {
                    document.querySelectorAll(".registration").forEach( function(el) {
                        el.parentElement.removeChild(el);
                    } );
                }
                else {
                    adminMakingRequest = true;
                    makeRequest("GET", "/api/class", {}, function(data) {

                        var classes = JSON.parse(data).items;

                        makeRequest("GET", "/api/class-user", { "user_id": addClassesButton.parentElement.parentElement.getAttribute("data-id") }, function(data) {
                            document.querySelectorAll(".registration").forEach( function(el) {
                                el.parentElement.removeChild(el);
                            } );
                            
                            var registeredClasses = JSON.parse(data).items;
                            var classToUserMap = {};
                            for( var i=0; i<registeredClasses.length; i++ ) {
                                classToUserMap[registeredClasses[i].class_id] = {
                                    "relation_id": registeredClasses[i].id,
                                    "user_id": registeredClasses[i].user_id,
                                    "is_admin": registeredClasses[i].is_admin
                                }
                            }

                            var registrationDiv = document.createElement("div");
                            registrationDiv.classList.add("registration");

                            var studentSection = document.createElement("div");
                            studentSection.classList.add("student-registration");
                            studentSection.innerText = "Student";
                            registrationDiv.appendChild(studentSection);

                            var adminSection = document.createElement("div");
                            adminSection.classList.add("admin-registration");
                            adminSection.innerText = "Admin";
                            registrationDiv.appendChild(adminSection);

                            var joinSection = document.createElement("div");
                            joinSection.classList.add("join-registration");
                            joinSection.innerText = "Available";
                            registrationDiv.appendChild(joinSection);

                            for( var i=0; i<classes.length; i++ ) {
                                var classElement = document.createElement("div");
                                classElement.classList.add("registration-class");
                                classElement.innerText = classes[i].name;
                                classElement.setAttribute("data-id", classes[i].id);

                                var changeSection = function( newSection, element ) {
                                    if( !adminMakingRequest ) {
                                        adminMakingRequest = true;
                                        var userId = element.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute("data-id");
                                        var className = element.parentNode.innerText.split("⬆️")[0];
                                        var id = element.parentNode.getAttribute("data-id");
                                        var relationId = element.parentNode.getAttribute("data-relation-id");

                                        var successChange = function() {
                                            newSection.appendChild( element.parentNode );
                                            createToast(SAVE_SUCCESSFUL_MESSAGE + " for " + className);
                                            adminMakingRequest = false;
                                        };
                                        var failureChange = function() {
                                            createToast(SAVE_ERROR_MESSAGE + " for " + className);
                                            adminMakingRequest = false;
                                        }
                                        var successAdd = function( data ) {
                                            var json = JSON.parse(data);
                                            element.parentNode.setAttribute("data-relation-id",json.id);
                                            successChange();
                                        }

                                        if( newSection.classList.contains("join-registration") ) {
                                            // this will always be a delete
                                            makeRequest("DELETE", "/api/class-user", { "id": relationId }, successChange, failureChange);
                                        }
                                        else if( newSection.classList.contains("admin-registration") ) {
                                            if( element.parentNode.parentNode.classList.contains("join-registration") ) {
                                                makeRequest("POST", "/api/class-user", { "class_id": id, "user_id": userId, "is_admin": 1 }, successAdd, failureChange);
                                            }
                                            else {
                                                makeRequest("PUT", "/api/class-user", { "id": relationId, "is_admin": 1 }, successChange, failureChange);
                                            }
                                        }
                                        else {
                                            if( element.parentNode.parentNode.classList.contains("join-registration") ) {
                                                makeRequest("POST", "/api/class-user", { "class_id": id, "user_id": userId, "is_admin": 0 }, successAdd, failureChange);
                                            }
                                            else {
                                                makeRequest("PUT", "/api/class-user", { "id": relationId, "is_admin": 0 }, successChange, failureChange);
                                            }
                                        }
                                    }
                                }

                                var sectionUpButton = document.createElement("button");
                                sectionUpButton.innerText = "⬆️";
                                classElement.appendChild(sectionUpButton);
                                sectionUpButton.onclick = function(e) {
                                    var prevSibling = this.parentNode.parentNode.previousElementSibling ? this.parentNode.parentNode.previousElementSibling : this.parentNode.parentNode.nextElementSibling.nextElementSibling;
                                    changeSection( prevSibling, this );
                                };

                                var sectionDownButton = document.createElement("button");
                                sectionDownButton.innerText = "⬇️";
                                classElement.appendChild(sectionDownButton);
                                sectionDownButton.onclick = function(e) {
                                    var nextSibling = this.parentNode.parentNode.nextElementSibling ? this.parentNode.parentNode.nextElementSibling : this.parentNode.parentNode.previousElementSibling.previousElementSibling;
                                    changeSection( nextSibling, this );
                                };

                                if( classToUserMap[classes[i].id] ) {
                                    classElement.setAttribute("data-relation-id", classToUserMap[classes[i].id].relation_id);
                                    if( classToUserMap[classes[i].id].is_admin ) {
                                        adminSection.appendChild(classElement);
                                    }
                                    else {
                                        studentSection.appendChild(classElement);
                                    }
                                }
                                else {
                                    joinSection.appendChild(classElement);
                                }
                            }
                            
                            addClassesButton.parentElement.insertBefore(registrationDiv, addClassesButton.nextElementSibling);
                            adminMakingRequest = false;
                        }, function() {
                            createToast(DEFAULT_ERROR);
                            adminMakingRequest = false;
                        });

                    }, function() {
                        createToast(DEFAULT_ERROR);
                        adminMakingRequest = false;
                    });
                }
            }
        }
        td.appendChild(addClassesButton);
    }
    else {
        var gotoButton = document.createElement("button");
        if( item.id == "new" ) gotoButton.classList.add("hidden");
        gotoButton.innerText = "➡️";
        gotoButton.onclick = function() {
            directPage("/class?id=" + gotoButton.parentNode.parentNode.getAttribute("data-id") + "&admin=1");
        }
        td.appendChild(gotoButton);
    }

    td.appendChild(deleteButton);

    tr.appendChild(td);
    tbody.appendChild(tr);
}

/**
 * Create a new entry in the table.
 * @param {string} column - The name of the column.
 * @param {string} value - The value for the column.
 * @param {HTMLElement} tr - The tr element to append the cell to.
 * @param {string} endpoint - The endpoint to load the table from.
 */
function adminCreateCell( column, value, tr, endpoint ) {
    var td = document.createElement("td");
    td.setAttribute("data-column", column);
    td.innerText = (typeof value !== "undefined") ? value : "";
    if( tr.getAttribute("data-id") == "new" ) td.setAttribute("data-default", 1);
    if( column === "password" ) td.innerText = ADMIN_PASSWORD_PLACEHOLDER;
    tr.appendChild(td);

    td.onclick = function(thisTd) { return function(e) {
        if( !thisTd.querySelector("input") && !adminMakingRequest ) {
            var oldValue = thisTd.innerText;
            document.body.click();
            var input = document.createElement("input");
            input.oninput = function() {
                thisTd.removeAttribute("data-default");
            }
            input.onkeydown = function(e) {
                if( e.which === 9 ) {
                    e.preventDefault();
                }
            }
            input.onkeyup = function(e) {
                if( e.which === 9 ) { // tab
                    var nextTd = this.parentNode.nextElementSibling;
                    if( nextTd && !nextTd.classList.contains("action-cell") ) {
                        nextTd.click();
                    }
                    else {
                        var nextTr = this.parentNode.parentNode.nextElementSibling;
                        if(nextTr) {
                            nextTr.querySelector("td").click();
                        }
                    }
                }
                else if(e.which === 13) {
                    document.body.click();
                }
            }
            if( thisTd.getAttribute("data-column") != "password" ) {
                if(thisTd.getAttribute("data-default")) {
                    input.placeholder = thisTd.innerText;
                }
                else {
                    input.value = thisTd.innerText;
                }
            }
            thisTd.innerHTML = "";
            thisTd.appendChild(input);
            input.focus();
            document.body.onclick = function() {
                if( input.value && !adminMakingRequest ) {
                    adminMakingRequest = true;
                    thisTd.innerText = input.value ? input.value : (input.placeholder ? input.placeholder : "");
                    var id = thisTd.parentNode.getAttribute("data-id");
                    if( id === "new" ) {
                        var otherTds = thisTd.parentNode.querySelectorAll("td:not(.action-cell)");
                        var params = {};
                        for( var i=0; i<otherTds.length; i++ ) {
                            var otherColumn = otherTds[i].getAttribute("data-column");
                            // generate random placeholder values
                            if( (/*otherColumn !== "email" &&*/ otherColumn !== "password") || otherTds[i].innerText ) params[ otherColumn ] = otherTds[i].innerText;
                            else params[ otherColumn ] = Math.random().toString(36).slice(2);
                        }
                        makeRequest("POST", endpoint, params, function(data) {
                            if( thisTd.getAttribute("data-column") == "password" ) thisTd.innerText = ADMIN_PASSWORD_PLACEHOLDER;
                            var id = JSON.parse(data).id;
                            thisTd.parentNode.setAttribute("data-id", id);
                            thisTd.parentNode.querySelectorAll("button").forEach( function(el) { el.classList.remove("hidden") });
                            createToast(SAVE_SUCCESSFUL_MESSAGE + " for " + thisTd.getAttribute("data-column"));
                            adminCreateRow( ADMIN_NEW_ROW_VALUES[endpoint], endpoint === "/api/user" ? ADMIN_USER_FIELDS : ADMIN_CLASS_FIELDS, tr.parentNode, endpoint ); // add a new row for adding
                            adminMakingRequest = false;
                        }, function() {
                            if( !thisTd.getAttribute("data-column") == "password" ) thisTd.innerText = oldValue;
                            createToast(SAVE_ERROR_MESSAGE + " for " + thisTd.getAttribute("data-column"));
                            adminMakingRequest = false;
                        } );
                    }
                    else {
                        var params = {
                            "id": id
                        };
                        params[ thisTd.getAttribute("data-column") ] = thisTd.innerText;
                        makeRequest("PUT", endpoint, params, function() {
                            if( thisTd.getAttribute("data-column") == "password" ) thisTd.innerText = ADMIN_PASSWORD_PLACEHOLDER;
                            createToast(SAVE_SUCCESSFUL_MESSAGE + " for " + thisTd.getAttribute("data-column"));
                            adminMakingRequest = false;
                        }, function() {
                            if( !thisTd.getAttribute("data-column") == "password" ) thisTd.innerText = oldValue;
                            createToast(SAVE_ERROR_MESSAGE + " for " + thisTd.getAttribute("data-column"));
                            adminMakingRequest = false;
                        } );
                    }
                }
                else {
                    thisTd.innerText = oldValue;
                }
                document.body.onclick = null;
            }
        }
        e.stopPropagation();
    } }(td);
}