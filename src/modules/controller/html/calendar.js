/**
 * @file    Calendar Controller
 * @author  James Grams
 * @abstract
 */

 const Html = require("../html");
 const CalendarView = require("../../view/page/calendar");
 
  /**
  * Class representing a Calendar Controller.
  */
 class Calendar extends Html {
 
     /**
      * Constructor.
      * @param {Request} request - The request object.
      * @param {Response} response - The response object.
      */
     constructor( request, response ) {
         super( request, response, {
             "standardRespond": {}
         },
         CalendarView );
     }
 
 }
 
 module.exports = Calendar;