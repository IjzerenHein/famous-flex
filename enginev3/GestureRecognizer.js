export default class GestureRecognizer {
  constructor(node) {
    this._node = node;
    node.addUIEvent('touchstart');
    node.addUIEvent('mousedown');
    node.addUIEvent('touchmove');
    node.addUIEvent('mousemove');
    node.addUIEvent('touchend');
    node.addUIEvent('mouseup');
    node.addUIEvent('mouseleave');
  }
}
