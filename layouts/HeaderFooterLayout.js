/**
 * HeaderFooterLayout.
 *
 * @param {Rect} rect Rect to layout in.
 * @param {Object} options Configuration options.
 * @param {Number} [options.headerSize] Size of the header.
 * @param {Number} [options.footerSize] Size of the footer.
 */
function headerFooterLayout(rect, options) {
  if (this.header) {
    rect.height = options.headerSize;
    this.header.rect = rect;
  }
  if (this.content) {
    rect.y = rect.bottom;
    rect.height = rect.parent.height - options.headerSize - options.footerSize;
    this.content.rect = rect;
  }
  if (this.footer) {
    rect.y = rect.parent.height - options.footerSize;
    rect.height = options.footerSize;
    this.footer.rect = rect;
  }
}

export default headerFooterLayout;
