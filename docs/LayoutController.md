<a name="module_LayoutController"></a>
#LayoutController
LayoutController lays out renderables according to a layout-
function and a data-source.

The LayoutController is the most basic and lightweight version
of a controller/view laying out renderables according to a
layout-function.

<a name="exp_module_LayoutController"></a>
##class: LayoutController ⏏
**Members**

* [class: LayoutController ⏏](#exp_module_LayoutController)
  * [new LayoutController(options)](#exp_new_module_LayoutController)
  * [layoutController.setOptions(options)](#module_LayoutController#setOptions)
  * [layoutController.setDataSource(dataSource)](#module_LayoutController#setDataSource)
  * [layoutController.getDataSource()](#module_LayoutController#getDataSource)
  * [layoutController.setLayout(layout, [options])](#module_LayoutController#setLayout)
  * [layoutController.getLayout()](#module_LayoutController#getLayout)
  * [layoutController.setLayoutOptions([options])](#module_LayoutController#setLayoutOptions)
  * [layoutController.getLayoutOptions()](#module_LayoutController#getLayoutOptions)
  * [layoutController.setDirection(direction)](#module_LayoutController#setDirection)
  * [layoutController.getDirection([actual])](#module_LayoutController#getDirection)
  * [layoutController.getSpec(node)](#module_LayoutController#getSpec)
  * [layoutController.reflowLayout()](#module_LayoutController#reflowLayout)

<a name="exp_new_module_LayoutController"></a>
###new LayoutController(options)
**Params**

- options `Object` - Options.  
  - \[layout\] `function` | `Object` - Layout function or layout-literal.  
  - \[layoutOptions\] `Object` - Options to pass in to the layout-function.  
  - \[dataSource\] `Array` | `ViewSequence` | `Object` - Array, ViewSequence or Object with key/value pairs.  
  - \[direction\] `Utility.Direction` - Direction to layout into (e.g. Utility.Direction.Y) (when ommited the default direction of the layout is used)  

<a name="module_LayoutController#setOptions"></a>
###layoutController.setOptions(options)
Patches the LayoutController instance's options with the passed-in ones.

**Params**

- options `Options` - An object of configurable options for the LayoutController instance.  
  - \[layout\] `function` | `Object` - Layout function or layout-literal.  
  - \[layoutOptions\] `Object` - Options to pass in to the layout-function.  
  - \[dataSource\] `Array` | `ViewSequence` | `Object` - Array, ViewSequence or Object with key/value pairs.  
  - \[direction\] `Utility.Direction` - Direction to layout into (e.g. Utility.Direction.Y) (when ommited the default direction of the layout is used)  

**Returns**: `LayoutController` - this  
<a name="module_LayoutController#setDataSource"></a>
###layoutController.setDataSource(dataSource)
Sets the collection of renderables which are layed out according to
the layout-function.

The data-source can be either an Array, ViewSequence or Object
with key/value pairs.

**Params**

- dataSource `Array` | `Object` | `ViewSequence` - Array, ViewSequence or Object.  

**Returns**: `LayoutController` - this  
<a name="module_LayoutController#getDataSource"></a>
###layoutController.getDataSource()
Get the data-source.

**Returns**: `Array` | `ViewSequence` | `Object` - data-source  
<a name="module_LayoutController#setLayout"></a>
###layoutController.setLayout(layout, [options])
Set the new layout.

**Params**

- layout `function` | `Object` - Layout function or layout-literal  
- \[options\] `Object` - Options to pass in to the layout-function  

**Returns**: `LayoutController` - this  
<a name="module_LayoutController#getLayout"></a>
###layoutController.getLayout()
Get the current layout.

**Returns**: `function` | `Object` - Layout function or layout literal  
<a name="module_LayoutController#setLayoutOptions"></a>
###layoutController.setLayoutOptions([options])
Set the options for the current layout. Use this function after
`setLayout` to update one or more options for the layout-function.

**Params**

- \[options\] `Object` - Options to pass in to the layout-function  

**Returns**: `LayoutController` - this  
<a name="module_LayoutController#getLayoutOptions"></a>
###layoutController.getLayoutOptions()
Get the current layout options.

**Returns**: `Object` - Layout options  
<a name="module_LayoutController#setDirection"></a>
###layoutController.setDirection(direction)
Set the direction of the layout. When no direction is set, the default
direction of the layout function is used.

**Params**

- direction `Utility.Direction` - Direction (e.g. Utility.Direction.X)  

**Returns**: `LayoutController` - this  
<a name="module_LayoutController#getDirection"></a>
###layoutController.getDirection([actual])
Get the direction (e.g. Utility.Direction.Y). By default, this function
returns the direction that was configured by setting `setDirection`. When
the direction has not been set, `undefined` is returned.

When no direction has been set, the first direction is used that is specified
in the capabilities of the layout-function. To obtain the actual in-use direction,
use `getDirection(true)`. This method returns the actual in-use direction and
never returns undefined.

**Params**

- \[actual\] `Boolean` - Set to true to obtain the actual in-use direction  

**Returns**: `Utility.Direction` - Direction or undefined  
<a name="module_LayoutController#getSpec"></a>
###layoutController.getSpec(node)
Get the spec (size, transform, etc..) for the given renderable or
Id.

**Params**

- node `Renderable` | `String` - Renderabe or Id to look for  

**Returns**: `Spec` - spec or undefined  
<a name="module_LayoutController#reflowLayout"></a>
###layoutController.reflowLayout()
Forces a reflow of the layout the next render cycle.

**Returns**: `LayoutController` - this  
