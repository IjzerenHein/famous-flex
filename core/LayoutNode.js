import BaseNode from './BaseNode';
import LayoutAnimation from '../animation/LayoutAnimation';
import Rect from './Rect';
import Size from './Size';

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
    rect.width = rect.parent.width;
    rect.height = rect.parent.height;

    if (this._animations) {
      for (var i = 0; i < this._animations.length; i++) {
        this._animations[i].state = LayoutAnimation.State.PRELAYOUT;
      }
    }
    this._layout(rect, this._layoutOptions);
    if (this._animations) {
      for (var i = 0; i < this._animations.length; i++) {
        this._animations[i].state = LayoutAnimation.State.POSTLAYOUT;
      }
    }
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
      this.requestLayout();
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

  measure(rect) {
    if (this._configuredSize) {
      this._configuredSize.measure(rect);
    } else {
      // TODO - MEASURE BASED ON CONTENT
      rect.width = rect.parent.width;
      rect.height = rect.parent.height;
    }
  }

  get size() {
    if (!this._configuredSize) {
      this._configuredSize = new Size(this);
      this._configuredSize.onChange = () => this.requestLayout();
    }
    return this._configuredSize;
  }

  set size(value) {
    this.size.set(value);
  }

  animate(curve, duration, collectFn) {
    const animation = LayoutAnimation.start(this, curve, duration, collectFn);
    this._animations = this._animations || [];
    this._animations.push(animation);
    animation.promise.then(() => this._animations.splice(this._animations.indexOf(animation), 1));
    return animation.promise;
  }
}
