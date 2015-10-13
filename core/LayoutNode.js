import BaseNode from './BaseNode';
import Margins from './Margins';
import Animation from '../animation/Animation';
import Classes from './Classes';
import Size from './Size';
import Rect from './Rect';

export default class LayoutNode extends BaseNode {
  constructor(options) {
    super(options);
  }

  onLayout() {
    if (!this._layoutRect) {
      this._layoutRect = new Rect();
      this._layoutRect.parent = new Rect();
    }
    const rect = this._layoutRect;
    rect.parent.width = this.rect.width;
    rect.parent.height = this.rect.height;
    rect.x = 0;
    rect.y = 0;
    rect.z = 0;
    if (this._measure) {
      this._measure(rect);
      rect.center();
    } else if (this._intrinsicSize) {
      this._intrinsicSize.resolve(rect);
      rect.center();
    } else {
      rect.width = rect.parent.width;
      rect.height = rect.parent.height;
    }
    this._layout(rect, this._layoutOptions);
  }

  requestLayout(immediate) {
    if (immediate) {
      this.onLayout();
    } else {
      this._updateLayout = this._updateLayout || this.registerUpdate(() => this.onLayout(), true);
      this._updateLayout.request();
    }
  }

  get layout() {
    return this._layout;
  }

  set layout(layout) {
    if (layout !== this._layout) {
      this._layout = layout;
      this.requestLayout(Animation.isCollecting);
    }
  }

  get layoutOptions() {
    return this._layoutOptions;
  }

  set layoutOptions(options) {
    if (this._layoutOptions !== options) {
      this._layoutOptions = options;
      this.requestLayout();
    }
  }

  get measure() {
    return this._measure;
  }

  set measure(measure) {
    if (measure !== this._measure) {
      this._measure = measure;
      this.requestLayout(Animation.isCollecting);
    }
  }

  get intrinsicSize() {
    if (!this._intrinsicSize) {
      this._intrinsicSize = new Size();
      this._intrinsicSize.onChange = () => this.requestLayout();
    }
    return this._intrinsicSize;
  }

  set intrinsicSize(value) {
    this.intrinsicSize.set(value);
  }

  get padding() {
    this._padding = this._padding || Margins.identity;
    return this._padding;
  }

  set padding(padding) {
    this._padding = this._padding || Margins.identity;
    if (Animation.isCollecting) {
      Animation.collect(this, 'padding', this._padding, Margins.parse(padding));
    } else {
      this._padding = Margins.parse(padding);
      this.requestLayout();
    }
  }

  onClasses(add, remove) {
    const children = this.getChildren();
    if (add) {
      for (let i = 0; i < children.length; i++) {
        if (children[i].classes) {
          children[i].classes.add(add);
        }
      }
    }
    if (remove) {
      for (let i = 0; i < children.length; i++) {
        if (children[i].classes) {
          children[i].classes.remove(remove);
        }
      }
    }
  }

  get classes() {
    this._classes = this._classes || new Classes(this);
    return this._classes;
  }

  set classes(values) {
    this.classes.add(values);
  }

  addChild(child) {
    super.addChild(child);
    if (this._classes && child.classes) {
      for (let i = 0; i < this._classes.length; i++) {
        child.classes.add(this._classes.getAt(i));
      }
    }
    this.requestLayout();
    return child;
  }

  removeChild(child) {
    if (this._classes && child.classes) {
      for (let i = 0; i < this._classes.length; i++) {
        child.classes.remove(this._classes.getAt(i));
      }
    }
    return super.removeChild(child);
  }
}
