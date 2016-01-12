import {DOMElement} from 'famous/dom-renderables';
import BaseNode from '../core/BaseNode';
import Style from '../core/Style';

export default class ContainerNode extends BaseNode {
  constructor(options) {
    super();
    this._domElement = new DOMElement(this);
    this.setOptions(options);
  }

  get el() {
    return this._domElement;
  }

  get style() {
    this._style = this._style || new Style(this);
    return this._style;
  }

  set style(options) {
    this._style = this._style || new Style(this);
    this.style.setOptions(options);
  }

  onSetStyle(style, value) {
    this.el.setProperty(style, value);
  }
}
