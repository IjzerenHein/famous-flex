<a name="module_FlexScrollView"></a>
## FlexScrollView
Flexible FlexScrollView for famo.us.

Key features:
-    Customizable layout (uses ListLayout by default)
-    Insert/remove at any position using animations
-    Support for `true` size renderables
-    Pull to refresh (header & footer)
-    Horizontal/vertical direction
-    Top/left or bottom/right alignment
-    Pagination
-    Option to embed in a ContainerSurface
-    FlexScrollView linking

Inherited from: [ScrollController](./ScrollController.md)


* [FlexScrollView](#module_FlexScrollView)
  * [FlexScrollView](#exp_module_FlexScrollView--FlexScrollView) ⇐ <code>ScrollController</code> ⏏
    * [new FlexScrollView(options)](#new_module_FlexScrollView--FlexScrollView_new)
    * ~~[.getPosition](#module_FlexScrollView--FlexScrollView+getPosition) ⇒ <code>number</code>~~
    * [.setOptions(options)](#module_FlexScrollView--FlexScrollView+setOptions) ⇒ <code>FlexScrollView</code>
    * [.sequenceFrom(node)](#module_FlexScrollView--FlexScrollView+sequenceFrom) ⇒ <code>FlexScrollView</code>
    * [.getCurrentIndex()](#module_FlexScrollView--FlexScrollView+getCurrentIndex) ⇒ <code>Number</code>
    * [.goToPage(index, [noAnimation])](#module_FlexScrollView--FlexScrollView+goToPage) ⇒ <code>FlexScrollView</code>
    * [.getOffset()](#module_FlexScrollView--FlexScrollView+getOffset) ⇒ <code>number</code>
    * [.getAbsolutePosition()](#module_FlexScrollView--FlexScrollView+getAbsolutePosition) ⇒ <code>number</code>
    * [.showPullToRefresh([footer])](#module_FlexScrollView--FlexScrollView+showPullToRefresh) ⇒ <code>FlexScrollView</code>
    * [.hidePullToRefresh([footer])](#module_FlexScrollView--FlexScrollView+hidePullToRefresh) ⇒ <code>FlexScrollView</code>
    * [.isPullToRefreshVisible([footer])](#module_FlexScrollView--FlexScrollView+isPullToRefreshVisible)

<a name="exp_module_FlexScrollView--FlexScrollView"></a>
### FlexScrollView ⇐ <code>ScrollController</code> ⏏
**Kind**: Exported class  
**Extends:** <code>ScrollController</code>  
<a name="new_module_FlexScrollView--FlexScrollView_new"></a>
#### new FlexScrollView(options)

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options (see ScrollController for all inherited options). |
| [options.pullToRefreshHeader] | <code>Renderable</code> | Pull to refresh renderable that is displayed when pulling down from the top. |
| [options.pullToRefreshFooter] | <code>Renderable</code> | Pull to refresh renderable that is displayed when pulling up from the bottom. |
| [options.leadingScrollView] | <code>FlexScrollView</code> | Leading scrollview into which input events are piped (see Tutorial) |
| [options.trailingScrollView] | <code>FlexScrollView</code> | Trailing scrollview into which input events are piped (see Tutorial) |

<a name="module_FlexScrollView--FlexScrollView+getPosition"></a>
#### ~~flexScrollView.getPosition ⇒ <code>number</code>~~
***Deprecated***

Returns the position associated with the Scrollview instance's current node
(generally the node currently at the top).

This function is a shim provided for compatibility with the stock famo.us Scrollview.

**Kind**: instance property of <code>[FlexScrollView](#exp_module_FlexScrollView--FlexScrollView)</code>  
**Returns**: <code>number</code> - The position of either the specified node, or the Scrollview's current Node,
in pixels translated.  

| Param | Type | Description |
| --- | --- | --- |
| [node] | <code>number</code> | If specified, returns the position of the node at that index in the Scrollview instance's currently managed collection. |

<a name="module_FlexScrollView--FlexScrollView+setOptions"></a>
#### flexScrollView.setOptions(options) ⇒ <code>FlexScrollView</code>
Patches the FlexScrollView instance's options with the passed-in ones.

**Kind**: instance method of <code>[FlexScrollView](#exp_module_FlexScrollView--FlexScrollView)</code>  
**Returns**: <code>FlexScrollView</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options (see ScrollController for all inherited options). |
| [options.pullToRefreshHeader] | <code>Renderable</code> | Pull to refresh renderable that is displayed when pulling down from the top. |
| [options.pullToRefreshFooter] | <code>Renderable</code> | Pull to refresh renderable that is displayed when pulling up from the bottom. |
| [options.leadingScrollView] | <code>FlexScrollView</code> | Leading scrollview into which input events are piped (see Tutorial). |
| [options.trailingScrollView] | <code>FlexScrollView</code> | Trailing scrollview into which input events are piped (see Tutorial). |

<a name="module_FlexScrollView--FlexScrollView+sequenceFrom"></a>
#### flexScrollView.sequenceFrom(node) ⇒ <code>FlexScrollView</code>
Sets the data-source (alias for setDataSource).

This function is a shim provided for compatibility with the stock famo.us Scrollview.

**Kind**: instance method of <code>[FlexScrollView](#exp_module_FlexScrollView--FlexScrollView)</code>  
**Returns**: <code>FlexScrollView</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| node | <code>Array</code> &#124; <code>ViewSequence</code> | Either an array of renderables or a Famous viewSequence. |

<a name="module_FlexScrollView--FlexScrollView+getCurrentIndex"></a>
#### flexScrollView.getCurrentIndex() ⇒ <code>Number</code>
Returns the index of the first visible renderable.

This function is a shim provided for compatibility with the stock famo.us Scrollview.

**Kind**: instance method of <code>[FlexScrollView](#exp_module_FlexScrollView--FlexScrollView)</code>  
**Returns**: <code>Number</code> - The current index of the ViewSequence  
<a name="module_FlexScrollView--FlexScrollView+goToPage"></a>
#### flexScrollView.goToPage(index, [noAnimation]) ⇒ <code>FlexScrollView</code>
Paginates the Scrollview to an absolute page index. This function is a shim provided
for compatibility with the stock famo.us Scrollview.

**Kind**: instance method of <code>[FlexScrollView](#exp_module_FlexScrollView--FlexScrollView)</code>  
**Returns**: <code>FlexScrollView</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>Number</code> | view-sequence index to go to. |
| [noAnimation] | <code>Bool</code> | When set to true, immediately shows the node without scrolling animation. |

<a name="module_FlexScrollView--FlexScrollView+getOffset"></a>
#### flexScrollView.getOffset() ⇒ <code>number</code>
Returns the offset associated with the Scrollview instance's current node
(generally the node currently at the top).

This function is a shim provided for compatibility with the stock famo.us Scrollview.

**Kind**: instance method of <code>[FlexScrollView](#exp_module_FlexScrollView--FlexScrollView)</code>  
**Returns**: <code>number</code> - The position of either the specified node, or the Scrollview's current Node,
in pixels translated.  
<a name="module_FlexScrollView--FlexScrollView+getAbsolutePosition"></a>
#### flexScrollView.getAbsolutePosition() ⇒ <code>number</code>
Returns the absolute position associated with the Scrollview instance.

This function is a shim provided for compatibility with the stock famo.us Scrollview.

**Kind**: instance method of <code>[FlexScrollView](#exp_module_FlexScrollView--FlexScrollView)</code>  
**Returns**: <code>number</code> - The position of the Scrollview's current Node, in pixels translated.  
<a name="module_FlexScrollView--FlexScrollView+showPullToRefresh"></a>
#### flexScrollView.showPullToRefresh([footer]) ⇒ <code>FlexScrollView</code>
Shows the pulls-to-refresh renderable indicating that a refresh is in progress.

**Kind**: instance method of <code>[FlexScrollView](#exp_module_FlexScrollView--FlexScrollView)</code>  
**Returns**: <code>FlexScrollView</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| [footer] | <code>Bool</code> | set to true to show pull-to-refresh at the footer (default: false). |

<a name="module_FlexScrollView--FlexScrollView+hidePullToRefresh"></a>
#### flexScrollView.hidePullToRefresh([footer]) ⇒ <code>FlexScrollView</code>
Hides the pull-to-refresh renderable in case it was visible.

**Kind**: instance method of <code>[FlexScrollView](#exp_module_FlexScrollView--FlexScrollView)</code>  
**Returns**: <code>FlexScrollView</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| [footer] | <code>Bool</code> | set to true to hide the pull-to-refresh at the footer (default: false). |

<a name="module_FlexScrollView--FlexScrollView+isPullToRefreshVisible"></a>
#### flexScrollView.isPullToRefreshVisible([footer])
Get the visible state of the pull-to-refresh renderable.

**Kind**: instance method of <code>[FlexScrollView](#exp_module_FlexScrollView--FlexScrollView)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [footer] | <code>Bool</code> | set to true to get the state of the pull-to-refresh footer (default: false). |

