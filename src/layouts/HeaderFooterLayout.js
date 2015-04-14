/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014 - 2015
 */

/**
 * Three part layout consisting of a top-header, bottom-footer and middle part.
 *
 * |options|type|description|
 * |---|---|---|
 * |`[headerSize]`|Number|Height of the header|
 * |`[footerSize]`|Number|Height of the footer|
 * |`[margins]`|Number/Array|Margins shorthand (e.g. 5, [10, 20], [2, 5, 2, 10])|
 *
 * Example:
 *
 * ```javascript
 * var HeaderFooterLayout = require('famous-flex/layouts/HeaderFooterLayout');
 *
 * var layout = new LayoutController({
 *   layout: HeaderFooterLayout,
 *   layoutOptions: {
 *     headerSize: 60,    // header has height of 60 pixels
 *     footerSize: 20     // footer has height of 20 pixels
 *   },
 *   dataSource: {
 *	   header: new Surface({content: 'This is the header surface'}),
 *	   content: new Surface({content: 'This is the content surface'}),
 *	   footer: new Surface({content: 'This is the footer surface'})
 *   }
 * });
 * ```
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var LayoutDockHelper = require('../helpers/LayoutDockHelper');

    // Layout function
    module.exports = function HeaderFooterLayout(context, options) {
        var dock = new LayoutDockHelper(context, options);
        dock.top('header', (options.headerSize !== undefined) ? options.headerSize : options.headerHeight);
        dock.bottom('footer', (options.footerSize !== undefined) ? options.footerSize : options.footerHeight);
        dock.fill('content');
    };
});
