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
export default class ObjectDataSource extends CallbackStore {
    constructor(data) {
      super(data);
      if (data) {
        for (var id in data) {
          this[id] = data[id];
        }
      }
    }

    set(id, node) {
      if (!this[id]) {
        this[id] = node || new Node();
        this.trigger('insert', id);
      } else if (!node || (node !== this[id])) {
        this.trigger('remove', id);
        this[id] = node;
        this.trigger('insert', id);
      }

      return this[id];
    }

    get(id) {
      return this[id];
    }

    remove(id) {
      if (this[id]) {
        var node = this[id];
        delete this[id];
        this.trigger('remove', id);
        return node;
      }
    }

    removeAll() {
      for (var id in this) {
        this.trigger('remove', id);
        delete this[id];
      }
    }

    forEach(callback) {
      for (var id in this) {
        if (this.hasOwnProperty(id) && (id !== '_events')) {
          callback(this[id], id);
        }
      }
    }
}
