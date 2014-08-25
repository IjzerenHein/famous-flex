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
 * LayoutNodesContext is the interface for a layout-function to enumerate the
 * `LayoutNode`'s' and to get the size of the parent.
 * @module
 */
define(function(require, exports, module) {

    /**
     * @class
     * @param {Object} methods Methods to implement.
     * @alias module:LayoutNodesContext
     */
    function LayoutNodesContext(methods) {
        for (var n in methods) {
            this[n] = methods[n];
        }
    }

    /**
     * Get the layout node for the next renderable in the data-source.
     *
     * @return {LayoutNode} layout-node or undefined
     */
    LayoutNodesContext.prototype.next = function() {
        // dummy implementation, override in constructor
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
    LayoutNodesContext.prototype.byId = function(nodeId) {
        // dummy implementation, override in constructor
    };

    /**
     * Get the layout-node based on an array element.
     *
     * @param {Object} arrayElement array-element for which to return a `LayoutNode`
     * @return {LayoutNode} layout-node or undefined
     */
    LayoutNodesContext.prototype.byArrayElement = function(arrayElement) {
        // dummy implementation, override in constructor
    };

    LayoutNodesContext.prototype.set = function(node, set) {
        // dummy implementation, override in constructor
    };

    LayoutNodesContext.prototype.size = function(node, size) {
        this.set(node, {size: size});
    };

    LayoutNodesContext.prototype.align = function(node, align) {
        this.set(node, {align: align});
    };

    LayoutNodesContext.prototype.origin = function(node, origin) {
        this.set(node, {origin: origin});
    };

    LayoutNodesContext.prototype.translate = function(node, x, y, z) {
        this.set(node, {translate: [x, y, z]});
    };

    LayoutNodesContext.prototype.rotate = function(node, x, y, z) {
        this.set(node, {rotate: [x, y, z]});
    };

    LayoutNodesContext.prototype.skew = function(node, x, y, z) {
        this.set(node, {skew: [x, y, z]});
    };

    LayoutNodesContext.prototype.scale = function(node, x, y, z) {
        this.set(node, {scale: [x, y, z]});
    };

    module.exports = LayoutNodesContext;
});
