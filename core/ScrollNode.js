import EngineScrollNode from '../engine/ScrollNode';
import Rect from './Rect';
import Size from './Size';
import Point from './Point';
import Particle from '../animation/Particle';
import {assert} from '../utils';

const defaults = {
  enabled: true,
  overscroll: [0.5, 0.5],
  direction: undefined,
  alignment: [0.5, 0.5]
};

export default class ScrollNode extends EngineScrollNode {
  constructor(options) {
    super();
    this._direction = 1;
    this._alignment = new Point();
    this._alignment.onChange = () => this.requestLayout();
    this._contentRect = new Rect();
    this._contentRect.parent = new Rect();
    this._contentOffset = new Point();

    //this._contentOffset.onChange = () => this._onSetContentOffset();
    this._overscroll = new Point();
    this._overscroll.onChange = () => this.requestLayout();
    this._updateLayout = this._updateLayout || this.registerUpdate(() => this.onLayout(), true);
    this._particle = new Particle(this);
    this._particle.onChange = () => this.requestLayout();
    this._setupDragListeners();
    this.setOptions(defaults, options);
  }

  _setupDragListeners() {
    let start;
    let startY;
    this.on('drag', (event) => {
      if (this._enabled) {
        const dir = this._direction;
        if (event.status === 'start') {
          this._dragging = true;
          start = this._particle.value;
          this._particle.endValue = undefined;
          if (dir === undefined) {
            startY = this._particleY.value;
            this._particleY.endValue = undefined;
          }
        } else if (event.status === 'end') {
          this._dragging = false;
        }
        switch (dir) {
          case 0: // horizontal
            this._particle.value = start + event.delta.x;
            if (!this._dragging) this._particle.velocity = event.velocity.x * 1000;
            break;
          case 1: // vertical
            this._particle.value = start + event.delta.y;
            if (!this._dragging) this._particle.velocity = event.velocity.y * 1000;
            break;
          default: // both
            this._particle.value = start + event.delta.x;
            this._particleY.value = startY + event.delta.y;
            if (!this._dragging) {
              this._particle.velocity = event.velocity.x * 1000;
              this._particleY.velocity = event.velocity.y * 1000;
            }
        }
        this.requestLayout();
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

  getBound(direction, rect) {
    const align = this._alignment;
    if (!direction) {
      if (rect.width < this.rect.width) {
        return (this.rect.width * align.x) - (align.x * rect.width);
      } else if (rect.x > 0) {
        return 0;
      } else if ((rect.x + rect.width) < this.rect.width) {
        return this.rect.width - rect.width;
      }
    } else {
      if (rect.height < this.rect.height) {
        return (this.rect.height * align.y) - (align.y * rect.height);
      } else if (rect.y > 0) {
        return 0;
      } else if ((rect.y + rect.height) < this.rect.height) {
        return this.rect.height - rect.height;
      }
    }
    return undefined;
  }

  onLayout() {
    if (!this._content) return;

    // Prepare content-rect
    const dir = this._direction;
    const rect = this._contentRect;
    rect.parent.width = this.rect.width;
    rect.parent.height = this.rect.height;

    // Calculate (unbounded) x & y, based on particle value
    switch (dir) {
      case 0: rect.x = this._particle.value; rect.y = 0; rect.z = 0; break;
      case 1: rect.y = this._particle.value; rect.x = 0; rect.z = 0; break;
      default: rect.x = this._particle.value; rect.y = this._particleY.value; rect.z = 0; break;
    }

    // Measure size of content
    rect.width = rect.parent.width;
    rect.height = rect.parent.height;
    if (this._content.measure) {
      const size = this._content.measure(rect);
      rect.width = size.width;
      rect.height = size.height;
    }

    // Calculate (unbounded) x & y, based on particle value
    switch (dir) {
      case 0: rect.x = this._particle.value; rect.y = 0; rect.z = 0; break;
      case 1: rect.y = this._particle.value; rect.x = 0; rect.z = 0; break;
      default: rect.x = this._particle.value; rect.y = this._particleY.value; rect.z = 0; break;
    }

    // Calculate bounded x & y; and set spring
    const bound = this.getBound(dir || 0, rect);
    switch (dir) {
      case 0:
        if (bound !== undefined) {
          rect.x = bound + ((this._particle.value - bound) * this._overscroll.x);
          if (!this._dragging) this._particle.endValue = bound;
        }
        break;
      case 1:
        if (bound !== undefined) {
          rect.y = bound + ((this._particle.value - bound) * this._overscroll.y);
          if (!this._dragging) this._particle.endValue = bound;
        }
        break;
      default:
        const boundY = this.getBound(1, rect);
        if (bound !== undefined) {
          rect.x = bound + ((this._particle.value - bound) * this._overscroll.x);
          if (!this._dragging) this._particle.endValue = bound;
        }
        if (boundY !== undefined) {
          rect.y = boundY + ((this._particleY.value - boundY) * this._overscroll.y);
          if (!this._dragging) this._particleY.endValue = boundY;
        }
        break;
    }

    // Layout content
    this._content.rect = rect;
  }

  get content() {
    return this._content;
  }

  set content(value) {
    if (this._content !== value) {
      if (this._content) this.removeChild(this._content);
      this._content = value;
      if (this._content) this.addChild(this._content);
      this.requestLayout();
    }
  }

  get contentOffset() {
    return this._contentOffset;
  }

  set contentOffset(value) {
    this._contentOffset.set(value);
  }

  measure(rect) {
    if (this._content && this._content.measure) {
      return this._content.measure(rect);
    }
    return rect;
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(value) {
    if (this._enabled !== value) {
      this._enabled = value;
      this.requestLayout();
    }
  }

  get direction() {
    return this._direction;
  }

  set direction(value) {
    if (this._direction !== value) {
      this._direction = value;
      if ((this._direction === undefined) && !this._particleY) {
        this._particleY = new Particle(this);
        this._particleY.onChange = () => this.requestLayout();
      }
      this.requestLayout();
    }
  }

  get alignment() {
    return this._alignment;
  }

  set alignment(value) {
    this._alignment.set(value);
  }

  get overscroll() {
    return this._overscroll;
  }

  set overscroll(value) {
    this._overscroll.set(value);
  }

  /*animate(curve, duration, collectFn) {
    const animation = LayoutAnimation.start(this, curve, duration, collectFn);
    this._animations = this._animations || [];
    this._animations.push(animation);
    animation.promise.then(() => this._animations.splice(this._animations.indexOf(animation), 1));
    return animation.promise;
  }*/
}

//LAYOUT
// 1) [ ] Mark all renderables as untouched
// 2) [ ] Layout renderables
// 3) [ ] Collect all renderables that have been set (context.set) (later using reflection)
// 4) [ ] Add unparented and set renderables to the scene (addChild)
// 5) [ ] Remove unset and parented renderables from the scene (removeChild) (only when not in an animation)
// 6) [ ] Collect through reflection

//SCROLLING
// 1) [X] Particle (scroll-particle) (two-dimensional?)
// 2) [X] Boundary detection
// 3) [X] Gesture handling
// 4) [ ] getVisibleItem
// 5) [ ] ensureVisible
// 6) [ ] navigateTo
// 7) [ ] Alignment
// 8) [ ] Direction
// 9) [ ] Pagination
// 10) [ ] Overscoll on/off
// 11) [ ] Emit events (scrollstart, scrollend, pagechange)
// 12) [ ] Native scrolling

