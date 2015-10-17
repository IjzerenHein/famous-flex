import ShowAnimation from './ShowAnimation';
import ShowEffect from './ShowEffect';

export default class ShowNode extends ShowAnimation {
  constructor(options) {
    super(options);
  }

  show(node, showEffect, curve, duration, hideEffect) {
    return this._showNode(node, showEffect, curve, duration, hideEffect);
  }

  hide(hideEffect, curve, duration) {
    return this._showNode(undefined, undefined, curve, duration, hideEffect);
  }

  get visibleNode() {
    return this._visibleNode;
  }
}
ShowNode.Effect = ShowEffect;
