/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author Hein Rutjes (IjzerenHein)
 * @license MIT
 * copyright Hein Rutjes, 2015
 */

import Surface from 'famous/core/Surface';
import BaseNode from '../core/BaseNode';
import Classes from '../core/Classes';
import Style from '../core/Style';
import {assert} from '../utils';

export default class DOMNode extends BaseNode {

  /*
  getOpacity()
  setOpacity()
  getParent()
  */

  constructor(options) {
    super();
    this._domSurface = new Surface();
    this.addChild(this._domSurface);
    this.setOptions(options);
  }

  addChild(child) {
    assert(!this._children, 'addChild is not supported on DOMNode\'s');
    this._children = [child];
    this._resultSpec.target.push({});
  }

  removeChild() {
    assert(false, 'removeChild is not supported on DOMNode\'s');
  }

  /*get surface() {
    return this._domSurface;
  }*/

  get innerHTML() {
    return this._domSurface.getContent();
  }

  set innerHTML(value) {
    this._domSurface.setContent(value);
  }

  get style() {
    this._style = this._style || new Style(this);
    return this._style;
  }

  set style(options) {
    this._style = this._style || new Style(this);
    this.style.setOptions(options);
  }

  onSetStyle(style, value) {
    const properties = {};
    properties[style] = value;
    this._domSurface.setProperties(properties);
  }

  get attributes() {
    // TODO PROPERLY
    return {};
  }

  set attributes(options) {
    // TODO PROPERLY
    /*for (var key in options) {
      this.el.setAttribute(key, options[key]);
    }*/
  }

  onClasses(add, remove) {
    if (add) {
      this._domSurface.addClass(add);
    }
    if (remove) {
      this._domSurface.removeClass(remove);
    }
  }

  get classes() {
    this._classes = this._classes || new Classes(this);
    return this._classes;
  }

  set classes(values) {
    this._classes = this._classes || new Classes(this);
    this.classes.add(values);
  }
}
