export default class Classes {
  constructor(node) {
    this._node = node;
    this._items = [];
  }

  getAt(index) {
    return this._items[index];
  }

  has(value) {
    return this._items.indexOf(value) !== -1;
  }

  toggle(value) {
    const index = this._items.indexOf(value);
    if (index >= 0) {
      this._items.splice(index, 1);
      this._node.onClasses(undefined, value);
    } else {
      this._items.push(value);
      this._node.onClasses(value);
    }
  }

  remove(value) {
    const index = this._items.indexOf(value);
    if (index >= 0) {
      this._items.splice(index, 1);
      this._node.onClasses(undefined, value);
    }
    return this;
  }

  add(value) {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (this._items.indexOf(value[i]) < 0) {
          this._items.push(value[i]);
          this._node.onClasses(value[i]);
        }
      }
    } else if (this._items.indexOf(value) < 0) {
      this._items.push(value);
      this._node.onClasses(value);
    }
    return this;
  }

  enable(value, enable) {
    return enable ? this.add(value) : this.remove(value);
  }

  get length() {
    return this._items.length;
  }
}
