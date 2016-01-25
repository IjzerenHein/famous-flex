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

class UpdateRegistration {
  constructor(node, callback) {
    this.node = node;
    this.callback = callback;
  }
  request() {
    if (!this.requested) {
      this.requested = true;
      if (!this.node._registeredUpdatesRequested) {
        this.node._registeredUpdatesRequested = true;
        this.node.requestUpdate(this.node._registeredUpdatesCompId);
      }
    }
  }
}

export default class BaseNode extends Node {

  /*
  getOpacity()
  setOpacity()
  addChild()
  removeChild()
  getChildren()
  getParent()
  */

  _processRegisteredUpdates(time) {
    this._registeredUpdates = this._newRegisteredUpdates || this._registeredUpdates;
    this._newRegisteredUpdates = undefined;
    this._registeredUpdatesRequested = false;
    for (let i = 0; i < this._registeredUpdates.length; i++) {
      const update = this._registeredUpdates[i];
      if (update.requested) {
        update.requested = false;
        update.callback(time);
      }
    }
  }

  registerUpdate(callback, layout) {
    if (!this._registeredUpdates) {
      this._registeredUpdates = [];
      this._registeredUpdatesComp = {
        onUpdate: (time) => this._processRegisteredUpdates(time)
      };
      this._registeredUpdatesCompId = this.addComponent(this._registeredUpdatesComp);
    }
    const update = new UpdateRegistration(this, callback);
    this._newRegisteredUpdates = this._newRegisteredUpdates || this._registeredUpdates.slice(0);
    if (layout) { // there should only be 1 layout registration!
      this._registeredUpdatesComp.onSizeChange = () => update.callback();
      this._newRegisteredUpdates.push(update); // layout is executed AFTER all other updates
    } else {
      this._newRegisteredUpdates.unshift(update);
    }
    return update;
  }

  unregisterUpdate(update) {
    this._newRegisteredUpdates = this._newRegisteredUpdates || this._registeredUpdates.slice(0);
    this._newRegisteredUpdates.splice(this._newRegisteredUpdates.indexOf(update), 1);
  }
}
