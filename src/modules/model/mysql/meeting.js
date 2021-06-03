/**
 * @file    Meetings Table
 * @author  James Grams
 */

 const Constants = require('../../../constants');
 const MySQL = require('../mysql');
 
  /**
  * Class representing a Classes Table.
  */
 class Meeting extends MySQL {
 
     /**
      * Constructor.
      * @param {Connection} connection - The connection to the Database.
      */
     constructor( connection, data ) {
         super( connection, Constants.TABLES.meetings, data );
     }
 
 }
 
 Meeting.FIELDS = [
     "id",
     "created",
     "modified",
     "class_id",
     "start_date",
     "end_date"
 ];
 
 module.exports = Meeting;