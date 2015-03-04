<a name="module_LayoutDockHelper"></a>
#LayoutDockHelper
LayoutDockHelper helps positioning nodes using docking principles.

**Example:**

```javascript
var LayoutDockHelper = require('famous-flex/helpers/LayoutDockHelper');

function HeaderFooterLayout(context, options) {
  var dock = new LayoutDockHelper(context);
  dock.top('header', options.headerHeight);
  dock.bottom('footer', options.footerHeight);
  dock.fill('content');
};
```

You can also use layout-literals to create layouts using docking semantics:

```javascript
var layoutController = new LayoutController({
  layout: {dock: [
    ['top', 'header', 40],
    ['bottom', 'footer', 40, 1], // z-index +1
    ['fill', 'content']
  ]},
  dataSource: {
    header: new Surface({content: 'header'}),
    footer: new Surface({content: 'footer'}),
    content: new Surface({content: 'content'}),
  }
});
```

<a name="exp_module_LayoutDockHelper"></a>
##class: LayoutDockHelper ⏏
**Members**

* [class: LayoutDockHelper ⏏](#exp_module_LayoutDockHelper)
  * [new LayoutDockHelper(context, [options])](#exp_new_module_LayoutDockHelper)
  * [layoutDockHelper.parse(data)](#module_LayoutDockHelper#parse)
  * [layoutDockHelper.top([node], [height], [z])](#module_LayoutDockHelper#top)
  * [layoutDockHelper.left([node], [width], [z])](#module_LayoutDockHelper#left)
  * [layoutDockHelper.bottom([node], [height], [z])](#module_LayoutDockHelper#bottom)
  * [layoutDockHelper.right([node], [width], [z])](#module_LayoutDockHelper#right)
  * [layoutDockHelper.fill(node, [z])](#module_LayoutDockHelper#fill)
  * [layoutDockHelper.margins(margins)](#module_LayoutDockHelper#margins)

<a name="exp_new_module_LayoutDockHelper"></a>
###new LayoutDockHelper(context, [options])
**Params**

- context `LayoutContext` - layout-context  
- \[options\] `Object` - additional options  
  - \[margins\] `Object` - margins to start out with (default: 0px)  
  - \[translateZ\] `Number` - z-index to use when translating objects (default: 0)  

<a name="module_LayoutDockHelper#parse"></a>
###layoutDockHelper.parse(data)
Parses the layout-rules based on a JSON data object.
The object should be an array with the following syntax:
`[[rule, node, value, z], [rule, node, value, z], ...]`

**Example:**

```JSON
[
  ['top', 'header', 50],
  ['bottom', 'footer', 50, 10], // z-index: 10
  ['margins', [10, 5]], // marginate remaining space: 10px top/bottom, 5px left/right
  ['fill', 'content']
]
```

**Params**

- data `Object` - JSON object  

<a name="module_LayoutDockHelper#top"></a>
###layoutDockHelper.top([node], [height], [z])
Dock the node to the top.

**Params**

- \[node\] `LayoutNode` | `String` - layout-node to dock, when ommited the `height` argument argument is used for padding  
- \[height\] `Number` - height of the layout-node, when ommited the height of the node is used  
- \[z\] `Number` - z-index to use for the node  

**Returns**: `LayoutDockHelper` - this  
<a name="module_LayoutDockHelper#left"></a>
###layoutDockHelper.left([node], [width], [z])
Dock the node to the left

**Params**

- \[node\] `LayoutNode` | `String` - layout-node to dock, when ommited the `width` argument argument is used for padding  
- \[width\] `Number` - width of the layout-node, when ommited the width of the node is used  
- \[z\] `Number` - z-index to use for the node  

**Returns**: `LayoutDockHelper` - this  
<a name="module_LayoutDockHelper#bottom"></a>
###layoutDockHelper.bottom([node], [height], [z])
Dock the node to the bottom

**Params**

- \[node\] `LayoutNode` | `String` - layout-node to dock, when ommited the `height` argument argument is used for padding  
- \[height\] `Number` - height of the layout-node, when ommited the height of the node is used  
- \[z\] `Number` - z-index to use for the node  

**Returns**: `LayoutDockHelper` - this  
<a name="module_LayoutDockHelper#right"></a>
###layoutDockHelper.right([node], [width], [z])
Dock the node to the right.

**Params**

- \[node\] `LayoutNode` | `String` - layout-node to dock, when ommited the `width` argument argument is used for padding  
- \[width\] `Number` - width of the layout-node, when ommited the width of the node is used  
- \[z\] `Number` - z-index to use for the node  

**Returns**: `LayoutDockHelper` - this  
<a name="module_LayoutDockHelper#fill"></a>
###layoutDockHelper.fill(node, [z])
Fills the node to the remaining content.

**Params**

- node `LayoutNode` | `String` - layout-node to dock  
- \[z\] `Number` - z-index to use for the node  

**Returns**: `LayoutDockHelper` - this  
<a name="module_LayoutDockHelper#margins"></a>
###layoutDockHelper.margins(margins)
Applies indent margins to the remaining content.

**Params**

- margins `Number` | `Array` - margins shorthand (e.g. '5', [10, 10], [5, 10, 5, 10])  

**Returns**: `LayoutDockHelper` - this  
