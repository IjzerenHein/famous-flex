// jscs:disable requireSpaceAfterKeywords

/**
 * A promise extended with a cancel method which resolves
 * the promise and thus cancels the animation.
 */
export default class AnimationPromise {
  constructor(fn) {
    this._promise = new Promise((resolve) => {
      this._resolve = resolve;
      fn(resolve);
    });
  }
  then() {
    return this._promise.then.apply(this._promise, arguments);
  }
  catch() {
    return this._promise.catch.apply(this._promise, arguments);
  }
  cancel() {
    if (!this._isDone) {
      this._isDone = true;
      this._resolve(false);
    }
  }
  done() {
    this._isDone = true;
    this._resolve(true);
  }
  get isActive() {
    return !this._isDone;
  }
}
