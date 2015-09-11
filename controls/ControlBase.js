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
import Margins from './Margins';
import Animation from '../core/Animation';
import DOMNode from '../core/DOMNode';

export default class ControlBase extends Node {
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
    this._layout = (options && options.layout) ? options.layout : () => {};
    this._comp = this.addComponent({
      onUpdate: () => this._layout(this.getSize()),
      onSizeChange: () => this._layout(this.getSize())
    });
    if (options) {
      if (options.margins) {
        this._margins = new Margins(options.margins);
      }
      if (options.content !== undefined) {
        this._setContent(options.content);
      }
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

  _reflowLayout() {
    this.requestUpdate(this._comp);
  }

  _setContent(content) {
    this._content = content;
    for (let i = 0; i < this._sharedContentNodes.length; i++) {
      this._sharedContentNodes[i].el.setContent(content);
    }
  }

  get margins() {
    this._margins = this._margins || new Margins();
    return this._margins;
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

  get animated() {
    return this._animated;
  }

  set animated(value) {
    this._animated = value;
  }

  _animate(collectFn) {
    return Animation.start(this.animationDuration, this.animationCurve, collectFn);
  }
}
