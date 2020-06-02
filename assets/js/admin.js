window.addEventListener('DOMContentLoaded', loadAdmin);

var USER_FIELDS = [
    "first",
    "last",
    "email",
    "password",
    "is_global_admin"
];
var CLASS_FIELDS = [
    "name"
];
var ADMIN_NEW_ROW_VALUES = {
    "/api/user": {
        "id": "new",
        "first": "New",
        "last": "User",
        "email": "",
        "password": "",
        "is_global_admin": 0
    },
    "/api/class": {
        "id": "new",
        "name": "New Class"
    }
};

/**
 * Load the login page.
 */
function loadAdmin() {
    setUserName();
    setActionButtons( [
    {
        "name": "Users",
        "action": function() { loadTable("/api/user", USER_FIELDS) }
    },
    {
        "name": "Classes",
        "action": function() { loadTable("/api/class", CLASS_FIELDS) }
    },
    {
        "name": LOG_OUT_STRING,
        "action": logout
    }
    ] );
    loadTable("/api/user", USER_FIELDS);
}


/**
 * Load an admin table.
 * @param {string} endpoint - The endpoint to load the table from.
 * @param {Array} keys - The fields to show.
 */
function loadTable( endpoint, keys ) {
    var table = document.querySelector("table");
    table.innerHTML = "";

    // make the request
    makeRequest("GET", endpoint, {}, function(data) {
        try {
            var items = JSON.parse(data).items;
            if( items.length ) { // TODO we are dependent on there being one item in the db
                keys = keys ? keys : Object.keys(items[0]);
                var thead = document.createElement("thead");
                var tr = document.createElement("tr");
                thead.appendChild(tr);

                for( var i=0; i<keys.length; i++ ) {
                    var th = document.createElement("th");
                    th.innerText = capitalizeFirstLetter(keys[i].replace(/_/g," "));
                    tr.appendChild(th);
                }
                table.appendChild(thead);

                var tbody = document.createElement("tbody");
                for( var i=0; i<items.length; i++ ) {
                    createRow(items[i], keys, tbody, endpoint);
                }

                createRow( ADMIN_NEW_ROW_VALUES[endpoint], keys, tbody, endpoint );
                table.appendChild(tbody);
            }
        }
        catch(err) {
            // TODO
            console.log(err);
        }
    } );
    // TODO error function
}

/**
 * 
 * @param {Object} item - The item to create the row for. 
 * @param {Array} keys - The keys to display.
 * @param {HTMLElement} tr - The tbody element to append the cell to. 
 * @param {string} endpoint - The endpoint to load the table from.
 */
function createRow( item, keys, tbody, endpoint ) {
    var tr = document.createElement("tr");
    tr.setAttribute("data-id", item.id);
    for( var j=0; j<keys.length; j++ ) {
        createCell( keys[j], item[keys[j]], tr, endpoint );
    }
    tbody.appendChild(tr);
}

/**
 * Create a new entry in the table.
 * @param {string} column - The name of the column.
 * @param {string} value - The value for the column.
 * @param {HTMLElement} tr - The tr element to append the cell to.
 * @param {string} endpoint - The endpoint to load the table from.
 */
function createCell( column, value, tr, endpoint ) {
    var td = document.createElement("td");
    td.setAttribute("data-column", column);
    td.innerText = (typeof value !== "undefined") ? value : "";
    tr.appendChild(td);

    td.onclick = function(thisTd) { return function(e) {
        if( !thisTd.querySelector("input") ) {
            var oldValue = thisTd.innerText;
            document.body.click();
            var input = document.createElement("input");
            input.value = thisTd.innerText;
            thisTd.innerHTML = "";
            thisTd.appendChild(input);
            document.body.onclick = function() {
                if( input.value ) {
                    thisTd.innerHTML = input.value;
                    var id = thisTd.parentNode.getAttribute("data-id");
                    if( id === "new" ) {
                        var otherTds = thisTd.parentNode.querySelectorAll("td");
                        var params = {};
                        for( var i=0; i<otherTds.length; i++ ) {
                            var otherColumn = otherTds[i].getAttribute("data-column");
                            // generate random placeholder values
                            if( !otherTds[i].innerText ) params[ otherColumn ] = otherTds[i].innerText;
                            else params[ otherColumn ] = Math.random().toString(36).slice(2);
                        }
                        makeRequest("POST", endpoint, params, function(data) {
                            var id = JSON.parse(data).id;
                            thisTd.parentNode.setAttribute("data-id", id);
                        }, function() {
                            if( !thisTd.getAttribute("data-column") == "password" ) thisTd.innerText = oldValue;
                            alert(defaultError);
                        } );
                    }
                    else {
                        var params = {
                            "id": id
                        };
                        params[ thisTd.getAttribute("data-column") ] = thisTd.innerHTML;
                        makeRequest("PUT", endpoint, params, function() {}, function() {
                            if( !thisTd.getAttribute("data-column") == "password" ) thisTd.innerText = oldValue;
                            alert(defaultError);
                        } );
                    }
                }
                else {
                    thisTd.innerText = oldValue;
                }
            }
        }
        e.stopPropagation();
    } }(td);
}