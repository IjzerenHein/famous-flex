<a name="module_ScrollView"></a>
#ScrollView
Advanced ScrollView for supporting flexible layouts.

Key features:
-    Customizable layout
-    Insert/remove renderables into the scene using animations/spec
-    Support for `true` size renderables
-    Horizontal/vertical direction
-    Top/left or bottom/right alignment
-    Pagination
-    Option to embed in a ContainerSurface

Inherited from: [FlowLayoutController](./FlowLayoutController.md)

<a name="exp_module_ScrollView"></a>
##class: ScrollView ⏏
**Extends**: `FlowLayoutController`  
**Members**

* [class: ScrollView ⏏](#exp_module_ScrollView)
  * [new ScrollView(options)](#exp_new_module_ScrollView)
  * [scrollView.setOptions(options)](#module_ScrollView#setOptions)
  * [scrollView.getVisibleItems()](#module_ScrollView#getVisibleItems)
  * [scrollView.getFirstVisibleItem()](#module_ScrollView#getFirstVisibleItem)
  * [scrollView.getLastVisibleItem()](#module_ScrollView#getLastVisibleItem)
  * [scrollView.goToFirstPage()](#module_ScrollView#goToFirstPage)
  * [scrollView.goToPreviousPage()](#module_ScrollView#goToPreviousPage)
  * [scrollView.goToNextPage()](#module_ScrollView#goToNextPage)
  * [scrollView.goToLastPage()](#module_ScrollView#goToLastPage)
  * [scrollView.goToRenderNode(node)](#module_ScrollView#goToRenderNode)
  * [scrollView.scroll(delta)](#module_ScrollView#scroll)
  * [scrollView.canScroll(delta)](#module_ScrollView#canScroll)
  * [scrollView.halt()](#module_ScrollView#halt)
  * [scrollView.getBoundsReached()](#module_ScrollView#getBoundsReached)
  * [scrollView.getVelocity()](#module_ScrollView#getVelocity)
  * [scrollView.setVelocity(velocity)](#module_ScrollView#setVelocity)
  * [scrollView.applyScrollForce(delta)](#module_ScrollView#applyScrollForce)
  * [scrollView.updateScrollForce(prevDelta, newDelta)](#module_ScrollView#updateScrollForce)
  * [scrollView.releaseScrollForce(delta, [velocity])](#module_ScrollView#releaseScrollForce)

<a name="exp_new_module_ScrollView"></a>
###new ScrollView(options)
**Params**

- options `Object` - Options.  
  - \[layout\] `function` | `Object` - Layout function or layout-literal.  
  - \[layoutOptions\] `Object` - Options to pass in to the layout-function.  
  - \[dataSource\] `Array` | `ViewSequence` | `Object` - Array, ViewSequence or Object with key/value pairs.  
  - \[direction\] `Utility.Direction` - Direction to layout into (e.g. Utility.Direction.Y) (when ommited the default direction of the layout is used)  
  - \[insertSpec\] `Spec` - Size, transform, opacity... to use when inserting new renderables into the scene (default: `{}`).  
  - \[removeSpec\] `Spec` - Size, transform, opacity... to use when removing renderables from the scene (default: `{}`).  
  - \[paginated\] `Bool` - Enabled pagination when set to `true` (default: `false`).  
  - \[alignment\] `Number` - Alignment of the renderables (0 = top/left, 1 = bottom/right) (default: `0`).  
  - \[mouseMove\] `Bool` - Enables scrolling by holding the mouse-button down and moving the mouse (default: `false`).  
  - \[nodeSpring\] `Object` - Spring options to use when transitioning renderables between scenes  
  - \[scrollParticle\] `Object` - Options for the scroll particle (default: `{}`)  
  - \[scrollSpring\] `Object` - Spring-force options that are applied on the scroll particle when e.g. bounds is reached (default: `{dampingRatio: 1.0, period: 500}`)  
  - \[scrollDrag\] `Object` - Drag-force options to apply on the scroll particle (default: `{strength: 0.001}`)  
  - \[offsetRounding\] `Number` - Rounds the calculated scroll-offset to prevent unsharp rendering (default: `1`).  
  - \[visibleItemThresshold\] `Number` - Thresshold (0..1) used for determining whether an item is considered to be the first/last visible item (default: `0.5`).  
  - \[debug\] `Bool` - Logs debug output to the console (default: `false`).  

**Extends**: `FlowLayoutController`  
<a name="module_ScrollView#setOptions"></a>
###scrollView.setOptions(options)
Patches the ScrollView instance's options with the passed-in ones.

**Params**

- options `Object` - An object of configurable options for the ScrollView instance.  
  - \[layout\] `function` | `Object` - Layout function or layout-literal.  
  - \[layoutOptions\] `Object` - Options to pass in to the layout-function.  
  - \[dataSource\] `Array` | `ViewSequence` | `Object` - Array, ViewSequence or Object with key/value pairs.  
  - \[direction\] `Utility.Direction` - Direction to layout into (e.g. Utility.Direction.Y) (when ommited the default direction of the layout is used)  
  - \[insertSpec\] `Spec` - Size, transform, opacity... to use when inserting new renderables into the scene (default: `{}`).  
  - \[removeSpec\] `Spec` - Size, transform, opacity... to use when removing renderables from the scene (default: `{}`).  
  - \[useContainer\] `Bool` - Embeds the view in a ContainerSurface to hide any overflow and capture input events (default: `false`).  
  - \[paginated\] `Bool` - Enabled pagination when set to `true` (default: `false`).  
  - \[alignment\] `Number` - Alignment of the renderables (0 = top/left, 1 = bottom/right) (default: `0`).  
  - \[mouseMove\] `Bool` - Enables scrolling by holding the mouse-button down and moving the mouse (default: `false`).  
  - \[nodeSpring\] `Object` - Spring options to use when transitioning renderables between scenes  
  - \[scrollParticle\] `Object` - Options for the scroll particle (default: `{}`)  
  - \[scrollSpring\] `Object` - Spring-force options that are applied on the scroll particle when e.g. bounds is reached (default: `{dampingRatio: 1.0, period: 500}`)  
  - \[scrollDrag\] `Object` - Drag-force options to apply on the scroll particle (default: `{strength: 0.001}`)  
  - \[offsetRounding\] `Number` - Rounds the calculated scroll-offset to prevent unsharp rendering (default: `1`).  
  - \[visibleItemThresshold\] `Number` - Thresshold (0..1) used for determining whether an item is considered to be the first/last visible item (default: `0.5`).  
  - \[debug\] `Bool` - Logs debug output to the console (default: `false`).  

**Returns**: `ScrollView` - this  
<a name="module_ScrollView#getVisibleItems"></a>
###scrollView.getVisibleItems()
Get all items that are partly or completely visible.

The returned result is an array of objects containing the
following properties. Example:
```javascript
{
  viewSequence: {ViewSequence},
  renderNode: {renderable},
  visiblePerc: {Number} 0..1
}
```

**Returns**: `Array` - array of items  
<a name="module_ScrollView#getFirstVisibleItem"></a>
###scrollView.getFirstVisibleItem()
Get the first visible item in the view.

An item is considered to be the first visible item when:
-    First item that is partly visible and the visibility % is higher than `options.visibleItemThresshold`
-    It is the first item after the top/left bounds

**Returns**: `Object` - item or `undefined`  
<a name="module_ScrollView#getLastVisibleItem"></a>
###scrollView.getLastVisibleItem()
Get the last visible item in the view.

An item is considered to be the last visible item when:
-    Last item that is partly visible and the visibility % is higher than `options.visibleItemThresshold`
-    It is the last item before the bottom/right bounds

**Returns**: `Object` - item or `undefined`  
<a name="module_ScrollView#goToFirstPage"></a>
###scrollView.goToFirstPage()
Scroll to the first page, making it visible.

NOTE: This function does not work on ViewSequences that have the `loop` property enabled.

**Returns**: `ScrollView` - this  
<a name="module_ScrollView#goToPreviousPage"></a>
###scrollView.goToPreviousPage()
Scroll to the previous page, making it visible.

**Returns**: `ScrollView` - this  
<a name="module_ScrollView#goToNextPage"></a>
###scrollView.goToNextPage()
Scroll to the next page, making it visible.

**Returns**: `ScrollView` - this  
<a name="module_ScrollView#goToLastPage"></a>
###scrollView.goToLastPage()
Scroll to the last page, making it visible.

NOTE: This function does not work on ViewSequences that have the `loop` property enabled.

**Returns**: `ScrollView` - this  
<a name="module_ScrollView#goToRenderNode"></a>
###scrollView.goToRenderNode(node)
Scroll to the given renderable in the datasource.

**Params**

- node `RenderNode` - renderable to scroll to.  

**Returns**: `ScrollView` - this  
<a name="module_ScrollView#scroll"></a>
###scrollView.scroll(delta)
Scrolls the view by the specified number of pixels.

**Params**

- delta `Number` - Delta in pixels (< 0 = down/right, > 0 = top/left).  

**Returns**: `ScrollView` - this  
<a name="module_ScrollView#canScroll"></a>
###scrollView.canScroll(delta)
Checks whether the scrollview can scroll the given delta.
When the scrollView can scroll the whole delta, then
the return value is the same as the delta. If it cannot
scroll the entire delta, the return value is the number of
pixels that can be scrolled.

**Params**

- delta `Number` - Delta to test  

**Returns**: `Number` - Number of pixels the view is allowed to scroll  
<a name="module_ScrollView#halt"></a>
###scrollView.halt()
Halts all scrolling going on. In essence this function sets
the velocity to 0 and cancels any `goToXxx` operation that
was applied.

**Returns**: `ScrollView` - this  
<a name="module_ScrollView#getBoundsReached"></a>
###scrollView.getBoundsReached()
Checks whether any boundaries have been reached.

**Returns**: `ScrollView.Bounds` - Either, Bounds.PREV, Bounds.NEXT, Bounds.BOTH or Bounds.NONE  
<a name="module_ScrollView#getVelocity"></a>
###scrollView.getVelocity()
Get the current scrolling velocity.

**Returns**: `Number` - Scroll velocity  
<a name="module_ScrollView#setVelocity"></a>
###scrollView.setVelocity(velocity)
Set the scrolling velocity.

**Params**

- velocity `Number` - New scroll velocity  

**Returns**: `ScrollView` - this  
<a name="module_ScrollView#applyScrollForce"></a>
###scrollView.applyScrollForce(delta)
Applies a permanent scroll-force (delta) until it is released.
When the cumulative scroll-offset lies outside the allowed bounds
a strech effect is used, and the offset beyond the bounds is
substracted by halve. This function should always be accompanied
by a call to `releaseScrollForce`.

This method is used for instance when using touch gestures to move
the scroll offset and corresponds to the `touchstart` event.

**Params**

- delta `Number` - Starting scroll-delta force to apply  

**Returns**: `ScrollView` - this  
<a name="module_ScrollView#updateScrollForce"></a>
###scrollView.updateScrollForce(prevDelta, newDelta)
Updates a existing scroll-force previously applied by calling
`applyScrollForce`.

This method is used for instance when using touch gestures to move
the scroll offset and corresponds to the `touchmove` event.

**Params**

- prevDelta `Number` - Previous delta  
- newDelta `Number` - New delta  

**Returns**: `ScrollView` - this  
<a name="module_ScrollView#releaseScrollForce"></a>
###scrollView.releaseScrollForce(delta, [velocity])
Releases a scroll-force and sets the velocity.

This method is used for instance when using touch gestures to move
the scroll offset and corresponds to the `touchend` event.

**Params**

- delta `Number` - Scroll delta to release  
- \[velocity\] `Number` - Velocity to apply after which the view keeps scrolling  

**Returns**: `ScrollView` - this  
