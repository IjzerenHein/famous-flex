import GroupNode from '../engine/GroupNode';
import Point from './Point';

const defaults = {
  // TODO
};

export default class ScrollContent extends GroupNode {
  constructor() {
    super();
    this._direction = 1;
    this._alignment = new Point();
    this._alignment.onChange = () => this.requestLayout();
  }

  measure(rect) {

  }

  get direction() {
    this._direction;
  }

  set direction(value) {
    if (this._direction !== value) {
      this._direction = value;
      this.requestLayout();
    }
  }

  get alignment() {
    this._alignment;
  }

  set alignment(value) {
    this._alignment.set(value);
  }
}

/*
const defaults = {
  layout: listLayout,
  enabled: true,
  paginated: false,
  overscroll: true,
  direction: 0,
  alignment: 0
};

this._layoutRect = new Rect();
    this._layoutRect.parent = new Rect();
    this._nodes = new LayoutNodes(this);
    this._context = new LayoutContext(this._group, this._nodes);
*/
  /*get nodes() {
    return this._nodes;
  }

  set nodes(value) {
    this._nodes.set(value);
  }

  onLayout() {
    this.group.rect.width = this.rect.width;
    this.group.rect.height = this.rect.height;

    //this.group.rect.y = this._particle.value.y;

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

    //console.log('layout!');
    this._context._prepareForLayout(rect, this._options, this._particle.value);
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
  }*/
