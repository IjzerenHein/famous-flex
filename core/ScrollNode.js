import BaseNode from './BaseNode';
import Rect from './Rect';
import LayoutNodes from './LayoutNodes';
import LayoutContext from './LayoutContext';

const defaults = {
};

export default class ScrollNode extends BaseNode {
  constructor(options) {
    super();
    this._nodes = new LayoutNodes(this);
    this._context = new LayoutContext(this, this._nodes);
  }

  get nodes() {
    return this._nodes;
  }

  set nodes(value) {
    this._nodes.set(value);
  }
}
