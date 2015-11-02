import {DOMElement} from 'famous/dom-renderables';
import BaseNode from '../core/BaseNode';

export default class GroupNode extends BaseNode {
  constructor(options) {
    super(options);
    this._domElement = new DOMElement(this);
  }

  get el() {
    return this._domElement;
  }
}
