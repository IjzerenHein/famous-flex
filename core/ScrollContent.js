import Animation from '../animation/Animation';
import GroupNode from '../engine/GroupNode';
import Point from './Point';
import Rect from './Rect';
import LayoutContext from './LayoutContext';

const defaults = {
  // TODO
};

const LayoutState = {
  NONE: undefined,
  MARKED_FOR_REMOVAL: 1,
  INLAYOUT: 2,
};

export default class ScrollContent extends GroupNode {
  constructor(options) {
    super();
    this._options = options;
    this._options.layoutOptions = {};
    this._parentRect = new Rect();
    this._sceneRect = new Rect();
    this._scrollOffset = new Point();
    this._scrollRect = new Rect();
    this._scrollRect.parent = this._parentRect;
    this._context = new LayoutContext(this, this._options.nodes);
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

   onLayout() {
    /*if (this._animations) {
      for (var i = 0; i < this._animations.length; i++) {
        this._animations[i].state = LayoutAnimation.State.PRELAYOUT;
      }
    }*/

    //console.log('layout: ', this.rect.toString());
    //this._layout(this.rect);

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
    this._layout(rect);
    this._updateScene();
    this._measure(rect);

    //console.log('result: ', rect);
  }

  _layout(rect) {
    this._scrollRect.parent.width = rect.width;
    this._scrollRect.parent.height = rect.height;
    this._scrollRect.x = -rect.width;
    this._scrollRect.y = -rect.height;
    this._scrollRect.width = rect.width * 3;
    this._scrollRect.height = rect.height * 3;
    this._scrollOffset.x = rect.x;
    this._scrollOffset.y = rect.y;
    const dirProp = this._options.direction ? 'y' : 'x';
    this._context._prepareForLayout(this._scrollRect, this._scrollOffset, this._options);

    for (let i = 0; i < this._layoutNodes.length; i++) {
      this._layoutNodes[i]._layoutState = LayoutState.MARKED_FOR_REMOVAL;
    }

    Animation.intercept(() => this._options.layout(this._context, this._options.layoutOptions), (object, property, newValue) => {
      const node = object.node;
      if ((property === dirProp) && node && (node._nodeCollection === this._options.nodes) && (node.rect === object)) {
        object[property] = newValue - this._scrollOffset[dirProp];
        if (node._layoutState === LayoutState.NONE) this._layoutNodes.push(node);
        node._layoutState = LayoutState.INLAYOUT;
        return true;
      }
    });
  }

  _measure(rect) {
    const dir = this._options.direction;
    const start = dir ? rect.y : rect.x;
    rect.height = 0;
    rect.width = 0;
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
    const dir = this._options.direction;
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
              console.log('adding to scene');
              this.addChild(node);
            }
          } else if (node.getParent()) {
            console.log('removing from scene #1');
            this.removeChild(node);
          }
          i++;
          break;
        case LayoutState.MARKED_FOR_REMOVAL:
          if (node.getParent()) {
            console.log('removing from scene #2');
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
