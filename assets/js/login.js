window.addEventListener('DOMContentLoaded', loadLogin);

/**
 * Load the login page.
 */
function loadLogin() {
    setUserName( getCookieValue("racecourse-id") ? false : true );
    setActionButtons( getCookieValue("racecourse-id") ? [ {
        "name": LOG_OUT_STRING,
        "action": logout
    } ] : []);
    var form = document.querySelector(".login form");
    // code to run for each input
    addFormInputEvents( form );
    // form submit
    var loginLocation = "/dashboard";
    var redirectParam = new URLSearchParams(window.location.search).get("r");
    if( redirectParam ) {
        loginLocation = decodeURIComponent(redirectParam);
    }
    document.querySelector(".login form button").onclick = function(e) { formSubmit( e, form, loginLocation ) }; 
}