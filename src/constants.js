/**
 * @file    Constants
 * @author  James Grams
 */

/**
 * Class representing Constants.
 * This file should include any text/media paths the user sees that is not dynamically generated.
 * In addition, other commonly used and changes values can be put in here.
 */
class Constants {}

// This is appended to the Title of every page
Constants.MAIN_NAME = "RaceCourse";
Constants.TITLE_APPEND = " | " + Constants.MAIN_NAME;

// These are the paths for the pages
Constants.PAGES = {
    login: {"name": "Login", "js": ["/assets/js/login.min.js"], "css": ["/assets/css/login.min.css"], "path": "/login", "description": "Login to RaceCourse"},
    notFound: {"name": "404", "js": [], "css": [], "path": "/404", "description": "404"}
}

Constants.API_PREFIX = "/api/";

// API endpoints
Constants.ENDPOINTS = {
    class: Constants.API_PREFIX + "class",
    user: Constants.API_PREFIX + "user",
    login: Constants.API_PREFIX + "login",
    classUser: Constants.API_PREFIX + "class-user",
    category: Constants.API_PREFIX + "category"
}

// The encoding of the site
Constants.ENCODING = "text/html; charset=utf-8";
// webp encoding
Constants.WEBP_ENCODING = "image/webp";
// json encoding
Constants.JSON_ENCDOING = "application/json";
// accept header
Constants.ACCEPT_HEADER = "Accept";

// good request
Constants.HTTP_OK = 200;
// bad request
Constants.HTTP_BAD_REQUEST = 422;
// Unauthorized
Constants.HTTP_FORBIDDEN = 401;
// Not found
Constants.HTTP_NOT_FOUND = 404;

// ajax success
Constants.AJAX_SUCCESS = "success";
// ajax failure
Constants.AJAX_FAILURE = "failure";

// Error messages
Constants.ERROR_MESSAGES = {
    "badInput": "You have entered invalid input. Please try again.",
    "failedConnection": "An error occurred while trying to connect to the database. Please try again.",
    "invalidCredentials": "Invalid credentials.",
    "missingRequiredFields": "Please fill out all required fields.",
    "noId": "No identifier specified."
};

// HTML Doctype
Constants.HTML_DOCTYPE = "<!DOCTYPE html>";

// Tables
Constants.TABLES = {
    classes: "classes",
    users: "users",
    classesUsers: "classes_users",
    categories: "categories"
}

// Default where column
Constants.DEFAULT_WHERE = "id";

// Length of the Scrypt key
Constants.CRYPTO_KEY_LEN = 128;
Constants.SALT_RANDOM_LEN = 20;
// Token expires in
Constants.TOKEN_OPTIONS = {"expiresIn": "2d"};
Constants.TOKEN_EXPIRES_IN_MS = 172800000;
// Token cookie
Constants.TOKEN_COOKIE = "racecourse-token";

// Log out button
Constants.LOG_OUT_BUTTON_TEXT = "Log Out";

// Hex to 32 bit hex
Constants.hexTo32BitHex = function(hex) {
    hex = hex.toString();
    let couplets = hex.match(/.{1,2}/g);
    let newString = "";
    for( let couplet of couplets ) {
        let sum = 0;
        for( let item of couplet ) {
            let intItem = parseInt(item);
            if( !intItem && intItem != 0 ) {
                intItem = item.charCodeAt(0);
                intItem = intItem - 87;
            }
            sum += intItem;
        }
        if( sum < 10 ) newString += sum.toString();
        else newString += String.fromCharCode(sum + 87);
    }
    return newString;
}

module.exports = Constants;