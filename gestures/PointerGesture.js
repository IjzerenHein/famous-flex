import BaseGesture from './BaseGesture';

export default class PointerGesture extends BaseGesture {
  constructor() {
    super();
  }

  pointerStart(pointer) {
    if (!pointer._event) {
      pointer._event = {
        start: {},
        delta: {}
      };
    };
    const event = pointer._event;
    event.id = pointer.id;
    event.time = pointer.time;
    event.start.time = pointer.time;
    event.start.x = pointer.x;
    event.start.y = pointer.y;
    event.delta.x = 0;
    event.delta.y = 0;
    event.status = 'start';
    event.capture = false;
    this.emit(event);
    if (event.capture) this.startCapture();
    event.status = 'update';
  }

  pointerMove(pointer) {
    const event = pointer._event;
    event.time = pointer.time;
    event.delta.x += pointer.deltaX;
    event.delta.y += pointer.deltaY;
    this.emit(event);
  }

  pointerEnd(pointer) {
    const event = pointer._event;
    event.status = 'end';
    this.emit(event);
    if (event.capture) this.endCapture();
  }
}
