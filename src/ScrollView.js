/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014
 */

/*global define, console*/
/*eslint no-use-before-define:0, no-console:0 */

/**
 * Flexible ScrollView drop-in replacement for famo.us.
 *
 * Key features:
 * -    Customizable layout
 * -    Insert/remove renderables into the scene using animations/spec
 * -    Support for `true` size renderables
 * -    Horizontal/vertical direction
 * -    Top/left or bottom/right alignment
 * -    Pagination
 * -    Option to embed in a ContainerSurface
 *
 * Inherited from: [ScrollController](./ScrollController.md)
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var ScrollController = require('./ScrollController');
    var ListLayout = require('./layouts/ListLayout');

    /**
     * @class
     * @extends ScrollController
     * @param {Object} options Options (see ScrollController).
     * @alias module:ScrollView
     */
    function ScrollView(options) {
        if (!options) {
            options = ScrollView.DEFAULT_OPTIONS;
        }
        else {
            var newOptions = {};
            for (var key in ScrollView.DEFAULT_OPTIONS) {
                newOptions[key] = ScrollView.DEFAULT_OPTIONS[key];
            }
            for (var key2 in options) {
                newOptions[key2] = options[key2];
            }
            options = newOptions;
        }
        ScrollController.call(this, options);
    }
    ScrollView.prototype = Object.create(ScrollController.prototype);
    ScrollView.prototype.constructor = ScrollView;

    ScrollView.DEFAULT_OPTIONS = {
        layout: ListLayout,         // sequential layout, uses width/height from renderable
        direction: undefined,       // 0 = X, 1 = Y, undefined = use default from layout
        paginated: false,           // pagination on/off
        alignment: 0,               // 0 = top/left, 1 = bottom/right
        flow: false,                // allow renderables to flow between layouts when not scrolling
        mouseMove: false,           // allow mouse to hold and move the view
        useContainer: false,        // embeds inside a ContainerSurface for clipping and capturing input events
        visibleItemThresshold: 0.5  // by default, when an item is 50% visible, it is considered visible by `getFirstVisibleItem`
        // see ScrollController for all other options
    };

    /**
     * Sets the data-source. This function is a shim provided for compatibility with the
     * stock famo.us ScrollView.
     *
     * @param {Array|ViewSequence} node Either an array of renderables or a Famous viewSequence.
     * @return {ScrollView} this
     */
    ScrollView.prototype.sequenceFrom = function(node) {
        return this.setDataSource(node);
    };

    module.exports = ScrollView;
});
