<a name="module_FlexScrollView"></a>
#FlexScrollView
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

<a name="exp_module_FlexScrollView"></a>
##class: FlexScrollView ⏏
**Extends**: `ScrollController`  
**Members**

* [class: FlexScrollView ⏏](#exp_module_FlexScrollView)
  * [new FlexScrollView(options)](#exp_new_module_FlexScrollView)
  * [~~flexScrollView.getPosition~~](#module_FlexScrollView#getPosition)
  * [flexScrollView.setOptions(options)](#module_FlexScrollView#setOptions)
  * [flexScrollView.sequenceFrom(node)](#module_FlexScrollView#sequenceFrom)
  * [flexScrollView.getCurrentIndex()](#module_FlexScrollView#getCurrentIndex)
  * [flexScrollView.goToPage(index)](#module_FlexScrollView#goToPage)
  * [flexScrollView.getOffset()](#module_FlexScrollView#getOffset)
  * [flexScrollView.showPullToRefresh([footer])](#module_FlexScrollView#showPullToRefresh)
  * [flexScrollView.hidePullToRefresh()](#module_FlexScrollView#hidePullToRefresh)
  * [flexScrollView.isPullToRefreshVisible()](#module_FlexScrollView#isPullToRefreshVisible)
  * [flexScrollView.applyScrollForce()](#module_FlexScrollView#applyScrollForce)
  * [flexScrollView.updateScrollForce()](#module_FlexScrollView#updateScrollForce)
  * [flexScrollView.releaseScrollForce()](#module_FlexScrollView#releaseScrollForce)

<a name="exp_new_module_FlexScrollView"></a>
###new FlexScrollView(options)
**Params**

- options `Object` - Configurable options (see ScrollController for all inherited options).  
  - \[pullToRefreshHeader\] `Renderable` - Pull to refresh renderable that is displayed when pulling down from the top.  
  - \[pullToRefreshFooter\] `Renderable` - Pull to refresh renderable that is displayed when pulling up from the bottom.  

**Extends**: `ScrollController`  
<a name="module_FlexScrollView#getPosition"></a>
###~~flexScrollView.getPosition~~
Returns the position associated with the Scrollview instance's current node
(generally the node currently at the top).

This function is a shim provided for compatibility with the stock famo.us Scrollview.

**Params**

- \[node\] `number` - If specified, returns the position of the node at that index in the
Scrollview instance's currently managed collection.  

***Deprecated***  
**Returns**: `number` - The position of either the specified node, or the Scrollview's current Node,
in pixels translated.  
<a name="module_FlexScrollView#setOptions"></a>
###flexScrollView.setOptions(options)
Patches the FlexScrollView instance's options with the passed-in ones.

**Params**

- options `Object` - Configurable options (see ScrollController for all inherited options).  
  - \[pullToRefreshHeader\] `Renderable` - Pull to refresh renderable that is displayed when pulling down from the top.  
  - \[pullToRefreshFooter\] `Renderable` - Pull to refresh renderable that is displayed when pulling up from the bottom.  

**Returns**: `FlexScrollView` - this  
<a name="module_FlexScrollView#sequenceFrom"></a>
###flexScrollView.sequenceFrom(node)
Sets the data-source (alias for setDataSource).

This function is a shim provided for compatibility with the stock famo.us Scrollview.

**Params**

- node `Array` | `ViewSequence` - Either an array of renderables or a Famous viewSequence.  

**Returns**: `FlexScrollView` - this  
<a name="module_FlexScrollView#getCurrentIndex"></a>
###flexScrollView.getCurrentIndex()
Returns the index of the first visible renderable.

This function is a shim provided for compatibility with the stock famo.us Scrollview.

**Returns**: `Number` - The current index of the ViewSequence  
<a name="module_FlexScrollView#goToPage"></a>
###flexScrollView.goToPage(index)
Paginates the Scrollview to an absolute page index. This function is a shim provided
for compatibility with the stock famo.us Scrollview.

**Params**

- index `Number` - view-sequence index to go to.  

**Returns**: `FlexScrollView` - this  
<a name="module_FlexScrollView#getOffset"></a>
###flexScrollView.getOffset()
Returns the offset associated with the Scrollview instance's current node
(generally the node currently at the top).

This function is a shim provided for compatibility with the stock famo.us Scrollview.

**Returns**: `number` - The position of either the specified node, or the Scrollview's current Node,
in pixels translated.  
<a name="module_FlexScrollView#showPullToRefresh"></a>
###flexScrollView.showPullToRefresh([footer])
Shows the pulls-to-refresh renderable indicating that a refresh is in progress.

**Params**

- \[footer\] `Bool` - set to true to show pull-to-refresh at the end (default: false).  

<a name="module_FlexScrollView#hidePullToRefresh"></a>
###flexScrollView.hidePullToRefresh()
Hides the pull-to-refresh renderable in case it was visible.

<a name="module_FlexScrollView#isPullToRefreshVisible"></a>
###flexScrollView.isPullToRefreshVisible()
Get the visible state of the pull-to-refresh renderable.

<a name="module_FlexScrollView#applyScrollForce"></a>
###flexScrollView.applyScrollForce()
Delegates any scroll force to leading/trailing scrollviews.

<a name="module_FlexScrollView#updateScrollForce"></a>
###flexScrollView.updateScrollForce()
Delegates any scroll force to leading/trailing scrollviews.

<a name="module_FlexScrollView#releaseScrollForce"></a>
###flexScrollView.releaseScrollForce()
Delegates any scroll force to leading/trailing scrollviews.

