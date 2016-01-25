/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author Hein Rutjes (IjzerenHein)
 * @license MIT
 * copyright Hein Rutjes, 2015
 */

import Engine from 'famous/core/Engine';
import Entity from 'famous/core/Entity';
import Transform from 'famous/core/Transform';
import {assert} from '../utils';

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
      }
    }
  }
}

export default class BaseNode {

  /*
  getOpacity()
  setOpacity()
  addChild()
  removeChild()
  getChildren()
  getParent()
  */

  constructor() {
    console.log('constructor');
    this.id = Entity.register(this);
    this._contextSize = [0, 0];
    this._resultSpec = {
      opacity: 1,
      size: [0, 0],
      target: []
    };
  }

  mountToDOMElement(domElement) {
    assert(!this._parent, 'Cannot mount node that is already mounted or a child of another node.');
    const context = Engine.createContext(domElement);
    this._parent = context;
    context.add(this);
    return this;
  }

  unmountFromDOMElement() {
    // TODO
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

  getSize() {
    return this._contextSize;
  }

  addChild(child) {
    this._children = this._children || [];
    this._children.push(child);
    this._resultSpec.target.push({});
    child.setParent(this);
  }

  removeChild(child) {
    const idx = this._children.indexOf(child);
    this._children.splice(this._children.indexOf(child), 1);
    this._resultSpec.target.splice(idx, 1);
    child.setParent(undefined);
  }

  getParent() {
    return this._parent;
  }

  setParent(value) {
    this._parent = value;
  }

  commit(context) {

    const size = context.size;
    const origin = context.origin;
    //const childSpecs = this._resultSpec.target;
    const time = Date.now();

    // Check whether re-layouting should be performed
    const sizeChanged = ((size[0] !== this._contextSize[0]) || (size[1] !== this._contextSize[1]));
    this._contextSize[0] = size[0];
    this._contextSize[1] = size[1];
    if (this._registeredUpdatesRequested) {
      this._processRegisteredUpdates(time);
    }
    if (sizeChanged) {
      console.log('size changed: ', size);
    }
    if (sizeChanged && this._registeredLayoutCallback) {
      this._registeredLayoutCallback(time);
    }

    // Position and render children
    if (this._children) {
      for (let i = 0; i < this._children.length; i++) {
        const child = this._children[i];
        this._resultSpec.target[i] = child.render();
        /*if (child._resultSpecDirty) {
        const childSpec = childSpecs[i];
        childSpec.opacity = child.opacity;
        childSpec.transform = Transform.translate(child.rect.x, child.rect.y, child.rect.z);
        childSpec.size[0] = child.rect.width;
        childSpec.size[1] = child.rect.height;
        childSpec.target = child.render();*/
      }
    }

    this._resultSpec.opacity = this._opacity; // multiple with context.opacity ?
    this._resultSpec.size[0] = this.rect.width;
    this._resultSpec.size[1] = this.rect.height;
    this._resultSpec.transform = Transform.translate(this.rect.x, this.rect.y, this.rect.z);

    // Finalize result spec
    /*this._resultSpec.opacity = context.opacity;
    this._resultSpec.transform = context.transform;
    if (origin && ((origin[0] !== 0) || (origin[1] !== 0))) { // Translate dependent on origin
      this._resultSpec.transform = Transform.moveThen([-size[0]*origin[0], -size[1]*origin[1], 0], context.transform);
    }*/
    return this._resultSpec;
  }

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
    this._registeredUpdates = this._registeredUpdates || [];
    const update = new UpdateRegistration(this, callback);
    this._newRegisteredUpdates = this._newRegisteredUpdates || this._registeredUpdates.slice(0);
    if (layout) { // there should only be 1 layout registration!
      this._registeredLayoutCallback = () => update.callback();
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
