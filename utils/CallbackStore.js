export default class CallbackStore {
  constructor() {
    this._events = {};
  }
  on(key, callback) {
    this._events[key] = this._events[key] || [];
    const callbackList = this._events[key];
    callbackList.push(callback);
    return () => callbackList.splice(callbackList.indexOf(callback), 1);
  }
  off(key, callback) {
    const events = this._events[key];
    if (events) events.splice(events.indexOf(callback), 1);
    return this;
  }
  trigger(key, payload) {
    const events = this._events[key];
    if (events) {
      for (let i = 0, n = events.length; i < n; i++) {
        events[i](payload);
      }
    }
    return this;
  }
}
