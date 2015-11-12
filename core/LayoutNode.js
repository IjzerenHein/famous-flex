import BaseNode from './BaseNode';
import LayoutAnimation from '../animation/LayoutAnimation';
import Rect from './Rect';
import Size from './Size';
import NodeCollection from './NodeCollection';
import LayoutContext from './LayoutContext';

const LayoutState = {
  NONE: undefined,
  MARKED_FOR_REMOVAL: 1,
  INLAYOUT: 2,
};

export default class LayoutNode extends BaseNode {
  constructor(options) {
    super(options);
    this._updateLayout = this.registerUpdate(() => this.onLayout(), true);
    this._nodes = new NodeCollection(this);
    this._context = new LayoutContext(this, this._nodes);
    this._layoutRect = new Rect();
    this._layoutRect.parent = new Rect();
    this._layoutNodes = [];
  }

  onLayout() {
    const rect = this._layoutRect;
    rect.parent.width = this.rect.width;
    rect.parent.height = this.rect.height;
    rect.x = 0;
    rect.y = 0;
    rect.z = 0;
    rect.width = rect.parent.width;
    rect.height = rect.parent.height;

    /*if (this._animations) {
      for (var i = 0; i < this._animations.length; i++) {
        this._animations[i].state = LayoutAnimation.State.PRELAYOUT;
      }
    }
    this._layout(rect, this._layoutOptions);
    if (this._animations) {
      for (var i = 0; i < this._animations.length; i++) {
        this._animations[i].state = LayoutAnimation.State.POSTLAYOUT;
      }
    }*/

    this._context.prepareForLayout(this._layoutRect, undefined, this);

    for (let i = 0; i < this._layoutNodes.length; i++) {
      this._layoutNodes[i]._layoutState = LayoutState.MARKED_FOR_REMOVAL;
    }

    Animation.intercept(() => this._scrollNode._layout(this._context, this._scrollNode._layoutOptions), (object, property, newValue) => {
      const node = object.node;
      if ((property === dirProp) && node && (node._nodeCollection === this._scrollNode._nodes) && (node.rect === object)) {
        object[property] = newValue - this._scrollOffset[dirProp];
        if (node._layoutState === LayoutState.NONE) this._layoutNodes.push(node);
        node._layoutState = LayoutState.INLAYOUT;
        return true;
      }
    });
  }

  requestLayout(immediate) {
    if (immediate) {
      this.onLayout();
    } else {
      this._updateLayout.request();
    }
  }

  get nodes() {
    return this._nodes;
  }

  set nodes(value) {
    this._nodes.set(value);
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
      return this._configuredSize.measure(rect);
    }
    return rect;
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
