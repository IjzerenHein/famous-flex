/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014
 */

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

    // Layout function
    module.exports = function CubeLayout(context, options) {

        var itemSize = options.itemSize;

        // right
        context.set(context.next(), {
            size: itemSize,
            origin: [0.5, 0.5],
            rotate: [0, Math.PI/2, 0],
            translate: [itemSize[0] / 2, 0, 0]
        });

        // left
        context.set(context.next(), {
            size: itemSize,
            origin: [0.5, 0.5],
            rotate: [0, Math.PI/2, 0],
            translate: [-(itemSize[0] / 2), 0, 0]
        });

        // top
        context.set(context.next(), {
            size: itemSize,
            origin: [0.5, 0.5],
            rotate: [Math.PI/2, 0, 0],
            translate: [0, -(itemSize[1] / 2), 0]
        });

        // bottom
        context.set(context.next(), {
            size: itemSize,
            origin: [0.5, 0.5],
            rotate: [Math.PI/2, 0, 0],
            translate: [0, itemSize[1] / 2, 0]
        });

    };
});
