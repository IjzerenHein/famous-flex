<a name="module_ScrollView"></a>
#ScrollView
Flexible ScrollView drop-in replacement for famo.us.

Key features:
-    Customizable layout
-    Insert/remove renderables into the scene using animations/spec
-    Support for `true` size renderables
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

<a name="exp_new_module_ScrollView"></a>
###new ScrollView(options)
**Params**

- options `Object` - Options (see ScrollController).  

**Extends**: `ScrollController`  
<a name="module_ScrollView#sequenceFrom"></a>
###scrollView.sequenceFrom(node)
Sets the data-source. This function is a shim provided for compatibility with the
stock famo.us ScrollView.

**Params**

- node `Array` | `ViewSequence` - Either an array of renderables or a Famous viewSequence.  

**Returns**: `ScrollView` - this  
