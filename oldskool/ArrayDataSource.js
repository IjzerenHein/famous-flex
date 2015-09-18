/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author Hein Rutjes (IjzerenHein)
 * @license MIT
 * copyright Hein Rutjes, 2015
 */

import {Node} from 'famous/core';
import {CallbackStore} from 'famous/utilities';

/**
 * NodesDataSource
 *
 * @class

 */
export default class ArrayDataSource extends CallbackStore {
    constructor(data) {
      super(data);
      this._array = data || [];
      this.length = this._array.length;
    }

    get(index) {
      return this._array[index];
    }

    push(node) {
      node = node || new Node();
      this._array.push(node);
      this.length = this._array.length;
      this.trigger('insert', node);
      return node;
    }

    pop() {
      var node = this._array.pop();
      this.length = this._array.length;
      this.trigger('remove', node);
      return node;
    }

    shift() {
      var node = this._array.shift();
      this.length = this._array.length;
      this.trigger('remove', node);
      return node;
    }

    unshift(node) {
      node = node || new Node();
      this._array.unshift(node);
      this.length = this._array.length;
      this.trigger('insert', node);
      return node;
    }

    insert(index, node) {
      node = node || new Node();
      index = (index === -1) ? this.length : index;
      this._array.splice(index, 0, node);
      this.length = this._array.length;
      this.trigger('insert', node);
      return node;
    }

    remove(index) {
      var node = this._array.splice(index, 1)[0];
      this.length = this._array.length;
      this.trigger('remove', node);
      return node;
    }

    removeAll() {
      while (this._nodes.array.length) {
        this.trigger('remove', this._array.pop());
      }
    }

    forEach() {
      return this._array.forEach.apply(this._array, arguments);
    }
}
