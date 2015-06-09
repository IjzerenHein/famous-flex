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
 * Navigation-bar layout consisting of optionally left and right items and a
 * title in the middle.
 *
 * When no item-width is specified, the width of the renderable itsself is used.
 *
 * |options|type|description|
 * |---|---|---|
 * |`[margins]`|Number/Array|Margins shorthand (e.g. 5, [10, 20], [2, 5, 2, 10])|
 * |`[zIncrement]`|Z-translation increment used to stack the elements correctly (default: 2)|
 * |`[itemWidth]`|Number|Width of the left & right items|
 * |`[leftItemWidth]`|Number|Width of the left items|
 * |`[rightItemWidth]`|Number|Width of the right items|
 * |`[itemSpacer]`|Number|Space in between items|
 *
 * Example:
 *
 * ```javascript
 * var NavBarLayout = require('famous-flex/layouts/NavBarLayout');
 *
 * var layout = new LayoutController({
 *   layout: NavBarLayout,
 *   layoutOptions: {
 *     margins: [5, 5, 5, 5], // margins to utilize
 *     itemSpacer: 10,        // space in between items
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
    var LayoutDockHelper = require('../helpers/LayoutDockHelper');

    // Layout function
    module.exports = function NavBarLayout(context, options) {
        var dock = new LayoutDockHelper(context, {
            margins: options.margins,
            translateZ: options.hasOwnProperty('zIncrement') ? options.zIncrement : 2
        });

        // Position background
        context.set('background', {size: context.size});

        // Position back-button
        var backIcon = context.get('backIcon');
        if (backIcon) {
            dock.left(backIcon, options.backIconWidth);
            dock.left(undefined, options.leftItemSpacer || options.itemSpacer);
        }
        var backItem = context.get('backItem');
        if (backItem) {
            dock.left(backItem, options.backItemWidth);
            dock.left(undefined, options.leftItemSpacer || options.itemSpacer);
        }

        // Position right items
        var node;
        var i;
        var rightItems = context.get('rightItems');
        if (rightItems) {
            for (i = 0; i < rightItems.length; i++) {
                // dock node
                node = context.get(rightItems[i]);
                dock.right(node, options.rightItemWidth || options.itemWidth);
                // spacer
                dock.right(undefined, options.rightItemSpacer || options.itemSpacer);
            }
        }

        // Position left items
        var leftItems = context.get('leftItems');
        if (leftItems) {
            for (i = 0; i < leftItems.length; i++) {
                // dock node
                node = context.get(leftItems[i]);
                dock.left(node, options.leftItemWidth || options.itemWidth);
                // spacer
                dock.left(undefined, options.leftItemSpacer || options.itemSpacer);
            }
        }

        // Position title
        var title = context.get('title');
        if (title) {
            var titleSize = context.resolveSize(title, context.size);
            var left = Math.max((context.size[0] - titleSize[0]) / 2, dock.get().left);
            var right = Math.min((context.size[0] + titleSize[0]) / 2, dock.get().right);
            left = Math.max(left, context.size[0] - right);
            right = Math.min(right, context.size[0] - left);
            context.set(title, {
                size: [right - left, context.size[1]],
                translate: [left, 0, dock.get().z]
            });
        }
    };
});
