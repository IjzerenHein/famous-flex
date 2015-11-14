import {assert} from '../utils';

export default class NodeCollection {
  constructor(node) {
    this._node = node;
    this._nodesById = {};
    this._index = 0;
    this._array = [];
  }

  get index() {
    return this._index;
  }

  get(value) {
    if ((value instanceof String) || (typeof value === 'string')) {
      return this._nodesById[value];
    } else {
      return this._array[value];
    }
  }

  getById(id) {
    return this._nodesById[id];
  }

  getAt(index) {
    return this._array[index];
  }

  set(id, node) {
    if (this._nodesById[id] !== node) {
      if (this._nodesById[id]) {
        this._nodesById[id]._nodeCollection = undefined;
      }
      node._nodeCollection = this;
      this._nodesById[id] = node;
      if (typeof this[id] !== 'function') {
        this[id] = node;
      }
      this._node.requestLayout();
    }
  }

  insert(index, node) {
    index = (index === -1) ? this._array.length : index;
    this._array.splice(index, 0, node);
    node._nodeCollection = this;
    this._index = (index <= this._index) ? Math.min(index + 1, this._array.length - 1) : 0;
    this._node.requestLayout();
  }

  remove(value) {
    let node;
    if ((value instanceof String) || (typeof value === 'string')) {
      node = this._nodesById[value];
      if (!node) return undefined;
      delete this._nodesById[value];
      if (typeof this[id] !== 'function') {
        delete this[id];
      }
    } else if ((value instanceof Number) || (typeof value === 'number')) {
      value = (value === -1) ? (this._array.length - 1) : value;
      assert((value >= 0) && (value < this._array.length), 'invalid index');
      node = this._array[value];
      this._array.splice(index, 1);

      // TODO - UPDATE INDEX
    } else {
      for (let key in this._nodesById) {
        if (this._nodesById[key] === value) {
          value._nodeCollection = undefined;
          delete this._nodesById[key];
          if (typeof this[key] !== 'function') {
            delete this[key];
          }
          this._node.requestLayout();
          return value;
        }
      }
      value = this._array.indexOf(value);
      assert((value >= 0) && (value < this._array.length), 'invalid node');
      node = this._array[value];
      this._array.splice(index, 1);

      // TODO - UPDATE INDEX
    }
    this._node.requestLayout();
    node._nodeCollection = undefined;
    return node;
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

  get length() {
    return this._array.length;
  }
}
