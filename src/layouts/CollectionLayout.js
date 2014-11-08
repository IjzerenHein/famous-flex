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
 * Lays a collection of renderables from left to right or top to bottom, and when the right/bottom edge is reached,
 * continues at the next column/row.
 *
 * |options|type|description|
 * |---|---|---|
 * |`itemSize`|Size/Function|Size of an item to layout or callback function which should return the size, e.g.: `function(renderNode, contextSize)`|
 * |`[gutter]`|Size|Gutter-space between renderables|
 * |`[justify]`|Bool/Array.Bool|Justify the renderables accross the width/height|
 *
 * Example:
 *
 * ```javascript
 * var CollectionLayout = require('famous-flex/layouts/CollectionLayout');
 *
 * new LayoutController({
 *   layout: CollectionLayout,
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
        direction: [Utility.Direction.Y, Utility.Direction.X],
        scrolling: true,
        trueSize: true,
        sequentialScrollingOptimized: true
    };

    // Prepare
    var context;
    var size;
    var direction;
    var lineDirection;
    var offset;
    var gutter;
    var justify;
    var itemSize;
    var getItemSize;
    var lineNodes;
    var hasNext;
    var firstPrev;

    /**
     * Lays out the renderables in a single line. Taking into account
     * the following variables:
     * - true-size
     * - gutter
     * - justify
     * - center align
     */
    function _layoutLine(next, endReached) {
        if (!lineNodes.length) {
            return 0;
        }

        // Determine size of the line
        var i;
        var lineSize = [0, 0];
        var lineNode;
        lineSize[lineDirection] = gutter[lineDirection];
        for (i = 0; i < lineNodes.length; i++) {
            lineSize[direction] = Math.max(lineSize[direction], lineNodes[i].size[direction]);
            lineSize[lineDirection] += lineNodes[i].size[lineDirection] + gutter[lineDirection];
        }

        // Layout nodes from left to right or top to bottom
        var justifyOffset = justify[lineDirection] ? ((size[lineDirection] - lineSize[lineDirection]) / (lineNodes.length * 2)) : 0;
        var lineOffset = gutter[lineDirection] + justifyOffset;
        var gutterOffset = (((endReached && next) || (!next && firstPrev && !hasNext))) ? gutter[direction] : 0;
        for (i = 0; i < lineNodes.length; i++) {
            lineNode = lineNodes[i];
            var translate = [0, 0, 0];
            translate[lineDirection] = lineOffset;
            translate[direction] = next ? (offset + gutter[direction]) : (offset - (lineSize[direction] + gutterOffset));
            lineNode.set = {
                size: lineNode.size,
                translate: translate,
                // first renderable has scrollLength, others have 0 scrollLength
                scrollLength: (i === 0) ? (lineSize[direction] + gutter[direction] + gutterOffset) : 0
            };
            lineOffset += lineNode.size[lineDirection] + gutter[lineDirection] + (justifyOffset * 2);
        }

        // Set nodes
        for (i = 0; i < lineNodes.length; i++) {
            lineNode = next ? lineNodes[i] : lineNodes[(lineNodes.length - 1) - i];
            context.set(lineNode.node, lineNode.set);
        }

        // Prepare for next line
        lineNodes = [];
        hasNext = next;
        if (!next) {
            firstPrev = false;
        }
        return lineSize[direction] + gutter[direction] + gutterOffset;
    }

    /**
     * Helper function to resolving the size of a node.
     */
    function _resolveNodeSize(node) {
        var localItemSize = itemSize;
        if (getItemSize) {
            localItemSize = getItemSize(context.getRenderNode(node), size);
        }
        if ((localItemSize[0] === true) || (localItemSize[1] === true)) {
            var result = context.resolveSize(node, size);
            if (localItemSize[0] !== true) {
                result[0] = itemSize[0];
            }
            if (localItemSize[1] !== true) {
                result[1] = itemSize[1];
            }
            return result;
        }
        else {
            return localItemSize;
        }
    }

    /**
     * Collection-layout
     */
    function CollectionLayout(context_, options) {

        // Prepare
        context = context_;
        size = context.size;
        direction = context.direction;
        lineDirection = (direction + 1) % 2;
        offset = context.scrollOffset;
        gutter = options.gutter || [0, 0];
        justify = Array.isArray(options.justify) ? options.justify : (options.justify ? [true, true] : [false, false]);
        lineNodes = [];
        hasNext = false;
        firstPrev = true;
        var node;
        var nodeSize;
        var lineLength;

        // Prepare item-size
        if (!options.itemSize) {
            itemSize = [true, true]; // when no item-size specified, use size from renderables
        } else if (options.itemSize instanceof Function) {
            getItemSize = options.itemSize;
        } else if ((options.itemSize[0] === undefined) || (options.itemSize[0] === undefined)){
            // resolve 'undefined' into a fixed size
            itemSize = [
                (options.itemSize[0] === undefined) ? size[0] : options.itemSize[0],
                (options.itemSize[1] === undefined) ? size[1] : options.itemSize[1]
            ];
        }
        else {
            itemSize = options.itemSize;
        }

        //
        // Process all next nodes
        //
        lineLength = gutter[lineDirection];
        while (offset < context.scrollEnd) {
            node = context.next();
            if (!node) {
                _layoutLine(true, true);
                break;
            }
            nodeSize = _resolveNodeSize(node);
            lineLength += nodeSize[lineDirection] + gutter[lineDirection];
            if (lineLength > size[lineDirection]) {
                offset += _layoutLine(true, !node);
                lineLength = gutter[lineDirection] + nodeSize[lineDirection] + gutter[lineDirection];
            }
            lineNodes.push({node: node, size: nodeSize});
        }
        lineNodes = [];

        //
        // Process previous nodes
        //
        offset = context.scrollOffset;
        lineLength = gutter[lineDirection];
        while (offset > context.scrollStart) {
            node = context.prev();
            if (!node) {
                _layoutLine(false, true);
                break;
            }
            nodeSize = _resolveNodeSize(node);
            lineLength += nodeSize[lineDirection] + gutter[lineDirection];
            if (lineLength > size[lineDirection]) {
                offset -= _layoutLine(false, !node);
                lineLength = gutter[lineDirection] + nodeSize[lineDirection] + gutter[lineDirection];
            }
            lineNodes.unshift({node: node, size: nodeSize});
        }
    }

    CollectionLayout.Capabilities = capabilities;
    module.exports = CollectionLayout;
});
