import BaseNode from './BaseNode';
import Rect from './Rect';
import LayoutNodes from './LayoutNodes';
import LayoutContext from './LayoutContext';
import listLayout from '../layouts/listLayout';
import {assert} from '../utils';

const defaults = {
  layout: listLayout
};

export default class ScrollNode extends BaseNode {
  constructor(options) {
    super();
    this._nodes = new LayoutNodes(this);
    this._context = new LayoutContext(this, this._nodes);
    this.setOptions(defaults, options);
  }

  get nodes() {
    return this._nodes;
  }

  set nodes(value) {
    this._nodes.set(value);
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

    if (this._animations) {
      for (var i = 0; i < this._animations.length; i++) {
        this._animations[i].state = LayoutAnimation.State.PRELAYOUT;
      }
    }
    console.log('layout!');
    this._context._prepareForLayout(rect);
    this._layout(this._context, this._layoutOptions);
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

  get measure() {
    return this._measure;
  }

  set measure(measure) {
    if (measure !== this._measure) {
      this._measure = measure;
      this.requestLayout();
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

  // TODO - SHARED CLASSES

  animate(curve, duration, collectFn) {
    const animation = LayoutAnimation.start(this, curve, duration, collectFn);
    this._animations = this._animations || [];
    this._animations.push(animation);
    animation.promise.then(() => this._animations.splice(this._animations.indexOf(animation), 1));
    return animation.promise;
  }
}

//LAYOUT
// 1) Mark all renderables as untouched
// 2) Layout renderables
// 3) Collect all renderables that have been set (context.set) (later using reflection)
// 4) Add unparented and set renderables to the scene (addChild)
// 5) Remove unset and parented renderables from the scene (removeChild) (only when not in an animation)

//SCROLLING
// 1) Particle (scroll-particle) (two-dimensional?)
// 2) Boundary detection
// 3) Gesture handling
// 4) getVisibleItem
// 5) ensureVisible
// 6) navigateTo
// 7) Alignment
// 8) Direction
// 9) Pagination
// 10) Overscoll on/off
// 11) Emit events (scrollstart, scrollend, pagechange)
