/**
 * @file    Meeting Controller
 * @author  James Grams
 * @abstract
 */

 const MeetingModel = require('../../model/mysql/meeting');
 const Api = require('../api');
 const Pool = require('../../../pool');
 const UserModel = require('../../model/mysql/user');
 const Constants = require('../../../constants');
 
  /**
  * Class representing a Controller for the Meeting Endpoints
  */
 class Meeting extends Api {
 
     /**
      * Constructor.
      * @param {request} request - The request object.
      * @param {Response} response - The response object.
      */
     constructor(request, response) {
         super(request, response, {
            "get": { 
                "params": {
                    "users.is_global_admin": 1,
                    "users.id": request.query.user_id
                },
                "where": [ ["users.is_global_admin", "users.id"], "users.id" ] // select all users where (is admin or id is what is being requested) and id matches token cookie
            },
            "get-student": { 
                "params": {
                    "users.is_global_admin": 1,
                    "classes.id": request.query.class_id,
                    "users.id": request.query.user_id
                },
                "where": [ ["users.is_global_admin", ["classes.id", "users.id"] ], "users.id" ] // select all users where (is admin or the class id matches what's requested [joined]) and the user column matches the token cookie
           },
            "add": { 
                 "params": {
                     "users.is_global_admin": 1,
                     "classes.id": request.body.class_id,
                     "users.id": request.body.user_id
                 },
                 "where": [ ["users.is_global_admin", ["classes.id", "users.id"] ], "users.id" ] // select all users where (is admin or the class id matches what's requested [joined]) and the user column matches the token cookie
            },
            "delete": { 
                "params": {
                    "users.is_global_admin": 1,
                    "classes.id": request.query.class_id
                },
                "where": [ ["users.is_global_admin", "classes.id"], "users.id" ] // select all users where (is admin or the class id matches what's requested [joined]) and the user column matches the token cookie
            }
         }, MeetingModel);
     }

    /**
    * Get values for fields in a database.
    * Getting is different for users and administrators.
    * Administrators see all their schedule for all their classes.
    * Users see all the schedules of the class they are looking at's administrators.
    */
    async get() {
        try {
            let rows = await this.getRows( false, true );
            this.standardRespond( false, {"items": rows} );
        }
        catch(err) {
            this.forbiddenRespond();
        }
    }

    /**
     * Get rows.
     * Abstracted outside of an endpoint.
     * @param {boolean} ignoreAllowed - Ignore allowed check.
     * @param {boolean} [useQuery] - True if we should use the query.
     * @returns {Promise<Array>} A promise containing an array of rows or a rejected promise if an error.
     */
    async getRows( ignoreAllowed, useQuery ) {
        // getting as a student has the same permissions as adding - you need a class.
        let gMap = this.generateParametersMap( useQuery );
        let map = {};
        for( let key in gMap ) {
            map["meetings." + key] = gMap[key];
        }
        map["users.id"] = this.request[useQuery ? "query" : "body"].user_id; // add user id
        if( this.request.query.student ) {
            if( ignoreAllowed || await this.isAllowed( "get-student" ) ) {
                map["ecu.is_admin"] = 1; // make sure we only get admin schedules in fetch
                delete map["meetings.class_id"]; // otherwise, we'd only see the classes we are in for the teacher
                let rows = await new UserModel( Pool.pool, map ).fetchAll( null, [
                    { 'table': 'classes_users as scu', 'localKey': 'users.id', 'foreignKey': 'scu.user_id' },
                    { 'table': 'classes as cs', 'localKey': 'scu.class_id', 'foreignKey': 'cs.id' }, // all the classes the user is in
                    { 'table': 'classes_users as ecu', 'localKey': 'cs.id', 'foreignKey': 'ecu.class_id' }, // get everyone in the same classes as the user [where clause gets only admins]
                    { 'table': 'users as administrators', 'localKey': 'ecu.user_id', 'foreignKey': 'administrators.id' },
                    { 'table': 'classes_users as acu', 'localKey': 'administrators.id', 'foreignKey': 'acu.user_id' }, // get all the classes the administrators teach
                    { 'table': 'meetings', 'localKey': 'acu.class_id', 'foreignKey': 'meetings.class_id' }
                ], [
                    "meetings.id", 
                    "meetings.class_id",
                    "meetings.start_date",
                    "meetings.end_date",
                    "administrators.first",
                    "administrators.last",
                    "administrators.email"
                ] );
                return Promise.resolve(rows);
            }
            else {
                return Promise.reject();
            }
        }
        else if( ignoreAllowed || await this.isAllowed( "get" ) ) {
            map["classes_users.is_admin"] = 1; // make sure we only get admin schedules in fetch
            let rows = await new UserModel( Pool.pool, map ).fetchAll( null, [
                { 'table': 'classes_users', 'localKey': 'users.id', 'foreignKey': 'classes_users.user_id' },
                { 'table': 'classes', 'localKey': 'classes_users.class_id', 'foreignKey': 'classes.id' }, // all the classes the admin teaches (see where)
                { 'table': 'meetings', 'localKey': 'classes_users.class_id', 'foreignKey': 'meetings.class_id' }
            ], [
                "meetings.id",
                "meetings.start_date",
                "meetings.end_date",
                "classes.name"
            ] );
            return Promise.resolve(rows);
        }
        else {
            return Promise.reject();
        }
    }

    /**
     * Add fields in the database.
     */
    async add() {
        if( await this.isAllowed( "add" ) ) {
            try {
                let startDate = new Date(this.request.body.start_date);
                let endDate = new Date(this.request.body.end_date);
                let classId = this.request.body.class_id;
                delete this.request.body.start_date;
                delete this.request.body.end_date;
                delete this.request.body.class_id;
                let meetings = await this.getRows( true );
                for( let row of meetings ) {
                    if( row["start_date"] < endDate && row["end_date"] > startDate ) {
                        this.standardRespond( Constants.ERROR_MESSAGES.dateTaken, {} );
                        return Promise.resolve();
                    }
                }
                this.request.body.start_date = startDate;
                this.request.body.end_date = endDate;
                this.request.body.class_id = classId;
                Api.prototype.add.call(this, true); // perform update in the superclass
            }
            catch(err) {
                this.forbiddenRespond();
            }
        }
        else {
            this.forbiddenRespond();
        }
    }
 
 }
 
 module.exports = Meeting;