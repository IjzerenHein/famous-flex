/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014
 */

/*global define*/

/**
 * Three part layout consiting of a top-header, bottom-footer and middle part.
 *
 * |options|type|description|
 * |---|---|---|
 * |`[headerHeight]`|Number|Height of the header|
 * |`[footerHeight]`|Number|Height of the footer|
 *
 * Example:
 *
 * ```javascript
 * var HeaderFooterLayout = require('famous-flex/layouts/HeaderFooterLayout');
 *
 * new LayoutController({
 *   layout: HeaderFooterLayout,
 *   layoutOptions: {
 *     headerHeight: 60,    // header has height of 60 pixels
 *     footerHeight: 20     // footer has height of 20 pixels
 *   },
 *   dataSource: {
 *	   header: new Surface({content: 'This is the header surface'}),
 *	   content: new Surface({content: 'This is the content surface'}),
 *	   footer: new Surface({content: 'This is the footer surface'})
 *   }
 * })
 * ```
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var LayoutDockHelper = require('../helpers/LayoutDockHelper');

    // Layout function
    module.exports = function HeaderFooterLayout(context, options) {
        var dock = new LayoutDockHelper(context);
        dock.top('header', options.headerHeight);
        dock.bottom('footer', options.footerHeight);
        dock.fill('content');
    };
});
