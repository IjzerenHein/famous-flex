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
 * LayoutDockHelper helps positioning nodes using docking principles.
 *
 * **Example:**
 *
 * ```javascript
 * var LayoutDockHelper = require('famous-flex/helpers/LayoutDockHelper');
 *
 * function HeaderFooterLayout(size, context, options) {
 *   var dock = new LayoutDockHelper(size, context);
 *   dock.top('header', options.headerHeight);
 *   dock.bottom('footer', options.footerHeight);
 *   dock.fill('content');
 * };
 * ```
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var LayoutUtility = require('famous-flex/LayoutUtility');

    /**
     * @class
     * @param {Size} size Size within which to layout
     * @param {LayoutContext} context layout-context
     * @param {Object} [options] additional options
     * @param {Object} [options.margins] margins to start out with (default: 0px)
     * @param {Number} [options.translateZ] z-index to use when translating objects (default: 0)
     * @alias module:LayoutDockHelper
     */
    function LayoutDockHelper(size, context, options) {
        this._size = size;
        this._context = context;
        this._options = options;
        this._z = (options && options.translateZ) ? options.translateZ : 0;
        if (options && options.margins) {
            var margins = LayoutUtility.normalizeMargins(options.margins);
            this._left = margins[3];
            this._top = margins[0];
            this._right = size[0] - margins[1];
            this._bottom = size[1] - margins[2];
        }
        else {
            this._left = 0;
            this._top = 0;
            this._right = size[0];
            this._bottom = size[1];
        }
    }

    /**
     * Dock the node to the top.
     *
     * @param {LayoutNode|String} node layout-node to dock
     * @param {Number} [height] height of the layout-node, when ommited the height of the node is used
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.top = function(node, height) {
        if (height instanceof Array) {
            height = height[1];
        }
        if (height === undefined) {
            var size = this._context.resolveSize(node, [this._right - this._left, this._bottom - this._top]);
            height = size[1];
        }
        this._context.set(node, {
            size: [this._right - this._left, height],
            origin: [0, 0],
            translate: [this._left, this._top, this._z]
        });
        this._top += height;
        return this;
    };

    /**
     * Dock the node to the left
     *
     * @param {LayoutNode|String} node layout-node to dock
     * @param {Number} [width] width of the layout-node, when ommited the width of the node is used
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.left = function(node, width) {
        if (width instanceof Array) {
            width = width[0];
        }
        if (width === undefined) {
            var size = this._context.resolveSize(node, [this._right - this._left, this._bottom - this._top]);
            width = size[0];
        }
        this._context.set(node, {
            size: [width, this._bottom - this._top],
            origin: [0, 0],
            translate: [this._left, this._top, this._z]
        });
        this._left += width;
        return this;
    };

    /**
     * Dock the node to the bottom
     *
     * @param {LayoutNode|String} node layout-node to dock
     * @param {Number} [height] height of the layout-node, when ommited the height of the node is used
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.bottom = function(node, height) {
        if (height instanceof Array) {
            height = height[1];
        }
        if (height === undefined) {
            var size = this._context.resolveSize(node, [this._right - this._left, this._bottom - this._top]);
            height = size[1];
        }
        this._context.set(node, {
            size: [this._right - this._left, height],
            origin: [0, 1],
            translate: [this._left, -(this._size[1] - this._bottom), this._z]
        });
        this._bottom -= height;
        return this;
    };

    /**
     * Dock the node to the right.
     *
     * @param {LayoutNode|String} node layout-node to dock
     * @param {Number} [width] width of the layout-node, when ommited the width of the node is used
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.right = function(node, width) {
        if (width instanceof Array) {
            width = width[0];
        }
        if (node) {
            if (width === undefined) {
                var size = this._context.resolveSize(node, [this._right - this._left, this._bottom - this._top]);
                width = size[0];
            }
            this._context.set(node, {
                size: [width, this._bottom - this._top],
                origin: [1, 0],
                translate: [-(this._size[0] - this._right), this._top, this._z]
            });
        }
        if (width) {
            this._right -= width;
        }
        return this;
    };

    /**
     * Fills the node to the remaining content.
     *
     * @param {LayoutNode|String} node layout-node to dock
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.fill = function(node) {
        this._context.set(node, {
            size: [this._right - this._left, this._bottom - this._top],
            translate: [this._left, this._top, this._z]
        });
        return this;
    };

    module.exports = LayoutDockHelper;
});
