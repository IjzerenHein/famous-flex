<a name="module_AnimationController"></a>
## AnimationController
Animating between famo.us views in awesome ways.


* [AnimationController](#module_AnimationController)
  * [AnimationController](#exp_module_AnimationController--AnimationController) ⏏
    * [new AnimationController([options])](#new_module_AnimationController--AnimationController_new)
    * _instance_
      * [.show(renderable, [options], [callback])](#module_AnimationController--AnimationController+show) ⇒ <code>AnimationController</code>
      * [.hide([options], [callback])](#module_AnimationController--AnimationController+hide) ⇒ <code>AnimationController</code>
      * [.halt([stopAnimation], [framePerc])](#module_AnimationController--AnimationController+halt) ⇒ <code>AnimationController</code>
      * [.abort([callback])](#module_AnimationController--AnimationController+abort) ⇒ <code>AnimationController</code>
      * [.get()](#module_AnimationController--AnimationController+get) ⇒ <code>Renderable</code>
      * [.getSize()](#module_AnimationController--AnimationController+getSize) ⇒ <code>Array.Number</code>
    * _static_
      * [.Animation](#module_AnimationController--AnimationController.Animation)

<a name="exp_module_AnimationController--AnimationController"></a>
### AnimationController ⏏
**Kind**: Exported class  
<a name="new_module_AnimationController--AnimationController_new"></a>
#### new AnimationController([options])

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Configurable options. |
| [options.transition] | <code>Object</code> | Transition options (default: `{duration: 400, curve: Easing.inOutQuad}`). |
| [options.animation] | <code>function</code> | Animation function (default: `AnimationController.Animation.Slide.Left`). |
| [options.zIndexOffset] | <code>Number</code> | Optional z-index difference between the hiding & showing renderable (default: 0). |
| [options.keepHiddenViewsInDOMCount] | <code>Number</code> | Keeps views in the DOM after they have been hidden (default: 0). |
| [options.show] | <code>Object</code> | Show specific options. |
| [options.show.transition] | <code>Object</code> | Show specific transition options. |
| [options.show.animation] | <code>function</code> | Show specific animation function. |
| [options.hide] | <code>Object</code> | Hide specific options. |
| [options.hide.transition] | <code>Object</code> | Hide specific transition options. |
| [options.hide.animation] | <code>function</code> | Hide specific animation function. |
| [options.transfer] | <code>Object</code> | Transfer options. |
| [options.transfer.transition] | <code>Object</code> | Transfer specific transition options. |
| [options.transfer.zIndex] | <code>Number</code> | Z-index the tranferables are moved on top while animating (default: 10). |
| [options.transfer.fastResize] | <code>Bool</code> | When enabled, scales the renderable i.s.o. resizing when doing the transfer animation (default: true). |
| [options.transfer.items] | <code>Array</code> | Ids (key/value) pairs (source-id/target-id) of the renderables that should be transferred. |

<a name="module_AnimationController--AnimationController+show"></a>
#### animationController.show(renderable, [options], [callback]) ⇒ <code>AnimationController</code>
Shows a renderable using an animation and hides the old renderable.

When multiple show operations are executed, they are queued and
shown in that sequence. Use `.halt` to cancel any pending show
operations from the queue.

**Kind**: instance method of <code>[AnimationController](#exp_module_AnimationController--AnimationController)</code>  
**Returns**: <code>AnimationController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| renderable | <code>Renderable</code> | View or surface to show |
| [options] | <code>Object</code> | Options. |
| [options.transition] | <code>Object</code> | Transition options for both show & hide. |
| [options.animation] | <code>function</code> | Animation function for both show & hide. |
| [options.wait] | <code>Promise</code> | A promise to wait for before running the animation. |
| [options.show] | <code>Object</code> | Show specific options. |
| [options.show.transition] | <code>Object</code> | Show specific transition options. |
| [options.show.animation] | <code>function</code> | Show specific animation function. |
| [options.hide] | <code>Object</code> | Hide specific options. |
| [options.hide.transition] | <code>Object</code> | Hide specific transition options. |
| [options.hide.animation] | <code>function</code> | Hide specific animation function. |
| [options.transfer] | <code>Object</code> | Transfer options. |
| [options.transfer.transition] | <code>Object</code> | Transfer specific transition options. |
| [options.transfer.zIndex] | <code>Number</code> | Z-index the tranferables are moved on top while animating. |
| [options.transfer.items] | <code>Array</code> | Ids (key/value) pairs (source-id/target-id) of the renderables that should be transferred. |
| [callback] | <code>function</code> | Function that is called on completion. |

<a name="module_AnimationController--AnimationController+hide"></a>
#### animationController.hide([options], [callback]) ⇒ <code>AnimationController</code>
Hides the current view with an animation.

**Kind**: instance method of <code>[AnimationController](#exp_module_AnimationController--AnimationController)</code>  
**Returns**: <code>AnimationController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Hide options |
| [options.transition] | <code>Object</code> | Hide transition options. |
| [options.animation] | <code>function</code> | Hide animation function. |
| [callback] | <code>function</code> | Function that is called an completion. |

<a name="module_AnimationController--AnimationController+halt"></a>
#### animationController.halt([stopAnimation], [framePerc]) ⇒ <code>AnimationController</code>
Clears the queue of any pending show animations.

**Kind**: instance method of <code>[AnimationController](#exp_module_AnimationController--AnimationController)</code>  
**Returns**: <code>AnimationController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| [stopAnimation] | <code>Boolean</code> | Freezes the current animation. |
| [framePerc] | <code>Number</code> | Frame at which to freeze the animation (in percentage). |

<a name="module_AnimationController--AnimationController+abort"></a>
#### animationController.abort([callback]) ⇒ <code>AnimationController</code>
Aborts the currently active show or hide operation, effectively
reversing the animation.

**Kind**: instance method of <code>[AnimationController](#exp_module_AnimationController--AnimationController)</code>  
**Returns**: <code>AnimationController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | Function that is called on completion. |

<a name="module_AnimationController--AnimationController+get"></a>
#### animationController.get() ⇒ <code>Renderable</code>
Gets the currently visible or being shown renderable.

**Kind**: instance method of <code>[AnimationController](#exp_module_AnimationController--AnimationController)</code>  
**Returns**: <code>Renderable</code> - currently visible view/surface  
<a name="module_AnimationController--AnimationController+getSize"></a>
#### animationController.getSize() ⇒ <code>Array.Number</code>
Gets the size of the view.

**Kind**: instance method of <code>[AnimationController](#exp_module_AnimationController--AnimationController)</code>  
**Returns**: <code>Array.Number</code> - size  
<a name="module_AnimationController--AnimationController.Animation"></a>
#### AnimationController.Animation
Out of the box supported animations.

**Kind**: static property of <code>[AnimationController](#exp_module_AnimationController--AnimationController)</code>  
