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
 * LayoutNode is the interface for setting the size and transform in a layout-
 * function.
 *
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var Transform = require('famous/core/Transform');
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
