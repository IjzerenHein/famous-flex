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
 * |`zOffset`|Size|Z-space offset for all the renderables except the current 'selected' renderable|
 * |`itemAngle`|Angle|Angle of the renderables, in radians|
 * Example:
 *
 * ```javascript
 * var CoverLayout = require('famous-flex/layouts/CoverLayout');
 *
 * new LayoutController({
 *   layout: CoverLayout,
 *   layoutOptions: {
 *        itemSize: 400,
 *        zOffset: 400,      // z-space offset for all the renderables except the current 'selected' renderable
 *        diameter: 2500,
 *        radialOpacity: 1,  // make items at the edges more transparent
 *        itemAngle: 0.78    // Angle of the renderables, in radians
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
        direction: [Utility.Direction.Y, Utility.Direction.X],
        scrolling: true,
        trueSize: true,
        sequentialScrollingOptimized: false
    };

    // Data
    var size;
    var direction;
    var revDirection;
    var node;
    var itemSize;
    var diameter;
    var offset;
    var bound;
    var angle;
    var radius;
    var itemAngle;
    var radialOpacity;
    var zOffset;
    var set = {
        opacity: 1,
        size: [0, 0],
        translate: [0, 0, 0],
        rotate: [0, 0, 0],
        origin: [0.5, 0.5],
        align: [0.5, 0.5],
        scrollLength: undefined
    };

    /**
     * CoverLayout
     */
    function CoverLayout(context, options) {

        //
        // Prepare
        //
        size = context.size;
        zOffset = options.zOffset;
        itemAngle = options.itemAngle;
        direction = context.direction;
        revDirection = direction ? 0 : 1;
        itemSize = options.itemSize || (size[direction] / 2);
        diameter = options.diameter || (itemSize * 3);
        radius = diameter / 2;
        radialOpacity = (options.radialOpacity === undefined) ? 1 : options.radialOpacity;

        //
        // reset size & translation
        //
        set.opacity = 1;
        set.size[0] = size[0];
        set.size[1] = size[1];
        set.size[revDirection] = itemSize
        set.size[direction] = itemSize;
        set.translate[0] = 0;
        set.translate[1] = 0;
        set.translate[2] = 0;
        set.rotate[0] = 0;
        set.rotate[1] = 0;
        set.rotate[2] = 0;
        set.scrollLength = itemSize;

        //
        // process next nodes
        //
        offset = context.scrollOffset;
        bound = (((Math.PI / 2) / itemAngle) * itemSize) + itemSize;
        while (offset <= bound) {
            node = context.next();
            if (!node) {
                break;
            }
            if (offset >= -bound) {
                set.translate[direction] = offset;
                set.translate[2] = Math.abs(offset) > itemSize ? - zOffset : -(Math.abs(offset) * (zOffset/itemSize));
                if(offset < 0){
                    set.rotate[1] = Math.abs(offset) > itemSize ?  itemAngle : (Math.abs(offset) * (itemAngle / itemSize));
                } else {
                    set.rotate[1] = Math.abs(offset) > itemSize ?  -itemAngle : -(Math.abs(offset) * (itemAngle / itemSize));
                }
                set.opacity = 1 - ((Math.abs(angle) / (Math.PI / 2)) * (1 - radialOpacity));
                context.set(node, set);
            }
            offset += itemSize;
        }

        //
        // process previous nodes
        //
        offset = context.scrollOffset - itemSize;
        while (offset >= -bound) {
            node = context.prev();
            if (!node) {
                break;
            }
            if (offset <= bound) {
                set.translate[direction] = offset;
                set.translate[2] = Math.abs(offset) > itemSize ? - zOffset : -(Math.abs(offset) * (zOffset/itemSize));
                if(offset < 0){
                    set.rotate[1] = Math.abs(offset) > itemSize ?  itemAngle : (Math.abs(offset) * (itemAngle / itemSize));
                } else {
                    set.rotate[1] = Math.abs(offset) > itemSize ?  -itemAngle : -(Math.abs(offset) * (itemAngle / itemSize));
                }
                set.opacity = 1 - ((Math.abs(angle) / (Math.PI / 2)) * (1 - radialOpacity));
                context.set(node, set);
            }
            offset -= itemSize;
        }
    }

    CoverLayout.Capabilities = capabilities;
    CoverLayout.Name = 'CoverLayout';
    CoverLayout.Description = 'CoverLayout';
    module.exports = CoverLayout;
});
