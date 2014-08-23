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
    var LayoutUtility = require('famous-flex/LayoutUtility');

    /**
     * @class
     * @param {LayoutContext} context layout-context
     * @alias module:LayoutDockHelper
     */
    function LayoutDockHelper(context, margins) {
        this._context = context;
        if (margins) {
            margins = LayoutUtility.normalizeMargins(margins);
            this._left = margins[3];
            this._top = margins[0];
            this._right = context.size[0] - margins[1];
            this._bottom = context.size[1] - margins[2];
        }
        else {
            this._left = 0;
            this._top = 0;
            this._right = context.size[0];
            this._bottom = context.size[1];
        }
    }

    /**
     * Dock the node to the top
     *
     * @param {LayoutNode} node layout-node to dock
     * @param {Number} height height of the layout-node
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.top = function(node, height) {
        if (height instanceof Array) {
            height = height[1];
        }
        this._context.setSize(node, [this._right - this._left, height]);
        this._context.setOrigin(node, [0, 0]);
        this._context.setTranslate(node, this._left, this._top, 0);
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
        if (width instanceof Array) {
            width = width[0];
        }
        this._context.setSize(node, [width, this._bottom - this._top]);
        this._context.setOrigin(node, [0, 0]);
        this._context.setTranslate(node, this._left, this._top, 0);
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
        if (height instanceof Array) {
            height = height[1];
        }
        this._context.setSize(node, [this._right - this._left, height]);
        this._context.setOrigin(node, [0, 1]);
        this._context.setTranslate(node, this._left, -(this._context.size[1] - this._bottom), 0);
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
        if (width instanceof Array) {
            width = width[0];
        }
        this._context.setSize(node, [width, this._bottom - this._top]);
        this._context.setOrigin(node, [1, 0]);
        this._context.setTranslate(node, -(this._context.size[0] - this._right), this._top, 0);
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
        this._context.setSize(node, [this._right - this._left, this._bottom - this._top]);
        this._context.setTranslate(node, this._left, this._top, 0);
        return this;
    };

    module.exports = LayoutDockHelper;
});
