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

export default class ControlBase extends Node {
  constructor(options) {
    super();
    this._domNodes = [];
    this._classes = ['ff-control'];
    this._styles = {};
    this._attributes = {};
    this._content = undefined;
    this._layout = (options && options.layout) ? options.layout : () => {};
    this._comp = this.addComponent({
      onUpdate: () => this._layout(this, this.getSize()),
      onSizeChange: () => this._layout(this, this.getSize())
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
      if (options.domNodes) {
        for (let i = 0; i < options.domNodes.length; i++) {
          this._addDOMNode(options.domNodes[i]);
        }
      }
    }
  }

  get domNodes() {
    return this._domNodes;
  }

  _addDOMNode(node) {
    this._domNodes.push(node);
    if (this._content !== undefined) {
      node.el.setContent(this._content);
    }
    for (let i = 0; i < this._classes.length; i++) {
      node.el.addClass(this._classes[i]);
    }
    for (let style in this._styles) {
      node.el.setProperty(style, this._styles[style]);
    }
    for (let attr in this._attributes) {
      this.el.setAttribute(attr, this._attributes[attr]);
    }
    this.addChild(node);
  }

  _removeDOMNode(domElementNode) {
    const index = this._domNodes.indexOf(domElementNode);
    if (index >= 0) {
      this._domNodes.splice(index, 1);
    }
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
    for (let i = 0; i < this._domNodes.length; i++) {
      this._domNodes[i].el.setContent(content);
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
      for (let i = 0; i < this._domNodes.length; i++) {
        this._domNodes[i].el.setProperty(style, value);
      }
    }
  }

  get attributes() {
    return this._attributes;
  }

  setAttribute(attr, value) {
    if (this._attributes[attr] !== value) {
      this._attributes[attr] = value;
      for (let i = 0; i < this._domNodes.length; i++) {
        this._domNodes[i].el.setAttribute(attr, value);
      }
    }
  }

  get classes() {
    return this._classes;
  }

  addClass(cls) {
    if (this._classes.indexOf(cls) < 0) {
      this._classes.push(cls);
      for (let i = 0; i < this._domNodes.length; i++) {
        this._domNodes[i].el.addClass(cls);
      }
    }
  }

  removeClass(cls) {
    const index = this._classes.indexOf(cls);
    if (index >= 0) {
      this._classes.splice(index, 1);
      for (let i = 0; i < this._domNodes.length; i++) {
        this._domNodes[i].el.removeClass(cls);
      }
    }
  }

  hasClass(cls) {
    return this._classes.indexOf(cls) !== -1;
  }
}
