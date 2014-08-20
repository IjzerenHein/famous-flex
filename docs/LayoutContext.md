<a name="module_LayoutContext"></a>
#LayoutContext
LayoutContext is the interface for a layout-function to enumerate the
`LayoutNode`s to layout and get the size of the parent.

<a name="exp_module_LayoutContext"></a>
##class: LayoutContext ⏏
**Members**

* [class: LayoutContext ⏏](#exp_module_LayoutContext)
  * [new LayoutContext(options)](#exp_new_module_LayoutContext)
  * [layoutContext.nextNode()](#module_LayoutContext#nextNode)
  * [layoutContext.nodeById(nodeId)](#module_LayoutContext#nodeById)
  * [layoutContext.nodeByArrayElement(arrayElement)](#module_LayoutContext#nodeByArrayElement)

<a name="exp_new_module_LayoutContext"></a>
###new LayoutContext(options)
**Params**

- options `Object` - Options.  

<a name="module_LayoutContext#nextNode"></a>
###layoutContext.nextNode()
Get the layout node for the next renderable in the data-source.

**Returns**: `LayoutNode` - layout-node or undefined  
<a name="module_LayoutContext#nodeById"></a>
###layoutContext.nodeById(nodeId)
Get the layout-node for a renderable with a specific id. The renderable
can be an array, in that case an array of elements is returned.
To access the `LayoutNode`s for those array-elements, use
`nodeByArrayElement` on each of the elements.

**Params**

- nodeId `String` - id of the renderable  

**Returns**: `LayoutNode` | `Array` - layout-node or undefined  
<a name="module_LayoutContext#nodeByArrayElement"></a>
###layoutContext.nodeByArrayElement(arrayElement)
Get the layout-node based on an array element.

**Params**

- arrayElement `Object` - array-element for which to return a `LayoutNode`  

**Returns**: `LayoutNode` - layout-node or undefined  
