/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author Hein Rutjes (IjzerenHein)
 * @license MIT
 * copyright Hein Rutjes, 2015
 */

import RenderNode from 'famous/core/RenderNode';
import Entity from 'famous/core/Entity';

export default class BaseNode extends RenderNode {

  /*
  getOpacity()
  setOpacity()
  addChild()
  removeChild()
  getChildren()
  getParent()
  */

  constructor() {
    super();
    this.id = Entity.register(this);
    this._resultSpec = {
      opacity: 1
    };
  }

  getOpacity() {
    return this._resultSpec.opacity;
  }

  setOpacity(value) {
    this._resultSpec.opacity = value;
  }

  render() {
    return this.id;
  }

  addChild(child) {
    this._children = this._children || [];
    this._children.push(child);
  }

  removeChild(child) {
    this._children.splice(this._children.indexOf(child), 1);
  }

  commit(context) {
    this._resultSpec.targets = [];
    for (let i = 0; i < this._children.length; i++) {
      this._resultSpec.targets.push(this._children[i].render());
    }
    if (this._resultSpecDirty) {
      /*if (this._origin) {
        this._resultSpec.origin = this._resultSpec.origin || [0, 0];
        this._resultSpec.origin[0] = this._origin.x;
        this._resultSpec.origin[1] = this._origin.y;
      }*/
      this._resultSpec.transform = Transform.translate(this._rect.x, this._rect.y, this._rect.z);
      this._resultSpec.size = [100, 100];
    }
    return this._resultSpec;
  }

  /*_processRegisteredUpdates(time) {
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
  }*/

  registerUpdate(callback, layout) {
    // TODO

    /*if (!this._registeredUpdates) {
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
    return update;*/
  }

  unregisterUpdate(update) {
    this._newRegisteredUpdates = this._newRegisteredUpdates || this._registeredUpdates.slice(0);
    this._newRegisteredUpdates.splice(this._newRegisteredUpdates.indexOf(update), 1);
  }
}
