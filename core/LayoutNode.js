import BaseNode from './BaseNode';
import Animation from '../animation/Animation';
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
    super();
    this._layoutRect = new Rect();
    this._layoutRect.parent = this.rect;
    this._updateLayout = this.registerUpdate(() => this.requestLayout(true), true);
    this._nodes = new NodeCollection(this);
    this._context = new LayoutContext(this, this._nodes);
    this._layoutNodes = [];
    this.setOptions(options);
  }

  requestLayout(immediate) {
    if (immediate) {
      const rect = this._layoutRect;
      rect.x = 0;
      rect.y = 0;
      rect.z = 0;
      rect.width = rect.parent.width;
      rect.height = rect.parent.height;
      this.onLayout(rect);
    } else {
      this._updateLayout.request();
    }
  }

  onLayout(rect) {

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

    this._context._prepareForLayout(rect, undefined, this);

    for (let i = 0; i < this._layoutNodes.length; i++) {
      this._layoutNodes[i]._layoutState = LayoutState.MARKED_FOR_REMOVAL;
    }

    Animation.intercept(() => this._layout(this._context, this._layoutOptions), (object, property, newValue) => {
      const node = object.node;
      if ((property === 'x') && node && (node._nodeCollection === this._nodes) && (node.rect === object)) {
        if (node._layoutState === LayoutState.NONE) this._layoutNodes.push(node);
        node._layoutState = LayoutState.INLAYOUT;
      }
    });

    this._updateScene();
  }

  _updateScene() {
    let i = 0;
    let n = this._layoutNodes.length;
    while (i < n) {
      const node = this._layoutNodes[i];
      switch (node._layoutState) {
        case LayoutState.INLAYOUT:
          if (!node.getParent()) {
            //console.log('adding to scene');
            this.addChild(node);
          }
          i++;
          break;
        case LayoutState.MARKED_FOR_REMOVAL:
          if (node.getParent()) {
            //console.log('removing from scene #2');
            node._layoutState = undefined;
            this.removeChild(node);
          }
          this._layoutNodes.splice(i, 1);
          n = this._layoutNodes.length;
          break;
        default:
          i++;
      }
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

  /*animate(curve, duration, collectFn) {
    const animation = Animation.start(this, curve, duration, collectFn);
    this._animations = this._animations || [];
    this._animations.push(animation);
    animation.promise.then(() => this._animations.splice(this._animations.indexOf(animation), 1));
    return animation.promise;
  }*/
}
