import SizeProperty from '../core/SizeProperty';
import LayoutNode from '../core/LayoutNode';

function headerFooterLayout(context) {
  console.log('here we go');
  const rect = context.rect;
  const headerSize = this.headerSize.resolve(this._direction ? context.rect.height : context.rect.width);
  const footerSize = this.footerSize.resolve(this._direction ? context.rect.height : context.rect.width);
  if (this.header) {
    if (this._direction) {
      rect.height = headerSize;
    } else {
      rect.width = headerSize;
    }
    this.header.rect = rect;
  }
  if (this.content) {
    if (this._direction) {
      rect.y = rect.bottom;
      rect.height = rect.parent.height - headerSize - footerSize;
    } else {
      rect.x = rect.right;
      rect.width = rect.parent.width - headerSize - footerSize;
    }
    this.content.rect = rect;
  }
  if (this.footer) {
    if (this._direction) {
      rect.y = rect.parent.height - footerSize;
      rect.height = footerSize;
    } else {
      rect.x = rect.parent.width - footerSize;
      rect.width = footerSize;
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
    this._headerSize = new SizeProperty();
    this._headerSize.onChange = () => this.requestLayout();
    this._footerSize = new SizeProperty();
    this._footerSize.onChange = () => this.requestLayout();
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
    return this._nodes.get('header');
  }

  set header(value) {
    this._nodes.set('header', value);
  }

  get content() {
    return this._nodes.get('content');
  }

  set content(value) {
    this._nodes.set('content', value);
  }

  get footer() {
    return this._nodes.get('footer');
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
