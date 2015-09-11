import {assert} from '../utilities';
import Transitionable from 'famous/transitions/Transitionable';

let collected;
let transitionablesPool = [];
let runningAnimations = [];
let famousEngine;
let requestingUpdate;

export default class Animation {

  static init(engine) {
    famousEngine = engine;
  }

  static requestUpdate() {
    if (!requestingUpdate) {
        famousEngine.requestUpdate(Animation);
        requestingUpdate = true;
    }
  }

  static onUpdate() {
    for (var i = 0; i < runningAnimations.length; i++) {
      const animation = runningAnimations[i];
      const value = animation.transitionable.get();
      for (var j = 0; j < animation.items.length; j++) {
        const item = animation.items[j];
        item.node[item.property] = ((item.newValue - item.curValue) * value) + item.curValue;
      }
    }
    if (runningAnimations.length) {
      famousEngine.requestUpdateOnNextTick(Animation);
    }
    else {
      requestingUpdate = false;
    }
  }

  static collect(node, property, curValue, newValue) {
    collected.push({node, property, curValue, newValue});
  }

  static start(curve, duration, collectFn) {
    assert(!Animation.isCollecting, 'Cannot start an animation while an other is still collecting')
    return new Promise((resolve) => {
      Animation.isCollecting = true;
      collected = [];
      let animation = {
        transitionable: transitionablesPool.pop() || new Transitionable(1),
        items: collected
      }
      collectFn();
      collected = undefined;
      Animation.isCollecting = false;
      runningAnimations.push(animation);
      Animation.requestUpdate();
      animation.transitionable.from(0).to(1, curve, duration, () => {
        transitionablesPool.push(animation.transitionable);
        runningAnimations.splice(runningAnimations.indexOf(animation));
        for (var i = 0; i < runningAnimations.length; i++) {
          const animation = runningAnimations[i];
          for (var j = 0; j < animation.items.length; j++) {
            const item = animation.items[j];
            item.node[item.property] = item.newValue;
          }
        }
        resolve(true);
      });
    });
  }
}

//FamousEngine.requestUpdate(Animation);*/
