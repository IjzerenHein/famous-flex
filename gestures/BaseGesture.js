export default class BaseGesture {
  constructor() {
    this._callbacks = [];
    this._pointers = {};
  }

  addCallback(callback) {
    this._callbacks.push(callback);
    return () => {
      this._callbacks.splice(this._callbacks.indexOf(callback), 1);
    };
  }

  emit(type, event) {
    for (var i = 0; i < this._callbacks.length; i++) {
      this._callbacks[i](type, event);
    }
  }

  onReceive(type, event) {
    switch (type) {
      case 'mousedown': return this._mouseDown(event);
      case 'mousemove': return this._mouseMove(event);
      case 'mouseup': return this._mouseUp(event);
    }
  }

  _mouseDown(event) {
    let pointer = this._pointers.mouse;
    if (!pointer) {
      pointer = {};
      this._pointers.mouse = pointer;
    }
    pointer.startTime = event.time || Date.now(),
    pointer.startX = event.clientX;
    pointer.startY = event.clientY;
    pointer.time = pointer.startTime;
    pointer.x = pointer.startX;
    pointer.y = pointer.startY;
    pointer.active = true;
    this._pointerStart(pointer);
  }

  _mouseMove(event) {
    let pointer = this._pointers.mouse;
    if (!pointer) {
      return;
    }
    pointer.time = event.time || Date.now(),
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    this._pointerMove(pointer);
  }

  _mouseUp(event) {
    let pointer = this._pointers.mouse;
    if (!pointer) {
      return;
    }
    pointer.time = event.time || Date.now(),
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = false;
    this._pointerEnd(pointer);
  }

  _pointerStart() {
    // override to implement
  }

  _pointerMove() {
    // override to implement
  }

  _pointerEnd() {
    // override to implement
  }
}
