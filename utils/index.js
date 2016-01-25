import CallbackStore from './CallbackStore';

function assert(value, message) {
  if (!value) {
    throw new Error(message);
  }
}

function interpolate(startValue, endValue, progress) {
  if (startValue.interpolate) {
    return startValue.interpolate(endValue, progress);
  } else if (Array.isArray(endValue)) {
    const result = [];
    for (var k = 0; k < endValue.length; k++) {
      const subEndValue = endValue[k];
      const subStartValue = startValue[k];
      if (Array.isArray(subEndValue)) {
        const subResult = [];
        for (var n = 0; n < subEndValue.length; n++) {
          subResult.push(((subEndValue[n] - subStartValue[n]) * progress) + subStartValue[n]);
        }
        result.push(subResult);
      } else {
        result.push(((subEndValue - subStartValue) * progress) + subStartValue);
      }
    }
    return result;
  } else {
    return ((endValue - startValue) * progress) + startValue;
  }
}

function cloneArray(ar) {
  var res = [];
  for (var i = 0; i < ar.length; i++) {
    const elm = ar[i];
    res.push(Array.isArray(elm) ? cloneArray(elm) : elm);
  }
  return res;
}

function distance(deltaX, deltaY) {
  return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
}

function nonNull(arg1, arg2, arg3, arg4) {
  if (arg1 !== undefined) return arg1;
  if (arg2 !== undefined) return arg2;
  if (arg3 !== undefined) return arg3;
  return arg4;
}

export {
  assert,
  interpolate,
  distance,
  cloneArray,
  nonNull,
  CallbackStore
};
