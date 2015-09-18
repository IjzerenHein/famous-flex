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
import Animation from '../animation/Animation';
import {GestureHandler} from 'famous/components';

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
        this.node.requestUpdate(this.node._registeredUpdatesComp);
      }
    }
  }
}

export default class BaseNode extends Node {

  on(event, callback) {
    this._gestureHandler = this._gestureHandler || new GestureHandler(this);
    this._gestureHandler.on(event, callback);
  }

  /*getOpacity() {
    return this.getOpacity();
  }

  setOpacity(value) {
    this.setOpacity(value);
  }*/

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

  registerUpdate(callback, last) {
    if (!this._registeredUpdates) {
      this._registeredUpdates = [];
      this._registeredUpdatesComp = this.addComponent({
        onUpdate: (time) => this._processRegisteredUpdates(time)
        //onSizeChange: () => this.requestLayout(true)
      });
    }
    const update = new UpdateRegistration(this, callback);
    this._newRegisteredUpdates = this._newRegisteredUpdates || this._registeredUpdates.slice(0);
    if (last) {
      this._newRegisteredUpdates.push(update);
    }
    else {
      this._newRegisteredUpdates.unshift(update);
    }
    return update;
  }

  unregisterUpdate(update) {
    this._newRegisteredUpdates = this._newRegisteredUpdates || this._registeredUpdates.slice(0);
    this._newRegisteredUpdates.splice(this._newRegisteredUpdates.indexOf(update), 1);
  }
}
