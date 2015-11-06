/**
 * Lays out items and optionally sticky sections from top to bottom or left to right.
 *
 * |options|type|description|
 * |---|---|---|
 * |`[itemSize]`|Number/Function|Height or width in pixels of an item (used when renderNode has no size)|
 * |`[spacing]`|Number|Spacing between items|
 * |`[isSectionCallback]`|Function|Callback that is called in order to check if a render-node is a section rather than a cell.|
 *
 * Example:
 *
 * ```javascript
 * var FlexScrollView = require('famous-flex/FlexScrollView');
 * var ListLayout = require('famous-flex/layouts/ListLayout');
 *
 * var scrollView = new FlexScrollView({
 *   layout: ListLayout,
 *   layoutOptions: {
 *     spacing: 1,
 *     isSectionCallback: function(renderNode) {
 *       return renderNode.isSection;
 *     },
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
 * this.add(scrollView);
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
 * ```
 */
function listLayout(context, options) {

  // Local data
  const size = context.size;
  const direction = context.direction;
  const alignment = direction ? context.alignment.y : context.alignment.x;
  const revDirection = direction ? 0 : 1;
  const spacing = options.spacing || 0;
  let offset;
  let node;
  let nodeSize;
  let itemSize;
  let getItemSize;
  let lastSectionBeforeVisibleCell;
  let lastSectionBeforeVisibleCellOffset;
  let lastSectionBeforeVisibleCellLength;
  let lastSectionBeforeVisibleCellTopReached;
  let firstVisibleCell;
  let lastNode;
  let lastCellOffsetInFirstVisibleSection;
  let isSectionCallback = options.isSectionCallback;
  let sectionZIndex = options.sectionZIndex || 5;
  let bound;

  //console.log('listlayout, offset: ' + context.scrollOffset + ', start: ' + context.scrollStart + ', end: ' + context.scrollEnd);

  //
  // Reset size & translation
  //
  const set = {
    size: [0, 0],
    translate: [0, 0, 0]
  };
  set.size[0] = size[0];
  set.size[1] = size[1];
  set.translate[0] = 0;
  set.translate[1] = 0;
  set.translate[2] = 0;

  //
  // Determine item-size or use true=size
  //
  if ((options.itemSize === true) || !options.hasOwnProperty('itemSize')) {
    itemSize = true;
  } else if (options.itemSize instanceof Function) {
    getItemSize = options.itemSize;
  } else {
    itemSize = (options.itemSize === undefined) ? size[direction] : options.itemSize;
  }

  //
  // Process all next nodes
  //
  offset = context.scrollOffset;
  bound = context.scrollEnd;
  while (offset < (bound + spacing)) {
    lastNode = node;
    node = context.next();
    if (!node) {
      break;
    }

    //
    // Get node size
    //
    nodeSize = getItemSize ? getItemSize(node) : itemSize;
    nodeSize = (nodeSize === true) ? context.resolveSize(node, size)[direction] : nodeSize;

    //
    // Position node
    //
    set.size[direction] = nodeSize;
    set.translate[direction] = offset + (alignment ? spacing : 0);
    context.set(node, set);
    offset += nodeSize + spacing;

    //
    // Keep track of the last section before the first visible cell
    //
    if (isSectionCallback && isSectionCallback(node)) {
      if ((set.translate[direction] <= 0) && !lastSectionBeforeVisibleCellTopReached) {
        lastSectionBeforeVisibleCellTopReached = true;
        /*set.translate[2] = sectionZIndex;
        context.set(node, set);
        set.translate[2] = 0;*/
      }
      if (!firstVisibleCell) {
        lastSectionBeforeVisibleCell = node;
        lastSectionBeforeVisibleCellOffset = offset - nodeSize;
        lastSectionBeforeVisibleCellLength = nodeSize;
      } else if (lastCellOffsetInFirstVisibleSection === undefined) {
        lastCellOffsetInFirstVisibleSection = offset - nodeSize;
      }
    } else if (!firstVisibleCell && (offset >= 0)) {
      firstVisibleCell = node;
    }
  }

  //
  // Process previous nodes
  //
  lastNode = undefined;
  node = undefined;
  offset = context.scrollOffset;
  bound = context.scrollStart;
  while (offset > (bound - spacing)) {
    lastNode = node;
    node = context.prev();
    if (!node) {
      break;
    }

    //
    // Get node size
    //
    nodeSize = getItemSize ? getItemSize(node) : itemSize;
    nodeSize = (nodeSize === true) ? context.resolveSize(node, size)[direction] : nodeSize;

    //
    // Position node
    //
    offset -= nodeSize + spacing;
    set.size[direction] = nodeSize;
    set.translate[direction] = offset + (alignment ? spacing : 0);
    context.set(node, set);

    //
    // Keep track of the last section before the first visible cell
    //
    if (isSectionCallback && isSectionCallback(node)) {
      if ((set.translate[direction] <= 0) && !lastSectionBeforeVisibleCellTopReached) {
        lastSectionBeforeVisibleCellTopReached = true;
        set.translate[direction] = 0;
        context.set(node, set);
      }
      if (!lastSectionBeforeVisibleCell) {
        lastSectionBeforeVisibleCell = node;
        lastSectionBeforeVisibleCellOffset = offset;
        lastSectionBeforeVisibleCellLength = nodeSize;
      }
    } else if ((offset + nodeSize) >= 0) {
      firstVisibleCell = node;
      if (lastSectionBeforeVisibleCell) {
        lastCellOffsetInFirstVisibleSection = offset + nodeSize;
      }
      lastSectionBeforeVisibleCell = undefined;
    }
  }

  //
  // When no first section is in the scrollable range, then
  // look back further in search for that section
  //
  if (isSectionCallback && !lastSectionBeforeVisibleCell) {
    node = context.prev();
    while (node) {
      if (isSectionCallback(node)) {
        lastSectionBeforeVisibleCell = node;
        nodeSize = options.itemSize || context.resolveSize(node, size)[direction];
        lastSectionBeforeVisibleCellOffset = offset - nodeSize;
        lastSectionBeforeVisibleCellLength = nodeSize;
        break;
      } else {
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
      (lastSectionBeforeVisibleCellLength > (lastCellOffsetInFirstVisibleSection))) {
      correctedOffset = ((lastCellOffsetInFirstVisibleSection - lastSectionBeforeVisibleCellLength));
    }
    set.size[direction] = lastSectionBeforeVisibleCellLength;

    //console.log('correctedOffset: ' + correctedOffset);
    set.translate[direction] = correctedOffset;
    set.translate[2] = sectionZIndex;
    context.set(lastSectionBeforeVisibleCell, set);
  }
}

export default listLayout;
