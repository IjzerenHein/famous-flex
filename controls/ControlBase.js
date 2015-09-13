/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author Hein Rutjes (IjzerenHein)
 * @license MIT
 * copyright Hein Rutjes, 2015
 */

import {Node} from 'famous/core';
import {Margins, assert} from '../utilities';
import Animation from '../core/Animation';
import DOMNode from '../core/DOMNode';

export default class ControlBase extends Node {

  constructor() {
    super();
    this._classes = ['ff-control'];
    this._sharedClassesNodes = [];
    this._intrinsicSize = [undefined, undefined];
    this._spec = {};
    this._comp = this.addComponent({
      onUpdate: () => this._relayout(this.getSize()),
      onSizeChange: () => this._relayout(this.getSize())
    });
  }

  /**
   * @param {Object} options Configuration options.
   * @param {Array.String} [options.classes] Initial css-classes.
   * @param {Bool} [options.animated] Enables or disables animations for the control.
   * @param {Number|String|Array} [options.padding] Sets the internal padding for the control.
   * @param {Array} [options.intrinsicsize] Sets the intrinsic-size of the control.
   */
  _setProperties(options, defaults) {
    if (defaults) {
      for (var key in defaults) {
        if (!options || (options[key] === undefined)) {
          // TODO
          //if (!Object.getOwnPropertyDescriptor(this, key)) {
          //console.warn('Property "' + key + '" specified in defaults, but not implemented by class');
          //}
          this[key] = defaults[key];
        }
      }
    }
    if (options) {
      for (var key in options) {
        if (key === 'classes') {
          for (let i = 0; i < options.classes.length; i++) {
            this.addClass(options.classes[i]);
          }
        } else if (!Object.getOwnPropertyDescriptor(this, key)) {
          //console.warn('option "' + key + '" specified, but not supported by class: ');
          this[key] = options[key];
        } else {
          this[key] = options[key];
        }
      }
    }
  }

  _relayout(size) {
    const spec = this._spec;
    spec.width = (this._intrinsicSize[0] !== undefined) ? this._intrinsicSize[0] : size[0];
    spec.height = (this._intrinsicSize[1] !== undefined) ? this._intrinsicSize[1] : size[1];
    spec.x = (size[0] - spec.width) / 2;
    spec.y = (size[1] - spec.height) / 2;
    spec.z = 0;
    this._layout(this._spec);
  }

  _applyPadding(rect) {
    return this._padding ? Margins.apply(this._padding, rect) : rect;
  }

  _createDOMNode(classes) {
    const domNode = new DOMNode();
    this._sharedClassesNodes.push(domNode);
    for (let i = 0; i < classes.length; i++) {
      domNode.addClass(classes[i]);
    }
    for (let i = 0; i < this._classes.length; i++) {
      domNode.addClass(this._classes[i]);
    }
    this.addChild(domNode);
    this.reflowLayout();
    return domNode;
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
      this.reflowLayout();
    }
  }

  reflowLayout() {
    this.requestUpdate(this._comp);
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
      this.reflowLayout();
    }
  }

  get classes() {
    return this._classes;
  }

  addClass(cls) {
    if (this._classes.indexOf(cls) < 0) {
      this._classes.push(cls);
      for (let i = 0; i < this._sharedClassesNodes.length; i++) {
        this._sharedClassesNodes[i].el.addClass(cls);
      }
    }
  }

  removeClass(cls) {
    const index = this._classes.indexOf(cls);
    if (index >= 0) {
      this._classes.splice(index, 1);
      for (let i = 0; i < this._sharedClassesNodes.length; i++) {
        this._sharedClassesNodes[i].el.removeClass(cls);
      }
    }
  }

  hasClass(cls) {
    return this._classes.indexOf(cls) !== -1;
  }

  get intrinsicSize() {
    return this._intrinsicSize;
  }

  set intrinsicSize(value) {
    if ((this._intrinsicSize[0] !== value[0]) || (this._intrinsicSize[1] !== value[1])) {
      this._intrinsicSize[0] = value[0];
      this._intrinsicSize[1] = value[1];
      this.reflowLayout();
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
