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
 * Lays-out renderables from left to right, in a grid with fixed number of
 * columns and rows.
 *
 * |options|type|description|
 * |---|---|---|
 * |`cells`|Size|Number of cells: [columns, rows]|
 * |`[direction]`|Number|Direction into which to layout: 0 = X, 1 = Y (default)|
 * |`[gutter]`|Size|Gutter-space between renderables|
 *
 * Example:
 *
 * ```javascript
 * var GridLayout = require('famous-flex/layouts/GridLayout');
 *
 * new LayoutController({
 *   layout: GridLayout,
 *   layoutOptions: {
 *     cells: [10, 5],    // 10 columns, 5 rows
 *     gutter: [20, 20],  // gutter of 20 pixels in between cells
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
    module.exports = function GridLayout(size, context, options) {

        // Do one-time stuff
        var gutter = options.gutter || [0, 0];
        var nodeSize = [
            ((size[0] - gutter[0]) / options.cells[0]) - gutter[0],
            ((size[1] - gutter[1]) / options.cells[1]) - gutter[1]
        ];

        // Define size and position of grid-item
        function _layoutNode(node, col, row) {
            context.set(node, {
                size: nodeSize,
                translate: [
                    ((nodeSize[0] + gutter[0]) * col) + gutter[0],
                    ((nodeSize[1] + gutter[1]) * row) + gutter[1],
                    0
                ]
            });
        }

        // Create rows & columns
        var row;
        var col;
        var node;
        if (options.direction === Utility.Direction.Y) {
            for (col = 0; col < options.cells[0]; col++) {
                for (row = 0; row < options.cells[1]; row++) {
                    node = context.next();
                    if (!node) {
                        return;
                    }
                    _layoutNode(node, col, row);
                }
            }
        }
        else {
            for (row = 0; row < options.cells[1]; row++) {
                for (col = 0; col < options.cells[0]; col++) {
                    node = context.next();
                    if (!node) {
                        return;
                    }
                    _layoutNode(node, col, row);
                }
            }
        }
    };
});
