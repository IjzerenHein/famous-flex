function assert(value, message) {
  if (!value) {
    throw new Error(message);
  }
}

export {
  assert
};
