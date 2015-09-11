import assert from '../utilities';
import Transitionable from 'famous/transitions/Transitionable';
import FamousEngine from 'famous/core/FamousEngine';

let collected;
let transitionablesPool = [];
let runningAnimations = [];

export default class Animation {

  static onUpdate() {
    for (var i = 0; i < runningAnimations.length; i++) {
      const animation = runningAnimations[i];
      const value = animation.transitionable.get();
      for (var j = 0; j < animation.items.length; j++) {
        const item = animation.items[j];
        item.node[item.property] = ((item.newValue - item.curValue) * value) + item.curValue;
      }
    }
  }

  static collect(node, property, curValue, newValue) {
    collected.push({node, property, curValue, newValue});
  }

  static start(collectFn, duration, curve) {
    assert(!Animation.isCollecting, 'Cannot start an animation while an other is still collecting')
    return new Promise((resolve) => {
      Animation.isCollecting = true;
      collected = {};
      let animation = {
        transitionable: transitionablesPool.pop(),
        items: collected
      }
      collectFn();
      collected = undefined;
      Animation.isCollecting = false;
      runningAnimations.push(animation);
      transitionable.from(0).to(1, curve, duration, () => {
        transitionablesPool.push(animation.transitionable);
        runningAnimations.splice(runningAnimations.indexOf(animation));
        for (var i = 0; i < runningAnimations.length; i++) {
          const animation = runningAnimations[i];
          for (var j = 0; j < animation.items.length; j++) {
            const item = animation.items[j];
            item.node[item.property] = item.newValue;
          }
        }
      });
    });
  }
}

FamousEngine.requestUpdate(Animation);
