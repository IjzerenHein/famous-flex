import Animation from '../animation/Animation';
import GroupNode from '../engine/GroupNode';
import Point from '../core/Point';
import Rect from '../core/Rect';
import LayoutContext from '../core/LayoutContext';

const LayoutState = {
  NONE: undefined,
  MARKED_FOR_REMOVAL: 1,
  INLAYOUT: 2,
};

class ContentRect {
  constructor(rect) {
    this._rect = rect;
    this._x = rect.x;
    this._y = rect.y;
    this._z = rect.z;
    this._width = rect.width;
    this._height = rect.height;
  }

  set(rect) {
    this._x = rect.x;
    this._y = rect.y;
    this._z = rect.z;
    this._width = rect.width;
    this._height = rect.height;
    this._rect.x = this._x;
    this._rect.y = this._y;
    this._rect.z = this._z;
    this._rect.width = this._width;
    this._rect.height = this._height;
    this.onChange('rect');
  }

  get x() {
    return this._x;
  }

  set x(value) {
    this._x = value;
    this._rect.x = x;
    this.onChange('x');
  }

  get y() {
    return this._y;
  }

  set x(value) {
    this._y = value;
    this._rect.y = y;
    this.onChange('y');
  }

  get z() {
    return this._z;
  }

  set z(value) {
    this._z = value;
    this._rect.z = z;
    this.onChange('z');
  }

  get width() {
    return this._width;
  }

  set width(value) {
    this._width = value;
    this._rect.width = value;
    this.onChange('width');
  }

  get height() {
    return this._height;
  }

  set height(value) {
    this._height = value;
    this._rect.height = value;
    this.onChange('height');
  }

  onChange() {
    // override to implement
  }
}

export default class ListViewContent extends GroupNode {
  constructor(node) {
    super();
    this._contentRect = new ContentRect(this._rect);
    this._contentRect.onChange = () => this.requestLayout(true);
    this._scrollNode = node;
    this._layoutOptions = {};
    this._parentRect = new Rect();
    this._sceneRect = new Rect();
    this._scrollOffset = new Point();
    this._scrollRect = new Rect();
    this._scrollRect.parent = this._parentRect;
    this._context = new LayoutContext(this, this._scrollNode._nodes);
    this._updateLayout = this._updateLayout || this.registerUpdate(() => this.onLayout(), true);
    this._layoutNodes = [];
  }

  requestLayout(immediate) {
    if (immediate) {
      this.onLayout();
    } else {
      this._updateLayout.request();
    }
  }

  get rect() {
    return this._contentRect;
  }

  set rect(value) {
    this._contentRect.set(value);
  }

  onLayout() {

    //console.log('layout: ', this.rect.toString());
    this._layout(this._contentRect);
    this._updateScene();

    /*if (this._animations) {
      for (var i = 0; i < this._animations.length; i++) {
        this._animations[i].state = LayoutAnimation.State.PRELAYOUT;
      }
    }*/
    /*if (this._animations) {
      for (var i = 0; i < this._animations.length; i++) {
        this._animations[i].state = LayoutAnimation.State.POSTLAYOUT;
      }
    }*/
  }

  /**
   * ==> in
   * parent.x = 0
   * parent.y = 0
   * parent.width = viewport width
   * parent.height = viewport height
   * rect.x = offset x
   * rect.y = offset y
   * <== out
   * rect.x = bound left
   * rect.y = bound top
   * rect.width = content width
   * rect.height = content height
   */
  measure(rect) {
    //console.log('measure: ' + rect.y);
    this._parentRect.width = rect.parent.width;
    this._parentRect.height = rect.parent.height;
    this._measure(rect);

    //console.log('measure result: ', rect);
  }

  _layout(rect) {
    this._scrollRect.parent.width = this._parentRect.width;
    this._scrollRect.parent.height = this._parentRect.height;
    this._scrollRect.x = -this._parentRect.width;
    this._scrollRect.y = -this._parentRect.height;
    this._scrollRect.width = this._parentRect.width * 3;
    this._scrollRect.height = this._parentRect.height * 3;
    this._scrollOffset.x = rect.x;
    this._scrollOffset.y = rect.y;
    const dirProp = this._scrollNode._direction ? 'y' : 'x';
    this._context._prepareForLayout(this._scrollRect, this._scrollOffset, this._scrollNode);

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

  _measure(rect) {
    const dir = this._scrollNode._direction;
    const start = dir ? rect.y : rect.x;
    if (dir) {
      rect.height = 0;
    } else {
      rect.width = 0;
    }
    let first;
    for (let i = 0; i < this._layoutNodes.length; i++) {
      const node = this._layoutNodes[i];
      if (node._layoutState === LayoutState.INLAYOUT) {
        if (!first) {
          first = true;
          rect.set(node.rect);
        }
        if (dir) {
          rect.y = Math.min(rect.y, node.rect.y);
          rect.height = (node.rect.y + node.rect.height) - rect.y;
        } else {
          rect.x = Math.min(rect.x, node.rect.x);
          rect.width = (node.rect.x + node.rect.width) - rect.x;
        }
      }
    }
    if (dir) {
      rect.y += start;
    } else {
      rect.x += start;
    }
  }

  _normalize() {
    // TODO
  }

  _updateScene() {

    // for now, just add all layed out nodes to the scene,
    // in the future we may want to optimize this, keep nodes in the scene longer
    // to remove animations can execute (ref-count?).
    let i = 0;
    let n = this._layoutNodes.length;
    const dir = this._scrollNode._direction;
    const sceneRect = this._sceneRect;
    sceneRect.x = this.rect.x - this._parentRect.width;
    sceneRect.y = -this._parentRect.height - this.rect.y;
    sceneRect.width = this._parentRect.width * 3;
    sceneRect.height = this._parentRect.height * 3;
    while (i < n) {
      const node = this._layoutNodes[i];
      switch (node._layoutState) {
        case LayoutState.INLAYOUT:
          if (sceneRect.intersectsWith(node.rect)) {
            if (!node.getParent()) {
              //console.log('adding to scene');
              this.addChild(node);
            }
          } else if (node.getParent()) {
            //console.log('removing from scene #1');
            this.removeChild(node);
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
}
