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
import {Margins} from '../utilities';
import Animation from '../core/Animation';
import DOMNode from '../core/DOMNode';

export default class ControlBase extends Node {

  /**
   * @param {Object} options Configuration options.
   * @param {Array.String} [options.classes] Initial css-classes.
   * @param {Object} [options.styles] Initial css-styles.
   * @param {Object} [options.attributes] Initial element attributes.
   * @param {Bool} [options.animated] Enables or disables animations for the control.
   * @param {Number|String|Array} [options.padding] Sets the internal padding for the control.
   * @param {Array} [options.intrinsicsize] Sets the intrinsic-size of the control.
   */
  constructor(options) {
    super();
    this._classes = ['ff-control'];
    this._styles = {};
    this._attributes = {};
    this._sharedContentNodes = [];
    this._sharedStylesNodes = [];
    this._sharedClassesNodes = [];
    this._sharedAttrNodes = [];
    this._content = undefined;
    this._intrinsicSize = [undefined, undefined];
    this._layout = (options && options.layout) ? options.layout : () => {};
    this._comp = this.addComponent({
      onUpdate: () => this._relayout(this.getSize()),
      onSizeChange: () => this._relayout(this.getSize())
    });
    if (options) {
      if (options.padding) this.padding = options.padding;
      if (options.intrinsicSize) this.intrinsicSize = options.intrinsicSize;
      if (options.content !== undefined) this._setContent(options.content);
      if (options.classes) {
        for (let i = 0; i < options.classes.length; i++) {
          this.addClass(options.classes[i]);
        }
      }
      if (options.styles) {
        for (let style in options.styles) {
          this.setStyle(style, options.styles[style]);
        }
      }
      if (options.attributes) {
        for (let attr in options.attributes) {
          this.setAttribute(attr, options.attributes[attr]);
        }
      }
      this.animated = options.animated || false;
    }
  }

  _relayout(size) {
    const width = (this._intrinsicSize[0] !== undefined) ? this._intrinsicSize[0] : size[0];
    const height = (this._intrinsicSize[1] !== undefined) ? this._intrinsicSize[1] : size[1];
    this._layout((size[0] - width) / 2, (size[1] - height) / 2, width, height);
  }

  _createDOMNode(inherit) {
    const domNode = new DOMNode();
    if (inherit && inherit.length) {
      if (inherit.indexOf('content') >= 0) {
        this._sharedContentNodes.push(domNode);
        if (this._content !== undefined) {
          domNode.el.setContent(this._content);
        }
      }
      if (inherit.indexOf('classes') >= 0) {
        this._sharedClassesNodes.push(domNode);
        for (let i = 0; i < this._classes.length; i++) {
          domNode.addClass(this._classes[i]);
        }
      }
      if (inherit.indexOf('attributes') >= 0) {
        this._sharedAttrNodes.push(domNode);
        for (let attr in this._attributes) {
          domNode.setAttribute(attr, this._attributes[attr]);
        }
      }
      if (inherit.indexOf('styles') >= 0) {
        this._sharedStylesNodes.push(domNode);
        for (let style in this._styles) {
          domNode.setStyle(style, this._styles[style]);
        }
      }
    }
    this.addChild(domNode);
    this.reflowLayout();
    return domNode;
  }

  _removeDOMNode(node) {
    let index = this._sharedContentNodes.indexOf(node);
    if (index >= 0) {
      this._sharedContentNodes.splice(index, 1);
    }
    index = this._sharedClassesNodes.indexOf(node);
    if (index >= 0) {
      this._sharedClassesNodes.splice(index, 1);
    }
    index = this._sharedAttrNodes.indexOf(node);
    if (index >= 0) {
      this._sharedAttrNodes.splice(index, 1);
    }
    index = this._sharedStylesNodes.indexOf(node);
    if (index >= 0) {
      this._sharedStylesNodes.splice(index, 1);
    }
    this.removeChild(node);
  }

  _setLayout(layout) {
    if (layout !== this._layout) {
      this._layout = layout;
    }
  }

  reflowLayout() {
    this.requestUpdate(this._comp);
  }

  _setContent(content) {
    this._content = content;
    for (let i = 0; i < this._sharedContentNodes.length; i++) {
      this._sharedContentNodes[i].el.setContent(content);
    }
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

  get styles() {
    return this._styles;
  }

  setStyle(style, value) {
    if (this._styles[style] !== value) {
      this._styles[style] = value;
      for (let i = 0; i < this._sharedStylesNodes.length; i++) {
        this._sharedStylesNodes[i].el.setProperty(style, value);
      }
    }
  }

  get attributes() {
    return this._attributes;
  }

  setAttribute(attr, value) {
    if (this._attributes[attr] !== value) {
      this._attributes[attr] = value;
      for (let i = 0; i < this._sharedAttrNodes.length; i++) {
        this._sharedAttrNodes[i].el.setAttribute(attr, value);
      }
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
