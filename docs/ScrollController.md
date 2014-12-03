<a name="module_ScrollController"></a>
#ScrollController
Scrollable layout-controller.

Key features:
-    Customizable layout
-    Insert/remove renderables into the scene using animations/spec
-    Support for `true` size renderables
-    Horizontal/vertical direction
-    Top/left or bottom/right alignment
-    Pagination
-    Option to embed in a ContainerSurface

Events:

|event      |description|
|-----------|-----------|
|scrollstart|Emitted when scrolling starts.|
|scrollend  |Emitted after scrolling stops (when the scroll particle settles).|

Inherited from: [LayoutController](./LayoutController.md)

<a name="exp_module_ScrollController"></a>
##class: ScrollController ⏏
**Extends**: `LayoutController`  
**Members**

* [class: ScrollController ⏏](#exp_module_ScrollController)
  * [new ScrollController(options)](#exp_new_module_ScrollController)
  * [scrollController.setOptions(options)](#module_ScrollController#setOptions)
  * [scrollController.getVisibleItems()](#module_ScrollController#getVisibleItems)
  * [scrollController.getFirstVisibleItem()](#module_ScrollController#getFirstVisibleItem)
  * [scrollController.getLastVisibleItem()](#module_ScrollController#getLastVisibleItem)
  * [scrollController.goToFirstPage()](#module_ScrollController#goToFirstPage)
  * [scrollController.goToPreviousPage()](#module_ScrollController#goToPreviousPage)
  * [scrollController.goToNextPage()](#module_ScrollController#goToNextPage)
  * [scrollController.goToLastPage()](#module_ScrollController#goToLastPage)
  * [scrollController.goToRenderNode(node)](#module_ScrollController#goToRenderNode)
  * [scrollController.scroll(delta)](#module_ScrollController#scroll)
  * [scrollController.canScroll(delta)](#module_ScrollController#canScroll)
  * [scrollController.halt()](#module_ScrollController#halt)
  * [scrollController.isScrolling()](#module_ScrollController#isScrolling)
  * [scrollController.getBoundsReached()](#module_ScrollController#getBoundsReached)
  * [scrollController.getVelocity()](#module_ScrollController#getVelocity)
  * [scrollController.setVelocity(velocity)](#module_ScrollController#setVelocity)
  * [scrollController.applyScrollForce(delta)](#module_ScrollController#applyScrollForce)
  * [scrollController.updateScrollForce(prevDelta, newDelta)](#module_ScrollController#updateScrollForce)
  * [scrollController.releaseScrollForce(delta, [velocity])](#module_ScrollController#releaseScrollForce)

<a name="exp_new_module_ScrollController"></a>
###new ScrollController(options)
**Params**

- options `Object` - Configurable options (see LayoutController for all inherited options).  
  - \[useContainer\] `Bool` - Embeds the view in a ContainerSurface to hide any overflow and capture input events (default: `false`).  
  - \[paginated\] `Bool` - Enabled pagination when set to `true` (default: `false`).  
  - \[alignment\] `Number` - Alignment of the renderables (0 = top/left, 1 = bottom/right) (default: `0`).  
  - \[mouseMove\] `Bool` - Enables scrolling by holding the mouse-button down and moving the mouse (default: `false`).  
  - \[enabled\] `Bool` - Enables or disabled user input (default: `true`).  
  - \[nodeSpring\] `Object` - Spring options to use when transitioning renderables between scenes  
  - \[scrollParticle\] `Object` - Options for the scroll particle (default: `{}`)  
  - \[scrollSpring\] `Object` - Spring-force options that are applied on the scroll particle when e.g. bounds is reached (default: `{dampingRatio: 1.0, period: 350}`)  
  - \[scrollDrag\] `Object` - Drag-force options to apply on the scroll particle  
  - \[scrollFriction\] `Object` - Friction-force options to apply on the scroll particle  
  - \[layoutAll\] `Bool` - When set to true, always lays out all renderables in the datasource (default: `false`).  
  - \[visibleItemThresshold\] `Number` - Thresshold (0..1) used for determining whether an item is considered to be the first/last visible item (default: `0.5`).  
  - \[debug\] `Bool` - Logs debug output to the console (default: `false`).  

**Extends**: `LayoutController`  
<a name="module_ScrollController#setOptions"></a>
###scrollController.setOptions(options)
Patches the ScrollController instance's options with the passed-in ones.

**Params**

- options `Object` - Configurable options (see LayoutController for all inherited options).  
  - \[paginated\] `Bool` - Enabled pagination when set to `true` (default: `false`).  
  - \[alignment\] `Number` - Alignment of the renderables (0 = top/left, 1 = bottom/right) (default: `0`).  
  - \[mouseMove\] `Bool` - Enables scrolling by holding the mouse-button down and moving the mouse (default: `false`).  
  - \[enabled\] `Bool` - Enables or disabled user input (default: `true`).  
  - \[nodeSpring\] `Object` - Spring options to use when transitioning renderables between scenes  
  - \[scrollParticle\] `Object` - Options for the scroll particle (default: `{}`)  
  - \[scrollSpring\] `Object` - Spring-force options that are applied on the scroll particle when e.g. bounds is reached (default: `{dampingRatio: 1.0, period: 500}`)  
  - \[scrollDrag\] `Object` - Drag-force options to apply on the scroll particle  
  - \[scrollFriction\] `Object` - Friction-force options to apply on the scroll particle  
  - \[visibleItemThresshold\] `Number` - Thresshold (0..1) used for determining whether an item is considered to be the first/last visible item (default: `0.5`).  
  - \[layoutAll\] `Bool` - When set to true, always lays out all renderables in the datasource (default: `false`).  
  - \[debug\] `Bool` - Logs debug output to the console (default: `false`).  

**Returns**: `ScrollController` - this  
<a name="module_ScrollController#getVisibleItems"></a>
###scrollController.getVisibleItems()
Get all items that are partly or completely visible.

The returned result is an array of objects containing the
following properties. Example:
```javascript
{
  viewSequence: {ViewSequence},
  index: {Number},
  renderNode: {renderable},
  visiblePerc: {Number} 0..1
}
```

**Returns**: `Array` - array of items  
<a name="module_ScrollController#getFirstVisibleItem"></a>
###scrollController.getFirstVisibleItem()
Get the first visible item in the view.

An item is considered to be the first visible item when:
-    First item that is partly visible and the visibility % is higher than `options.visibleItemThresshold`
-    It is the first item after the top/left bounds

**Returns**: `Object` - item or `undefined`  
<a name="module_ScrollController#getLastVisibleItem"></a>
###scrollController.getLastVisibleItem()
Get the last visible item in the view.

An item is considered to be the last visible item when:
-    Last item that is partly visible and the visibility % is higher than `options.visibleItemThresshold`
-    It is the last item before the bottom/right bounds

**Returns**: `Object` - item or `undefined`  
<a name="module_ScrollController#goToFirstPage"></a>
###scrollController.goToFirstPage()
Scroll to the first page, making it visible.

NOTE: This function does not work on ViewSequences that have the `loop` property enabled.

**Returns**: `ScrollController` - this  
<a name="module_ScrollController#goToPreviousPage"></a>
###scrollController.goToPreviousPage()
Scroll to the previous page, making it visible.

**Returns**: `ScrollController` - this  
<a name="module_ScrollController#goToNextPage"></a>
###scrollController.goToNextPage()
Scroll to the next page, making it visible.

**Returns**: `ScrollController` - this  
<a name="module_ScrollController#goToLastPage"></a>
###scrollController.goToLastPage()
Scroll to the last page, making it visible.

NOTE: This function does not work on ViewSequences that have the `loop` property enabled.

**Returns**: `ScrollController` - this  
<a name="module_ScrollController#goToRenderNode"></a>
###scrollController.goToRenderNode(node)
Scroll to the given renderable in the datasource.

**Params**

- node `RenderNode` - renderable to scroll to.  

**Returns**: `ScrollController` - this  
<a name="module_ScrollController#scroll"></a>
###scrollController.scroll(delta)
Scrolls the view by the specified number of pixels.

**Params**

- delta `Number` - Delta in pixels (< 0 = down/right, > 0 = top/left).  

**Returns**: `ScrollController` - this  
<a name="module_ScrollController#canScroll"></a>
###scrollController.canScroll(delta)
Checks whether the scrollview can scroll the given delta.
When the scrollView can scroll the whole delta, then
the return value is the same as the delta. If it cannot
scroll the entire delta, the return value is the number of
pixels that can be scrolled.

**Params**

- delta `Number` - Delta to test  

**Returns**: `Number` - Number of pixels the view is allowed to scroll  
<a name="module_ScrollController#halt"></a>
###scrollController.halt()
Halts all scrolling going on. In essence this function sets
the velocity to 0 and cancels any `goToXxx` operation that
was applied.

**Returns**: `ScrollController` - this  
<a name="module_ScrollController#isScrolling"></a>
###scrollController.isScrolling()
Checks whether scrolling is in progress or not.

**Returns**: `Bool` - true when scrolling is active  
<a name="module_ScrollController#getBoundsReached"></a>
###scrollController.getBoundsReached()
Checks whether any boundaries have been reached.

**Returns**: `ScrollController.Bounds` - Either, Bounds.PREV, Bounds.NEXT, Bounds.BOTH or Bounds.NONE  
<a name="module_ScrollController#getVelocity"></a>
###scrollController.getVelocity()
Get the current scrolling velocity.

**Returns**: `Number` - Scroll velocity  
<a name="module_ScrollController#setVelocity"></a>
###scrollController.setVelocity(velocity)
Set the scrolling velocity.

**Params**

- velocity `Number` - New scroll velocity  

**Returns**: `ScrollController` - this  
<a name="module_ScrollController#applyScrollForce"></a>
###scrollController.applyScrollForce(delta)
Applies a permanent scroll-force (delta) until it is released.
When the cumulative scroll-offset lies outside the allowed bounds
a strech effect is used, and the offset beyond the bounds is
substracted by halve. This function should always be accompanied
by a call to `releaseScrollForce`.

This method is used for instance when using touch gestures to move
the scroll offset and corresponds to the `touchstart` event.

**Params**

- delta `Number` - Starting scroll-delta force to apply  

**Returns**: `ScrollController` - this  
<a name="module_ScrollController#updateScrollForce"></a>
###scrollController.updateScrollForce(prevDelta, newDelta)
Updates a existing scroll-force previously applied by calling
`applyScrollForce`.

This method is used for instance when using touch gestures to move
the scroll offset and corresponds to the `touchmove` event.

**Params**

- prevDelta `Number` - Previous delta  
- newDelta `Number` - New delta  

**Returns**: `ScrollController` - this  
<a name="module_ScrollController#releaseScrollForce"></a>
###scrollController.releaseScrollForce(delta, [velocity])
Releases a scroll-force and sets the velocity.

This method is used for instance when using touch gestures to move
the scroll offset and corresponds to the `touchend` event.

**Params**

- delta `Number` - Scroll delta to release  
- \[velocity\] `Number` - Velocity to apply after which the view keeps scrolling  

**Returns**: `ScrollController` - this  
