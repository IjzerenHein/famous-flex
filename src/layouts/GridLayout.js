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
 * |`[margins]`|Array|Margins applied to the outside (e.g. [10, 20, 10, 20])|
 * |`[innerGutter]`|Size|Gutter-space between renderables. (e.g. [10, 10]|
 * |`[gutter]`|Size|Gutter-space between renderables (combines insideGutter and margins)|
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
 *     gutter: [20, 20]   // gutter of 20 pixels in between cells
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
    var LayoutUtility = require('../LayoutUtility');

    // Define capabilities of this layout function
    var capabilities = {
        sequence: true,
        direction: [Utility.Direction.Y, Utility.Direction.X],
        scrolling: false
    };

    // Layout function
    function GridLayout(context, options) {

        // Do one-time stuff
        var size = context.size;
        var innerGutter = options.innerGutter || options.gutter || [0, 0];
        var margins;
        if (options.margins) {
            margins = LayoutUtility.normalizeMargins(options.margins);
        } else if (options.gutter) {
            margins = [options.gutter[1], options.gutter[0], options.gutter[1], options.gutter[0]];
        }
        else {
            margins = [0, 0, 0, 0];
        }
        var nodeSize = [
            (size[0] - (((options.cells[0] - 1) * innerGutter[0]) + margins[1] + margins[3])) / options.cells[0],
            (size[1] - (((options.cells[1] - 1) * innerGutter[1]) + margins[0] + margins[2])) / options.cells[1]
        ];

        // Define size and position of grid-item
        function _layoutNode(node, col, row) {
            context.set(node, {
                size: nodeSize,
                translate: [
                    ((nodeSize[0] + innerGutter[0]) * col) + margins[3],
                    ((nodeSize[1] + innerGutter[1]) * row) + margins[0],
                    0
                ]
            });
        }

        // Create rows & columns
        var row;
        var col;
        var node;
        if (context.direction === Utility.Direction.Y) {
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
    }

    GridLayout.Capabilities = capabilities;
    module.exports = GridLayout;
});
