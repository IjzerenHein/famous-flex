<a name="module_LayoutDockHelper"></a>
##LayoutDockHelper
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


* [LayoutDockHelper](#module_LayoutDockHelper)
  * [class: LayoutDockHelper](#exp_module_LayoutDockHelper--LayoutDockHelper) ⏏
    * [new LayoutDockHelper(context, [options])](#new_module_LayoutDockHelper--LayoutDockHelper_new)
    * _instance_
      * [.parse(data)](#module_LayoutDockHelper--LayoutDockHelper#parse)
      * [.top([node], [height], [z])](#module_LayoutDockHelper--LayoutDockHelper#top) ⇒ <code>LayoutDockHelper</code>
      * [.left([node], [width], [z])](#module_LayoutDockHelper--LayoutDockHelper#left) ⇒ <code>LayoutDockHelper</code>
      * [.bottom([node], [height], [z])](#module_LayoutDockHelper--LayoutDockHelper#bottom) ⇒ <code>LayoutDockHelper</code>
      * [.right([node], [width], [z])](#module_LayoutDockHelper--LayoutDockHelper#right) ⇒ <code>LayoutDockHelper</code>
      * [.fill(node, [z])](#module_LayoutDockHelper--LayoutDockHelper#fill) ⇒ <code>LayoutDockHelper</code>
      * [.margins(margins)](#module_LayoutDockHelper--LayoutDockHelper#margins) ⇒ <code>LayoutDockHelper</code>

<a name="exp_module_LayoutDockHelper--LayoutDockHelper"></a>
###class: LayoutDockHelper ⏏
<a name="new_module_LayoutDockHelper--LayoutDockHelper_new"></a>
####new LayoutDockHelper(context, [options])
| Param | Type | Description |
| ----- | ---- | ----------- |
| context | <code>LayoutContext</code> | layout-context |
| \[options\] | <code>Object</code> | additional options |
| \[options.margins\] | <code>Object</code> | margins to start out with (default: 0px) |
| \[options.translateZ\] | <code>Number</code> | z-index to use when translating objects (default: 0) |

<a name="module_LayoutDockHelper--LayoutDockHelper#parse"></a>
####layoutDockHelper.parse(data)
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

| Param | Type | Description |
| ----- | ---- | ----------- |
| data | <code>Object</code> | JSON object |

<a name="module_LayoutDockHelper--LayoutDockHelper#top"></a>
####layoutDockHelper.top([node], [height], [z]) ⇒ <code>LayoutDockHelper</code>
Dock the node to the top.

| Param | Type | Description |
| ----- | ---- | ----------- |
| \[node\] | <code>LayoutNode</code> \| <code>String</code> | layout-node to dock, when ommited the `height` argument argument is used for padding |
| \[height\] | <code>Number</code> | height of the layout-node, when ommited the height of the node is used |
| \[z\] | <code>Number</code> | z-index to use for the node |

**Returns**: <code>LayoutDockHelper</code> - this  
<a name="module_LayoutDockHelper--LayoutDockHelper#left"></a>
####layoutDockHelper.left([node], [width], [z]) ⇒ <code>LayoutDockHelper</code>
Dock the node to the left

| Param | Type | Description |
| ----- | ---- | ----------- |
| \[node\] | <code>LayoutNode</code> \| <code>String</code> | layout-node to dock, when ommited the `width` argument argument is used for padding |
| \[width\] | <code>Number</code> | width of the layout-node, when ommited the width of the node is used |
| \[z\] | <code>Number</code> | z-index to use for the node |

**Returns**: <code>LayoutDockHelper</code> - this  
<a name="module_LayoutDockHelper--LayoutDockHelper#bottom"></a>
####layoutDockHelper.bottom([node], [height], [z]) ⇒ <code>LayoutDockHelper</code>
Dock the node to the bottom

| Param | Type | Description |
| ----- | ---- | ----------- |
| \[node\] | <code>LayoutNode</code> \| <code>String</code> | layout-node to dock, when ommited the `height` argument argument is used for padding |
| \[height\] | <code>Number</code> | height of the layout-node, when ommited the height of the node is used |
| \[z\] | <code>Number</code> | z-index to use for the node |

**Returns**: <code>LayoutDockHelper</code> - this  
<a name="module_LayoutDockHelper--LayoutDockHelper#right"></a>
####layoutDockHelper.right([node], [width], [z]) ⇒ <code>LayoutDockHelper</code>
Dock the node to the right.

| Param | Type | Description |
| ----- | ---- | ----------- |
| \[node\] | <code>LayoutNode</code> \| <code>String</code> | layout-node to dock, when ommited the `width` argument argument is used for padding |
| \[width\] | <code>Number</code> | width of the layout-node, when ommited the width of the node is used |
| \[z\] | <code>Number</code> | z-index to use for the node |

**Returns**: <code>LayoutDockHelper</code> - this  
<a name="module_LayoutDockHelper--LayoutDockHelper#fill"></a>
####layoutDockHelper.fill(node, [z]) ⇒ <code>LayoutDockHelper</code>
Fills the node to the remaining content.

| Param | Type | Description |
| ----- | ---- | ----------- |
| node | <code>LayoutNode</code> \| <code>String</code> | layout-node to dock |
| \[z\] | <code>Number</code> | z-index to use for the node |

**Returns**: <code>LayoutDockHelper</code> - this  
<a name="module_LayoutDockHelper--LayoutDockHelper#margins"></a>
####layoutDockHelper.margins(margins) ⇒ <code>LayoutDockHelper</code>
Applies indent margins to the remaining content.

| Param | Type | Description |
| ----- | ---- | ----------- |
| margins | <code>Number</code> \| <code>Array</code> | margins shorthand (e.g. '5', [10, 10], [5, 10, 5, 10]) |

**Returns**: <code>LayoutDockHelper</code> - this  
