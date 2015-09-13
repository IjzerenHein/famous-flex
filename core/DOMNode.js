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
import {DOMElement} from 'famous/dom-renderables';
import {GestureHandler} from 'famous/components';
import Animation from './Animation';
import {Color} from '../utilities';

export default class DOMNode extends Node {
    constructor(options) {
      super();
      this.setSizeMode('absolute', 'absolute');
      this._domElement = new DOMElement(this, options);
      if (options && options.styles) {
        for (var key in options.styles) {
          this._domElement.setProperty(key, options.styles[key]);
        }
      }
    }

    get el() {
      return this._domElement;
    }

    on(event, callback) {
      this._gestureHandler = this._gestureHandler || new GestureHandler(this);
      this._gestureHandler.on(event, callback);
    }

    setStyle(style, value) {
      this.el.setProperty(style, value);
      return this;
    }

    setAttribute(attr, value) {
      this.el.setAttribute(attr, value);
      return this;
    }

    addClass(cls) {
      this.el.addClass(cls);
      return this;
    }

    removeClass(cls) {
      this.el.addClass(cls);
      return this;
    }

    hasClass(cls) {
      return this.el.hasClass();
    }

    get opacity() {
      return this.getOpacity();
    }

    set opacity(value) {
      if (Animation.isCollecting) {
        Animation.collect(this, 'opacity', this.getOpacity(), value);
      } else {
        this.setOpacity(value);
      }
    }

    get width() {
      return this.getSize()[0];
    }

    set width(value) {
      this.setAbsoluteSize(value);
    }

    get height() {
      return this.getSize()[1];
    }

    set height(value) {
      this.setAbsoluteSize(undefined, value);
    }

    get left() {
      this.getPosition()[0];
    }

    set left(value) {
      this.setPosition(value, undefined, undefined);
    }

    get top() {
      this.getPosition()[1];
    }

    set top(value) {
      this.setPosition(undefined, value, undefined);
    }

    get zIndex() {
      this.getPosition()[2];
    }

    set zIndex(value) {
      this.setPosition(undefined, undefined, value);
    }

    setRect(left, top, width, height) {
      this.setPosition(left, top);
      this.setAbsoluteSize(width, height);
    }

    get color() {
      return this._color;
    }

    set color(color) {
      if (this._color && Animation.isCollecting) {
        Animation.collect(this, 'color', this._color, Color.parse(color));
      } else {
        this._color = Color.parse(color);
        this.setStyle('color', Array.isArray(color) ? Color.formatRGBA(color) : color);
      }
    }

    get backgroundColor() {
      return this._color;
    }

    set backgroundColor(color) {
      if (this._backgroundColor && Animation.isCollecting) {
        Animation.collect(this, 'backgroundColor', this._backgroundColor, Color.parse(color));
      } else {
        this._backgroundColor = Color.parse(color);
        this.setStyle('backgroundColor', Array.isArray(color) ? Color.formatRGBA(color) : color);
      }
    }

    get borderColor() {
      return this._borderColor;
    }

    set borderColor(color) {
      if (this._borderColor && Animation.isCollecting) {
        Animation.collect(this, 'borderColor', this._borderColor, Color.parse(color));
      } else {
        this._borderColor = Color.parse(color);
        this.setStyle('borderColor', Array.isArray(color) ? Color.formatRGBA(color) : color);
      }
    }
}
