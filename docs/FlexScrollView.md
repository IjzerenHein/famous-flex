<a name="module_FlexScrollView"></a>
##FlexScrollView
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
  * [class: FlexScrollView](#exp_module_FlexScrollView--FlexScrollView) ⇐ <code>ScrollController</code> ⏏
    * [new FlexScrollView(options)](#new_module_FlexScrollView--FlexScrollView_new)
    * _instance_
      * ~~[.getPosition](#module_FlexScrollView--FlexScrollView#getPosition) ⇒ <code>number</code>~~
      * [.setOptions(options)](#module_FlexScrollView--FlexScrollView#setOptions) ⇒ <code>FlexScrollView</code>
      * [.sequenceFrom(node)](#module_FlexScrollView--FlexScrollView#sequenceFrom) ⇒ <code>FlexScrollView</code>
      * [.getCurrentIndex()](#module_FlexScrollView--FlexScrollView#getCurrentIndex) ⇒ <code>Number</code>
      * [.goToPage(index)](#module_FlexScrollView--FlexScrollView#goToPage) ⇒ <code>FlexScrollView</code>
      * [.getOffset()](#module_FlexScrollView--FlexScrollView#getOffset) ⇒ <code>number</code>
      * [.showPullToRefresh([footer])](#module_FlexScrollView--FlexScrollView#showPullToRefresh) ⇒ <code>FlexScrollView</code>
      * [.hidePullToRefresh([footer])](#module_FlexScrollView--FlexScrollView#hidePullToRefresh) ⇒ <code>FlexScrollView</code>
      * [.isPullToRefreshVisible([footer])](#module_FlexScrollView--FlexScrollView#isPullToRefreshVisible)

<a name="exp_module_FlexScrollView--FlexScrollView"></a>
###class: FlexScrollView ⇐ <code>ScrollController</code> ⏏
**Extends:** <code>ScrollController</code>  
<a name="new_module_FlexScrollView--FlexScrollView_new"></a>
####new FlexScrollView(options)
| Param | Type | Description |
| ----- | ---- | ----------- |
| options | <code>Object</code> | Configurable options (see ScrollController for all inherited options). |
| \[options.pullToRefreshHeader\] | <code>Renderable</code> | Pull to refresh renderable that is displayed when pulling down from the top. |
| \[options.pullToRefreshFooter\] | <code>Renderable</code> | Pull to refresh renderable that is displayed when pulling up from the bottom. |
| \[options.leadingScrollView\] | <code>FlexScrollView</code> | Leading scrollview into which input events are piped (see Tutorial) |
| \[options.trailingScrollView\] | <code>FlexScrollView</code> | Trailing scrollview into which input events are piped (see Tutorial) |

<a name="module_FlexScrollView--FlexScrollView#getPosition"></a>
####~~flexScrollView.getPosition ⇒ <code>number</code>~~
***Deprecated:*** true  

Returns the position associated with the Scrollview instance's current node
(generally the node currently at the top).

This function is a shim provided for compatibility with the stock famo.us Scrollview.

| Param | Type | Description |
| ----- | ---- | ----------- |
| \[node\] | <code>number</code> | If specified, returns the position of the node at that index in the Scrollview instance's currently managed collection. |

**Returns**: <code>number</code> - The position of either the specified node, or the Scrollview's current Node,
in pixels translated.  
<a name="module_FlexScrollView--FlexScrollView#setOptions"></a>
####flexScrollView.setOptions(options) ⇒ <code>FlexScrollView</code>
Patches the FlexScrollView instance's options with the passed-in ones.

| Param | Type | Description |
| ----- | ---- | ----------- |
| options | <code>Object</code> | Configurable options (see ScrollController for all inherited options). |
| \[options.pullToRefreshHeader\] | <code>Renderable</code> | Pull to refresh renderable that is displayed when pulling down from the top. |
| \[options.pullToRefreshFooter\] | <code>Renderable</code> | Pull to refresh renderable that is displayed when pulling up from the bottom. |
| \[options.leadingScrollView\] | <code>FlexScrollView</code> | Leading scrollview into which input events are piped (see Tutorial). |
| \[options.trailingScrollView\] | <code>FlexScrollView</code> | Trailing scrollview into which input events are piped (see Tutorial). |

**Returns**: <code>FlexScrollView</code> - this  
<a name="module_FlexScrollView--FlexScrollView#sequenceFrom"></a>
####flexScrollView.sequenceFrom(node) ⇒ <code>FlexScrollView</code>
Sets the data-source (alias for setDataSource).

This function is a shim provided for compatibility with the stock famo.us Scrollview.

| Param | Type | Description |
| ----- | ---- | ----------- |
| node | <code>Array</code> \| <code>ViewSequence</code> | Either an array of renderables or a Famous viewSequence. |

**Returns**: <code>FlexScrollView</code> - this  
<a name="module_FlexScrollView--FlexScrollView#getCurrentIndex"></a>
####flexScrollView.getCurrentIndex() ⇒ <code>Number</code>
Returns the index of the first visible renderable.

This function is a shim provided for compatibility with the stock famo.us Scrollview.

**Returns**: <code>Number</code> - The current index of the ViewSequence  
<a name="module_FlexScrollView--FlexScrollView#goToPage"></a>
####flexScrollView.goToPage(index) ⇒ <code>FlexScrollView</code>
Paginates the Scrollview to an absolute page index. This function is a shim provided
for compatibility with the stock famo.us Scrollview.

| Param | Type | Description |
| ----- | ---- | ----------- |
| index | <code>Number</code> | view-sequence index to go to. |

**Returns**: <code>FlexScrollView</code> - this  
<a name="module_FlexScrollView--FlexScrollView#getOffset"></a>
####flexScrollView.getOffset() ⇒ <code>number</code>
Returns the offset associated with the Scrollview instance's current node
(generally the node currently at the top).

This function is a shim provided for compatibility with the stock famo.us Scrollview.

**Returns**: <code>number</code> - The position of either the specified node, or the Scrollview's current Node,
in pixels translated.  
<a name="module_FlexScrollView--FlexScrollView#showPullToRefresh"></a>
####flexScrollView.showPullToRefresh([footer]) ⇒ <code>FlexScrollView</code>
Shows the pulls-to-refresh renderable indicating that a refresh is in progress.

| Param | Type | Description |
| ----- | ---- | ----------- |
| \[footer\] | <code>Bool</code> | set to true to show pull-to-refresh at the footer (default: false). |

**Returns**: <code>FlexScrollView</code> - this  
<a name="module_FlexScrollView--FlexScrollView#hidePullToRefresh"></a>
####flexScrollView.hidePullToRefresh([footer]) ⇒ <code>FlexScrollView</code>
Hides the pull-to-refresh renderable in case it was visible.

| Param | Type | Description |
| ----- | ---- | ----------- |
| \[footer\] | <code>Bool</code> | set to true to hide the pull-to-refresh at the footer (default: false). |

**Returns**: <code>FlexScrollView</code> - this  
<a name="module_FlexScrollView--FlexScrollView#isPullToRefreshVisible"></a>
####flexScrollView.isPullToRefreshVisible([footer])
Get the visible state of the pull-to-refresh renderable.

| Param | Type | Description |
| ----- | ---- | ----------- |
| \[footer\] | <code>Bool</code> | set to true to get the state of the pull-to-refresh footer (default: false). |

