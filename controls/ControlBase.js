/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author Hein Rutjes (IjzerenHein)
 * @license MIT
 * copyright Hein Rutjes, 2015
 */

import NodeBase from '../core/NodeBase';
import {Margins, assert} from '../utilities';
import Animation from '../core/Animation';
import Classes from '../core/Classes';
import DOMNode from '../core/DOMNode';
import Size from '../core/Size';
import Rect from '../core/Rect';

const defaults = {
  classes: ['ff-control']
};

export default class ControlBase extends NodeBase {
  constructor(options) {
    super();
    this._sharedClassesNodes = [];
    this._comp = this.addComponent({
      onUpdate: (time) => this.processUpdate(time),
      onSizeChange: () => this.requestLayout(true)
    });
    this.setOptions(options, defaults);
  }

  onClasses(add, remove) {
    if (add) {
      for (let j = 0; j < this._sharedClassesNodes.length; j++) {
        this._sharedClassesNodes[j].el.addClass(add);
      }
    }
    if (remove) {
      for (let j = 0; j < this._sharedClassesNodes.length; j++) {
        this._sharedClassesNodes[j].el.removeClass(remove);
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
    if (child.classes) {
      for (let i = 0; i < this._classes.length; i++) {
        child.classes.add(this._classes.getAt(i));
      }
    }
    this.requestLayout();
    return child;
  }

  _removeDOMNode(node) {
    let index = this._sharedClassesNodes.indexOf(node);
    if (index >= 0) {
      this._sharedClassesNodes.splice(index, 1);
    }
    this.removeChild(node);
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

  processUpdate(time) {
    this._updateRequested = false;
    if (this._requestedUpdates) {
      const requestedUpdates = this._requestedUpdates;
      this._requestedUpdates = undefined;
      let comp = requestedUpdates.shift();
      while (comp) {
        comp.onUpdate(time);
        comp = requestedUpdates.shift();
      }
    }
    if (this._layoutRequested) {
      this._layoutRequested = false;
      this.requestLayout(true);
    }
  }

  requestUpdate(comp) {
    if (comp === this._comp) {
      this._layoutRequested = true;
    } else {
      this._requestedUpdates = this._requestedUpdates || [];
      this._requestedUpdates.push(comp);
    }
    if (!this._updateRequested) {
      this._updateRequested = true;
      super.requestUpdate(this._comp);
    }
  }

  requestLayout(immediate) {
    if (immediate) {
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
      if (this._intrinsicSize) {
        this._intrinsicSize.resolve(rect);
        rect.center();
      } else {
        rect.width = rect.parent.width;
        rect.height = rect.parent.height;
      }
      this._layout(rect);
    } else if (!this._layoutRequested) {
      this.requestUpdate(this._comp);
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

  get animated() {
    return this._animated;
  }

  set animated(value) {
    this._animated = value;
  }

  get animationDuration() {
    return this._animationDuration;
  }

  set animationDuration(value) {
    this._animationDuration = value;
  }

  get animationCurve() {
    return this._animationCurve;
  }

  set animationCurve(value) {
    this._animationCurve = value;
  }

  _animate(collectFn) {
    if (this._lastAnimation) this._lastAnimation.cancel();
    this._lastAnimation = Animation.start(this.animationCurve, this.animationDuration, collectFn);
  }
}
