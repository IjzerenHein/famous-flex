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
 * Lays out renderables in a spinner wheel (slot-machine wheel) formation.
 *
 * |options|type|description|
 * |---|---|---|
 * |`itemSize`|Size|Size (width or height) of an item to layout.|
 * |`[diameter]`|Number|Diameter of the wheel in pixels.|
 *
 * Example:
 *
 * ```javascript
 * var ContainerSurface = require('famous/surfaces/ContainerSurface');
 * var ScrollController = require('famous-flex/ScrollController');
 * var WheelLayout = require('famous-flex/layouts/WheelLayout');
 *
 * // Create scroll-wheel
 * var scrollWheel = new ScrollController({
 *   layout: WheelLayout,
 *   layoutOptions: {
 *     itemSize: 100    // item has height of 100 pixels
 *   },
 *   dataSource: [
 *     new Surface({content: 'item 1'}),
 *     new Surface({content: 'item 2'}),
 *     new Surface({content: 'item 3'})
 *   ]
 * });
 *
 * // Create a container-surface for clipping and give it a nice perspective
 * var container = new ContainerSurface({
 *    properties: {
 *    	  overflow: 'hidden'
 *    }
 * });
 * container.context.setPerspective(1500);
 * container.add(scrollWheel);
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
        trueSize: true
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
    var set = {
        size: [0, 0],
        translate: [0, 0, 0],
        rotate: [0, 0, 0],
        origin: [0.5, 0.5],
        align: [0.5, 0.5],
        scrollLength: undefined
    };

    /**
     * Wheel-layout
     */
    function WheelLayout(context, options) {

		//
		// Prepare
		//
		size = context.size;
		direction = context.direction;
		revDirection = direction ? 0 : 1;
		itemSize = options.itemSize || (size[direction] / 2);
		diameter = options.diameter || (itemSize * 3);

		//
        // reset size & translation
        //
        set.size[0] = size[0];
        set.size[1] = size[1];
        set.size[revDirection] = size[revDirection] / 2;
        set.size[direction] = itemSize;
        set.translate[0] = 0;
        set.translate[1] = 0;
        set.translate[2] = 0;
        set.rotate[0] = 0;
        set.rotate[1] = 0;
        set.rotate[2] = 0;
        set.scrollLength = itemSize;

        //
        // Calculation preparations
        //
        radius = diameter / 2;
        itemAngle = Math.tan((itemSize / 2) / radius) * 2;

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
				angle = (offset / itemSize) * itemAngle;
				set.translate[direction] = radius * Math.sin(angle);
				set.translate[2] = (radius * Math.cos(angle)) - radius;
				set.rotate[revDirection] = direction ? -angle : angle;
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
				angle = (offset / itemSize) * itemAngle;
				set.translate[direction] = radius * Math.sin(angle);
				set.translate[2] = (radius * Math.cos(angle)) - radius;
				set.rotate[revDirection] = direction ? -angle : angle;
				context.set(node, set);
			}
			offset -= itemSize;
		}
    }

    WheelLayout.Capabilities = capabilities;
    WheelLayout.Name = 'WheelLayout';
    WheelLayout.Description = 'Spinner-wheel/slot-machine layout';
    module.exports = WheelLayout;
});
