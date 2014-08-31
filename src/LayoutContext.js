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
 * LayoutContext is the interface for a layout-function to access
 * renderables in the data-source and set their size, position, tranformation, etc...
 * The renderables are not accessed directly but through opaque layout-nodes.
 *
 * @module
 */
define(function(require, exports, module) {

    /**
     * @class
     * @alias module:LayoutContext
     */
    function LayoutContext(methods) {
        for (var n in methods) {
            this[n] = methods[n];
        }
    }

    /**
     * Get the layout-node for the next renderable in the data-source. When
     * the end of the data-source is reached, `undefined` is returned.
     * Use this function to enumerate the contents of a data-source that is
     * either an Array or a ViewSequence.
     *
     * @return {Object} layout-node or undefined
     */
    LayoutContext.prototype.next = function() {
        // dummy implementation, override in constructor
    };

    /**
     * Get the layout-node for a renderable with a specific id. This function
     * should be used to access data-sources which are key-value collections.
     * When a data-source is an Array or a ViewSequence, use `next`.
     *
     * If the value of the datasource is an array, then that array is returned
     * as is. To get the layout-node which corresponds to the array-element use
     * `byArrayElement`.
     *
     * ```javascript
     * var layoutController = new LayoutController({
     *   layout: function (size, nodes) {
     *     var left = 0;
     *
     *     // Position title
     *     var title = nodes.byId('title');
     *     nodes.set(title, {
     *       size: [100, size[1]],
     *       translate: [left, 0, 0]
     *     });
     *     left += 100;
     *
     *     // Position right-items (array)
     *     var leftItems = nodes.byId('leftItems');
     *     for (var i = 0; i < leftItems.length; i++) {
     *       var leftItem = nodes.byArrayElement(leftItems[i]);
     *       nodes.set(leftItem, {
     *         size: [100, size[1]],
     *         translate: [left, 0, 0]
     *       });
     *       left += 100;
     *     }
     *   },
     *   dataSource: {
     *     title: new Surface({content: 'title'}),
     *     rightItems: [
     *       new Surface({content: 'item1'}),
     *       new Surface({content: 'item2'})
     *     ]
     *   }
     * });
     * ```
     *
     * @param {String} nodeId id of the renderable
     * @return {Object} layout-node or undefined
     */
    LayoutContext.prototype.byId = function(nodeId) {
        // dummy implementation, override in constructor
    };

    /**
     * Get the layout-node based on an array element.
     *
     * See `byId` for an example.
     *
     * @param {Object} arrayElement opaque array-element
     * @return {Object} layout-node
     */
    LayoutContext.prototype.byArrayElement = function(arrayElement) {
        // dummy implementation, override in constructor
    };

    /**
     * Get the layout-node based on an array element.
     *
     * See `byId` for an example.
     *
     * @param {Object} arrayElement opaque array-element
     * @return {Object} layout-node
     */
    LayoutContext.prototype.getSizeInfo = function(node) {
        // dummy implementation, override in constructor
    };

    /**
     * Set the size, origin, align, translation, scale, rotate & skew for a layout-node.
     * All properties with exception for `size` are optional.
     *
     * ```javascript
     * function MyLayoutFunction(size, nodes, options) {
     *   nodes.set('mynode', {
     *     size: [100, 20],
     *     origin: [0.5, 0.5],
     *     align: [0.5, 0.5],
     *     translate: [50, 10, 0],
     *     scale: [1, 1, 1],
     *     skew: [0, 0, 0],
     *     rotate: [Math.PI, 0, 0],
     *   })
     * }
     * ```
     *
     * When the data-source is a key-value collection, the id can be passed in
     * directly to this function.
     *
     * ```javascript
     * nodes.set('myname', {size: [100, 10]});
     *
     * equals
     *
     * nodes.set(nodes.byId('myname'), {size: [100, 10]});
     * ```
     *
     * @param {Object|String} node layout-node or node-id
     * @param {Object} set properties: size, origin, align, translate, scale, rotate & skew
     */
    LayoutContext.prototype.set = function(node, set) {
        // dummy implementation, override in constructor
    };

    module.exports = LayoutContext;
});
