import ScrollNode from '../core/ScrollNode';
import ScrollContent from '../core/ScrollContent';
import NodeCollection from '../core/NodeCollection';
import listLayout from '../layouts/listLayout';

const defaults = {
  layout: listLayout,
  paginated: false,
  alignment: 0,
  direction: 1
};

export default class ListView extends ScrollNode {
  constructor(options) {
    super();
    this._contentOptions.nodes = new NodeCollection(this);
    this.content = new ScrollContent(this._contentOptions);
    this.setOptions(defaults, options);
  }

  get nodes() {
    return this._contentOptions.nodes;
  }

  set nodes(value) {
    this._contentOptions.nodes = value;
  }

  get layout() {
    return this._contentOptions.layout;
  }

  set layout(layout) {
    if (this._contentOptions.layout !== layout) {
      this._contentOptions.layout = layout;
      this.requestLayout();
    }
  }

  get layoutOptions() {
    return this._content.layoutOptions;
  }

  set layoutOptions(options) {
    if (this._contentOptions.layoutOptions !== options) {
      this._contentOptions.layoutOptions = options;
      this.requestLayout();
    }
  }

  get paginated() {
    return this._contentOptions.paginated;
  }

  set paginated(value) {
    if (this._contentOptions.paginated !== value) {
      this._contentOptions.paginated = value;
      this.requestLayout();
    }
  }
}
