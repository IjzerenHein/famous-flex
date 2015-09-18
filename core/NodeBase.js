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
import Animation from '../core/Animation';
import {GestureHandler} from 'famous/components';
import NodeRect from './NodeRect';

export default class NodeBase extends Node {
  constructor(options) {
    super();
    this._rect = new NodeRect(this);
    this.setOptions(options);
  }

  on(event, callback) {
    this._gestureHandler = this._gestureHandler || new GestureHandler(this);
    this._gestureHandler.on(event, callback);
  }

  /**
   * @param {Object} options Configuration options.
   * @param {Array.String} [options.classes] Initial css-classes.
   * @param {Bool} [options.animated] Enables or disables animations for the control.
   * @param {Number|String|Array} [options.padding] Sets the internal padding for the control.
   * @param {Array} [options.intrinsicsize] Sets the intrinsic-size of the control.
   */
  setOptions(options, defaults) {
    if (defaults) {
      for (var key in defaults) {
        //if (!Object.getOwnPropertyDescriptor(this, key)) {
        //console.warn('Property "' + key + '" specified in defaults, but not implemented by class');
        //}
        this[key] = defaults[key];
      }
    }
    if (options) {
      for (var key in options) {
        //if (!Object.getOwnPropertyDescriptor(this, key)) {
        //console.warn('option "' + key + '" specified, but not supported by class: ');
        //}
        this[key] = options[key];
      }
    }
  }

  get rect() {
    return this._rect;
  }

  set rect(rect) {
    this._rect.set(rect);
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

  animate(curve, duration, collectFn) {
    // TODO, couple to requestUpdate of this node.
    return Animation.start(curve, duration, collectFn);
  }
}
