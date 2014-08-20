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
 * LayoutNode is the interface for setting the size and transform in a layout-
 * function.
 *
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var LayoutUtility = require('./LayoutUtility');

    /**
     * @class
     * @param {Object} options Options.
     * @alias module:LayoutNode
     */
    function LayoutNode(options) {
        this._start = {};
        this._final = {};
        this._current = {};
    }

    /**
     * Set the size of the node.
     *
     * @param {Array.Number} size
     * @return {LayoutNode} this
     */
    LayoutNode.prototype.setSize = function(size) {
        this._final.size = size;
        this._cleanup = false;
        return this;
    };

    /**
     * Set the transform of the node.
     *
     * @param {Matrix} transform
     * @return {LayoutNode} this
     */
    LayoutNode.prototype.setTransform = function(transform) {
        this._final.transform = transform;
        this._cleanup = false;
        return this;
    };

    /**
     * Resolves the size of render-node the into a fixed size.  E.g., if the
     * render-node has a configured size (e.g. [50, undefined]), then the retured
     * size would have a width of 50, and would try to resolve `undefined` using
     * the `defaultSize` and `parentSize`. The size is resolved in the following order:
     * - width/height returned by `getSize` of the render-node
     * - width/height as specified in `defaultSize`
     * - width/height as specified in `parentSize`
     *
     * @param {Array.Number} parentSize parent-size
     * @param {Array.Number} [defaultSize] default-size to use
     * @return {Array.Number} resolved size
     */
    LayoutNode.prototype.resolveSize = function(parentSize, defaultSize) {
        return LayoutUtility.resolveSize(this.renderNode.getSize(), parentSize, defaultSize);
    };

    /**
     *  Get the json that can be stringified for this object.
     *
     *  @return {Object} clean object
     */
    LayoutNode.prototype.toJSON = function() {
        return {
            start: LayoutUtility.cloneSpec(this._start),
            current: LayoutUtility.cloneSpec(this._current),
            final: LayoutUtility.cloneSpec(this._final)
        };
    };

    module.exports = LayoutNode;
});
