export default class BaseGesture {
  constructor() {
    this.callbacks = [];
    this.pointers = {};
    this.event = {};
    this.pointerCount = 0;
    this.captureCount = 0;
  }

  addCallback(callback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks.splice(this.callbacks.indexOf(callback), 1);
    };
  }

  emit(event) {
    for (var i = 0; i < this.callbacks.length; i++) {
      this.callbacks[i](event);
    }
  }

  onReceive(type, event) {
    if (!this.captureCount) {
      switch (type) {
        case 'mousedown': return this.mouseDown(event);
        case 'mousemove': return this.mouseMove(event);
        case 'mouseup': return this.mouseUp(event);
      }
    }
  }

  startCapture() {
    this.captureCount++;
    if (this.captureCount === 1) {
      this.mouseMoveListener = this.mouseMoveListener || ((event) => this.mouseMove(event));
      this.mouseUpListener = this.mouseUpListener || ((event) => this.mouseUp(event));
      document.addEventListener('mousemove', this.mouseMoveListener);
      document.addEventListener('mouseup', this.mouseUpListener);
    }
  }

  endCapture() {
    this.captureCount = Math.max(this.captureCount - 1, 0);
    if (!this.captureCount) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
      document.removeEventListener('mouseup', this.mouseUpListener);
    }
  }

  mouseDown(event) {
    let pointer = this.pointers.mouse;
    if (!pointer) {
      pointer = {
        id: 'mouse'
      };
      this.pointers.mouse = pointer;
    }
    pointer.startTime = event.time || Date.now(),
    pointer.startX = event.clientX;
    pointer.startY = event.clientY;
    pointer.time = pointer.startTime;
    pointer.x = pointer.startX;
    pointer.y = pointer.startY;
    pointer.deltaX = 0;
    pointer.deltaY = 0;
    if (!pointer.active) {
      pointer.active = true;
      this.pointerCount++;
    }
    this.pointerStart(pointer);
  }

  mouseMove(event) {
    let pointer = this.pointers.mouse;
    if (!pointer) {
      return;
    }
    pointer.time = event.time || Date.now(),
    pointer.deltaX += event.clientX - pointer.x;
    pointer.deltaY += event.clientY - pointer.y;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    this.pointerMove(pointer);
  }

  mouseUp(event) {
    let pointer = this.pointers.mouse;
    if (!pointer) {
      return;
    }
    pointer.time = event.time || Date.now(),
    pointer.deltaX += event.clientX - pointer.x;
    pointer.deltaY += event.clientY - pointer.y;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    if (pointer.active) {
      pointer.active = false;
      this.pointerCount--;
    }
    this.pointerEnd(pointer);
  }

  pointerStart() {
    // override to implement
  }

  pointerMove() {
    // override to implement
  }

  pointerEnd() {
    // override to implement
  }
}
