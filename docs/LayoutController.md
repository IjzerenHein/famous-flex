<a name="module_LayoutController"></a>
##LayoutController
LayoutController lays out renderables according to a layout-
function and a data-source.

Events:

|event      |description|
|-----------|-----------|
|layoutstart|Emitted before the layout function is executed.|
|layoutend  |Emitted after the layout function has been executed.|
|reflow     |Emitted after one or more renderables have been changed.|


* [LayoutController](#module_LayoutController)
  * [class: LayoutController](#exp_module_LayoutController--LayoutController) ⏏
    * [new LayoutController(options)](#new_module_LayoutController--LayoutController_new)
    * _instance_
      * [.setOptions(options)](#module_LayoutController--LayoutController#setOptions) ⇒ <code>LayoutController</code>
      * [.setDataSource(dataSource)](#module_LayoutController--LayoutController#setDataSource) ⇒ <code>LayoutController</code>
      * [.getDataSource()](#module_LayoutController--LayoutController#getDataSource) ⇒ <code>Array</code> \| <code>ViewSequence</code> \| <code>Object</code>
      * [.setLayout(layout, [options])](#module_LayoutController--LayoutController#setLayout) ⇒ <code>LayoutController</code>
      * [.getLayout()](#module_LayoutController--LayoutController#getLayout) ⇒ <code>function</code> \| <code>Object</code>
      * [.setLayoutOptions([options])](#module_LayoutController--LayoutController#setLayoutOptions) ⇒ <code>LayoutController</code>
      * [.getLayoutOptions()](#module_LayoutController--LayoutController#getLayoutOptions) ⇒ <code>Object</code>
      * [.setDirection(direction)](#module_LayoutController--LayoutController#setDirection) ⇒ <code>LayoutController</code>
      * [.getDirection([actual])](#module_LayoutController--LayoutController#getDirection) ⇒ <code>Utility.Direction</code>
      * [.getSpec(node, normalize)](#module_LayoutController--LayoutController#getSpec) ⇒ <code>Spec</code>
      * [.reflowLayout()](#module_LayoutController--LayoutController#reflowLayout) ⇒ <code>LayoutController</code>
      * [.insert(indexOrId, renderable, [insertSpec])](#module_LayoutController--LayoutController#insert) ⇒ <code>LayoutController</code>
      * [.push(renderable, [insertSpec])](#module_LayoutController--LayoutController#push) ⇒ <code>LayoutController</code>
      * [.swap(index, index2)](#module_LayoutController--LayoutController#swap) ⇒ <code>LayoutController</code>
      * [.remove(indexOrId, [removeSpec])](#module_LayoutController--LayoutController#remove) ⇒ <code>LayoutController</code>
      * [.removeAll()](#module_LayoutController--LayoutController#removeAll) ⇒ <code>LayoutController</code>
      * [.getSize()](#module_LayoutController--LayoutController#getSize) ⇒ <code>Array.Number</code>

<a name="exp_module_LayoutController--LayoutController"></a>
###class: LayoutController ⏏
<a name="new_module_LayoutController--LayoutController_new"></a>
####new LayoutController(options)
| Param | Type | Description |
| ----- | ---- | ----------- |
| options | <code>Object</code> | Options. |
| \[options.layout\] | <code>function</code> \| <code>Object</code> | Layout function or layout-literal. |
| \[options.layoutOptions\] | <code>Object</code> | Options to pass in to the layout-function. |
| \[options.dataSource\] | <code>Array</code> \| <code>ViewSequence</code> \| <code>Object</code> | Array, ViewSequence or Object with key/value pairs. |
| \[options.direction\] | <code>Utility.Direction</code> | Direction to layout into (e.g. Utility.Direction.Y) (when ommited the default direction of the layout is used) |
| \[options.flow\] | <code>Bool</code> | Enables flow animations when the layout changes (default: `false`). |
| \[options.reflowOnResize\] | <code>Bool</code> | Smoothly reflows renderables on resize (only used when flow = true) (default: `true`). |
| \[options.insertSpec\] | <code>Spec</code> | Size, transform, opacity... to use when inserting new renderables into the scene (default: `{}`). |
| \[options.removeSpec\] | <code>Spec</code> | Size, transform, opacity... to use when removing renderables from the scene (default: `{}`). |
| \[options.alwaysLayout\] | <code>Bool</code> | When set to true, always calls the layout function on every render-cycle (default: `false`). |
| \[options.autoPipeEvents\] | <code>Bool</code> | When set to true, automatically calls .pipe on all renderables when inserted (default: `false`). |
| \[options.preallocateNodes\] | <code>Object</code> | Optimisation option to improve initial scrolling/animation performance by pre-allocating nodes, e.g.: `{count: 50, spec: {size:[0, 0], transform: Transform.identity}}`. |

<a name="module_LayoutController--LayoutController#setOptions"></a>
####layoutController.setOptions(options) ⇒ <code>LayoutController</code>
Patches the LayoutController instance's options with the passed-in ones.

| Param | Type | Description |
| ----- | ---- | ----------- |
| options | <code>Options</code> | An object of configurable options for the LayoutController instance. |
| \[options.layout\] | <code>function</code> \| <code>Object</code> | Layout function or layout-literal. |
| \[options.layoutOptions\] | <code>Object</code> | Options to pass in to the layout-function. |
| \[options.dataSource\] | <code>Array</code> \| <code>ViewSequence</code> \| <code>Object</code> | Array, ViewSequence or Object with key/value pairs. |
| \[options.direction\] | <code>Utility.Direction</code> | Direction to layout into (e.g. Utility.Direction.Y) (when ommited the default direction of the layout is used) |
| \[options.insertSpec\] | <code>Spec</code> | Size, transform, opacity... to use when inserting new renderables into the scene (default: `{}`). |
| \[options.removeSpec\] | <code>Spec</code> | Size, transform, opacity... to use when removing renderables from the scene (default: `{}`). |
| \[options.alwaysLayout\] | <code>Bool</code> | When set to true, always calls the layout function on every render-cycle (default: `false`). |
| \[options.autoPipeEvents\] | <code>Bool</code> | When set to true, automatically calls .pipe on all renderables when inserted (default: `false`). |

**Returns**: <code>LayoutController</code> - this  
<a name="module_LayoutController--LayoutController#setDataSource"></a>
####layoutController.setDataSource(dataSource) ⇒ <code>LayoutController</code>
Sets the collection of renderables which are layed out according to
the layout-function.

The data-source can be either an Array, ViewSequence or Object
with key/value pairs.

| Param | Type | Description |
| ----- | ---- | ----------- |
| dataSource | <code>Array</code> \| <code>Object</code> \| <code>ViewSequence</code> | Array, ViewSequence or Object. |

**Returns**: <code>LayoutController</code> - this  
<a name="module_LayoutController--LayoutController#getDataSource"></a>
####layoutController.getDataSource() ⇒ <code>Array</code> \| <code>ViewSequence</code> \| <code>Object</code>
Get the data-source.

**Returns**: <code>Array</code> \| <code>ViewSequence</code> \| <code>Object</code> - data-source  
<a name="module_LayoutController--LayoutController#setLayout"></a>
####layoutController.setLayout(layout, [options]) ⇒ <code>LayoutController</code>
Set the new layout.

| Param | Type | Description |
| ----- | ---- | ----------- |
| layout | <code>function</code> \| <code>Object</code> | Layout function or layout-literal |
| \[options\] | <code>Object</code> | Options to pass in to the layout-function |

**Returns**: <code>LayoutController</code> - this  
<a name="module_LayoutController--LayoutController#getLayout"></a>
####layoutController.getLayout() ⇒ <code>function</code> \| <code>Object</code>
Get the current layout.

**Returns**: <code>function</code> \| <code>Object</code> - Layout function or layout literal  
<a name="module_LayoutController--LayoutController#setLayoutOptions"></a>
####layoutController.setLayoutOptions([options]) ⇒ <code>LayoutController</code>
Set the options for the current layout. Use this function after
`setLayout` to update one or more options for the layout-function.

| Param | Type | Description |
| ----- | ---- | ----------- |
| \[options\] | <code>Object</code> | Options to pass in to the layout-function |

**Returns**: <code>LayoutController</code> - this  
<a name="module_LayoutController--LayoutController#getLayoutOptions"></a>
####layoutController.getLayoutOptions() ⇒ <code>Object</code>
Get the current layout options.

**Returns**: <code>Object</code> - Layout options  
<a name="module_LayoutController--LayoutController#setDirection"></a>
####layoutController.setDirection(direction) ⇒ <code>LayoutController</code>
Set the direction of the layout. When no direction is set, the default
direction of the layout function is used.

| Param | Type | Description |
| ----- | ---- | ----------- |
| direction | <code>Utility.Direction</code> | Direction (e.g. Utility.Direction.X) |

**Returns**: <code>LayoutController</code> - this  
<a name="module_LayoutController--LayoutController#getDirection"></a>
####layoutController.getDirection([actual]) ⇒ <code>Utility.Direction</code>
Get the direction (e.g. Utility.Direction.Y). By default, this function
returns the direction that was configured by setting `setDirection`. When
the direction has not been set, `undefined` is returned.

When no direction has been set, the first direction is used that is specified
in the capabilities of the layout-function. To obtain the actual in-use direction,
use `getDirection(true)`. This method returns the actual in-use direction and
never returns undefined.

| Param | Type | Description |
| ----- | ---- | ----------- |
| \[actual\] | <code>Boolean</code> | Set to true to obtain the actual in-use direction |

**Returns**: <code>Utility.Direction</code> - Direction or undefined  
<a name="module_LayoutController--LayoutController#getSpec"></a>
####layoutController.getSpec(node, normalize) ⇒ <code>Spec</code>
Get the spec (size, transform, etc..) for the given renderable or
Id.

| Param | Type | Description |
| ----- | ---- | ----------- |
| node | <code>Renderable</code> \| <code>String</code> | Renderabe or Id to look for |
| normalize | <code>Bool</code> | When set to `true` normalizes the origin/align into the transform translation (default: `false`). |

**Returns**: <code>Spec</code> - spec or undefined  
<a name="module_LayoutController--LayoutController#reflowLayout"></a>
####layoutController.reflowLayout() ⇒ <code>LayoutController</code>
Forces a reflow of the layout the next render cycle.

**Returns**: <code>LayoutController</code> - this  
<a name="module_LayoutController--LayoutController#insert"></a>
####layoutController.insert(indexOrId, renderable, [insertSpec]) ⇒ <code>LayoutController</code>
Inserts a renderable into the data-source.

The optional argument `insertSpec` is only used `flow` mode is enabled.
When specified, the renderable is inserted using an animation starting with
size, origin, opacity, transform, etc... as specified in `insertSpec'.

| Param | Type | Description |
| ----- | ---- | ----------- |
| indexOrId | <code>Number</code> \| <code>String</code> | Index (0 = before first, -1 at end), within dataSource array or id (String) |
| renderable | <code>Object</code> | Renderable to add to the data-source |
| \[insertSpec\] | <code>Spec</code> | Size, transform, etc.. to start with when inserting |

**Returns**: <code>LayoutController</code> - this  
<a name="module_LayoutController--LayoutController#push"></a>
####layoutController.push(renderable, [insertSpec]) ⇒ <code>LayoutController</code>
Adds a renderable to the end of a sequential data-source.

The optional argument `insertSpec` is only used `flow` mode is enabled.
When specified, the renderable is inserted using an animation starting with
size, origin, opacity, transform, etc... as specified in `insertSpec'.

| Param | Type | Description |
| ----- | ---- | ----------- |
| renderable | <code>Object</code> | Renderable to add to the data-source |
| \[insertSpec\] | <code>Spec</code> | Size, transform, etc.. to start with when inserting |

**Returns**: <code>LayoutController</code> - this  
<a name="module_LayoutController--LayoutController#swap"></a>
####layoutController.swap(index, index2) ⇒ <code>LayoutController</code>
Swaps two renderables at the given positions.

| Param | Type | Description |
| ----- | ---- | ----------- |
| index | <code>Number</code> | Index of the renderable to swap |
| index2 | <code>Number</code> | Index of the renderable to swap with |

**Returns**: <code>LayoutController</code> - this  
<a name="module_LayoutController--LayoutController#remove"></a>
####layoutController.remove(indexOrId, [removeSpec]) ⇒ <code>LayoutController</code>
Removes a renderable from the data-source.

The optional argument `removeSpec` is only used `flow` mode is enabled.
When specified, the renderable is removed using an animation ending at
the size, origin, opacity, transform, etc... as specified in `removeSpec'.

| Param | Type | Description |
| ----- | ---- | ----------- |
| indexOrId | <code>Number</code> \| <code>String</code> | Index within dataSource array or id (String) |
| \[removeSpec\] | <code>Spec</code> | Size, transform, etc.. to end with when removing |

**Returns**: <code>LayoutController</code> - this  
<a name="module_LayoutController--LayoutController#removeAll"></a>
####layoutController.removeAll() ⇒ <code>LayoutController</code>
Removes all renderables from the data-source.

**Returns**: <code>LayoutController</code> - this  
<a name="module_LayoutController--LayoutController#getSize"></a>
####layoutController.getSize() ⇒ <code>Array.Number</code>
Return size of contained element or `undefined` when size is not defined.

**Returns**: <code>Array.Number</code> - [width, height]  
