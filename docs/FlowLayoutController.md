<a name="module_FlowLayoutController"></a>
#FlowLayoutController
FlowLayoutController transitions renderables smoothly from one
layout to another. When the data-source or layout is changed,
the renderables are transitioned from their old state (size,
transform, origin, etc..) to the new state.

Inherited from: [LayoutController](./LayoutController.md)

<a name="exp_module_FlowLayoutController"></a>
##class: FlowLayoutController ⏏
**Extends**: `LayoutController`  
**Members**

* [class: FlowLayoutController ⏏](#exp_module_FlowLayoutController)
  * [new FlowLayoutController(options)](#exp_new_module_FlowLayoutController)
  * [flowLayoutController.setOptions(options)](#module_FlowLayoutController#setOptions)
  * [flowLayoutController.insert(indexOrId, renderable, [spec])](#module_FlowLayoutController#insert)
  * [flowLayoutController.remove(indexOrId, [spec])](#module_FlowLayoutController#remove)

<a name="exp_new_module_FlowLayoutController"></a>
###new FlowLayoutController(options)
**Params**

- options `Object` - Options.  
  - \[layout\] `function` | `Object` - Layout function or layout-literal.  
  - \[layoutOptions\] `Object` - Options to pass in to the layout-function.  
  - \[dataSource\] `Array` | `ViewSequence` | `Object` - Array, ViewSequence or Object with key/value pairs.  
  - \[direction\] `Utility.Direction` - Direction to layout into (e.g. Utility.Direction.Y) (when ommited the default direction of the layout is used)  
  - \[insertSpec\] `Spec` - Size, transform, opacity... to use when inserting new renderables into the scene.  
  - \[removeSpec\] `Spec` - Size, transform, opacity... to use when removing renderables from the scene.  
  - \[nodeSpring\] `Object` - Spring options to use when transitioning between states  

**Extends**: `LayoutController`  
<a name="module_FlowLayoutController#setOptions"></a>
###flowLayoutController.setOptions(options)
Patches the FlowLayoutController instance's options with the passed-in ones.

**Params**

- options `Options` - An object of configurable options for the FlowLayoutController instance.  
  - \[layout\] `function` | `Object` - Layout function or layout-literal.  
  - \[layoutOptions\] `Object` - Options to pass in to the layout-function.  
  - \[dataSource\] `Array` | `ViewSequence` | `Object` - Array, ViewSequence or Object with key/value pairs.  
  - \[direction\] `Utility.Direction` - Direction to layout into (e.g. Utility.Direction.Y) (when ommited the default direction of the layout is used)  
  - \[insertSpec\] `Spec` - Size, transform, opacity... to use when inserting new renderables into the scene.  
  - \[removeSpec\] `Spec` - Size, transform, opacity... to use when removing renderables from the scene.  
  - \[nodeSpring\] `Object` - Spring options to use when transitioning between states  

**Returns**: `FlowLayoutController` - this  
<a name="module_FlowLayoutController#insert"></a>
###flowLayoutController.insert(indexOrId, renderable, [spec])
Inserts a renderable into the data-source. If the renderable is visible
then it is inserted using an animation.

**Params**

- indexOrId `Number` | `String` - Index within dataSource array or id (String)  
- renderable `Object` - Rendeable to add to the data-source  
- \[spec\] `Spec` - Size, transform, etc.. to start with when inserting  

**Returns**: `FlowLayoutController` - this  
<a name="module_FlowLayoutController#remove"></a>
###flowLayoutController.remove(indexOrId, [spec])
Removes a renderable from the data-source. If the renderable is visible
then it will be removed using an animation.

**Params**

- indexOrId `Number` | `String` - Index within dataSource array or id (String)  
- \[spec\] `Spec` - Size, transform, etc.. to end with when removing  

**Returns**: `FlowLayoutController` - this  
