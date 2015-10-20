import {assert} from '../utils';

export default class LayoutNodes {
  constructor(node) {
    this._node = node;
    this._nodesById = {};
    this._index = 0;
    this._array = [];
    this._removedNodes = [];
  }

  get(id) {
    return this._nodesById[id];
  }

  set(id, node) {
    if (this._nodesById[id] !== node) {
      if (this._nodesById[id]) {
        this._removedNodes.push(this._nodesById[id]);
      }
      this._nodesById[id] = node;
      if (typeof this[id] !== 'function') {
        this[id] = node;
      }

      // TODO, requestLayout?
    }
  }

  insert(index, node) {
    this._array.splice(index, 0, node);
    this._index += (index <= this._index) ? 1 : 0;
  }

  remove(value) {
    if ((value instanceof String) || (typeof value === 'string')) {
      if (!this._nodesById[id]) return undefined;
      this._removedNodes.push(this._nodesById[id]);
      delete this._nodesById[id];
      if (typeof this[id] !== 'function') {
        delete this[id];
      }
    } else if ((value instanceof Number) || (typeof value === 'number')) {
      value = (value === -1) ? (this._array.length - 1) : value;
      assert((value >= 0) && (value < this._array.length), 'invalid index');
      this._removedNodes.push(this._array[value]);
      this._array.splice(index, 1);
    } else {
      for (let key in this._nodesById) {
        if (this._nodesById[key] === value) {
          this._removedNodes.push(value);
          delete this._nodesById[key];
          if (typeof this[key] !== 'function') {
            delete this[key];
          }
          return this._removedNodes[this._removedNodes.length - 1];
        }
      }
      value = this._array.indexOf(value);
      assert((value >= 0) && (value < this._array.length), 'invalid node');
      this._removedNodes.push(this._array[value]);
      this._array.splice(index, 1);
    }
    return this._removedNodes[this._removedNodes.length - 1];
  }

  push(node) {
    return this.insert(-1, node);
  }

  pop() {
    return this.remove(-1);
  }

  unshift(node) {
    return this.insert(0, node);
  }

  shift() {
    return this.remove(0);
  }

  next() {

  }

  prev() {

  }

  _beginLayout() {
    for (let key in this._nodesById) {
      this._nodesById[key]._layoutInvalidated = false;
    }
    for (let i = 0; i < this._array.length; i++) {
      this._array[i]._layoutInvalidated = false;
    }
  }

  _endLayout() {
    let node;
    for (let key in this._nodesById) {
      node = this._nodesById[key];
      if (node._layoutInvalidated && !node.getParent()) {
        this._node.addChild(node);
      } else if (!node._layoutInvalidated && node.getParent()) {
        this._node.removeChild(node);
      }
    }
    for (let i = 0; i < this._array.length; i++) {
      node = this._array[i];
      if (node._layoutInvalidated && !node.getParent()) {
        this._node.addChild(node);
      } else if (!node._layoutInvalidated && node.getParent()) {
        this._node.removeChild(node);
      }
    }
  }
}
