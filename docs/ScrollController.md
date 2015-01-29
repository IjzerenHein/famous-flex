<a name="module_ScrollController"></a>
##ScrollController
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
|scroll     |Emitted as the content scrolls (once for each frame the visible offset has changed).|
|pagechange |Emitted whenever the visible page changes.|
|scrollend  |Emitted after scrolling stops (when the scroll particle settles).|

Inherited from: [LayoutController](./LayoutController.md)


* [ScrollController](#module_ScrollController)
  * [class: ScrollController](#exp_module_ScrollController--ScrollController) ⇐ <code>LayoutController</code> ⏏
    * [new ScrollController(options)](#new_module_ScrollController--ScrollController_new)
    * _instance_
      * [.setOptions(options)](#module_ScrollController--ScrollController#setOptions) ⇒ <code>ScrollController</code>
      * [.getVisibleItems()](#module_ScrollController--ScrollController#getVisibleItems) ⇒ <code>Array</code>
      * [.getFirstVisibleItem()](#module_ScrollController--ScrollController#getFirstVisibleItem) ⇒ <code>Object</code>
      * [.getLastVisibleItem()](#module_ScrollController--ScrollController#getLastVisibleItem) ⇒ <code>Object</code>
      * [.goToFirstPage()](#module_ScrollController--ScrollController#goToFirstPage) ⇒ <code>ScrollController</code>
      * [.goToPreviousPage()](#module_ScrollController--ScrollController#goToPreviousPage) ⇒ <code>ScrollController</code>
      * [.goToNextPage()](#module_ScrollController--ScrollController#goToNextPage) ⇒ <code>ScrollController</code>
      * [.goToLastPage()](#module_ScrollController--ScrollController#goToLastPage) ⇒ <code>ScrollController</code>
      * [.goToRenderNode(node)](#module_ScrollController--ScrollController#goToRenderNode) ⇒ <code>ScrollController</code>
      * [.ensureVisible(node)](#module_ScrollController--ScrollController#ensureVisible) ⇒ <code>ScrollController</code>
      * [.scroll(delta)](#module_ScrollController--ScrollController#scroll) ⇒ <code>ScrollController</code>
      * [.canScroll(delta)](#module_ScrollController--ScrollController#canScroll) ⇒ <code>Number</code>
      * [.halt()](#module_ScrollController--ScrollController#halt) ⇒ <code>ScrollController</code>
      * [.isScrolling()](#module_ScrollController--ScrollController#isScrolling) ⇒ <code>Bool</code>
      * [.getBoundsReached()](#module_ScrollController--ScrollController#getBoundsReached) ⇒ <code>ScrollController.Bounds</code>
      * [.getVelocity()](#module_ScrollController--ScrollController#getVelocity) ⇒ <code>Number</code>
      * [.setVelocity(velocity)](#module_ScrollController--ScrollController#setVelocity) ⇒ <code>ScrollController</code>
      * [.applyScrollForce(delta)](#module_ScrollController--ScrollController#applyScrollForce) ⇒ <code>ScrollController</code>
      * [.updateScrollForce(prevDelta, newDelta)](#module_ScrollController--ScrollController#updateScrollForce) ⇒ <code>ScrollController</code>
      * [.releaseScrollForce(delta, [velocity])](#module_ScrollController--ScrollController#releaseScrollForce) ⇒ <code>ScrollController</code>
      * [.getSpec(node, normalize)](#module_ScrollController--ScrollController#getSpec) ⇒ <code>Spec</code>

<a name="exp_module_ScrollController--ScrollController"></a>
###class: ScrollController ⇐ <code>LayoutController</code> ⏏
**Extends:** <code>LayoutController</code>  
<a name="new_module_ScrollController--ScrollController_new"></a>
####new ScrollController(options)
| Param | Type | Description |
| ----- | ---- | ----------- |
| options | <code>Object</code> | Configurable options (see LayoutController for all inherited options). |
| \[options.useContainer\] | <code>Bool</code> | Embeds the view in a ContainerSurface to hide any overflow and capture input events (default: `false`). |
| \[options.container\] | <code>String</code> | Options that are passed to the ContainerSurface in case `useContainer` is true. |
| \[options.paginated\] | <code>Bool</code> | Enabled pagination when set to `true` (default: `false`). |
| \[options.paginationEnergyThresshold\] | <code>Number</code> | Thresshold after which pagination kicks in (default: `0.01`). |
| \[options.paginationMode\] | <code>PaginationMode</code> | Pagination-mode (either page-based or scroll-based) (default: `PaginationMode.PAGE`). |
| \[options.alignment\] | <code>Number</code> | Alignment of the renderables (0 = top/left, 1 = bottom/right) (default: `0`). |
| \[options.mouseMove\] | <code>Bool</code> | Enables scrolling by holding the mouse-button down and moving the mouse (default: `false`). |
| \[options.enabled\] | <code>Bool</code> | Enables or disabled user input (default: `true`). |
| \[options.nodeSpring\] | <code>Object</code> | Spring options to use when transitioning renderables between scenes |
| \[options.scrollParticle\] | <code>Object</code> | Options for the scroll particle (default: `{}`) |
| \[options.scrollSpring\] | <code>Object</code> | Spring-force options that are applied on the scroll particle when e.g. bounds is reached (default: `{dampingRatio: 1.0, period: 350}`) |
| \[options.scrollDrag\] | <code>Object</code> | Drag-force options to apply on the scroll particle |
| \[options.scrollFriction\] | <code>Object</code> | Friction-force options to apply on the scroll particle |
| \[options.layoutAll\] | <code>Bool</code> | When set to true, always lays out all renderables in the datasource (default: `false`). |
| \[options.visibleItemThresshold\] | <code>Number</code> | Thresshold (0..1) used for determining whether an item is considered to be the first/last visible item (default: `0.5`). |
| \[options.debug\] | <code>Bool</code> | Logs debug output to the console (default: `false`). |

<a name="module_ScrollController--ScrollController#setOptions"></a>
####scrollController.setOptions(options) ⇒ <code>ScrollController</code>
Patches the ScrollController instance's options with the passed-in ones.

| Param | Type | Description |
| ----- | ---- | ----------- |
| options | <code>Object</code> | Configurable options (see LayoutController for all inherited options). |
| \[options.paginated\] | <code>Bool</code> | Enabled pagination when set to `true` (default: `false`). |
| \[options.paginationEnergyThresshold\] | <code>Number</code> | Thresshold after which pagination kicks in (default: `0.01`). |
| \[options.paginationMode\] | <code>PaginationMode</code> | Pagination-mode (either page-based or scroll-based) (default: `PaginationMode.PAGE`). |
| \[options.alignment\] | <code>Number</code> | Alignment of the renderables (0 = top/left, 1 = bottom/right) (default: `0`). |
| \[options.mouseMove\] | <code>Bool</code> | Enables scrolling by holding the mouse-button down and moving the mouse (default: `false`). |
| \[options.enabled\] | <code>Bool</code> | Enables or disabled user input (default: `true`). |
| \[options.nodeSpring\] | <code>Object</code> | Spring options to use when transitioning renderables between scenes |
| \[options.scrollParticle\] | <code>Object</code> | Options for the scroll particle (default: `{}`) |
| \[options.scrollSpring\] | <code>Object</code> | Spring-force options that are applied on the scroll particle when e.g. bounds is reached (default: `{dampingRatio: 1.0, period: 500}`) |
| \[options.scrollDrag\] | <code>Object</code> | Drag-force options to apply on the scroll particle |
| \[options.scrollFriction\] | <code>Object</code> | Friction-force options to apply on the scroll particle |
| \[options.visibleItemThresshold\] | <code>Number</code> | Thresshold (0..1) used for determining whether an item is considered to be the first/last visible item (default: `0.5`). |
| \[options.layoutAll\] | <code>Bool</code> | When set to true, always lays out all renderables in the datasource (default: `false`). |
| \[options.debug\] | <code>Bool</code> | Logs debug output to the console (default: `false`). |

**Returns**: <code>ScrollController</code> - this  
<a name="module_ScrollController--ScrollController#getVisibleItems"></a>
####scrollController.getVisibleItems() ⇒ <code>Array</code>
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

**Returns**: <code>Array</code> - array of items  
<a name="module_ScrollController--ScrollController#getFirstVisibleItem"></a>
####scrollController.getFirstVisibleItem() ⇒ <code>Object</code>
Get the first visible item in the view.

An item is considered to be the first visible item when:
-    First item that is partly visible and the visibility % is higher than `options.visibleItemThresshold`
-    It is the first item after the top/left bounds

**Returns**: <code>Object</code> - item or `undefined`  
<a name="module_ScrollController--ScrollController#getLastVisibleItem"></a>
####scrollController.getLastVisibleItem() ⇒ <code>Object</code>
Get the last visible item in the view.

An item is considered to be the last visible item when:
-    Last item that is partly visible and the visibility % is higher than `options.visibleItemThresshold`
-    It is the last item before the bottom/right bounds

**Returns**: <code>Object</code> - item or `undefined`  
<a name="module_ScrollController--ScrollController#goToFirstPage"></a>
####scrollController.goToFirstPage() ⇒ <code>ScrollController</code>
Scroll to the first page, making it visible.

NOTE: This function does not work on ViewSequences that have the `loop` property enabled.

**Returns**: <code>ScrollController</code> - this  
<a name="module_ScrollController--ScrollController#goToPreviousPage"></a>
####scrollController.goToPreviousPage() ⇒ <code>ScrollController</code>
Scroll to the previous page, making it visible.

**Returns**: <code>ScrollController</code> - this  
<a name="module_ScrollController--ScrollController#goToNextPage"></a>
####scrollController.goToNextPage() ⇒ <code>ScrollController</code>
Scroll to the next page, making it visible.

**Returns**: <code>ScrollController</code> - this  
<a name="module_ScrollController--ScrollController#goToLastPage"></a>
####scrollController.goToLastPage() ⇒ <code>ScrollController</code>
Scroll to the last page, making it visible.

NOTE: This function does not work on ViewSequences that have the `loop` property enabled.

**Returns**: <code>ScrollController</code> - this  
<a name="module_ScrollController--ScrollController#goToRenderNode"></a>
####scrollController.goToRenderNode(node) ⇒ <code>ScrollController</code>
Scroll to the given renderable in the datasource.

| Param | Type | Description |
| ----- | ---- | ----------- |
| node | <code>RenderNode</code> | renderable to scroll to. |

**Returns**: <code>ScrollController</code> - this  
<a name="module_ScrollController--ScrollController#ensureVisible"></a>
####scrollController.ensureVisible(node) ⇒ <code>ScrollController</code>
Ensures that a render-node is entirely visible.

When the node is already visible, nothing happens. If the node is not entirely visible
the view is scrolled as much as needed to make it entirely visibl.

| Param | Type | Description |
| ----- | ---- | ----------- |
| node | <code>Number</code> \| <code>ViewSequence</code> \| <code>Renderable</code> | index, renderNode or ViewSequence |

**Returns**: <code>ScrollController</code> - this  
<a name="module_ScrollController--ScrollController#scroll"></a>
####scrollController.scroll(delta) ⇒ <code>ScrollController</code>
Scrolls the view by the specified number of pixels.

| Param | Type | Description |
| ----- | ---- | ----------- |
| delta | <code>Number</code> | Delta in pixels (< 0 = down/right, > 0 = top/left). |

**Returns**: <code>ScrollController</code> - this  
<a name="module_ScrollController--ScrollController#canScroll"></a>
####scrollController.canScroll(delta) ⇒ <code>Number</code>
Checks whether the scrollview can scroll the given delta.
When the scrollView can scroll the whole delta, then
the return value is the same as the delta. If it cannot
scroll the entire delta, the return value is the number of
pixels that can be scrolled.

| Param | Type | Description |
| ----- | ---- | ----------- |
| delta | <code>Number</code> | Delta to test |

**Returns**: <code>Number</code> - Number of pixels the view is allowed to scroll  
<a name="module_ScrollController--ScrollController#halt"></a>
####scrollController.halt() ⇒ <code>ScrollController</code>
Halts all scrolling going on. In essence this function sets
the velocity to 0 and cancels any `goToXxx` operation that
was applied.

**Returns**: <code>ScrollController</code> - this  
<a name="module_ScrollController--ScrollController#isScrolling"></a>
####scrollController.isScrolling() ⇒ <code>Bool</code>
Checks whether scrolling is in progress or not.

**Returns**: <code>Bool</code> - true when scrolling is active  
<a name="module_ScrollController--ScrollController#getBoundsReached"></a>
####scrollController.getBoundsReached() ⇒ <code>ScrollController.Bounds</code>
Checks whether any boundaries have been reached.

**Returns**: <code>ScrollController.Bounds</code> - Either, Bounds.PREV, Bounds.NEXT, Bounds.BOTH or Bounds.NONE  
<a name="module_ScrollController--ScrollController#getVelocity"></a>
####scrollController.getVelocity() ⇒ <code>Number</code>
Get the current scrolling velocity.

**Returns**: <code>Number</code> - Scroll velocity  
<a name="module_ScrollController--ScrollController#setVelocity"></a>
####scrollController.setVelocity(velocity) ⇒ <code>ScrollController</code>
Set the scrolling velocity.

| Param | Type | Description |
| ----- | ---- | ----------- |
| velocity | <code>Number</code> | New scroll velocity |

**Returns**: <code>ScrollController</code> - this  
<a name="module_ScrollController--ScrollController#applyScrollForce"></a>
####scrollController.applyScrollForce(delta) ⇒ <code>ScrollController</code>
Applies a permanent scroll-force (delta) until it is released.
When the cumulative scroll-offset lies outside the allowed bounds
a strech effect is used, and the offset beyond the bounds is
substracted by halve. This function should always be accompanied
by a call to `releaseScrollForce`.

This method is used for instance when using touch gestures to move
the scroll offset and corresponds to the `touchstart` event.

| Param | Type | Description |
| ----- | ---- | ----------- |
| delta | <code>Number</code> | Starting scroll-delta force to apply |

**Returns**: <code>ScrollController</code> - this  
<a name="module_ScrollController--ScrollController#updateScrollForce"></a>
####scrollController.updateScrollForce(prevDelta, newDelta) ⇒ <code>ScrollController</code>
Updates a existing scroll-force previously applied by calling
`applyScrollForce`.

This method is used for instance when using touch gestures to move
the scroll offset and corresponds to the `touchmove` event.

| Param | Type | Description |
| ----- | ---- | ----------- |
| prevDelta | <code>Number</code> | Previous delta |
| newDelta | <code>Number</code> | New delta |

**Returns**: <code>ScrollController</code> - this  
<a name="module_ScrollController--ScrollController#releaseScrollForce"></a>
####scrollController.releaseScrollForce(delta, [velocity]) ⇒ <code>ScrollController</code>
Releases a scroll-force and sets the velocity.

This method is used for instance when using touch gestures to move
the scroll offset and corresponds to the `touchend` event.

| Param | Type | Description |
| ----- | ---- | ----------- |
| delta | <code>Number</code> | Scroll delta to release |
| \[velocity\] | <code>Number</code> | Velocity to apply after which the view keeps scrolling |

**Returns**: <code>ScrollController</code> - this  
<a name="module_ScrollController--ScrollController#getSpec"></a>
####scrollController.getSpec(node, normalize) ⇒ <code>Spec</code>
Get the spec (size, transform, etc..) for the given renderable or
Id.

| Param | Type | Description |
| ----- | ---- | ----------- |
| node | <code>Renderable</code> \| <code>String</code> | Renderabe or Id to look for. |
| normalize | <code>Bool</code> | When set to `true` normalizes the origin/align into the transform translation (default: `false`). |

**Returns**: <code>Spec</code> - spec or undefined  
