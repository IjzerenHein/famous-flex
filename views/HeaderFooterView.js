import Size from '../core/Size';
import LayoutNode from '../core/LayoutNode';

function headerFooterLayout(context) {
  const rect = context.rect;
  const headerSize = this.headerSize.measure(context.rect);
  const footerSize = this.footerSize.measure(context.rect);
  if (this.header) {
    if (this._direction) {
      rect.height = headerSize.height;
    } else {
      rect.width = headerSize.width;
    }
    this.header.rect = rect;
  }
  if (this.content) {
    if (this._direction) {
      rect.y = rect.bottom;
      rect.height = rect.parent.height - headerSize.height - footerSize.height;
    } else {
      rect.x = rect.right;
      rect.width = rect.parent.width - headerSize.width - footerSize.width;
    }
    this.content.rect = rect;
  }
  if (this.footer) {
    if (this._direction) {
      rect.y = rect.parent.height - footerSize.height;
      rect.height = footerSize.height;
    } else {
      rect.x = rect.parent.width - footerSize.width;
      rect.width = footerSize.width;
    }
    this.footer.rect = rect;
  }
}

const defaults = {
  layout: headerFooterLayout,
  direction: 1
};

export default class HeaderFooterView extends LayoutNode {
  constructor(options) {
    super();
    this._headerSize = new Size();
    this._headerSize.onChange(() => this.requestLayout());
    this._footerSize = new Size();
    this._footerSize.onChange(() => this.requestLayout());
    this.setOptions(defaults, options);
  }

  get direction() {
    return this._direction;
  }

  set direction(value) {
    if (this._direction !== value) {
      this._direction = value;
      this.requestLayout();
    }
  }

  get headerSize() {
    return this._headerSize;
  }

  set headerSize(value) {
    this._headerSize.set(value);
  }

  get header() {
    this._nodes.get('header');
  }

  set header(value) {
    this._nodes.set('header', value);
  }

  get content() {
    this._nodes.get('content');
  }

  set content(value) {
    this._nodes.set('content', value);
  }

  get footer() {
    this._nodes.get('footer');
  }

  set footer(value) {
    this._nodes.set('footer', value);
  }

  get footerSize() {
    return this._footerSize;
  }

  set footerSize(value) {
    this._footerSize.set(value);
  }
}
