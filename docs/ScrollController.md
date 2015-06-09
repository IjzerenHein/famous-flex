<a name="module_ScrollController"></a>
## ScrollController
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
  * [ScrollController](#exp_module_ScrollController--ScrollController) ⇐ <code>LayoutController</code> ⏏
    * [new ScrollController(options)](#new_module_ScrollController--ScrollController_new)
    * [.setOptions(options)](#module_ScrollController--ScrollController+setOptions) ⇒ <code>ScrollController</code>
    * [.getVisibleItems()](#module_ScrollController--ScrollController+getVisibleItems) ⇒ <code>Array</code>
    * [.getFirstVisibleItem()](#module_ScrollController--ScrollController+getFirstVisibleItem) ⇒ <code>Object</code>
    * [.getLastVisibleItem()](#module_ScrollController--ScrollController+getLastVisibleItem) ⇒ <code>Object</code>
    * [.goToFirstPage([noAnimation])](#module_ScrollController--ScrollController+goToFirstPage) ⇒ <code>ScrollController</code>
    * [.goToPreviousPage([noAnimation])](#module_ScrollController--ScrollController+goToPreviousPage) ⇒ <code>ScrollController</code>
    * [.goToNextPage([noAnimation])](#module_ScrollController--ScrollController+goToNextPage) ⇒ <code>ScrollController</code>
    * [.goToLastPage([noAnimation])](#module_ScrollController--ScrollController+goToLastPage) ⇒ <code>ScrollController</code>
    * [.goToRenderNode(node, [noAnimation])](#module_ScrollController--ScrollController+goToRenderNode) ⇒ <code>ScrollController</code>
    * [.ensureVisible(node)](#module_ScrollController--ScrollController+ensureVisible) ⇒ <code>ScrollController</code>
    * [.scroll(delta)](#module_ScrollController--ScrollController+scroll) ⇒ <code>ScrollController</code>
    * [.canScroll(delta)](#module_ScrollController--ScrollController+canScroll) ⇒ <code>Number</code>
    * [.halt()](#module_ScrollController--ScrollController+halt) ⇒ <code>ScrollController</code>
    * [.isScrolling()](#module_ScrollController--ScrollController+isScrolling) ⇒ <code>Bool</code>
    * [.getBoundsReached()](#module_ScrollController--ScrollController+getBoundsReached) ⇒ <code>ScrollController.Bounds</code>
    * [.getVelocity()](#module_ScrollController--ScrollController+getVelocity) ⇒ <code>Number</code>
    * [.getEnergy()](#module_ScrollController--ScrollController+getEnergy) ⇒ <code>Number</code>
    * [.setVelocity(velocity)](#module_ScrollController--ScrollController+setVelocity) ⇒ <code>ScrollController</code>
    * [.applyScrollForce(delta)](#module_ScrollController--ScrollController+applyScrollForce) ⇒ <code>ScrollController</code>
    * [.updateScrollForce(prevDelta, newDelta)](#module_ScrollController--ScrollController+updateScrollForce) ⇒ <code>ScrollController</code>
    * [.releaseScrollForce(delta, [velocity])](#module_ScrollController--ScrollController+releaseScrollForce) ⇒ <code>ScrollController</code>
    * [.getSpec(node, normalize)](#module_ScrollController--ScrollController+getSpec) ⇒ <code>Spec</code>

<a name="exp_module_ScrollController--ScrollController"></a>
### ScrollController ⇐ <code>LayoutController</code> ⏏
**Kind**: Exported class  
**Extends:** <code>LayoutController</code>  
<a name="new_module_ScrollController--ScrollController_new"></a>
#### new ScrollController(options)

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options (see LayoutController for all inherited options). |
| [options.useContainer] | <code>Bool</code> | Embeds the view in a ContainerSurface to hide any overflow and capture input events (default: `false`). |
| [options.container] | <code>String</code> | Options that are passed to the ContainerSurface in case `useContainer` is true. |
| [options.paginated] | <code>Bool</code> | Enabled pagination when set to `true` (default: `false`). |
| [options.paginationEnergyThreshold] | <code>Number</code> | Threshold after which pagination kicks in (default: `0.01`). |
| [options.paginationMode] | <code>PaginationMode</code> | Pagination-mode (either page-based or scroll-based) (default: `PaginationMode.PAGE`). |
| [options.alignment] | <code>Number</code> | Alignment of the renderables (0 = top/left, 1 = bottom/right) (default: `0`). |
| [options.mouseMove] | <code>Bool</code> | Enables scrolling by holding the mouse-button down and moving the mouse (default: `false`). |
| [options.enabled] | <code>Bool</code> | Enables or disabled user input (default: `true`). |
| [options.overscroll] | <code>Bool</code> | Enables or disables overscroll (default: `true`). |
| [options.scrollParticle] | <code>Object</code> | Options for the scroll particle (default: `{}`) |
| [options.scrollSpring] | <code>Object</code> | Spring-force options that are applied on the scroll particle when e.g. bounds is reached (default: `{dampingRatio: 1.0, period: 350}`) |
| [options.scrollDrag] | <code>Object</code> | Drag-force options to apply on the scroll particle |
| [options.scrollFriction] | <code>Object</code> | Friction-force options to apply on the scroll particle |
| [options.layoutAll] | <code>Bool</code> | When set to true, always lays out all renderables in the datasource (default: `false`). |

<a name="module_ScrollController--ScrollController+setOptions"></a>
#### scrollController.setOptions(options) ⇒ <code>ScrollController</code>
Patches the ScrollController instance's options with the passed-in ones.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>ScrollController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options (see LayoutController for all inherited options). |
| [options.paginated] | <code>Bool</code> | Enabled pagination when set to `true` (default: `false`). |
| [options.paginationEnergyThreshold] | <code>Number</code> | Threshold after which pagination kicks in (default: `0.01`). |
| [options.paginationMode] | <code>PaginationMode</code> | Pagination-mode (either page-based or scroll-based) (default: `PaginationMode.PAGE`). |
| [options.alignment] | <code>Number</code> | Alignment of the renderables (0 = top/left, 1 = bottom/right) (default: `0`). |
| [options.mouseMove] | <code>Bool</code> | Enables scrolling by holding the mouse-button down and moving the mouse (default: `false`). |
| [options.enabled] | <code>Bool</code> | Enables or disables user input (default: `true`). |
| [options.overscroll] | <code>Bool</code> | Enables or disables overscroll (default: `true`). |
| [options.scrollParticle] | <code>Object</code> | Options for the scroll particle (default: `{}`) |
| [options.scrollSpring] | <code>Object</code> | Spring-force options that are applied on the scroll particle when e.g. bounds is reached (default: `{dampingRatio: 1.0, period: 500}`) |
| [options.scrollDrag] | <code>Object</code> | Drag-force options to apply on the scroll particle |
| [options.scrollFriction] | <code>Object</code> | Friction-force options to apply on the scroll particle |
| [options.layoutAll] | <code>Bool</code> | When set to true, always lays out all renderables in the datasource (default: `false`). |

<a name="module_ScrollController--ScrollController+getVisibleItems"></a>
#### scrollController.getVisibleItems() ⇒ <code>Array</code>
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

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>Array</code> - array of items  
<a name="module_ScrollController--ScrollController+getFirstVisibleItem"></a>
#### scrollController.getFirstVisibleItem() ⇒ <code>Object</code>
Get the first visible item in the view.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>Object</code> - item or `undefined`  
<a name="module_ScrollController--ScrollController+getLastVisibleItem"></a>
#### scrollController.getLastVisibleItem() ⇒ <code>Object</code>
Get the last visible item in the view.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>Object</code> - item or `undefined`  
<a name="module_ScrollController--ScrollController+goToFirstPage"></a>
#### scrollController.goToFirstPage([noAnimation]) ⇒ <code>ScrollController</code>
Goes to the first page, making it visible.

NOTE: This function does not work on ViewSequences that have the `loop` property enabled.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>ScrollController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| [noAnimation] | <code>Bool</code> | When set to true, immediately shows the node without any scrolling animation. |

<a name="module_ScrollController--ScrollController+goToPreviousPage"></a>
#### scrollController.goToPreviousPage([noAnimation]) ⇒ <code>ScrollController</code>
Goes to the previous page, making it visible.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>ScrollController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| [noAnimation] | <code>Bool</code> | When set to true, immediately shows the node without any scrolling animation. |

<a name="module_ScrollController--ScrollController+goToNextPage"></a>
#### scrollController.goToNextPage([noAnimation]) ⇒ <code>ScrollController</code>
Goes to the next page, making it visible.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>ScrollController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| [noAnimation] | <code>Bool</code> | When set to true, immediately shows the node without any scrolling animation. |

<a name="module_ScrollController--ScrollController+goToLastPage"></a>
#### scrollController.goToLastPage([noAnimation]) ⇒ <code>ScrollController</code>
Goes to the last page, making it visible.

NOTE: This function does not work on ViewSequences that have the `loop` property enabled.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>ScrollController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| [noAnimation] | <code>Bool</code> | When set to true, immediately shows the node without any scrolling animation. |

<a name="module_ScrollController--ScrollController+goToRenderNode"></a>
#### scrollController.goToRenderNode(node, [noAnimation]) ⇒ <code>ScrollController</code>
Goes to the given renderable in the datasource.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>ScrollController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| node | <code>RenderNode</code> | renderable to scroll to. |
| [noAnimation] | <code>Bool</code> | When set to true, immediately shows the node without scrolling animation. |

<a name="module_ScrollController--ScrollController+ensureVisible"></a>
#### scrollController.ensureVisible(node) ⇒ <code>ScrollController</code>
Ensures that a render-node is entirely visible.

When the node is already visible, nothing happens. If the node is not entirely visible
the view is scrolled as much as needed to make it entirely visibl.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>ScrollController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| node | <code>Number</code> &#124; <code>ViewSequence</code> &#124; <code>Renderable</code> | index, renderNode or ViewSequence |

<a name="module_ScrollController--ScrollController+scroll"></a>
#### scrollController.scroll(delta) ⇒ <code>ScrollController</code>
Scrolls the view by the specified number of pixels.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>ScrollController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| delta | <code>Number</code> | Delta in pixels (< 0 = down/right, > 0 = top/left). |

<a name="module_ScrollController--ScrollController+canScroll"></a>
#### scrollController.canScroll(delta) ⇒ <code>Number</code>
Checks whether the scrollview can scroll the given delta.
When the scrollView can scroll the whole delta, then
the return value is the same as the delta. If it cannot
scroll the entire delta, the return value is the number of
pixels that can be scrolled.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>Number</code> - Number of pixels the view is allowed to scroll  

| Param | Type | Description |
| --- | --- | --- |
| delta | <code>Number</code> | Delta to test |

<a name="module_ScrollController--ScrollController+halt"></a>
#### scrollController.halt() ⇒ <code>ScrollController</code>
Halts all scrolling going on. In essence this function sets
the velocity to 0 and cancels any `goToXxx` operation that
was applied.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>ScrollController</code> - this  
<a name="module_ScrollController--ScrollController+isScrolling"></a>
#### scrollController.isScrolling() ⇒ <code>Bool</code>
Checks whether scrolling is in progress or not.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>Bool</code> - true when scrolling is active  
<a name="module_ScrollController--ScrollController+getBoundsReached"></a>
#### scrollController.getBoundsReached() ⇒ <code>ScrollController.Bounds</code>
Checks whether any boundaries have been reached.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>ScrollController.Bounds</code> - Either, Bounds.PREV, Bounds.NEXT, Bounds.BOTH or Bounds.NONE  
<a name="module_ScrollController--ScrollController+getVelocity"></a>
#### scrollController.getVelocity() ⇒ <code>Number</code>
Get the current scrolling velocity.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>Number</code> - Scroll velocity  
<a name="module_ScrollController--ScrollController+getEnergy"></a>
#### scrollController.getEnergy() ⇒ <code>Number</code>
Get the current energy of the scrolling particle.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>Number</code> - Energy  
<a name="module_ScrollController--ScrollController+setVelocity"></a>
#### scrollController.setVelocity(velocity) ⇒ <code>ScrollController</code>
Set the scrolling velocity.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>ScrollController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| velocity | <code>Number</code> | New scroll velocity |

<a name="module_ScrollController--ScrollController+applyScrollForce"></a>
#### scrollController.applyScrollForce(delta) ⇒ <code>ScrollController</code>
Applies a permanent scroll-force (delta) until it is released.
When the cumulative scroll-offset lies outside the allowed bounds
a strech effect is used, and the offset beyond the bounds is
substracted by halve. This function should always be accompanied
by a call to `releaseScrollForce`.

This method is used for instance when using touch gestures to move
the scroll offset and corresponds to the `touchstart` event.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>ScrollController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| delta | <code>Number</code> | Starting scroll-delta force to apply |

<a name="module_ScrollController--ScrollController+updateScrollForce"></a>
#### scrollController.updateScrollForce(prevDelta, newDelta) ⇒ <code>ScrollController</code>
Updates a existing scroll-force previously applied by calling
`applyScrollForce`.

This method is used for instance when using touch gestures to move
the scroll offset and corresponds to the `touchmove` event.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>ScrollController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| prevDelta | <code>Number</code> | Previous delta |
| newDelta | <code>Number</code> | New delta |

<a name="module_ScrollController--ScrollController+releaseScrollForce"></a>
#### scrollController.releaseScrollForce(delta, [velocity]) ⇒ <code>ScrollController</code>
Releases a scroll-force and sets the velocity.

This method is used for instance when using touch gestures to move
the scroll offset and corresponds to the `touchend` event.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>ScrollController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| delta | <code>Number</code> | Scroll delta to release |
| [velocity] | <code>Number</code> | Velocity to apply after which the view keeps scrolling |

<a name="module_ScrollController--ScrollController+getSpec"></a>
#### scrollController.getSpec(node, normalize) ⇒ <code>Spec</code>
Get the spec (size, transform, etc..) for the given renderable or
Id.

**Kind**: instance method of <code>[ScrollController](#exp_module_ScrollController--ScrollController)</code>  
**Returns**: <code>Spec</code> - spec or undefined  

| Param | Type | Description |
| --- | --- | --- |
| node | <code>Renderable</code> &#124; <code>String</code> | Renderabe or Id to look for. |
| normalize | <code>Bool</code> | When set to `true` normalizes the origin/align into the transform translation (default: `false`). |

