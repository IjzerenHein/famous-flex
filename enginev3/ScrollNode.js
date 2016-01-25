import BaseNode from '../core/BaseNode';
//import DOMNode from '../core/DOMNode';

export default class ScrollNode extends BaseNode {
  constructor(options) {
    super(options);
    //this._domElement = new DOMElement(this);

    //this._group = new DOMNode();
    //this.addChild(this._group);
  }

  /*get el() {
    return this._domElement;
  }*/

  /*get group() {
    return this._group;
  }*/
}

class GroupNode extends BaseNode {
  constructor(options) {
    super(options);
    //this._domElement = new DOMElement(this);
  }

  /*get el() {
    return this._domElement;
  }*/
}
ScrollNode.GroupNode = GroupNode;
