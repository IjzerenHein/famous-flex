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
 * function HeaderFooterLayout(context, options) {
 *   var dock = new LayoutDockHelper(context);
 *   dock.top('header', options.headerHeight);
 *   dock.bottom('footer', options.footerHeight);
 *   dock.fill('content');
 * };
 * ```
 *
 * You can also use layout-literals to create layouts using docking semantics:
 *
 * ```javascript
 * var layoutController = new LayoutController({
 *   layout: {dock: [
 *     ['top', 'header', 40],
 *     ['bottom', 'footer', 40],
 *     ['fill', 'content']
 *   ]},
 *   dataSource: {
 *     header: new Surface({content: 'header'}),
 *     footer: new Surface({content: 'footer'}),
 *     content: new Surface({content: 'content'}),
 *   }
 * });
 * ```
 *
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var LayoutUtility = require('famous-flex/LayoutUtility');

    /**
     * @class
     * @param {LayoutContext} context layout-context
     * @param {Object} [options] additional options
     * @param {Object} [options.margins] margins to start out with (default: 0px)
     * @param {Number} [options.translateZ] z-index to use when translating objects (default: 0)
     * @alias module:LayoutDockHelper
     */
    function LayoutDockHelper(context, options) {
        var size = context.size;
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
     * Parses the layout-rules based on a JSON data object.
     * The object should be an array with the following syntax:
     * `[[rule, node, value], [rule, node, value], ...]`
     *
     * **Example:**
     *
     * ```JSON
     * [
     *   ['top': 'header', 50],
     *   ['bottom': 'footer', 50],
     *   ['fill', 'content']
     * ]
     * ```
     *
     * @param {Object} data JSON object
     */
    LayoutDockHelper.prototype.parse = function(data) {
        for (var i = 0; i < data.length; i++) {
            var rule = data[i];
            var value = (data.length >= 3) ? rule[2] : undefined;
            if (rule[0] === 'top') {
                this.top(rule[1], value);
            } else if (rule[0] === 'left') {
                this.left(rule[1], value);
            } else if (rule[0] === 'right') {
                this.right(rule[1], value);
            } else if (rule[0] === 'bottom') {
                this.bottom(rule[1], value);
            } else if (rule[0] === 'fill') {
                this.fill(rule[1]);
            }
        }
    };

    /**
     * Dock the node to the top.
     *
     * @param {LayoutNode|String} [node] layout-node to dock
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
     * @param {LayoutNode|String} [node] layout-node to dock
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
     * @param {LayoutNode|String} [node] layout-node to dock
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
     * @param {LayoutNode|String} [node] layout-node to dock
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

    // Register the helper
    LayoutUtility.registerHelper('dock', LayoutDockHelper);

    module.exports = LayoutDockHelper;
});
