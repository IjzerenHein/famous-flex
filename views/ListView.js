import ScrollNode from '../core/ScrollNode';
import ListViewContent from './ListViewContent';
import listLayout from '../layouts/listLayout';
import NodeCollection from '../core/NodeCollection';

const defaults = {
  layout: listLayout,
  paginated: false,
  alignment: 0,
  direction: 1
};

export default class ListView extends ScrollNode {
  constructor(options) {
    super();
    this._nodes = new NodeCollection(this);
    this.content = new ListViewContent(this);
    this.setOptions(defaults, options);
  }

  get nodes() {
    return this._nodes;
  }

  set nodes(value) {
    this._nodes.set(value);
  }

  get layout() {
    return this._layout;
  }

  set layout(value) {
    if (this._layout !== value) {
      this._layout = value;
      this.requestLayout();
    }
  }

  get layoutOptions() {
    return this._layoutOptions;
  }

  set layoutOptions(value) {
    if (this._layoutOptions !== value) {
      this._layoutOptions = value;
      this.requestLayout();
    }
  }

  get paginated() {
    return this._paginated;
  }

  set paginated(value) {
    if (this._paginated !== value) {
      this._paginated = value;
      this.requestLayout();
    }
  }
}
