<a name="module_LayoutNode"></a>
#LayoutNode
LayoutNode is the interface for setting the size and transform in a layout-
function.

<a name="exp_module_LayoutNode"></a>
##class: LayoutNode ⏏
**Members**

* [class: LayoutNode ⏏](#exp_module_LayoutNode)
  * [new LayoutNode(options)](#exp_new_module_LayoutNode)
  * [layoutNode.setSize(size)](#module_LayoutNode#setSize)
  * [layoutNode.setTransform(transform)](#module_LayoutNode#setTransform)
  * [layoutNode.resolveSize(parentSize, [defaultSize])](#module_LayoutNode#resolveSize)
  * [layoutNode.toJSON()](#module_LayoutNode#toJSON)

<a name="exp_new_module_LayoutNode"></a>
###new LayoutNode(options)
**Params**

- options `Object` - Options.  

<a name="module_LayoutNode#setSize"></a>
###layoutNode.setSize(size)
Set the size of the node.

**Params**

- size `Array.Number`  

**Returns**: `LayoutNode` - this  
<a name="module_LayoutNode#setTransform"></a>
###layoutNode.setTransform(transform)
Set the transform of the node.

**Params**

- transform `Matrix`  

**Returns**: `LayoutNode` - this  
<a name="module_LayoutNode#resolveSize"></a>
###layoutNode.resolveSize(parentSize, [defaultSize])
Resolves the size of render-node the into a fixed size.  E.g., if the
render-node has a configured size (e.g. [50, undefined]), then the retured
size would have a width of 50, and would try to resolve `undefined` using
the `defaultSize` and `parentSize`. The size is resolved in the following order:
- width/height returned by `getSize` of the render-node
- width/height as specified in `defaultSize`
- width/height as specified in `parentSize`

**Params**

- parentSize `Array.Number` - parent-size  
- \[defaultSize\] `Array.Number` - default-size to use  

**Returns**: `Array.Number` - resolved size  
<a name="module_LayoutNode#toJSON"></a>
###layoutNode.toJSON()
Get the json that can be stringified for this object.

**Returns**: `Object` - clean object  
