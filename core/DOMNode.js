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

export default class DOMNode extends Node {
    constructor(options) {
      super();
      this._domElement = new DOMElement(this, options);
    }

    get el() {
      return this._domElement;
    }

    on(event, callback) {
      this._gestureHandler = this._gestureHandler || new GestureHandler(this);
      this._gestureHandler.on(event, callback);
    }
}
