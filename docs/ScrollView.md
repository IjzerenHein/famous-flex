<a name="module_ScrollView"></a>
#ScrollView
Work in progress - do not use.

Inherited from: [FlowLayoutController](./FlowLayoutController.md)

<a name="exp_module_ScrollView"></a>
##class: ScrollView ⏏
**Members**

* [class: ScrollView ⏏](#exp_module_ScrollView)
  * [new ScrollView(options)](#exp_new_module_ScrollView)
  * [scrollView.getFirstVisibleItem([visiblePerc])](#module_ScrollView#getFirstVisibleItem)
  * [scrollView.scroll([amount])](#module_ScrollView#scroll)
  * [scrollView.scrollTo([node])](#module_ScrollView#scrollTo)

<a name="exp_new_module_ScrollView"></a>
###new ScrollView(options)
**Params**

- options `Object` - Options.  

<a name="module_ScrollView#getFirstVisibleItem"></a>
###scrollView.getFirstVisibleItem([visiblePerc])
Get the first visible item that meets the visible percentage criteria.
The percentage indicates how many pixels should at least visible before
the renderable is considered visible.
`visible percentage = (width * height) / (visible width * visible height)`

**Params**

- \[visiblePerc\] `Number` - percentage in the range of 0..1 (default: 0.99)  

**Returns**: `Object` - item object or undefined  
<a name="module_ScrollView#scroll"></a>
###scrollView.scroll([amount])
Moves to the next node in the viewSequence.

**Params**

- \[amount\] `Number` - Amount of nodes to move  

**Returns**: `ScrollView` - this  
<a name="module_ScrollView#scrollTo"></a>
###scrollView.scrollTo([node])
Scroll to the given renderable in the datasource.

**Params**

- \[node\] `RenderNode` - renderable to scroll to  

**Returns**: `LayoutController` - this  
