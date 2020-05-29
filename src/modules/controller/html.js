/**
 * @file    HTML Controller
 * @author  James Grams
 * @abstract
 */

const Controller = require("../controller");
const Constants = require('../../constants');

 /**
 * Class representing an API Controller.
 */
class Html extends Controller {

    /**
     * Constructor.
     * @param {Request} request - The request object.
     * @param {Response} response - The response object.
     * @param {Object} authInfo - An object with keys being methods, and values being an object with keys of params and where to send to the auth controller.
     * @param {Class} pageView - The page class.
     */
    constructor( request, response, authInfo, pageView ) {
        super( request, response, authInfo );
        this.pageView = pageView;
    }

    /**
     * Respond to a forbidden request.
     */
    forbiddenRespond() {
        this.response.redirect( Constants.ENDPOINTS.login );
    }

    /**
     * Send a standard response for a request.
     */
    async standardRespond() {
        if( !await this.isAllowed( "standardRespond" ) ) {
            this.forbiddenRespond();
        }
        else {
            let acceptsWebP;
            if( (this.request.query.webp && this.request.query.webp != "false") || (this.request.get(Constants.ACCEPT_HEADER) && this.request.get(Constants.ACCEPT_HEADER).includes(Constants.WEBP_ENCODING)) ) {
                acceptsWebP = true;
            }
            else {
                acceptsWebP = false;
            }

            let ajax = this.request.query.ajax;

            let pageInstance = this.pageViewInstance ? this.pageViewInstance : new this.pageView( acceptsWebP, this.request.tokenData ? this.request.tokenData.username : null );
            pageInstance.acceptsWebP = acceptsWebP; // if pageViewInstance is used like in book.js
            let content = ajax ? pageInstance.generateAjax() : pageInstance.generateElement();
            if( !ajax ) content = Constants.HTML_DOCTYPE + content.outerHTML;
            else content = JSON.stringify( content );
            
            this.response.set({ 'content-type': ajax ? Constants.JSON_ENCDOING : Constants.ENCODING });
            this.response.end( content );
        }
    }

}

module.exports = Html;