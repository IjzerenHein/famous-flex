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
 * Lays a collection of renderables from left to right, and when the right edge is reached,
 * continues at the left of the next line.
 *
 * |options|type|description|
 * |---|---|---|
 * |`itemSize`|Size|Size of an item to layout|
 * |`[gutter]`|Size|Gutter-space between renderables|
 *
 * Example:
 *
 * ```javascript
 * var CoverLayout = require('famous-flex/layouts/CoverLayout');
 *
 * new LayoutController({
 *   layout: CoverLayout,
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

    // Define capabilities of this layout function
    var capabilities = {
        sequence: true,
        direction: [Utility.Direction.X, Utility.Direction.Y],
        scrolling: true,
        sequentialScrollingOptimized: false
    };

    function CoverLayout(context, options) {

        // Get first renderable
        var node = context.next();
        if (!node) {
            return;
        }

        // Prepare
        var size = context.size;
        var direction = context.direction;
        var itemSize = options.itemSize;
        var opacityStep = 0.2;
        var scaleStep = 0.1;
        var translateStep = 30;
        var zStart = 100;

        // Layout the first renderable in the center
        context.set(node, {
            size: itemSize,
            origin: [0.5, 0.5],
            align: [0.5, 0.5],
            translate: [0, 0, zStart],
            scrollLength: itemSize[direction]
        });

        // Layout renderables
        var translate = itemSize[0] / 2;
        var opacity = 1 - opacityStep;
        var zIndex = zStart - 1;
        var scale = 1 - scaleStep;
        var prev = false;
        var endReached = false;
        node = context.next();
        if (!node) {
            node = context.prev();
            prev = true;
        }
        while (node) {

            // Layout next node
            context.set(node, {
                size: itemSize,
                origin: [0.5, 0.5],
                align: [0.5, 0.5],
                translate: direction ? [0, prev ? -translate : translate, zIndex] : [prev ? -translate : translate, 0, zIndex],
                scale: [scale, scale, 1],
                opacity: opacity,
                scrollLength: itemSize[direction]
            });
            opacity -= opacityStep;
            scale -= scaleStep;
            translate += translateStep;
            zIndex--;

            // Check if the end is reached
            if (translate >= (size[direction]/2)) {
                endReached = true;
            }
            else {
                node = prev ? context.prev() : context.next();
                endReached = !node;
            }

            // When end is reached for next, start processing prev
            if (endReached) {
                if (prev) {
                    break;
                }
                endReached = false;
                prev = true;
                node = context.prev();
                if (node) {
                    translate = (itemSize[direction] / 2);
                    opacity = 1 - opacityStep;
                    zIndex = zStart - 1;
                    scale = 1 - scaleStep;
                }
            }
        }
    }

    CoverLayout.Capabilities = capabilities;
    module.exports = CoverLayout;
});
