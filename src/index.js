// TODO: error checking start and end dates
// TODO: if 0 rows deleted or updates, say so
// first thing - keep going - next up, category tests
// maybe parse the different types of error to give better error messages.
// Variables in heroku
// Get ALL Categories - that should be part of the class get method.
/***************** Constants and Variables ******************/

const express = require('express');
const compression = require('compression');
const cookieParser = require("cookie-parser");

const Constants = require("./constants");
const ServerSpecific = require("./server-specific");

const ClassController = require("./modules/controller/api/class");
const UserController = require("./modules/controller/api/user");
const ClassUserController = require("./modules/controller/api/class-user");
const CategoryController = require("./modules/controller/api/category");
const AuthController = require("./modules/auth");

/***************** App Endpoints ******************/

const app = express();

// Compress items
app.use(compression());

// Static directories
app.use("/assets/", express.static( ServerSpecific.STATIC_APPEND + "assets"));
//app.use("/", express.static( ServerSpecific.STATIC_APPEND + "assets/images/icons"));

// Allow json body parsing
app.use(express.json());

// Allow cookie parsing
app.use(cookieParser());

// ajax - classes
app.post(Constants.ENDPOINTS.class, async function(request, response) { new ClassController(request, response).add() } );
app.put(Constants.ENDPOINTS.class, async function(request, response) { new ClassController(request, response).update() } );
app.get(Constants.ENDPOINTS.class, async function(request, response) { new ClassController(request, response).get() } );
app.delete(Constants.ENDPOINTS.class, async function(request, response) { new ClassController(request, response).delete() } );

// ajax - users
app.post(Constants.ENDPOINTS.user, async function(request, response) { new UserController(request, response).add() } );
app.put(Constants.ENDPOINTS.user, async function(request, response) { new UserController(request, response).update() } );
app.get(Constants.ENDPOINTS.user, async function(request, response) { new UserController(request, response).get() } );
app.delete(Constants.ENDPOINTS.user, async function(request, response) { new UserController(request, response).delete() } );

// ajax - class-users
app.post(Constants.ENDPOINTS.classUser, async function(request, response) { new ClassUserController(request, response).add() } );
app.put(Constants.ENDPOINTS.classUser, async function(request, response) { new ClassUserController(request, response).update() } );
app.get(Constants.ENDPOINTS.classUser, async function(request, response) { new ClassUserController(request, response).get() } );
app.delete(Constants.ENDPOINTS.classUser, async function(request, response) { new ClassUserController(request, response).delete() } );

// ajax - category
app.post(Constants.ENDPOINTS.category, async function(request, response) { new CategoryController(request, response).add() } );
app.put(Constants.ENDPOINTS.category, async function(request, response) { new CategoryController(request, response).update() } );
app.get(Constants.ENDPOINTS.category, async function(request, response) { new CategoryController(request, response).get() } );
app.delete(Constants.ENDPOINTS.category, async function(request, response) { new CategoryController(request, response).delete() } );

// ajax - login
app.post(Constants.ENDPOINTS.login, async function(request, response) { new AuthController(request, response).createToken() } );

//app.get("*", async function(request, response) { new NotFoundController(request, response).standardRespond() } );

// ready to listen
app.listen( ServerSpecific.PORT );