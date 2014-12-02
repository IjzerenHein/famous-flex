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
/*eslint no-console: 0*/

/**
 * Lays-out renderables from left to right, in a grid with fixed number of
 * columns and rows.
 *
 * |options|type|description|
 * |---|---|---|
 * |`cells`|Size|Number of cells: [columns, rows]|
 * |`[margins]`|Number/Array|Margins shorthand (e.g. 5, [10, 20], [2, 5, 2, 10])|
 * |`[spacing]`|Size|Spacing between renderables. (e.g. [10, 10]|
 *
 * Example:
 *
 * ```javascript
 * var GridLayout = require('famous-flex/layouts/GridLayout');
 *
 * var layoutController = new LayoutController({
 *   layout: GridLayout,
 *   layoutOptions: {
 *     cells: [10, 5],            // 10 columns, 5 rows
 *     margins: [20, 20, 20, 20], // margins on the outside
 *     spacing: [10, 10]          // spacing between cells
 *   },
 *   dataSource: [
 *     new Surface({content: 'item 1'}),
 *     new Surface({content: 'item 2'}),
 *     new Surface({content: 'item 3'})
 *   ]
 * });
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
        if ((options.gutter !== undefined) && console.warn) {
            console.warn('gutter has been deprecated for GridLayout, use margins & spacing instead');
        }
        var spacing;
        if (options.gutter && !options.spacing) {
            spacing = options.gutter || 0;
        }
        else {
            spacing = options.spacing || 0;
        }
        spacing = Array.isArray(spacing) ? spacing : [spacing, spacing];
        var margins = LayoutUtility.normalizeMargins(options.margins);
        var nodeSize = [
            (size[0] - (((options.cells[0] - 1) * spacing[0]) + margins[1] + margins[3])) / options.cells[0],
            (size[1] - (((options.cells[1] - 1) * spacing[1]) + margins[0] + margins[2])) / options.cells[1]
        ];

        // Define size and position of grid-item
        function _layoutNode(node, col, row) {
            context.set(node, {
                size: nodeSize,
                translate: [
                    ((nodeSize[0] + spacing[0]) * col) + margins[3],
                    ((nodeSize[1] + spacing[1]) * row) + margins[0],
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
