<a name="module_LayoutController"></a>
#LayoutController
TODO

<a name="exp_module_LayoutController"></a>
##class: LayoutController ⏏
**Members**

* [class: LayoutController ⏏](#exp_module_LayoutController)
  * [new LayoutController(options)](#exp_new_module_LayoutController)
  * [LayoutController~setOptions(options)](#module_LayoutController..setOptions)
  * [LayoutController~setDataSource(dataSource)](#module_LayoutController..setDataSource)
  * [layoutController.getDataSource()](#module_LayoutController#getDataSource)
  * [layoutController.insert(indexOrId, renderable, [insertSpec])](#module_LayoutController#insert)
  * [layoutController.remove(indexOrId, [removeSpec])](#module_LayoutController#remove)
  * [layoutController.setLayout(layout, [options])](#module_LayoutController#setLayout)
  * [layoutController.getLayout()](#module_LayoutController#getLayout)
  * [layoutController.setLayoutOptions([options])](#module_LayoutController#setLayoutOptions)
  * [layoutController.patchLayoutOptions([options])](#module_LayoutController#patchLayoutOptions)
  * [layoutController.getLayoutOptions()](#module_LayoutController#getLayoutOptions)
  * [layoutController.getLayoutNode(renderable)](#module_LayoutController#getLayoutNode)
  * [layoutController.getLayoutNodeById(nodeId)](#module_LayoutController#getLayoutNodeById)
  * [layoutController.reflowLayout()](#module_LayoutController#reflowLayout)

<a name="exp_new_module_LayoutController"></a>
###new LayoutController(options)
**Params**

- options `Object` - Options.  

<a name="module_LayoutController..setOptions"></a>
###LayoutController~setOptions(options)
Patches the LayoutController instance's options with the passed-in ones.

**Params**

- options `Options` - An object of configurable options for the LayoutController instance.  

**Scope**: inner function of [LayoutController](#module_LayoutController)  
<a name="module_LayoutController..setDataSource"></a>
###LayoutController~setDataSource(dataSource)
Sets the collection of renderables which are layed out according to
the layout-function.

**Params**

- dataSource `Array` | `Object` | `ViewSequence` - Either an array of renderables or a Famous viewSequence.  

**Scope**: inner function of [LayoutController](#module_LayoutController)  
**Returns**: `LayoutController` - this  
<a name="module_LayoutController#getDataSource"></a>
###layoutController.getDataSource()
Get the data-source.

**Returns**: `Array` | `ViewSequence` | `Object` - data-source  
<a name="module_LayoutController#insert"></a>
###layoutController.insert(indexOrId, renderable, [insertSpec])
Inserts a renderable into the data-source.

**Params**

- indexOrId `Number` | `String` - Index within dataSource array or id (String)  
- renderable `Object` - Rendeable to add to the data-source  
- \[insertSpec\] `Object` - Spec (size, transform, etc..) to start with when inserting  

**Returns**: `LayoutController` - this  
<a name="module_LayoutController#remove"></a>
###layoutController.remove(indexOrId, [removeSpec])
Removes a renderable from the data-source. If the renderable is visible
then it will be removed using an animation (see removeSpec).

**Params**

- indexOrId `Number` | `String` - Index within dataSource array or id (String)  
- \[removeSpec\] `Object` - Spec (size, transform, etc..) to end with when removing  

**Returns**: `LayoutController` - this  
<a name="module_LayoutController#setLayout"></a>
###layoutController.setLayout(layout, [options])
Set the new layout

**Params**

- layout `function` - Layout function  
- \[options\] `Object` - Options to pass in to the layout-function  

**Returns**: `LayoutController` - this  
<a name="module_LayoutController#getLayout"></a>
###layoutController.getLayout()
Get the current layout-function

**Returns**: `function` - Layout function  
<a name="module_LayoutController#setLayoutOptions"></a>
###layoutController.setLayoutOptions([options])
Set the options for the current layout. Use this function after
`setLayout` to update the options for the layout-function.

**Params**

- \[options\] `Object` - Options to pass in to the layout-function  

**Returns**: `LayoutController` - this  
<a name="module_LayoutController#patchLayoutOptions"></a>
###layoutController.patchLayoutOptions([options])
Patches the options for the current layout. Use this function to change
just one or a couple of layout-options, instead to having to set all
the options again.

**Params**

- \[options\] `Object` - Options to pass in to the layout-function  

**Returns**: `LayoutController` - this  
<a name="module_LayoutController#getLayoutOptions"></a>
###layoutController.getLayoutOptions()
Get the current layout options.

**Returns**: `Object` - Layout options  
<a name="module_LayoutController#getLayoutNode"></a>
###layoutController.getLayoutNode(renderable)
Get the layout-node based on the renderable that was provided
in the data-source.

**Params**

- renderable `Object` - Renderable to look for  

**Returns**: `LayoutNode` - layout-node or undefined  
<a name="module_LayoutController#getLayoutNodeById"></a>
###layoutController.getLayoutNodeById(nodeId)
Get the layout-node based on the id of the renderable that was provided
in the data-source. If the content at the given id was an array, then
that array is returned as is. You can use `getLayoutNode` on the elements
of the array to obtain their `LayoutNode`s.

**Params**

- nodeId `String` - Node-id to look for  

**Returns**: `LayoutNode` | `Array` - layout-node, undefined or an error of renderables.  
<a name="module_LayoutController#reflowLayout"></a>
###layoutController.reflowLayout()
Forces a reflow of the layout, the next render cycle.

**Returns**: `LayoutController` - this  
