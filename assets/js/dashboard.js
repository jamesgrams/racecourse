window.addEventListener('DOMContentLoaded', loadDashboard);

/**
 * Load the login page.
 */
function loadDashboard() {
    setUserName();
    var buttons = [ {
        "name": LOG_OUT_STRING,
        "action": logout
    } ];

    var userInfo = JSON.parse( decodeURIComponent (getCookieValue("racecourse-id")) );
    if( !userInfo.user ) {
        alert(defaultError); 
        return;
    }

    if( userInfo.is_global_admin ) {
        buttons.unshift( {
            "name": "Admin",
            "action": function() {
                directPage("/admin")
            }
        } );
    }
    setActionButtons( buttons );

    // TODO what if no user
    makeRequest( "GET", "/api/class-user", { "user_id": userInfo.user }, 
    function( data ) {
        
        var items = JSON.parse(data).items;
        for( var i=0; i<items.length;i++ ) {

            (function( item ) {
                // todo make these show up alphabetically or some other order
                makeRequest( "GET", "/api/class", { "id": item.class_id }, function( classData ) {
                    var classBox = document.createElement("div");
                    classBox.classList.add("dashboard-box");
                    var classJson = JSON.parse(classData);
                    classBox.innerHTML = classJson.items[0].name;
                    classBox.onclick = function() { 
                        directPage("/class?id=" + item.class_id +  (item.is_admin ? "&admin=1" : "") ); 
                    }
                    document.querySelector(".dashboard").appendChild(classBox);
                } );
            })( items[i] );
            // TODO error function here?

        }

    },
    function( data ) {
        var errorMessage = defaultError;
        try {
            var responseObj = JSON.parse(data);
            if( responseObj.errorMessage ) errorMessage = responseObj.errorMessage;
        }
        catch(err) {}
        alert( errorMessage );
    } );
}