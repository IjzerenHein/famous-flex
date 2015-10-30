import {assert} from '../utils';

export default class LayoutNodes {
  constructor(node) {
    this._node = node;
    this._nodesById = {};
    this._index = 0;
    this._array = [];
    this._removedNodes = [];
  }

  get index() {
    return this._index;
  }

  get(value) {
    if ((indexOrId instanceof String) || (typeof value === 'string')) {
      return this._nodesById[id];
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
        this._removedNodes.push(this._nodesById[id]);
      }
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
    this._index = (index <= this._index) ? Math.min(index + 1, this._array.length - 1) : 0;
    this._node.requestLayout();
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

      // TODO - UPDATE INDEX
    } else {
      for (let key in this._nodesById) {
        if (this._nodesById[key] === value) {
          this._removedNodes.push(value);
          delete this._nodesById[key];
          if (typeof this[key] !== 'function') {
            delete this[key];
          }
          this._node.requestLayout();
          return this._removedNodes[this._removedNodes.length - 1];
        }
      }
      value = this._array.indexOf(value);
      assert((value >= 0) && (value < this._array.length), 'invalid node');
      this._removedNodes.push(this._array[value]);
      this._array.splice(index, 1);

      // TODO - UPDATE INDEX
    }
    this._node.requestLayout();
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

  get length() {
    return this._array.length;
  }
}
