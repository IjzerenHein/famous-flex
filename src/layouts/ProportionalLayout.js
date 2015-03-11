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
 * Lays-out renderables sequentially based on size-ratios (similar to the stock famo.us FlexibleLayout view).
 *
 * |options|type|description|
 * |---|---|---|
 * |`ratios`|Array|Size-ratios of the renderables.|
 *
 * Example:
 *
 * ```javascript
 * var ProportionalLayout = require('famous-flex/layouts/ProportionalLayout');
 *
 * var layoutController = new LayoutController({
 *   layout: ProportionalLayout,
 *   layoutOptions: {
 *     ratios: [1, 1, 2, 1],      // total size: 5
 *   },
 *   dataSource: [
 *     new Surface({content: 'item 1'}), // 20%
 *     new Surface({content: 'item 2'}), // 20%
 *     new Surface({content: 'item 3'}), // 40%
 *     new Surface({content: 'item 4'})  // 20%
 *   ]
 * });
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
        scrolling: false
    };

    // data
    var direction;
    var size;
    var ratios;
    var total;
    var offset;
    var index;
    var node;
    var set = {
        size: [0, 0],
        translate: [0, 0, 0]
    };

    // Layout function
    function ProportionalLayout(context, options) {

        // init
        size = context.size;
        direction = context.direction;
        ratios = options.ratios;
        total = 0;

        // Calculate total sum of ratios
        for (index = 0; index < ratios.length; index++) {
            total += ratios[index];
        }

        // Prepare
        set.size[0] = size[0];
        set.size[1] = size[1];
        set.translate[0] = 0;
        set.translate[1] = 0;

        // Layout renderables
        node = context.next();
        offset = 0;
        index = 0;
        while (node && (index < ratios.length)) {

            // Position renderable
            set.size[direction] = ((size[direction] - offset) / total) * ratios[index];
            set.translate[direction] = offset;
            context.set(node, set);

            // Move to next renderable
            offset += set.size[direction];
            total -= ratios[index];
            index++;
            node = context.next();
        }
    }

    ProportionalLayout.Capabilities = capabilities;
    module.exports = ProportionalLayout;
});
