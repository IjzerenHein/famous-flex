import BaseGesture from './BaseGesture';
import {distance} from '../utils';

export default class DoubleTapGesture extends BaseGesture {
  _pointerEnd(pointer) {
    if (((pointer.time - pointer.startTime) <= 250) &&
        (Math.abs(distance(pointer.x - pointer.startX, pointer.y - pointer.startY)) <= 3)) {
      if (this._firstTapTime &&
         ((pointer.time - this._firstTapTime) <= 300) &&
         (Math.abs(distance(pointer.x - this._firstTapX, pointer.y - this._firstTapY)) <= 20)) {
        this._firstTapTime = undefined;
        this.emit('doubletap');
      } else {
        this._firstTapTime = pointer.time;
        this._firstTapX = pointer.x;
        this._firstTapY = pointer.y;
      }
    }
  }
}
