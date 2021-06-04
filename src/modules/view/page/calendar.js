/**
 * @file    Calendar Page
 * @author  James Grams
 */

 const Constants = require('../../../constants');
 const Page = require('../page');
 const Document = require("../../../document");
const Select = require('../select');
 
 /**
  * Class representing the Calendar Page.
  */
 class Calendar extends Page {
 
     /**
      * Constructor.
      * @param {boolean} [acceptsWebP] - True if the client can accept webp images.
      */
     constructor( acceptsWebP ) {
         super( Constants.PAGES.calendar.name, Constants.PAGES.calendar.description, acceptsWebP, Constants.PAGES.calendar.path, Constants.PAGES.calendar.js, Constants.PAGES.calendar.css );
     }
 
     /**
      * Generate the specfic content for the dashboard page.
      * @returns {Array.<HTMLElement>} The content HTML Elements.
      */
     generateContent() {
         let pageItems = [];
     
         let calendarSection = Document.document.createElement("div");
         calendarSection.classList.add("calendar");
 
         let title = Document.document.createElement("h1");
         title.classList.add("calendar-title");
         title.innerHTML = Constants.CALENDAR_TITLE;
         calendarSection.appendChild(title);
 
         let select = new Select(Constants.CALENDAR_CLASS_LABEL, Constants.CALENDAR_CLASS_NAME, []).generateElement();
         calendarSection.appendChild(select);

         let calendar = Document.document.createElement("table");
         calendarSection.appendChild(calendar);

         let previousButton = Document.document.createElement("button");
         previousButton.setAttribute("id", "calendar-previous-button");
         previousButton.innerHTML = Constants.CALENDAR_PREVIOUS_LABEL;
         calendarSection.appendChild(previousButton);

         let nextButton = Document.document.createElement("button");
         nextButton.setAttribute("id", "calendar-next-button");
         nextButton.innerHTML = Constants.CALENDAR_NEXT_LABEL;
         calendarSection.appendChild(nextButton);
 
         pageItems.push(calendarSection);
 
         return pageItems;
     }
 
 }
 
 module.exports = Calendar;