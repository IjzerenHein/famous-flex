export default function HeaderFooterLayout(nodes, size, options) {
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
