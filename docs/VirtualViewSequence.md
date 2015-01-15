<a name="module_VirtualViewSequence"></a>
#VirtualViewSequence
Virtual ViewSequence for famo.us which creates & destroys nodes using a
factory delegate. The factory class should support the following functions:
- create()
- createNext(prevRenderable)
- createPrevious(nextRenderable)
- destroy(renderable) (optional)

Example:

```javascript
var VirtualViewSequence = require('famous-flex/VirtualViewSequence');

// Factory for creating surfaces
function MyFactory() {}
MyFactory.prototype.create = function(index) {
  var surface = new Surface({
    size: [undefined, 100],
    classes: ['my-surface']
  });
  surface.index = index || 0; // add property to renderable
  return surface;
};
MyFactory.prototype.createNext = function(renderable) {
  return this.create(renderable.index + 1);
};
MyFactory.prototype.createPrevious = function(renderable) {
  return this.create(renderable.index - 1);
};

// Create infinite scrollview
var viewSequence = new VirtualViewSequence({
  factory: new MyFactory()
});
var scrollView = new FlexScrollView({
  dataSource: viewSequence
});
```

<a name="exp_module_VirtualViewSequence"></a>
##class: VirtualViewSequence ⏏
**Members**

* [class: VirtualViewSequence ⏏](#exp_module_VirtualViewSequence)
  * [new VirtualViewSequence(options)](#exp_new_module_VirtualViewSequence)
  * [virtualViewSequence.getPrevious()](#module_VirtualViewSequence#getPrevious)
  * [virtualViewSequence.getNext()](#module_VirtualViewSequence#getNext)
  * [virtualViewSequence.get()](#module_VirtualViewSequence#get)
  * [virtualViewSequence.getIndex()](#module_VirtualViewSequence#getIndex)
  * [virtualViewSequence.toString()](#module_VirtualViewSequence#toString)
  * [virtualViewSequence.cleanup()](#module_VirtualViewSequence#cleanup)

<a name="exp_new_module_VirtualViewSequence"></a>
###new VirtualViewSequence(options)
**Params**

- options `Object` - Configurable options.  
  - factory `Object` - Factory delegate for creating new renderables.  
  - \[value\] `Renderable` - Renderable for this node (when omitted, `factory.create()` is called)  
  - \[index\] `Number` - Index of this node (default: 0).  

<a name="module_VirtualViewSequence#getPrevious"></a>
###virtualViewSequence.getPrevious()
Get previous node.

When no previous node exists, the factory-delegate function `createPrevious`
is called to construct a renderable for the previous node. When `createPrevious`
returns `undefined`, no previous-node will be created.

**Returns**: `VirtualViewSequence` - previous node.  
<a name="module_VirtualViewSequence#getNext"></a>
###virtualViewSequence.getNext()
Get next node.

When no next node exists, the factory-delegate function `createNext`
is called to construct a renderable for the next node. When `createNext`
returns `undefined`, no next-node will be created.

**Returns**: `VirtualViewSequence` - next node.  
<a name="module_VirtualViewSequence#get"></a>
###virtualViewSequence.get()
Get the value of this node.

**Returns**: `Renderable` - surface/view  
<a name="module_VirtualViewSequence#getIndex"></a>
###virtualViewSequence.getIndex()
Get the index of the node.

**Returns**: `Number` - Index of node.  
<a name="module_VirtualViewSequence#toString"></a>
###virtualViewSequence.toString()
Get human readable string verion of the node.

**Returns**: `String` - node as a human readable string  
<a name="module_VirtualViewSequence#cleanup"></a>
###virtualViewSequence.cleanup()
Cleans up any un-accessed nodes since the previous call to `cleanup`.

This function cleans up any nodes that have not been accessed
since the last call to `cleanup`. When a node is accessed
through a call to `getNext`, `getPrevious`, `get` or `getIndex`
it is considered `touched` and should not be cleaned up.

**Returns**: `VirtualViewSequence` - this.  
