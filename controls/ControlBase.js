/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author Hein Rutjes (IjzerenHein)
 * @license MIT
 * copyright Hein Rutjes, 2015
 */

import LayoutNode from '../core/LayoutNode';

const defaults = {
  classes: ['ff-control']
};

export default class ControlBase extends LayoutNode {
  constructor(options) {
    super();
    this.setOptions(options, defaults);
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
    this._lastAnimation = this.animate(this.animationCurve, this.animationDuration, collectFn);
  }
}
