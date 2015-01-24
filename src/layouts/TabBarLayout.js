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
 * Tab-bar layout.
 *
 * |options|type|description|
 * |---|---|---|
 * |`[margins]`|Number/Array|Margins shorthand (e.g. 5, [10, 20], [2, 5, 2, 10])|
 * |`[spacing]`|Number|Space in between items|
 * |`[itemSize]`|Number|Width or height of the item (when omitted, the size of the renderable is used)|
 *
 * Example:
 *
 * ```javascript
 * var TabBarLayout = require('famous-flex/layouts/TabBarLayout');
 *
 * var layout = new LayoutController({
 *   layout: NavBarLayout,
 *   layoutOptions: {
 *     margins: [5, 5, 5, 5], // margins to utilize
 *     spacing: 10            // space in between items
 *   },
 *   dataSource: {
 *     background: new Surface({properties: {backgroundColor: 'black'}}),
 *     title: new Surface({content: 'My title'}),
 *     leftItems:[
 *       new Surface({
 *         content: 'left1',
 *         size: [100, undefined] // use fixed width
 *       })
 *     ],
 *     rightItems: [
 *       new Surface({
 *         content: 'right1',
 *         size: [true, undefined] // use actual width of DOM-node
 *       }),
 *       new Surface({
 *         content: 'right2'
 *         size: [true, undefined] // use actual width of DOM-node
 *       })
 *     ]
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

    // Layout function
    function NavBarLayout(context, options) {

        // Prepare data
        size = context.size;
        direction = context.direction;
        revDirection = direction ? 0 : 1;
        spacing = options.spacing || 0;
        items = context.get('items');
        margins = LayoutUtility.normalizeMargins(options.margins);
        set.size[0] = context.size[0];
        set.size[1] = context.size[1];
        set.size[revDirection] -= (margins[1 - revDirection] + margins[3 - revDirection]);
        set.translate[0] = 0;
        set.translate[1] = 0;
        set.translate[2] = 0;
        set.translate[revDirection] = margins[direction ? 3 : 0];
        set.align[0] = 0;
        set.align[1] = 0;
        set.origin[0] = 0;
        set.origin[1] = 0;

        // When no item-size specified, spread all items
        // out equally over the full width/height, taking into
        // account margins & spacing
        offset = direction ? margins[0] : margins[3];
        if (options.itemSize === undefined) {
            sizeLeft = size[direction] - (offset + (direction ? margins[2] : margins[1]));
            sizeLeft -= ((items.length - 1) * spacing);
            for (var i = 0; i < items.length; i++) {

                // Calculate item size
                nodeSize = Math.round(sizeLeft / (items.length - i));

                // Position item
                set.size[direction] = nodeSize;
                set.translate[direction] = offset;
                context.set(items[i], set);
                offset += nodeSize + spacing;
                sizeLeft -= (nodeSize + spacing);

                // Place selected item overlay
                if (i === options.selectedItemIndex) {
                    set.translate[direction] += (nodeSize / 2);
                    set.origin[direction] = 0.5;
                    context.set('selectedItemOverlay', set);
                    set.origin[direction] = 0;
                }
            }
        }
        else {
            for (i = 0; i < items.length; i++) {

                // Get item size
                nodeSize = (options.itemSize === true) ? context.resolveSize(items[i], size)[direction] : options.itemSize;

                // Position item
                set.size[direction] = nodeSize;
                set.translate[direction] = offset;
                context.set(items[i], set);
                offset += nodeSize + spacing;

                // Place selected item overlay
                if (i === options.selectedItemIndex) {
                    set.translate[direction] += (nodeSize / 2);
                    set.origin[direction] = 0.5;
                    context.set('selectedItemOverlay', set);
                    set.origin[direction] = 0;
                }
            }
        }
    }

    NavBarLayout.Capabilities = capabilities;
    NavBarLayout.Name = 'TabBarLayout';
    NavBarLayout.Description = 'TabBar widget layout';
    module.exports = NavBarLayout;
});
