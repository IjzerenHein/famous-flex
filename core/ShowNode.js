import BaseNode from './BaseNode';
import Rect from './Rect';
import ShowEffect from './ShowEffect';

const resolved = Promise.resolve(true);

export default class ShowNode extends BaseNode {
  constructor(options) {
    super(options);
    this._lastPromise = resolved;
    this._clientRect = new Rect();
    this.registerUpdate(() => this.onResize(), true);
  }

  show(node, showEffect, curve, duration, hideEffect) {
    if (node === this._visibleNode) {
      return this._lastPromise;
    }

    const clientRect = this._clientRect;
    clientRect.width = this.rect.width;
    clientRect.height = this.rect.height;

    let promise;
    if (this._visibleNode) {
      hideEffect = hideEffect || showEffect;
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

  hide(hideEffect, curve, duration) {
    return this.show(undefined, undefined, curve, duration, hideEffect);
  }

  get visibleNode() {
    return this._visibleNode;
  }

  onResize() {
    if (this._visibleNode) {
      this._clientRect.width = this.rect.width;
      this._clientRect.height = this.rect.height;
      this._visibleNode.rect = this._clientRect;

      // todo interpolation ?
    }
  }
}
ShowNode.Effect = ShowEffect;
