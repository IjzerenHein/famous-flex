<a name="module_LayoutContext"></a>
#LayoutContext
LayoutContext is the interface for a layout-function to access
renderables in the data-source and set their size, position, tranformation, etc...

<a name="exp_module_LayoutContext"></a>
##class: LayoutContext ⏏
**Members**

* [class: LayoutContext ⏏](#exp_module_LayoutContext)
  * [layoutContext.next()](#module_LayoutContext#next)
  * [layoutContext.get(nodeId)](#module_LayoutContext#get)
  * [layoutContext.set(node, set)](#module_LayoutContext#set)
  * [layoutContext.resolveSize(node)](#module_LayoutContext#resolveSize)

<a name="module_LayoutContext#next"></a>
###layoutContext.next()
Get the layout-node for the next renderable in the data-source. When
the end of the data-source is reached, `undefined` is returned.
Use this function to enumerate the contents of a data-source that is
either an Array or a ViewSequence.

**Example:**

```javascript
function MyLayoutFunction(size, context, options) {
  var height = 0;
  var node = context.next(); // get first node
  while (node) {
    context.set({
      size: [size[0], 100],
      transform: [0, height, 0]
    });
    height += 100;
    node = context.next(); // get next node
  }
}
```

**Returns**: `LayoutNode` - layout-node or undefined  
<a name="module_LayoutContext#get"></a>
###layoutContext.get(nodeId)
Get the layout-node for a renderable with a specific id. This function
should be used to access data-sources which are key-value collections.
When a data-source is an Array or a ViewSequence, use `next()`.
In many cases it is not neccesary to use `get()`, instead you can pass
the id of the renderable straight to the `set` function.

**Example:**

```javascript
var layoutController = new LayoutController({
  layout: function (size, context, options) {
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
layout-nodes in the array use `get()` to get the array and enumerate the
elements in the array:

```javascript
var layoutController = new LayoutController({
  layout: function (size, context, options) {
    var left = 0;

    // Position title
    context.set('title', { size: [100, size[1]] });
    left += 100;

    // Position left-items (array)
    var leftItems = context.get('leftItems');
    for (var i = 0; i < leftItems.length; i++) {
      context.set(leftItems[i], {
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

**Params**

- nodeId `String` | `RenderNode` | `Array.Elmement` - object to resolve into a LayoutNode  

**Returns**: `LayoutNode` - layout-node or undefined  
<a name="module_LayoutContext#set"></a>
###layoutContext.set(node, set)
Set the size, origin, align, translation, scale, rotate & skew for a layout-node.

**Overview of all supported properties:**

```javascript
function MyLayoutFunction(size, context, options) {
  context.set('mynode', {
    size: [100, 20],
    origin: [0.5, 0.5],
    align: [0.5, 0.5],
    translate: [50, 10, 0],
    scale: [1, 1, 1],
    skew: [0, 0, 0],
    rotate: [Math.PI, 0, 0],
  })
}
```

**Params**

- node `LayoutNode` | `String` | `Array.Eelement` - layout-node, node-id or array-element  
- set `Object` - properties: size, origin, align, translate, scale, rotate & skew  

<a name="module_LayoutContext#resolveSize"></a>
###layoutContext.resolveSize(node)
Resolve the size of a layout-node by accessing the `getSize` function
of the renderable.

**Example:**

```javascript
var layoutController = new LayoutController({
  layout: function (size, context, options) {
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

**Params**

- node `LayoutNode` | `String` | `Array.Eelement` - layout-node, node-id or array-element  

**Returns**: `Size` - size of the node  
