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
 * Lays out a collection of renderables from top to bottom or left to right.
 *
 * |options|type|description|
 * |---|---|---|
 * |`[itemSize]`|Number|Height or width in pixels of the list-item|
 *
 * Example:
 *
 * ```javascript
 * var ListLayout = require('famous-flex/layouts/ListLayout');
 *
 * new LayoutController({
 *   layout: ListLayout,
 *   layoutOptions: {
 *     itemSize: 40,         // item has height of 40 pixels
 *   },
 *   dataSource: [
 *     new Surface({content: 'item 1'}),
 *     new Surface({content: 'item 2'}),
 *     new Surface({content: 'item 3'})
 *   ]
 * })
 * ```
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var Utility = require('famous/utilities/Utility');

    // Layout function
    module.exports = function ListLayout(context, options) {

        // Prepare
        var size = context.size;
        var reverse = context.reverse;
        var node = context.next();
        var itemSize;
        var nodeSize;

        // Layout from top to bottom
        if ((context.direction === undefined) || (context.direction === Utility.Direction.Y)) {
            itemSize = options.itemSize ? [size[0], options.itemSize] : undefined;
            var height = 0;
            while (node) {
                nodeSize = itemSize || [size[0], context.resolveSize(node, size)[1]];
                context.set(node, {
                    size: nodeSize,
                    translate: [0, reverse ? (size[1] - (height + nodeSize[1])) : height, 0]
                });
                height += nodeSize[1];
                if (height > size[1]) {
                    return;
                }
                node = context.next();
            }
        }

        // Layout from left to right
        else {
            itemSize = options.itemSize ? [options.itemSize, size[1]] : undefined;
            var width = 0;
            while (node) {
                nodeSize = itemSize || [context.resolveSize(node, size)[0], size[1]];
                context.set(node, {
                    size: nodeSize,
                    translate: [reverse ? (size[0] - (width + nodeSize[0])) : width, 0, 0]
                });
                width += nodeSize[0];
                if (width > size[0]) {
                    return;
                }
                node = context.next();
            }
        }
    };
});
