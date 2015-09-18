import Color from './Color';
import Margins from './Margins';

function assert(value, message) {
  if (!value) {
    throw new Error(message);
  }
}

export {
  Color,
  Margins,
  assert
};
