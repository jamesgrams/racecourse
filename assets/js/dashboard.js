window.addEventListener('DOMContentLoaded', loadDashboard);

/**
 * Load the login page.
 */
function loadDashboard() {
    setUserName();
    var buttons = [ 
    {
        "name": "Calendar",
        "action": function() { directPage("/calendar") }
    },
    {
        "name": LOG_OUT_STRING,
        "action": logout
    } ];

    var userInfo = JSON.parse( decodeURIComponent (getCookieValue("racecourse-id")) );
    if( !userInfo.user ) {
        createToast(DEFAULT_ERROR); 
        return;
    }

    if( userInfo.is_global_admin ) {
        buttons.unshift( {
            "name": "Admin",
            "action": function() {
                directPage("/admin?type=user")
            }
        } );
    }
    setActionButtons( buttons );

    makeRequest( "GET", "/api/class-user", { "user_id": userInfo.user }, 
    function( data ) {
        
        var items = JSON.parse(data).items;
        var requestCount = items.length;
        var errorOcurred = false;
        var classes = {}; // this will be sorted to be alphabetical
        var allDone = function() {
            requestCount --;
            if( requestCount == 0 ) {
                var keys = Object.keys(classes).sort();
                for( var i=0; i<keys.length; i++ ) {
                    document.querySelector(".dashboard").appendChild(classes[keys[i]]);
                }
                if( errorOcurred ) {
                    createToast(DEFAULT_ERROR);
                }
            }
        }
        for( var i=0; i<items.length;i++ ) {

            (function( item ) {
                // todo make these show up alphabetically or some other order
                makeRequest( "GET", "/api/class", { "id": item.class_id }, function( classData ) {
                    var classBox = document.createElement("div");
                    classBox.classList.add("dashboard-box");
                    var classJson = JSON.parse(classData);
                    var classNameContainer = document.createElement("span");
                    classNameContainer.innerHTML = classJson.items[0].name;
                    classBox.appendChild(classNameContainer);
                    classBox.onclick = function() { 
                        directPage("/class?id=" + item.class_id +  (item.is_admin ? "&admin=1" : "") ); 
                    }
                    classes[classJson.items[0].name] = classBox;
                    allDone();
                }, function() {
                    errorOcurred = true;
                    allDone();
                } );
            })( items[i] );

        }

    },
    function( data ) {
        var errorMessage = DEFAULT_ERROR;
        try {
            var responseObj = JSON.parse(data);
            if( responseObj.errorMessage ) errorMessage = responseObj.errorMessage;
        }
        catch(err) {}
        createToast( errorMessage );
    } );
}