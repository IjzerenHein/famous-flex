/**
 * Copyright (c) 2014 Gloey Apps
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
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
