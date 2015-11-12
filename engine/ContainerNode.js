import {DOMElement} from 'famous/dom-renderables';
import BaseNode from '../core/BaseNode';
import Styles from '../core/Styles';

export default class ContainerNode extends BaseNode {
  constructor(options) {
    super();
    this._domElement = new DOMElement(this);
    this.setOptions(options);
  }

  get el() {
    return this._domElement;
  }

  get styles() {
    this._styles = this._styles || new Styles(this);
    return this._styles;
  }

  set styles(options) {
    this._styles = this._styles || new Styles(this);
    this.styles.setOptions(options);
  }

  onSetStyle(style, value) {
    this.el.setProperty(style, value);
  }
}
