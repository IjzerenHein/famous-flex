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

/**
 * LayoutContext is the interface for a layout-function to enumerate the
 * `LayoutNode`'s' and to get the size of the parent.
 * @module
 */
define(function(require, exports, module) {

    /**
     * @class
     * @param {Object} options Options.
     * @alias module:LayoutContext
     */
    function LayoutContext() {
        // properties:
        // size
    }

    /**
     * Get the layout node for the next renderable in the data-source.
     *
     * @return {LayoutNode} layout-node or undefined
     */
    LayoutContext.prototype.nextNode = function() {
        // this function is overriden by LayoutController
        // which provides the implementation.
    };

    /**
     * Get the layout-node for a renderable with a specific id. The renderable
     * can be an array, in that case an array of elements is returned.
     * To access the `LayoutNode`s for those array-elements, use
     * `nodeByArrayElement` on each of the elements.
     *
     * @param {String} nodeId id of the renderable
     * @return {LayoutNode|Array} layout-node or undefined
     */
    LayoutContext.prototype.nodeById = function(nodeId) {
        // this function is overriden by LayoutController
        // which provides the implementation.
    };

    /**
     * Get the layout-node based on an array element.
     *
     * @param {Object} arrayElement array-element for which to return a `LayoutNode`
     * @return {LayoutNode} layout-node or undefined
     */
    LayoutContext.prototype.nodeByArrayElement = function(arrayElement) {
        // this function is overriden by LayoutController
        // which provides the implementation.
    };

    module.exports = LayoutContext;
});
