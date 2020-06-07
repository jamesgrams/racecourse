window.addEventListener('DOMContentLoaded', loadClass);

var classContents;
var classId;
var classIsSaving;
var classNewCategoryCount = 0;

var CATEGORY_NEW_CATEGORY_DATA = {
    "name": "",
    "id": "new",
    "content": ""
};

/**
 * Load the class page.
 */
function loadClass() {

    setUserName();
    var actions = [ {
        "name": LOG_OUT_STRING,
        "action": logout
    } ];
    var classInfo = new URLSearchParams(window.location.search);
    var isAdmin = parseInt(classInfo.get("admin"));
    classContents = {};
    classIsSaving = false;
    classNewCategoryCount = 0;
    classId = classInfo.get("id");

    if( isAdmin ) {
        actions.unshift({
            "name": "Save",
            "action": classSaveState
        });
        actions.unshift({
            "name": "View",
            "action": function() { window.open("/class?id=" + classId) }
        });
    }
    setActionButtons(actions);

    makeRequest( "GET", "/api/class", { "id": classInfo.get("id") }, 
    function( data ) {
        
        var items = JSON.parse(data).items;
        var className = items[0].name;
        var titleElement = document.querySelector("head title");
        titleElement.innerHTML = titleElement.innerHTML.replace("Class", className);
        if( !isAdmin ) document.querySelector(".class-title").innerText = className;
        else {
            var nameTextBox = document.createElement("input");
            nameTextBox.setAttribute("type", "text");
            nameTextBox.value = className;
            document.querySelector(".class-title").appendChild(nameTextBox);
        }
    },
    function( data ) {
        var errorMessage = defaultError;
        try {
            var responseObj = JSON.parse(data);
            if( responseObj.errorMessage ) errorMessage = responseObj.errorMessage;
        }
        catch(err) {}
        createToast( errorMessage );
    } );

    makeRequest( "GET", "/api/category", { "class_id": classInfo.get("id") }, 
    function( categoryData ) {
        var categoryItems = JSON.parse(categoryData).items;
        if( isAdmin ) {
            categoryItems.push(CATEGORY_NEW_CATEGORY_DATA);
        }
        for( var i=0; i<categoryItems.length; i++ ) {
            classAddCategory(categoryItems[i], isAdmin);
        }
        if( categoryItems.length ) {
            document.querySelector(".categories li").click(); // show the content of the first tab.
        }
    },
    function( data ) {
        var errorMessage = defaultError;
        try {
            var responseObj = JSON.parse(data);
            if( responseObj.errorMessage ) errorMessage = responseObj.errorMessage;
        }
        catch(err) {}
        createToast( errorMessage );
    } );
}

/**
 * Save the current state of the edited class.
 */
function classSaveState() {
    if( classIsSaving ) return;
    classIsSaving = true;
    document.querySelector("header button:nth-child(2)").innerText = "Saving...";

    var classTitle = document.querySelector(".class-title");
    var titleText = classTitle.querySelector("input").value;

    var errorOcurred = false;

    makeRequest( "PUT", "/api/class", { "id": classId, "name": titleText }, function() {
        classSaveContents();
        var categoriesOptions = document.querySelectorAll(".categories li");
        var categoriesRequestsLength = categoriesOptions.length;
        
        var allDone = function() {
            categoriesRequestsLength--;
            if( categoriesRequestsLength == 0 ) {
                classIsSaving = false;
                document.querySelector("header button:nth-child(2)").innerText = "Save";
                if( errorOcurred ) {
                    createToast(SAVE_ERROR_MESSAGE);
                }
                else {
                    createToast(SAVE_SUCCESSFUL_MESSAGE);
                }
            }
        }

        // delete
        var keys = Object.keys(classContents);
        var deleteCategories = [];
        for( var i=0; i<keys.length; i++ ) {
            if( !document.querySelector(".categories li[data-id='"+keys[i]+"']") ) {
                deleteCategories.push(keys[i]);
            }
        }
        categoriesRequestsLength += deleteCategories.length;
        for( var i=0; i<deleteCategories.length; i++ ) {
            makeRequest( "DELETE", "/api/category", { "id": deleteCategories[i], "class_id": classId }, function(id) { return function() {
                delete classContents[id];
                allDone();
            } }(deleteCategories[i]), function() { errorOcurred = true; allDone(); } );
        }

        // update/add
        for( var i=0; i<categoriesOptions.length; i++ ) {
            var id = categoriesOptions[i].getAttribute("data-id");
            var content = classContents[id];
            var name = categoriesOptions[i].querySelector("input").value;

            if( id.toString().match(/^new/) ) {
                if( !name ) {
                    allDone();
                    return;
                }
                // display order depends on category options being fetched in order on the page which it is
                makeRequest( "POST", "/api/category", { "content": content, "name": name, "class_id": classId, "display_order": i }, function(id) { return function(data) {
                    try {
                        var newId = JSON.parse(data).id;
                        document.querySelector(".categories li[data-id='"+id+"']").setAttribute("data-id", newId);
                        classContents[newId] = classContents[id];
                        delete classContents[id];
                    }
                    catch(err) {
                        console.log(err);
                        errorOcurred = true;
                    }
                    allDone();
                } }(id), function() { errorOcurred = true; allDone(); } );
            }
            else {
                makeRequest( "PUT", "/api/category", { "id": id, "content": content, "name": name, "class_id": classId, "display_order": i }, allDone, function() { errorOcurred = true; allDone(); } );
            }
        }

    }, function() {
        createToast(SAVE_ERROR_MESSAGE);
    } );

}

/**
 * Add a category to the list of the display.
 * @param {Object} categoryItem - The category item.
 * @param {boolean} isAdmin - True if this is an admin.
 */
function classAddCategory( categoryItem, isAdmin ) {

    categoryItem = JSON.parse(JSON.stringify(categoryItem));
    if( categoryItem.id == "new" ) {
        categoryItem.id = "new" + classNewCategoryCount;
        classNewCategoryCount++;
    }
    
    var categoryBox = document.createElement("li");
    categoryBox.setAttribute("data-id", categoryItem.id);

    if( !isAdmin ) {
        categoryBox.innerText = categoryItem.name;
    }
    else {
        var categoryTextBox = document.createElement("input");
        categoryTextBox.setAttribute("type", "text");
        categoryTextBox.value = categoryItem.name;
        categoryBox.appendChild(categoryTextBox);

        var deleteButton = document.createElement("button");
        deleteButton.innerText = "❌";
        categoryBox.appendChild(deleteButton);
        deleteButton.onclick = function(e) {
            if( categoryBox.classList.contains("selected") ) document.querySelector(".categories li:not(.selected)").click();
            this.parentElement.parentElement.removeChild(this.parentElement);
            e.stopPropagation();
        };

        var orderUpButton = document.createElement("button");
        orderUpButton.innerText = "⬆️";
        categoryBox.appendChild(orderUpButton);
        orderUpButton.onclick = function(e) {
            var prevSibling = categoryBox.previousElementSibling;
            if( prevSibling ) {
                categoryBox.parentNode.insertBefore( categoryBox, prevSibling );
            }
            else {
                var existingBoxes = document.querySelectorAll(".categories li:not([data-id^='new'])");
                categoryBox.parentNode.insertBefore( categoryBox, existingBoxes[existingBoxes.length-1].nextElementSibling );
            }
        };

        var orderDownButton = document.createElement("button");
        orderDownButton.innerText = "⬇️";
        categoryBox.appendChild(orderDownButton);
        orderDownButton.onclick = function(e) {
            var nextSibling = categoryBox.nextElementSibling;
            if( nextSibling && !nextSibling.getAttribute("data-id").match(/^new/) ) {
                categoryBox.parentNode.insertBefore( categoryBox, nextSibling.nextElementSibling );
            }
            else {
                categoryBox.parentNode.prepend( categoryBox );
            }
        };
        
        if( categoryItem.id.toString().match(/^new/) ) {
            deleteButton.classList.add("hidden");
            orderUpButton.classList.add("hidden");
            orderDownButton.classList.add("hidden");
        }

        if( isAdmin && categoryItem.id.toString().match(/^new/) ) {
            categoryTextBox.oninput = function() {
                classAddCategory( CATEGORY_NEW_CATEGORY_DATA, isAdmin );
                categoryTextBox.oninput = null;
                deleteButton.classList.remove("hidden");
                orderUpButton.classList.remove("hidden");
                orderDownButton.classList.remove("hidden");
            }
        }
    }

    classContents[categoryItem.id] = categoryItem.content;
    categoryBox.onclick = function() {
        if( this.classList.contains("selected") ) return;
        var id = this.getAttribute("data-id");
        var curSelected = document.querySelector(".categories li.selected");
        if( curSelected && isAdmin ) {
            classSaveContents();
        }

        if( isAdmin ) {
            tinyMCE.remove(".content .editor");
            document.querySelector(".editor").innerHTML = classContents[id];
            tinymce.init({selector: ".editor",plugins: "link"});
        }
        else {
            document.querySelector(".editor").innerHTML = classContents[id];
        }

        if( curSelected ) curSelected.classList.remove("selected");
        this.classList.add("selected");

    }
    document.querySelector(".categories").appendChild(categoryBox);
    
}

/**
 * Save the current editor's contents to the in memory hash.
 */
function classSaveContents() {
    var id = document.querySelector(".categories li.selected").getAttribute("data-id");
    var content = tinymce.activeEditor.getContent();
    classContents[id] = content;
}