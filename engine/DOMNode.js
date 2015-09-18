/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author Hein Rutjes (IjzerenHein)
 * @license MIT
 * copyright Hein Rutjes, 2015
 */

import {DOMElement} from 'famous/dom-renderables';
import BaseNode from '../core/BaseNode';
import Animation from '../animation/Animation';
import Classes from '../core/Classes';
import Styles from './Styles';
import {Color} from '../utils';

export default class DOMNode extends BaseNode {
  constructor(options) {
    super();
    this._domElement = new DOMElement(this);
    this.setOptions(options);
  }

  get el() {
    return this._domElement;
  }

  get innerHTML() {
    return this.el.getContent();
  }

  set innerHTML(value) {
    this.el.setContent(value);
  }

  get styles() {
    this._styles = this._styles || new Styles(this.el);
    return this._styles;
  }

  set styles(value) {
    this.styles.setAll(value);
  }

  // TODO ATTRIBUTES ?

  onClasses(add, remove) {
    if (add) {
      this.el.addClass(add);
    }
    if (remove) {
      this.el.removeClass(remove);
    }
  }

  get classes() {
    this._classes = this._classes || new Classes(this);
    return this._classes;
  }

  set classes(values) {
    this.classes.add(values);
  }
}
