import Control from '../controls/Control';
import NodeCollection from '../core/NodeCollection';
import Margins from '../core/Margins';
import Spacing from '../core/Spacing';

function toolBarLayout(context) {
  const rect = this._itemRect;
  const dir = this._direction;
  Margins.apply(this._padding, context.rect);
  const spacing = Spacing.resolve(this._spacing, context.rect, dir);
  let start = dir ? context.rect.y : context.rect.x;
  let end = dir ? context.rect.bottom : context.rect.right;
  for (let i = 0; i < this._nodes.length; i++) {
    const item = this._nodes.getAt(i);
    rect.set(context.rect);
    item.measure(rect);
    if (dir) {
      rect.centerX();
      rect.y = start;
      start += rect.height + spacing;
    } else {
      rect.centerY();
      rect.x = start;
      start += rect.width + spacing;
    }
  }
}

const itemDefaults = {
  alignment: 0
};

class ToolBarItem extends BaseNode {
  constructor(options) {
    super();
    this.registerUpdate(() => {
      if (this._control) this._control.rect = this.rect;
    }, true);
    this.setOptions(itemDefaults, options);
  }

  get control() {
    return this._control;
  }

  set control(value) {
    if (this._control !== value) {
      if (this._control) this.removeChild(this._control);
      this._control = value;
      if (this._control) {
        this.addChild(this._control);
        this._control.rect = this.rect;
      }
    }
  }

  get alignment() {
    return this._alignment;
  }

  set alignment(value) {
    if (this._alignment !== value) {
      this._alignment = value;
    }
  }
};

const defaults = {
  layout: toolBarLayout,
  direction: 0,
  padding: 8,
  spacing: 8
};

export default class ToolBar extends LayoutNode {
  constructor(options) {
    super();
    this._itemRect = new Rect();
    this._itemRect.parent = this._layoutRect;
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

  get padding() {
    return this._padding || Margins.identity;
  }

  set padding(value) {
    value = Margins.parse(value);
    if (!Animation.collect(this, 'padding', value)) {
      this._padding = value;
      this.requestLayout();
    }
  }

  get spacing() {
    return this._spacing || Spacing.identity;
  }

  set spacing(value) {
    value = Spacing.parse(value);
    if (!Animation.collect(this, 'spacing', value)) {
      this._spacing = value;
      this.requestLayout();
    }
  }
}
ToolBar.Item = ToolBarItem;
