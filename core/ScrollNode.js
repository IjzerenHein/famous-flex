import EngineScrollNode from '../engine/ScrollNode';
import Rect from './Rect';
import LayoutNodes from './LayoutNodes';
import LayoutContext from './LayoutContext';
import listLayout from '../layouts/listLayout';
import Particle from '../animation/Particle';
import {assert} from '../utils';

const defaults = {
  layout: listLayout,
  enabled: true,
  paginated: false,
  overscroll: true,
  direction: 0,
  alignment: 0
};

export default class ScrollNode extends EngineScrollNode {
  constructor(options) {
    super();
    this._options = {};
    this._layoutRect = new Rect();
    this._layoutRect.parent = new Rect();
    this._nodes = new LayoutNodes(this);
    this._context = new LayoutContext(this._group, this._nodes);
    this._particle = new Particle(this);
    this._particle.onChange = () => this.requestLayout();
    this._setupDragListeners();
    this.setOptions(defaults, options);
  }

  _setupDragListeners() {
    let startX;
    let startY;
    this.on('drag', (event) => {
      if (this._options.enabled) {
        const dir = this._options.direction;
        if (event.status === 'start') {
          startX = this._particle.value.x;
          startY = this._particle.value.y;
        }
        this._particle.value.x = (dir !== 1) ? (startX + event.delta.x) : 0;
        this._particle.value.y = (dir !== 0) ? (startY + event.delta.y) : 0;
        if (event.status === 'end') {
          this._particle.endValue.x = (dir !== 1) ? undefined : 0;
          this._particle.endValue.y = (dir !== 0) ? undefined : 0;
          this._particle.velocity.x = (dir !== 1) ? (event.velocity.x * 100) : 0;
          this._particle.velocity.y = (dir !== 0) ? (event.velocity.y * 100) : 0;
        } else {
          this._particle.endValue.x = (dir !== 1) ? (startX + event.delta.x) : 0;
          this._particle.endValue.y = (dir !== 0) ? (startY + event.delta.y) : 0;
        }
        this.requestLayout();
      }
    });
  }

  get nodes() {
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
  }

  measure(size) {
    // TODO
    return size;
  }

  get enabled() {
    return this._options.enabled;
  }

  set enabled(value) {
    if (this._options.enabled !== value) {
      this._options.enabled = value;
      this.requestLayout();
    }
  }

  get direction() {
    return this._options.direction;
  }

  set direction(value) {
    if (this._options.direction !== value) {
      this._options.direction = value;
      this.requestLayout();
    }
  }

  get alignment() {
    return this._options.alignment;
  }

  set alignment(value) {
    if (this._options.alignment !== value) {
      this._options.alignment = value;
      this.requestLayout();
    }
  }

  get paginated() {
    return this._options.paginated;
  }

  set paginated(value) {
    if (this._options.paginated !== value) {
      this._options.paginated = value;
      this.requestLayout();
    }
  }

  get overscroll() {
    return this._options.overscroll;
  }

  set overscroll(value) {
    if (this._options.overscroll !== value) {
      this._options.overscroll = value;
      this.requestLayout();
    }
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
// 6) Collect through reflection

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
// 12) Native scrolling

