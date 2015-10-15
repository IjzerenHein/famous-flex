import BaseGesture from './BaseGesture';
import {distance} from '../utils';

export default class TapGesture extends BaseGesture {
  pointerEnd(pointer) {
    if (((pointer.time - pointer.startTime) <= 250) &&
         (Math.abs(distance(pointer.x - pointer.startX, pointer.y - pointer.startY)) <= 3)) {
      this.emit(this.event);
    }
  }
}
