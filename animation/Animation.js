import EngineAnimation from '../engine/Animation';
import {assert, cloneArray} from '../utils';
import AnimationPromise from './AnimationPromise';

let collected;
let animationsPool = [];

export default class Animation extends EngineAnimation {

  onUpdate(value) {
    for (var j = 0; j < this.items.length; j++) {
      const item = this.items[j];
      if (Array.isArray(item.startValue)) {
        for (var k = 0; k < item.endValue.length; k++) {
          const endValue = item.endValue[k];
          const startValue = item.startValue[k];
          if (Array.isArray(endValue)) {
            for (var n = 0; n < endValue.length; n++) {
              item.curValue[k][n] = ((endValue[n] - startValue[n]) * value) + startValue[n];
            }
          } else {
            item.curValue[k] = ((endValue - startValue) * value) + startValue;
          }
        }
        item.node[item.property] = item.curValue;
      } else {
        console.log('animating ' + item.property + ' = ' + ((item.endValue - item.startValue) * value) + item.startValue);
        item.node[item.property] = ((item.endValue - item.startValue) * value) + item.startValue;
      }
    }
  }

  static collect(node, property, curValue, newValue) {
    assert(Animation.isCollecting, 'collect is only allowed during an animation-collection cycle');
    for (let i = 0; i < collected.length; i++) {
      const item = collected[i];
      if ((item.node === node) && (item.property === property)) {
        item.curValue = Array.isArray(curValue) ? cloneArray(curValue) : curValue; // allocate array for re-use
        item.startValue = Array.isArray(curValue) ? cloneArray(curValue) : curValue;
        item.endValue = Array.isArray(curValue) ? cloneArray(newValue) : newValue;
        break;
      }
    }
    if (Array.isArray(curValue)) {
      collected.push({
        node: node,
        property: property,
        curValue: cloneArray(curValue), // allocate array for re-use
        startValue: cloneArray(curValue),
        endValue: cloneArray(newValue)
      });
    } else if (curValue !== newValue) {
      //console.log('collect: ' + property + ' = ' + curValue + ' -> ' + newValue);
      collected.push({
        node: node,
        property: property,
        startValue: curValue,
        endValue: newValue
      });
    }
  }

  static start(node, curve, duration, collectFn) {

    // collect changed properties, layout changes, etc..
    assert(!Animation.isCollecting, 'Cannot start an animation while an other is still collecting');
    Animation.isCollecting = true;
    collected = [];
    collectFn();
    Animation.isCollecting = false;

    // Re-use/create animation
    const animation = animationsPool.pop() || new Animation();
    animation.items = collected;

    const promise = new AnimationPromise((resolve) => {
      animation.start(node, curve, duration, () => {
        animation.stop();
        for (var j = 0; j < animation.items.length; j++) {
          const item = animation.items[j];
          item.node[item.property] = item.endValue;
        }
        animation.items = undefined;
        animationsPool.push(animation);
        resolve(true);
      });
    });
    promise.then((done) => {
      if (!done) {
        animation.stop();
        animation.items = undefined;
        animationsPool.push(animation);
      }
    });
    return promise;
  }
}

