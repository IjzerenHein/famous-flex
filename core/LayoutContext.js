import {assert} from '../utils';

export default class LayoutContext {
  constructor(node) {
    this._node = node;
  }

  set(nodeOrId, spec) {

  }

  next() {

  }

  prev() {

  }
}

/*var newNode = new DOMNode();
scrollView.animate('easeIn', 500, () => {
  newNode.opacity = 0;
  scrollView.push(newNode);
});*/

//1) collect start values
//2) install capture on collected properties
//3) start transition
//4) on update of a property (layout), capture end-value
//5) during transition, interpolate between start and end
//6) on end transition, remove property-capture
//7) if new animation started on property, remove old apture
