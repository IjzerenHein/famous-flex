import BaseGesture from './BaseGesture';
import {distance} from '../utils';

export default class PanGesture extends BaseGesture {
  constructor() {
    super();
    this.event.delta = {};
    this.event.start = {};
  }

  update(event) {
    event.delta.x = 0;
    event.delta.y = 0;
    for (var key in this.pointers) {
      const pointer = this.pointers[key];
      event.delta.x += pointer.deltaX;
      event.delta.y += pointer.deltaY;
    }
  }

  pointerStart(pointer) {
    const event = this.event;
    if (this.pointerCount === 1) {
      event.start.time = pointer.time;
      event.start.x = pointer.x;
      event.start.y = pointer.y;
      event.delta.x = 0;
      event.delta.y = 0;
      event.status = 'start';
      this.emit(event);
      event.status = 'update';
      this.startCapture();
    }
  }

  pointerMove(pointer) {
    if (this.event.status === 'update') {
      this.update(this.event);
      this.emit(this.event);
    }
  }

  pointerEnd(pointer) {
    if (!this.pointerCount ) {
      this.update(this.event);
      this.event.status = 'end';
      this.emit(this.event);
      this.endCapture();
    }
  }
}
