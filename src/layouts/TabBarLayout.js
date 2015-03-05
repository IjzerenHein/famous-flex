/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/**
 * Tab-bar layout supporting both horizontal (default) and vertical orientation.
 *
 * |options|type|description|
 * |---|---|---|
 * |`[margins]`|Number/Array|Margins shorthand (e.g. 5, [10, 20], [2, 5, 2, 10])|
 * |`[spacing]`|Number|Space in between items|
 * |`[zIncrement]`|Number|Z-translation increment used to stack the elements correctly (default: 0.001)|
 * |`[itemSize]`|Number/Bool|Width or height of the item (see below)|
 *
 * `itemSize` can have of the following values:
 *
 * |itemSize|description|
 * |---|---|---|
 * |`undefined`|When itemSize is undefined or omitted, all items are spread out equally over the full size.|
 * |`Number`|Size of the item.|
 * |`true`|Use the size of the renderable (calls `getSize` on the item).|
 *
 * Example:
 *
 * ```javascript
 * var TabBarLayout = require('famous-flex/layouts/TabBarLayout');
 *
 * var layout = new LayoutController({
 *   layout: TabBarLayout,
 *   layoutOptions: {
 *     itemSize: undefined,   // undefined = fill equally to full width
 *     margins: [5, 1, 5, 1], // margins to utilize
 *     spacing: 10            // space in between items
 *   },
 *   dataSource: {
 *     background: new Surface({properties: {backgroundColor: 'black'}}),
 *     items: [
 *       new Surface({ content: 'one' }),
 *       new Surface({ content: 'two' }),
 *       new Surface({ content: 'three' })
 *     ],
 *     spacers: [ // spacers in between the items
 *       new Surface({properties: {backgroundColor: 'gray'}}),
 *       new Surface({properties: {backgroundColor: 'gray'}})
 *     ],
 *     selectedItemOverlay: {
 *       new Surface({ properties: {borderBottom: '4px solid blue'}})
 *     }
 *   }
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
        direction: [Utility.Direction.X, Utility.Direction.Y],
        trueSize: true
    };

    // global data
    var size;
    var direction;
    var revDirection;
    var items;
    var spacers;
    var margins;
    var spacing;
    var sizeLeft;
    var set = {
        size: [0, 0],
        translate: [0, 0, 0],
        align: [0, 0],
        origin: [0, 0]
    };
    var nodeSize;
    var offset;
    var zIncrement;

    // Layout function
    function TabBarLayout(context, options) {

        // Prepare data
        size = context.size;
        direction = context.direction;
        revDirection = direction ? 0 : 1;
        spacing = options.spacing || 0;
        items = context.get('items');
        spacers = context.get('spacers');
        margins = LayoutUtility.normalizeMargins(options.margins);
        zIncrement = options.zIncrement || 0.001;
        set.size[0] = context.size[0];
        set.size[1] = context.size[1];
        set.size[revDirection] -= (margins[1 - revDirection] + margins[3 - revDirection]);
        set.translate[0] = 0;
        set.translate[1] = 0;
        set.translate[2] = zIncrement;
        set.translate[revDirection] = margins[direction ? 3 : 0];
        set.align[0] = 0;
        set.align[1] = 0;
        set.origin[0] = 0;
        set.origin[1] = 0;

        // When no item-size specified, spread all items
        // out equally over the full width/height, taking into
        // account margins & spacing
        offset = direction ? margins[0] : margins[3];
        sizeLeft = size[direction] - (offset + (direction ? margins[2] : margins[1]));
        sizeLeft -= ((items.length - 1) * spacing);
        for (var i = 0; i < items.length; i++) {

            // Calculate item size
            if (options.itemSize === undefined) {
                nodeSize = Math.round(sizeLeft / (items.length - i));
            }
            else {
                nodeSize = (options.itemSize === true) ? context.resolveSize(items[i], size)[direction] : options.itemSize;
            }

            // Calculate length used
            set.scrollLength = nodeSize;
            if (i === 0) {
                set.scrollLength += direction ? margins[0] : margins[3];
            }
            if (i === (items.length - 1)) {
                set.scrollLength += direction ? margins[2] : margins[1];
            }
            else {
                set.scrollLength += spacing;
            }

            // Position item
            set.size[direction] = nodeSize;
            set.translate[direction] = offset;
            context.set(items[i], set);
            offset += nodeSize;
            sizeLeft -= nodeSize;

            // Place selected item overlay
            if (i === options.selectedItemIndex) {
                set.scrollLength = 0;
                set.translate[direction] += (nodeSize / 2);
                set.translate[2] = zIncrement * 2;
                set.origin[direction] = 0.5;
                context.set('selectedItemOverlay', set);
                set.origin[direction] = 0;
                set.translate[2] = zIncrement;
            }

            // Position spacer (optional)
            if (i < (items.length - 1)) {
                if (spacers && (i < spacers.length)) {
                    set.size[direction] = spacing;
                    set.translate[direction] = offset;
                    context.set(spacers[i], set);
                }
                offset += spacing;
            }
            else {
                offset += direction ? margins[2] : margins[1];
            }
        }

        // Set background
        set.scrollLength = 0;
        set.size[0] = size[0];
        set.size[1] = size[1];
        set.size[direction] = size[direction];
        set.translate[0] = 0;
        set.translate[1] = 0;
        set.translate[2] = 0;
        set.translate[direction] = 0;
        context.set('background', set);
    }

    TabBarLayout.Capabilities = capabilities;
    TabBarLayout.Name = 'TabBarLayout';
    TabBarLayout.Description = 'TabBar widget layout';
    module.exports = TabBarLayout;
});
