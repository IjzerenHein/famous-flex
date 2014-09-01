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
 * Lays a collection of renderables from left to right, and when the right edge is reached,
 * continues at the left of the next line.
 *
 * |options|type|description|
 * |---|---|---|
 * |`itemSize`|Size|Size of an item to layout|
 * |`[direction]`|Number|Direction into which to layout: 0 = X, 1 = Y (default)|
 * |`[gutter]`|Size|Gutter-space between renderables|
 * |`[justify]`|Bool|Justifies the renderables accross the width & height|
 * |`[justifyHorizontal]`|Bool|Justifies the renderables accross the width|
 * |`[justifyVertical]`|Bool|Justifies the renderables accross the height|
 *
 * Example:
 *
 * ```javascript
 * var CollectionLayout = require('famous-flex/layouts/CollectionLayout');
 *
 * new LayoutController({
 *   layout: CollectionLayout,
 *   layoutOptions: {
 *     itemSize: [100, 100],  // item has width and height of 100 pixels
 *     gutter: [5, 5],        // gutter of 5 pixels in between cells
 *     justify: true          // justify the items neatly across the whole width and height
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

    module.exports = function CollectionLayout(size, context, options) {

        // Prepare
        var gutter = options.gutter || [0, 0];
        var left = gutter[0];
        var top = gutter[1];
        var nodeSize = options.itemSize;
        var nodeWidth = (options.justify || options.horizontalJustify)
            ? ((size[0] - gutter[0]) / Math.floor((size[0] - gutter[0]) / (nodeSize[0] + gutter[0])))
            : (nodeSize[0] + gutter[0]);
        var nodeHeight = (options.justify || options.verticalJustify)
            ? ((size[1] - gutter[1]) / Math.floor((size[1] - gutter[1]) / (nodeSize[1] + gutter[1])))
            : (nodeSize[1] + gutter[1]);

        // Layout renderables
        var node = context.next();
        while (node) {

            // Layout current node
            context.set(node, {
                size: nodeSize,
                translate: [
                    left + ((nodeWidth - gutter[0]) - nodeSize[0]) / 2,
                    top + ((nodeHeight - gutter[1]) - nodeSize[1]) / 2,
                    0
                ]
            });

            // Calculate next node
            if ((options.direction === undefined) || (options.direction === Utility.Direction.Y)) {
                left += nodeWidth;
                if ((left + nodeSize[0]) > size[0]) {
                    left = gutter[0];
                    top += nodeHeight;
                }
                if (top >= size[1]) {
                    return;
                }
            }
            else {
                top += nodeHeight;
                if ((top + nodeSize[1]) > size[1]) {
                    top = gutter[1];
                    left += nodeWidth;
                }
                if (left >= size[0]) {
                    return;
                }
            }
            node = context.next();
        }
    };
});
