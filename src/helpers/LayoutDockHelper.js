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
 * LayoutDockHelper helps position nodes using docking principles.
 *
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var Transform = require('famous/core/Transform');

    /**
     * @class
     * @param {LayoutContext} context layout-context
     * @alias module:LayoutDockHelper
     */
    function LayoutDockHelper(context) {
        this._context = context;
        this._left = 0;
        this._top = 0;
        this._right = context.size[0];
        this._bottom = context.size[1];
    }

    /**
     * Dock the node to the top
     *
     * @param {LayoutNode} node layout-node to dock
     * @param {Number} height height of the layout-node
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.top = function(node, height) {
        node.setSize([this._right - this._left, height]);
        node.setOrigin([0, 0]).setAlign([0, 0]);
        node.setTransform(Transform.translate(this._left, this._top, 0));
        this._top += height;
        return this;
    };

    /**
     * Dock the node to the left
     *
     * @param {LayoutNode} node layout-node to dock
     * @param {Number} width width of the layout-node
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.left = function(node, width) {
        node.setSize([width, this._bottom - this._top]);
        node.setOrigin([0, 0]).setAlign([0, 0]);
        node.setTransform(Transform.translate(this._left, this._top, 0));
        this._left += width;
        return this;
    };

    /**
     * Dock the node to the bottom
     *
     * @param {LayoutNode} node layout-node to dock
     * @param {Number} height height of the layout-node
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.bottom = function(node, height) {
        node.setSize([this._right - this._left, height]);
        node.setOrigin([0, 1]).setAlign([0, 1]);
        node.setTransform(Transform.translate(this._left, -(this._context.size[1] - this._bottom), 0));
        this._bottom -= height;
        return this;
    };

    /**
     * Dock the node to the right
     *
     * @param {LayoutNode} node layout-node to dock
     * @param {Number} width width of the layout-node
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.right = function(node, width) {
        node.setSize([width, this._bottom - this._top]);
        node.setOrigin([1, 0]).setAlign([1, 0]);
        node.setTransform(Transform.translate(-(this._context.size[0] - this._right), this._top, 0));
        this._right -= width;
        return this;
    };

    /**
     * Fills the node to the content
     *
     * @param {LayoutNode} node layout-node to fill
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.fill = function(node) {
        node.setSize([this._right - this._left, this._bottom - this._top]);
        node.setOrigin([0, 0]).setAlign([0, 0]);
        node.setTransform(Transform.translate(this._left, this._top, 0));
        return this;
    };

    module.exports = LayoutDockHelper;
});
