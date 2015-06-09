<a name="module_VirtualViewSequence"></a>
## VirtualViewSequence
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


* [VirtualViewSequence](#module_VirtualViewSequence)
  * [VirtualViewSequence](#exp_module_VirtualViewSequence--VirtualViewSequence) ⏏
    * [new VirtualViewSequence(options)](#new_module_VirtualViewSequence--VirtualViewSequence_new)
    * [.getPrevious()](#module_VirtualViewSequence--VirtualViewSequence+getPrevious) ⇒ <code>VirtualViewSequence</code>
    * [.getNext()](#module_VirtualViewSequence--VirtualViewSequence+getNext) ⇒ <code>VirtualViewSequence</code>
    * [.get()](#module_VirtualViewSequence--VirtualViewSequence+get) ⇒ <code>Renderable</code>
    * [.getIndex()](#module_VirtualViewSequence--VirtualViewSequence+getIndex) ⇒ <code>Number</code>
    * [.toString()](#module_VirtualViewSequence--VirtualViewSequence+toString) ⇒ <code>String</code>
    * [.cleanup()](#module_VirtualViewSequence--VirtualViewSequence+cleanup) ⇒ <code>VirtualViewSequence</code>

<a name="exp_module_VirtualViewSequence--VirtualViewSequence"></a>
### VirtualViewSequence ⏏
**Kind**: Exported class  
<a name="new_module_VirtualViewSequence--VirtualViewSequence_new"></a>
#### new VirtualViewSequence(options)

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options. |
| options.factory | <code>Object</code> | Factory delegate for creating new renderables. |
| [options.value] | <code>Renderable</code> | Renderable for this node (when omitted, `factory.create()` is called) |
| [options.index] | <code>Number</code> | Index of this node (default: 0). |

<a name="module_VirtualViewSequence--VirtualViewSequence+getPrevious"></a>
#### virtualViewSequence.getPrevious() ⇒ <code>VirtualViewSequence</code>
Get previous node.

When no previous node exists, the factory-delegate function `createPrevious`
is called to construct a renderable for the previous node. When `createPrevious`
returns `undefined`, no previous-node will be created.

**Kind**: instance method of <code>[VirtualViewSequence](#exp_module_VirtualViewSequence--VirtualViewSequence)</code>  
**Returns**: <code>VirtualViewSequence</code> - previous node.  
<a name="module_VirtualViewSequence--VirtualViewSequence+getNext"></a>
#### virtualViewSequence.getNext() ⇒ <code>VirtualViewSequence</code>
Get next node.

When no next node exists, the factory-delegate function `createNext`
is called to construct a renderable for the next node. When `createNext`
returns `undefined`, no next-node will be created.

**Kind**: instance method of <code>[VirtualViewSequence](#exp_module_VirtualViewSequence--VirtualViewSequence)</code>  
**Returns**: <code>VirtualViewSequence</code> - next node.  
<a name="module_VirtualViewSequence--VirtualViewSequence+get"></a>
#### virtualViewSequence.get() ⇒ <code>Renderable</code>
Get the value of this node.

**Kind**: instance method of <code>[VirtualViewSequence](#exp_module_VirtualViewSequence--VirtualViewSequence)</code>  
**Returns**: <code>Renderable</code> - surface/view  
<a name="module_VirtualViewSequence--VirtualViewSequence+getIndex"></a>
#### virtualViewSequence.getIndex() ⇒ <code>Number</code>
Get the index of the node.

**Kind**: instance method of <code>[VirtualViewSequence](#exp_module_VirtualViewSequence--VirtualViewSequence)</code>  
**Returns**: <code>Number</code> - Index of node.  
<a name="module_VirtualViewSequence--VirtualViewSequence+toString"></a>
#### virtualViewSequence.toString() ⇒ <code>String</code>
Get human readable string verion of the node.

**Kind**: instance method of <code>[VirtualViewSequence](#exp_module_VirtualViewSequence--VirtualViewSequence)</code>  
**Returns**: <code>String</code> - node as a human readable string  
<a name="module_VirtualViewSequence--VirtualViewSequence+cleanup"></a>
#### virtualViewSequence.cleanup() ⇒ <code>VirtualViewSequence</code>
Cleans up any un-accessed nodes since the previous call to `cleanup`.

This function cleans up any nodes that have not been accessed
since the last call to `cleanup`. When a node is accessed
through a call to `getNext`, `getPrevious`, `get` or `getIndex`
it is considered `touched` and should not be cleaned up.

**Kind**: instance method of <code>[VirtualViewSequence](#exp_module_VirtualViewSequence--VirtualViewSequence)</code>  
**Returns**: <code>VirtualViewSequence</code> - this.  
