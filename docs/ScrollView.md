<a name="module_ScrollView"></a>
#ScrollView
Flexible ScrollView drop-in replacement for famo.us.

Key features:
-    Customizable layout (uses ListLayout by default)
-    Insert/remove at any position using animations
-    Support for `true` size renderables
-    Pull to refresh
-    Horizontal/vertical direction
-    Top/left or bottom/right alignment
-    Pagination
-    Option to embed in a ContainerSurface

Inherited from: [ScrollController](./ScrollController.md)

<a name="exp_module_ScrollView"></a>
##class: ScrollView ⏏
**Extends**: `ScrollController`  
**Members**

* [class: ScrollView ⏏](#exp_module_ScrollView)
  * [new ScrollView(options)](#exp_new_module_ScrollView)
  * [scrollView.sequenceFrom(node)](#module_ScrollView#sequenceFrom)
  * [scrollView.getCurrentIndex()](#module_ScrollView#getCurrentIndex)
  * [scrollView.goToPage(index)](#module_ScrollView#goToPage)
  * [scrollView.getOffset()](#module_ScrollView#getOffset)
  * [~~ScrollView~getPosition([node])~~](#module_ScrollView..getPosition)
  * [scrollView.showPullToRefresh([footer])](#module_ScrollView#showPullToRefresh)
  * [scrollView.hidePullToRefresh()](#module_ScrollView#hidePullToRefresh)
  * [scrollView.isPullToRefreshVisible()](#module_ScrollView#isPullToRefreshVisible)

<a name="exp_new_module_ScrollView"></a>
###new ScrollView(options)
**Params**

- options `Object` - Options (see ScrollController).  

**Extends**: `ScrollController`  
<a name="module_ScrollView#sequenceFrom"></a>
###scrollView.sequenceFrom(node)
Sets the data-source (alias for setDataSource).

This function is a shim provided for compatibility with the stock famo.us ScrollView.

**Params**

- node `Array` | `ViewSequence` - Either an array of renderables or a Famous viewSequence.  

**Returns**: `ScrollView` - this  
<a name="module_ScrollView#getCurrentIndex"></a>
###scrollView.getCurrentIndex()
Returns the index of the first visible renderable.

This function is a shim provided for compatibility with the stock famo.us ScrollView.

**Returns**: `Number` - The current index of the ViewSequence  
<a name="module_ScrollView#goToPage"></a>
###scrollView.goToPage(index)
Paginates the Scrollview to an absolute page index. This function is a shim provided
for compatibility with the stock famo.us ScrollView.

**Params**

- index `Number` - view-sequence index to go to.  

**Returns**: `ScrollView` - this  
<a name="module_ScrollView#getOffset"></a>
###scrollView.getOffset()
Returns the offset associated with the Scrollview instance's current node
(generally the node currently at the top).

This function is a shim provided for compatibility with the stock famo.us ScrollView.

**Returns**: `number` - The position of either the specified node, or the Scrollview's current Node,
in pixels translated.  
<a name="module_ScrollView..getPosition"></a>
###~~ScrollView~getPosition([node])~~
Returns the position associated with the Scrollview instance's current node
(generally the node currently at the top).

This function is a shim provided for compatibility with the stock famo.us ScrollView.

**Params**

- \[node\] `number` - If specified, returns the position of the node at that index in the
Scrollview instance's currently managed collection.  

***Deprecated***  
**Scope**: inner function of [ScrollView](#module_ScrollView)  
**Returns**: `number` - The position of either the specified node, or the Scrollview's current Node,
in pixels translated.  
<a name="module_ScrollView#showPullToRefresh"></a>
###scrollView.showPullToRefresh([footer])
Shows the pulls-to-refresh renderable indicating that a refresh is in progress.

**Params**

- \[footer\] `Bool` - set to true to show pull-to-refresh at the end (default: false).  

<a name="module_ScrollView#hidePullToRefresh"></a>
###scrollView.hidePullToRefresh()
Hides the pull-to-refresh renderable in case it was visible.

<a name="module_ScrollView#isPullToRefreshVisible"></a>
###scrollView.isPullToRefreshVisible()
Get the visible state of the pull-to-refresh renderable.

