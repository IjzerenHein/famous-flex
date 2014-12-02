<a name="module_FlexScrollView"></a>
#FlexScrollView
Flexible ScrollView drop-in replacement for famo.us.

Key features:
-    Customizable layout (uses ListLayout by default)
-    Insert/remove at any position using animations
-    Support for `true` size renderables
-    Pull to refresh (header & footer)
-    Horizontal/vertical direction
-    Top/left or bottom/right alignment
-    Pagination
-    Option to embed in a ContainerSurface
-    ScrollView linking

Inherited from: [ScrollController](./ScrollController.md)

<a name="module_FlexScrollView..getPosition"></a>
##~~FlexScrollView~getPosition([node])~~
Returns the position associated with the Scrollview instance's current node
(generally the node currently at the top).

This function is a shim provided for compatibility with the stock famo.us ScrollView.

**Params**

- \[node\] `number` - If specified, returns the position of the node at that index in the
Scrollview instance's currently managed collection.  

***Deprecated***  
**Scope**: inner function of [FlexScrollView](#module_FlexScrollView)  
**Returns**: `number` - The position of either the specified node, or the Scrollview's current Node,
in pixels translated.  
