import BaseNode from './BaseNode';
import Rect from './Rect';
import ShowEffect from './ShowEffect';
import {nonNull} from '../utils';

const resolved = Promise.resolve(true);

const defaults = {
  effect: null, // none
  curve: 'easeIn',
  duration: 400
};

export default class ShowAnimation extends BaseNode {
  constructor(options) {
    super();
    this._lastPromise = resolved;
    this._clientRect = new Rect();
    this.registerUpdate(() => this.onResize(), true);
    this.setOptions(defaults, options);
  }

  _showNode(node, showEffect, curve, duration, hideEffect) {
    if (node === this._visibleNode) {
      return this._lastPromise;
    }

    showEffect = nonNull(showEffect, this._showEffect);
    curve = curve || this._curve;
    duration = duration || this._duration;
    hideEffect = nonNull(hideEffect, showEffect, this._hideEffect, this._showEffect);

    const clientRect = this._clientRect;
    clientRect.width = this.rect.width;
    clientRect.height = this.rect.height;

    let promise;
    if (this._visibleNode) {
      if (hideEffect) {
        hideEffect = (typeof hideEffect === 'string') ? ShowEffect[hideEffect] : hideEffect;
        const hideNode = this._visibleNode;
        promise = this.animate(curve, duration, () => {
          hideEffect(hideNode, clientRect, true);
        });
        promise.then(() => this.debounce(() => this.removeChild(hideNode)));
      } else {
        this.removeChild(this._visibleNode);
      }
    }
    this._visibleNode = node;
    if (node) {
      this.addChild(node);
      console.log(clientRect);
      node.rect = clientRect;
      console.log(node.rect.toString());
      if (showEffect) {
        showEffect = (typeof showEffect === 'string') ? ShowEffect[showEffect] : showEffect;
        showEffect(node, clientRect);
        promise = this.animate(curve, duration, () => {
          node.rect = clientRect;
          node.opacity = 1;
        });
      }
    }

    this._lastPromise = promise || resolved;
    return this._lastPromise;
  }

  onResize() {
    if (this._visibleNode) {
      this._clientRect.width = this.rect.width;
      this._clientRect.height = this.rect.height;
      this._visibleNode.rect = this._clientRect;

      // todo interpolation ?
    }
  }

  onChanged() {
    // override to implement
  }

  get effect() {
    return (this._showEffect === this._hideEffect) ? this._showEffect : undefined;
  }

  set effect(effect) {
    if ((this._showEffect !== effect) || (this._hideEffect !== effect)) {
      this._showEffect = effect;
      this._hideEffect = effect;
      this.onChanged();
    }
  }

  get showEffect() {
    return this._showEffect;
  }

  set showEffect(effect) {
    if (this._showEffect !== effect) {
      this._showEffect = effect;
      this.onChanged();
    }
  }

  get hideEffect() {
    return this._hideEffect;
  }

  set hideEffect(effect) {
    if (this._hideEffect !== effect) {
      this._hideEffect = effect;
      this.onChanged();
    }
  }

  get duration() {
    return this._duration;
  }

  set duration(duration) {
    if (this._duration !== duration) {
      this._duration = duration;
      this.onChanged();
    }
  }

  get curve() {
    return this._curve;
  }

  set curve(curve) {
    if (this._curve !== curve) {
      this._curve = curve;
      this.onChanged();
    }
  }
}
