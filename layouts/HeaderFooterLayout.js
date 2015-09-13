/**
 * HeaderFooterLayout.
 *
 * @param {Object} nodes Nodes to layout.
 * @param {Array} size Size of the container.
 * @param {Object} options Configuration options.
 * @param {Number} [options.headerSize] Size of the header.
 * @param {Number} [options.footerSize] Size of the footer.
 */
function headerFooterLayout(nodes, size, options) {
  if (nodes.header) {
    nodes.header
      .setSizeMode('relative', 'absolute')
      .setAbsoluteSize(0, options.headerSize);
  }
  if (nodes.content) {
    nodes.content
      .setDifferentialSize(0, -(options.headerSize + (nodes.footer ? options.footerSize : 0)))
      .setPosition(0, options.headerSize, 0);
  }
  if (nodes.footer) {
    nodes.footer
      .setSizeMode('relative', 'absolute')
      .setAbsoluteSize(0, options.footerSize)
      .setPosition(0, size[1] - options.footerSize, 0);
  }
}

export default headerFooterLayout;
