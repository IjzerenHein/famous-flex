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
 * Lays out renderables as a font text string.
 *
 * |options|type|description|
 * |---|---|---|
 * |`itemSize`|Size|Size (width or height) of an item to layout.|
 * |`[diameter]`|Number|Diameter of the wheel in pixels (default: `3 x itemSize`).|
 * |`[radialOpacity]`|Number|Opacity (0..1) at the diameter edges of the wheel (default: 1).|
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
 *     itemSize: 100,      // item has height of 100 pixels
 *     radialOpacity: 0.5  // make items at the edges more transparent
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
 *   properties: {
 *     overflow: 'hidden'
 *   }
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
        direction: [Utility.Direction.X, Utility.Direction.Y]
    };

    // Character-segments are layed out in clockwise order:
    // ---0---
    // 5     1
    // |--6--|
    // 4     2
    // ---3---
    //
    var charMap = {
        '0': 0x3F,
        '1': 0x06,
        '2': 0x5B,
        '3': 0x4F,
        '4': 0x66,
        '5': 0x6D,
        '6': 0x7D,
        '7': 0x07,
        '8': 0x7F,
        '9': 0x6F,
        '?': 0x53,
        '-': 0x40,
        'A': 0x77,
        'B': 0x7C,
        'C': 0x39,
        'D': 0x5E,
        'E': 0x79,
        'F': 0x71,
        'G': 0x6F,
        'H': 0x76,
        'I': 0x06,
        'J': 0x0E,
        'K': 0x7F,
        'L': 0x38,
        'M': 0xD4,
        'N': 0x54,
        'O': 0x5C,
        'P': 0x73,
        'Q': 0x67,
        'R': 0x50,
        'S': 0x6D,
        'T': 0x78,
        'U': 0x3E,
        'V': 0x3E,
        'W': 0x7F,
        'X': 0x7F,
        'Y': 0x7F,
        'Z': 0x7F
    };

    // Segments that make up a characters in clockwise order:
    // [translateX, translateY, rotation, lineOffsetX, lineOffsetY]
    var segmentMap = [
        [0, 0, 0, 1, 0],
        [1, 0, 0.25, 2, 1],
        [1, 1, 0.25, 2, 2],
        [0, 2, 0, 1, 2],
        [0, 1, 0.25, 1, 2],
        [0, 0, 0.25, 1, 1],
        [0, 1, 0, 1, 1],
        [0.5, 1, 0.25, 1.5, 2]
    ];

    // Data
    var size;
    var direction;
    var text;
    var spacing;
    var node;
    var offset;
    var set = {
        size: [0, 0],
        translate: [0, 0, 0],
        rotate: [0, 0, 0]
    };

    /**
     * Font-layout
     */
    function FontLayout(context, options) {

        // Prepare
        size = context.size;
        direction = context.direction;
        text = options.text || 'KLMNOPQRSTUVW';
        spacing = (options.spacing === undefined) ? 10 : options.spacing;
        offset = 0;
        set.size[0] = options.segmentSize ? options.segmentSize[0] : 20;
        set.size[1] = options.segmentSize ? options.segmentSize[1] : 4;

        for (var i = 0; i < text.length; i++) {
            var charSegments = charMap[text.charAt(i)] || charMap['?'];
            for (var j = 0; j < 8; j++) {
                if (charSegments & (1 << j)) {
                    node = context.next();
                    if (!node) {
                        return;
                    }
                    var segment = segmentMap[j];
                    set.translate[0] = (set.size[0] * segment[0]) + (segment[3] * set.size[1]);
                    set.translate[1] = (set.size[0] * segment[1]) + (segment[4] * set.size[1]);
                    set.translate[direction] += offset;
                    set.rotate[2] = (segment[2] * Math.PI * 2);
                    set.scrollLength = i ? 0 : (direction ? (set.size[0] * 2) : set.size[1]);
                    if ((j === 0) && (i < (text.length - 1))) {
                        set.scrollLength += spacing;
                    }
                    context.set(node, set);
                }
            }

            // Advance offset for next character
            offset += (direction ? (set.size[0] * 2) : set.size[0]) + spacing;
        }
    }

    FontLayout.Capabilities = capabilities;
    FontLayout.Name = 'FontLayout';
    FontLayout.Description = 'Font layout';
    module.exports = FontLayout;
});
