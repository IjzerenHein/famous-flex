import Animation from '../animation/Animation';
import SizeProperty from '../core/SizeProperty';
import LayoutNode from '../core/LayoutNode';

function drawerLayout(context) {
  const rect = context.rect;
  const direction = ((this._drawerLocation === 'top') || (this._drawerLocation === 'bottom')) ? 1 : 0;
  const size = direction ? rect.height : rect.width;
  const fullDrawerSize = this.drawerSize.resolve(size);
  const drawerSize = fullDrawerSize * ((this._drawerMode === 'resize') ? this._openRatio : 1);
  const drawerStart = (this._drawerMode === 'move') ? -(drawerSize * this._openRatio) : 0;
  const contentSize = (this._contentMode === 'resize') ? (size - (fullDrawerSize * this._openRatio)) : size;
  const contentStart = (this._contentMode === 'stay') ? 0 : (fullDrawerSize * this._openRatio);

  if (this.drawer) {
    if (direction) {
      rect.height = drawerSize;
    } else {
      rect.width = drawerSize;
    }
    switch (this._drawerLocation) {
      case 'top': rect.y = drawerStart; break;
      case 'left': rect.x = drawerStart; break;
      case 'bottom': rect.y = size - drawerSize - drawerStart; break;
      case 'left': rect.x = size - drawerSize - drawerStart; break;
    }
    rect.z = this._drawerZIndex;
    this.drawer.rect = rect;
  }

  if (this.content) {
    if (direction) {
      rect.height = contentSize;
    } else {
      rect.width = contentSize;
    }
    switch (this._drawerLocation) {
      case 'top': rect.y = contentStart; break;
      case 'left': rect.x = contentStart; break;
      case 'bottom': rect.y = size - contentSize - contentStart; break;
      case 'left': rect.x = size - contentSize - contentStart; break;
    }
    rect.z = this._contentZIndex;
    this.content.rect = rect;
  }
}

const defaults = {
  layout: drawerLayout,
  drawerZIndex: 0,
  drawerLocation: 'top', // top, left, bottom, right
  drawerMode: 'stay', // stay, resize, move
  contentZIndex: 10,
  contentMode: 'resize' // stay, resize, move
};

export default class DrawerView extends LayoutNode {
  constructor(options) {
    super();
    this._openRatio = 0;
    this._drawerZIndex = 0;
    this._contentZIndex = 0;
    this._drawerSize = new SizeProperty();
    this._drawerSize.onChange = () => this.requestLayout();
    this.setOptions(defaults, options);
  }

  get open() {
    return this.openRatio > 0;
  }

  set open(value) {
    this.openRatio = value ? 1 : 0;
  }

  get openRatio() {
    return this._openRatio;
  }

  set openRatio(value) {
    if (!Animation.collect(this, 'openRatio', value) && (this._openRatio !== value)) {
      this._openRatio = value;
      this.requestLayout();
    }
  }

  get drawerZIndex() {
    return this._drawerZIndex;
  }

  set drawerZIndex(value) {
    if (this._drawerZIndex !== value) {
      this._drawerZIndex = value;
      this.requestLayout();
    }
  }

  get drawerLocation() {
    return this._drawerLocation;
  }

  set drawerLocation(value) {
    if (this._drawerLocation !== value) {
      this._drawerLocation = value;
      this.requestLayout();
    }
  }

  get drawerMode() {
    return this._drawerMode;
  }

  set drawerMode(value) {
    if (this._drawerMode !== value) {
      this._drawerMode = value;
      this.requestLayout();
    }
  }

  get contentMode() {
    return this._contentMode;
  }

  set contentMode(value) {
    if (this._contentMode !== value) {
      this._contentMode = value;
      this.requestLayout();
    }
  }

  get drawerSize() {
    return this._drawerSize;
  }

  set drawerSize(value) {
    this._drawerSize.set(value);
  }

  get drawer() {
    return this._nodes.get('drawer');
  }

  set drawer(value) {
    this._nodes.set('drawer', value);
  }

  get content() {
    return this._nodes.get('content');
  }

  set content(value) {
    this._nodes.set('content', value);
  }
}
