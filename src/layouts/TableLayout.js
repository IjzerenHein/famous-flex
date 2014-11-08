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
 * Lays out a sections and cells and makes the section stick to the top (or left) side
 * of the scollview.
 *
 * |options|type|description|
 * |---|---|---|
 * |`[isSectionCallback]`|Function|Callback that is called in order to check if a render-node is a section rather than a cell.|
 * |`[itemSize]`|Number/Function|Height or width in pixels of an item (used when renderNode has no size)|
 * |`[setCallback]`|Function|Callback that is called prior to setting size, translate, etc...: `function(renderNode, set)`.|
 *
 * Example:
 *
 * ```javascript
 * var ScrollController = require('famous-flex/ScrollController');
 * var TableLayout = require('famous-flex/layouts/TableLayout');
 *
 * var tableView = new ScrollController({
 *   layout: TableLayout,
 *   layoutOptions: {
 *     isSectionCallback: _isSection,
 *   },
 *   dataSource: [
 *     // first section
 *     _createSection(),
 *     _createCell(),
 *     _createCell(),
 *     // second section
 *     _createSection(),
 *     _createCell(),
 *   ]
 * });
 * this.add(tableView);
 *
 * function _createCell() {
 *   return new Surface({
 *     size: [undefined, 50],
 *     content: 'my cell'
 *   });
 * }
 *
 * function _createSection() {
 *   var section = new Surface({
 *     size: [undefined, 30],
 *     content: 'my sticky section'
 *   });
 *   section.isSection = true; // mark renderNode as section
 *   return section;
 * }
 *
 * function _isSection(renderNode) {
 *   return renderNode.isSection;
 * }
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
        sequentialScrollingOptimized: true
    };

    // Data
    var context;
    var options;
    var size;
    var direction;
    var offset;
    var setSize = [0, 0];
    var setTranslate = [0, 0, 0];
    var set = {
        size: setSize,
        translate: setTranslate
    };

    //
    // Sets the node
    //
    function _setNode(node, offset, nodeSize, scrollLength) {
        setSize[0] = size[0];
        setSize[1] = size[1];
        setSize[direction] = nodeSize;
        setTranslate[0] = 0;
        setTranslate[1] = 0;
        setTranslate[2] = 0;
        setTranslate[direction] = offset;
        set.scrollLength = scrollLength;
        if (options.setCallback) {
            options.setCallback(node.renderNode, set);
        }
        context.set(node, set);
        return set.scrollLength;
    }

    // Layout function
    function TableLayout(context_, options_) {

        // Local data
        var node;
        var nodeSize;
        var itemSize;
        var getItemSize;
        var lastSectionBeforeVisibleCell;
        var lastSectionBeforeVisibleCellOffset;
        var lastSectionBeforeVisibleCellLength;
        var lastSectionBeforeVisibleCellScrollLength;
        var firstVisibleCell;
        var lastCellOffsetInFirstVisibleSection;
        var firstCell;
        var firstCellOffset;
        var lastCell;
        var lastCellOffset;

        // init
        context = context_;
        options = options_;
        size = context.size;
        direction = context.direction;
        offset = context.scrollOffset;

        //
        // Determine item-size or use true=size
        //
        if ((options.itemSize === true) || !options.hasOwnProperty('itemSize')) {
            itemSize = true;
        } else if (options.itemSize instanceof Function) {
            getItemSize = options.itemSize;
        }
        else {
            itemSize = (options.itemSize === undefined) ? size[direction] : options.itemSize;
        }

        //
        // Process all next nodes
        //
        while (offset < context.scrollEnd) {
            node = context.next();
            if (!node) {
                break;
            }

            //
            // Get node size
            //
            nodeSize = getItemSize ? getItemSize(node.renderNode) : itemSize;
            nodeSize = (nodeSize === true) ? context.resolveSize(node, size)[direction] : nodeSize;

            //
            // Detect the first and last cell
            //
            if (!firstCell) {
                firstCell = node;
                firstCellOffset = offset;
                if (options.isPullToRefreshCallback && options.isPullToRefreshCallback(node.renderNode)) {
                    nodeSize = 0;
                }
            }
            lastCell = node;
            lastCellOffset = offset;

            //
            // Position node
            //
            offset += _setNode(node, offset, nodeSize, nodeSize);

            //
            // Keep track of the last section before the first visible cell
            //
            if (options.isSectionCallback && options.isSectionCallback(node.renderNode)) {
                if (!firstVisibleCell) {
                    lastSectionBeforeVisibleCell = node;
                    lastSectionBeforeVisibleCellOffset = offset - nodeSize;
                    lastSectionBeforeVisibleCellLength = nodeSize;
                    lastSectionBeforeVisibleCellScrollLength = nodeSize;
                } else if (lastCellOffsetInFirstVisibleSection === undefined) {
                    lastCellOffsetInFirstVisibleSection = offset - nodeSize;
                }
            } else if (!firstVisibleCell && (offset >= 0)) {
                firstVisibleCell = node;
            }
        }
        if (!lastCell) {
            lastCell = context.next();
            lastCellOffset = offset;
        }

        //
        // Process previous nodes
        //
        offset = context.scrollOffset;
        while (offset > context.scrollStart) {
            node = context.prev();
            if (!node) {
                break;
            }

            //
            // Get node size
            //
            nodeSize = getItemSize ? getItemSize(node.renderNode) : itemSize;
            nodeSize = (nodeSize === true) ? context.resolveSize(node, size)[direction] : nodeSize;

            //
            // Position node
            //
            offset -= _setNode(node, offset - nodeSize, nodeSize, nodeSize);

            //
            // Keep track of the last section before the first visible cell
            //
            if (options.isSectionCallback && options.isSectionCallback(node.renderNode)) {
                if (!lastSectionBeforeVisibleCell) {
                    lastSectionBeforeVisibleCell = node;
                    lastSectionBeforeVisibleCellOffset = offset;
                    lastSectionBeforeVisibleCellLength = nodeSize;
                    lastSectionBeforeVisibleCellScrollLength = set.scrollLength;
                }
            } else if ((offset + nodeSize) >= 0) {
                firstVisibleCell = node;
                if (lastSectionBeforeVisibleCell) {
                    lastCellOffsetInFirstVisibleSection = offset + nodeSize;
                }
                lastSectionBeforeVisibleCell = undefined;
            }

            //
            // Detect the first and last cell
            //
            firstCell = node;
            firstCellOffset = offset;
            if (!lastCell) {
                lastCell = node;
                lastCellOffset = offset;
            }
        }

        //
        // When no first section is in the scrollable range, then
        // look back further in search for the that section
        //
        if (node && !lastSectionBeforeVisibleCell && options.isSectionCallback) {
            node = context.prev();
            while (node && !lastSectionBeforeVisibleCell) {
                if (options.isSectionCallback && options.isSectionCallback(node.renderNode)) {
                    lastSectionBeforeVisibleCell = node;
                    nodeSize = options.itemSize || context.resolveSize(node, size)[direction];
                    lastSectionBeforeVisibleCellOffset = offset - nodeSize;
                    lastSectionBeforeVisibleCellLength = nodeSize;
                    lastSectionBeforeVisibleCellScrollLength = undefined;
                    _setNode(node, offset - nodeSize, nodeSize, undefined);
                    context.set(node, set);
                }
                else {
                    node = context.prev();
                }
            }
        }

        //
        // Reposition "last section before first visible cell" to the top of the layout
        //
        if (lastSectionBeforeVisibleCell) {
            var correctedOffset = Math.max(0, lastSectionBeforeVisibleCellOffset);
            if ((lastCellOffsetInFirstVisibleSection !== undefined) &&
                (lastSectionBeforeVisibleCellLength > lastCellOffsetInFirstVisibleSection)) {
                correctedOffset = lastCellOffsetInFirstVisibleSection - lastSectionBeforeVisibleCellLength;
            }
            _setNode(lastSectionBeforeVisibleCell, correctedOffset, lastSectionBeforeVisibleCellLength, lastSectionBeforeVisibleCellScrollLength);
        }

        //
        // Reposition "pull to refresh" renderable at the top
        //
        /*if (firstCell && (firstCellOffset > 0) &&
           options.isPullToRefreshCallback && options.isPullToRefreshCallback(firstCell.renderNode)) {
            firstCell.set.translate[direction] = 0;
            firstCell.set.size[direction] = firstCellOffset;
            context.set(firstCell, {
                size: firstCell.set.size,
                translate: firstCell.set.translate,
                scrollLength: firstCell.set.scrollLength
            });
        }

        //
        // Reposition "pull to refresh" renderable at the bottom
        //
        if (lastCell && (lastCellOffset < context.size[direction]) &&
           options.isPullToRefreshCallback && options.isPullToRefreshCallback(lastCell.renderNode)) {
            lastCell.set.translate[direction] = lastCellOffset;
            lastCell.set.size[direction] = context.size[direction] - lastCellOffset;
            context.set(lastCell, {
                size: lastCell.set.size,
                translate: lastCell.set.translate,
                scrollLength: 0
            });
        }*/
    }

    TableLayout.Capabilities = capabilities;
    TableLayout.Name = 'TableLayout';
    TableLayout.Description = 'TableLayout with sticky headers';
    module.exports = TableLayout;
});
