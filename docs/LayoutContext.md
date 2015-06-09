<a name="module_LayoutContext"></a>
## LayoutContext
LayoutContext is the interface for a layout-function to access
renderables in the data-source and set their size, position, tranformation, etc...

The `next`, `prev` and `get` functions return an opaque object which represents
the renderable that is to be layed out. To access the actual renderable, use the
`.renderNode` property of this opaque object.


* [LayoutContext](#module_LayoutContext)
  * [LayoutContext](#exp_module_LayoutContext--LayoutContext) ⏏
    * [.size](#module_LayoutContext--LayoutContext+size)
    * [.direction](#module_LayoutContext--LayoutContext+direction)
    * [.scrollOffset](#module_LayoutContext--LayoutContext+scrollOffset)
    * [.scrollStart](#module_LayoutContext--LayoutContext+scrollStart)
    * [.scrollEnd](#module_LayoutContext--LayoutContext+scrollEnd)
    * [.next()](#module_LayoutContext--LayoutContext+next) ⇒ <code>Object</code>
    * [.prev()](#module_LayoutContext--LayoutContext+prev) ⇒ <code>Object</code>
    * [.get(node)](#module_LayoutContext--LayoutContext+get) ⇒ <code>Object</code>
    * [.set(node, set)](#module_LayoutContext--LayoutContext+set)
    * [.resolveSize(node)](#module_LayoutContext--LayoutContext+resolveSize) ⇒ <code>Size</code>

<a name="exp_module_LayoutContext--LayoutContext"></a>
### LayoutContext ⏏
**Kind**: Exported class  
<a name="module_LayoutContext--LayoutContext+size"></a>
#### layoutContext.size
{Property} Size in which to layout the renderables.

**Kind**: instance property of <code>[LayoutContext](#exp_module_LayoutContext--LayoutContext)</code>  
<a name="module_LayoutContext--LayoutContext+direction"></a>
#### layoutContext.direction
{Property} Direction in which to layout the renderables (0 = X, 1 = Y).

**Kind**: instance property of <code>[LayoutContext](#exp_module_LayoutContext--LayoutContext)</code>  
<a name="module_LayoutContext--LayoutContext+scrollOffset"></a>
#### layoutContext.scrollOffset
{Property} {Number} Scrolling offset at which to start laying out next/prev renderables.

**Kind**: instance property of <code>[LayoutContext](#exp_module_LayoutContext--LayoutContext)</code>  
<a name="module_LayoutContext--LayoutContext+scrollStart"></a>
#### layoutContext.scrollStart
{Property} {Number} Top/left boundary to which to layout renderables (default: 0).

**Kind**: instance property of <code>[LayoutContext](#exp_module_LayoutContext--LayoutContext)</code>  
<a name="module_LayoutContext--LayoutContext+scrollEnd"></a>
#### layoutContext.scrollEnd
{Property} {Number} Bottom/right boundary to which to continue laying out renderables.

**Kind**: instance property of <code>[LayoutContext](#exp_module_LayoutContext--LayoutContext)</code>  
<a name="module_LayoutContext--LayoutContext+next"></a>
#### layoutContext.next() ⇒ <code>Object</code>
Get the context-node for the next renderable in the data-source. When
the end of the data-source is reached, `undefined` is returned.
Use this function to enumerate the contents of a data-source that is
either an Array or a ViewSequence.

**Example:**

```javascript
function MyLayoutFunction(context, options) {
  var height = 0;
  var node = context.next(); // get first next node
  while (node) {
    context.set(node, {
      size: [context.size[0], 100],
      translate: [0, height, 0]
    });
    height += 100;
    node = context.next(); // get next node
  }
}
```

**Kind**: instance method of <code>[LayoutContext](#exp_module_LayoutContext--LayoutContext)</code>  
**Returns**: <code>Object</code> - context-node or undefined  
<a name="module_LayoutContext--LayoutContext+prev"></a>
#### layoutContext.prev() ⇒ <code>Object</code>
Get the context-node for the previous renderable in the data-source. When
the start of the data-source is reached, `undefined` is returned.
Use this function to enumerate the contents of a data-source that is
either an Array or a ViewSequence.

**Example:**

```javascript
function MyLayoutFunction(context, options) {
  var height = 0;
  var node = context.prev(); // get first previous
  while (node) {
    height -= 100;
    context.set(node, {
      size: [context.size[0], 100],
      translate: [0, height, 0]
    });
    node = context.prev(); // get prev node
  }
}
```

**Kind**: instance method of <code>[LayoutContext](#exp_module_LayoutContext--LayoutContext)</code>  
**Returns**: <code>Object</code> - context-node or undefined  
<a name="module_LayoutContext--LayoutContext+get"></a>
#### layoutContext.get(node) ⇒ <code>Object</code>
Get the context-node for a renderable with a specific id. This function
should be used to access data-sources which are key-value collections.
When a data-source is an Array or a ViewSequence, use `next()`.
In many cases it is not neccesary to use `get()`, instead you can pass
the id of the renderable straight to the `set` function.

**Example:**

```javascript
var layoutController = new LayoutController({
  layout: function (context, options) {
    var size = context.size;
    var left = context.get('left');
    context.set(left, { size: [100, size[1]] });

    var right = context.get('right');
    context.set(right, {
      size: [100, size[1]],
      translate: [size[1] - 100, 0, 0]
    });

    var middle = context.get('middle');
    context.set(middle, {
      size: [size[0] - 200, size[1]],
      translate: [100, 0, 0]
    });
  },
  dataSource: {
    left: new Surface({content: 'left'}),
    right: new Surface({content: 'right'}),
    middle: new Surface({content: 'middle'})
  }
});
```

**Arrays:**

A value at a specific id in the datasource can also be an array. To access the
context-nodes in the array use `get()` to get the array and the elements in the
array:

```javascript
var layoutController = new LayoutController({
  layout: function (context, options) {
    var size = context.size;
    var left = 0;

    // Position title
    context.set('title', { size: [100, size[1]] });
    left += 100;

    // Position left-items (array)
    var leftItems = context.get('leftItems');
    for (var i = 0; i < leftItems.length; i++) {
      var leftItem = context.get(leftItems[i]);
      context.set(leftItem, {
        size: [100, size[1]],
        translate: [left, 0, 0]
      });
      left += 100;
    }
  },
  dataSource: {
    title: new Surface({content: 'title'}),
    leftItems: [
      new Surface({content: 'item1'}),
      new Surface({content: 'item2'})
    ]
  }
});
```

**Kind**: instance method of <code>[LayoutContext](#exp_module_LayoutContext--LayoutContext)</code>  
**Returns**: <code>Object</code> - context-node or undefined  

| Param | Type | Description |
| --- | --- | --- |
| node | <code>Object</code> &#124; <code>String</code> | context-node or node-id |

<a name="module_LayoutContext--LayoutContext+set"></a>
#### layoutContext.set(node, set)
Set the size, origin, align, translation, scale, rotate, skew & opacity for a context-node.

**Overview of all supported properties:**

```javascript
function MyLayoutFunction(context, options) {
  context.set('mynode', {
    size: [100, 20],
    origin: [0.5, 0.5],
    align: [0.5, 0.5],
    translate: [50, 10, 0],
    scale: [1, 1, 1],
    skew: [0, 0, 0],
    rotate: [Math.PI, 0, 0],
    opacity: 1
  })
}
```

**Kind**: instance method of <code>[LayoutContext](#exp_module_LayoutContext--LayoutContext)</code>  

| Param | Type | Description |
| --- | --- | --- |
| node | <code>Object</code> &#124; <code>String</code> | context-node or node-id |
| set | <code>Object</code> | properties: size, origin, align, translate, scale, rotate, skew & opacity |

<a name="module_LayoutContext--LayoutContext+resolveSize"></a>
#### layoutContext.resolveSize(node) ⇒ <code>Size</code>
Resolve the size of a context-node by accessing the `getSize` function
of the renderable.

**Example:**

```javascript
var layoutController = new LayoutController({
  layout: function (context, options) {
    var centerSize = context.resolveSize('center');
    context.set('center', {origin: [0.5, 0.5]});
    context.set('centerRight', {
      origin: [0.5, 0.5],
      translate: [centerSize[0] / 2, 0, 0]
    });
  },
  dataSource: {
    center: new Surface({content: 'center'}),
    centerRight: new Surface({content: 'centerRight'}),
  }
});
```

**When the size of the renderable is calculated by the DOM (`true` size)**

When the layout-function performs its layout for the first time, it is
possible that the renderable has not yet been rendered and its size
is unknown. In this case, the LayoutController will cause a second
reflow of the layout the next render-cycle, ensuring that the renderables
are layed out as expected.

**Kind**: instance method of <code>[LayoutContext](#exp_module_LayoutContext--LayoutContext)</code>  
**Returns**: <code>Size</code> - size of the node  

| Param | Type | Description |
| --- | --- | --- |
| node | <code>Object</code> &#124; <code>String</code> | context-node, node-id or array-element |

