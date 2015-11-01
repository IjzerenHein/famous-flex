import BaseGesture from './BaseGesture';
import {distance} from '../utils';

export default class PanGesture extends BaseGesture {
  constructor() {
    super();
    this.event.delta = {};
    this.event.start = {};
    this.event.velocity = {};
  }

  update(pointer, count) {
    const event = this.event;
    event.prevTime = event.time;
    event.time = pointer.time;
    const prevDeltaX = event.delta.x;
    const prevDeltaY = event.delta.y;
    event.delta.x = 0;
    event.delta.y = 0;
    while (pointer) {
      event.delta.x += pointer.deltaX;
      event.delta.y += pointer.deltaY;
      pointer = pointer.next;
    }
    event.delta.x /= count;
    event.delta.y /= count;
    const time = event.time - event.prevTime;
    event.velocity.x = time ? ((event.delta.x - prevDeltaX) / time) : 0;
    event.velocity.y = time ? ((event.delta.y - prevDeltaY) / time) : 0;
  }

  pointerStart(pointer, count) {
    const event = this.event;
    if (!this.prevPointerCount) {
      event.time = pointer.time;
      event.prevTime = pointer.time;
      event.start.time = pointer.time;
      event.start.x = 0;
      event.start.y = 0;
      while (pointer) {
        event.start.x += pointer.x;
        event.start.y += pointer.y;
        pointer = pointer.next;
      }
      event.start.x /= count;
      event.start.y /= count;
      event.delta.x = 0;
      event.delta.y = 0;
      event.velocity.x = 0;
      event.velocity.y = 0;
      event.status = 'start';
      this.emit(event);
      event.status = 'update';
      this.startCapture();
    }
  }

  pointerMove(pointer, count) {
    if (this.event.status === 'update') {
      this.update(pointer, count);
      this.emit(this.event);
    }
  }

  pointerEnd(pointer, count) {
    if (!this.pointerCount) {
      if ((pointer.time - this.event.time) >= 100) {
        this.event.velocity.x = 0;
        this.event.velocity.y = 0;
      }
      this.event.status = 'end';
      this.emit(this.event);
      this.endCapture();
    }
  }
}
