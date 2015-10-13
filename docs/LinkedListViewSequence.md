<a name="module_LinkedListViewSequence"></a>
## LinkedListViewSequence
Linked-list based implementation of a view-sequence which fixes
several issues in the stock famo.us ViewSequence.


* [LinkedListViewSequence](#module_LinkedListViewSequence)
  * [LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence) ⏏
    * [new LinkedListViewSequence(options)](#new_module_LinkedListViewSequence--LinkedListViewSequence_new)
    * [.getHead()](#module_LinkedListViewSequence--LinkedListViewSequence+getHead) ⇒ <code>LinkedListViewSequence</code>
    * [.getTail()](#module_LinkedListViewSequence--LinkedListViewSequence+getTail) ⇒ <code>LinkedListViewSequence</code>
    * [.getPrevious()](#module_LinkedListViewSequence--LinkedListViewSequence+getPrevious) ⇒ <code>LinkedListViewSequence</code>
    * [.getNext()](#module_LinkedListViewSequence--LinkedListViewSequence+getNext) ⇒ <code>LinkedListViewSequence</code>
    * [.get()](#module_LinkedListViewSequence--LinkedListViewSequence+get) ⇒ <code>Renderable</code>
    * [.set(value)](#module_LinkedListViewSequence--LinkedListViewSequence+set) ⇒ <code>LinkedListViewSequence</code>
    * [.getIndex()](#module_LinkedListViewSequence--LinkedListViewSequence+getIndex) ⇒ <code>Number</code>
    * [.toString()](#module_LinkedListViewSequence--LinkedListViewSequence+toString) ⇒ <code>String</code>
    * [.indexOf(item)](#module_LinkedListViewSequence--LinkedListViewSequence+indexOf) ⇒ <code>Number</code>
    * [.findByIndex(index)](#module_LinkedListViewSequence--LinkedListViewSequence+findByIndex) ⇒ <code>LinkedListViewSequence</code>
    * [.findByValue(value)](#module_LinkedListViewSequence--LinkedListViewSequence+findByValue) ⇒ <code>LinkedListViewSequence</code>
    * [.insert(index, renderNode)](#module_LinkedListViewSequence--LinkedListViewSequence+insert) ⇒ <code>LinkedListViewSequence</code>
    * [.remove(sequence)](#module_LinkedListViewSequence--LinkedListViewSequence+remove) ⇒ <code>LinkedListViewSequence</code>
    * [.getLength()](#module_LinkedListViewSequence--LinkedListViewSequence+getLength) ⇒ <code>Number</code>
    * [.clear()](#module_LinkedListViewSequence--LinkedListViewSequence+clear) ⇒ <code>LinkedListViewSequence</code>
    * [.unshift(renderNode)](#module_LinkedListViewSequence--LinkedListViewSequence+unshift) ⇒ <code>LinkedListViewSequence</code>
    * [.push(renderNode)](#module_LinkedListViewSequence--LinkedListViewSequence+push) ⇒ <code>LinkedListViewSequence</code>
    * [.swap(index, index2)](#module_LinkedListViewSequence--LinkedListViewSequence+swap) ⇒ <code>LinkedListViewSequence</code>

<a name="exp_module_LinkedListViewSequence--LinkedListViewSequence"></a>
### LinkedListViewSequence ⏏
**Kind**: Exported class  
<a name="new_module_LinkedListViewSequence--LinkedListViewSequence_new"></a>
#### new LinkedListViewSequence(options)

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options. |

<a name="module_LinkedListViewSequence--LinkedListViewSequence+getHead"></a>
#### linkedListViewSequence.getHead() ⇒ <code>LinkedListViewSequence</code>
Get head node.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>LinkedListViewSequence</code> - head node.  
<a name="module_LinkedListViewSequence--LinkedListViewSequence+getTail"></a>
#### linkedListViewSequence.getTail() ⇒ <code>LinkedListViewSequence</code>
Get tail node.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>LinkedListViewSequence</code> - tail node.  
<a name="module_LinkedListViewSequence--LinkedListViewSequence+getPrevious"></a>
#### linkedListViewSequence.getPrevious() ⇒ <code>LinkedListViewSequence</code>
Get previous node.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>LinkedListViewSequence</code> - previous node.  
<a name="module_LinkedListViewSequence--LinkedListViewSequence+getNext"></a>
#### linkedListViewSequence.getNext() ⇒ <code>LinkedListViewSequence</code>
Get next node.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>LinkedListViewSequence</code> - next node.  
<a name="module_LinkedListViewSequence--LinkedListViewSequence+get"></a>
#### linkedListViewSequence.get() ⇒ <code>Renderable</code>
Gets the value of this node.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>Renderable</code> - surface/view  
<a name="module_LinkedListViewSequence--LinkedListViewSequence+set"></a>
#### linkedListViewSequence.set(value) ⇒ <code>LinkedListViewSequence</code>
Sets the value of this node.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>LinkedListViewSequence</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>Renderable</code> | surface/view |

<a name="module_LinkedListViewSequence--LinkedListViewSequence+getIndex"></a>
#### linkedListViewSequence.getIndex() ⇒ <code>Number</code>
Get the index of the node.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>Number</code> - Index of node.  
<a name="module_LinkedListViewSequence--LinkedListViewSequence+toString"></a>
#### linkedListViewSequence.toString() ⇒ <code>String</code>
Get human readable string verion of the node.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>String</code> - node as a human readable string  
<a name="module_LinkedListViewSequence--LinkedListViewSequence+indexOf"></a>
#### linkedListViewSequence.indexOf(item) ⇒ <code>Number</code>
Finds the index of a given render-node.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>Number</code> - Index or -1 when not found.  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>Renderable</code> | Render-node to find. |

<a name="module_LinkedListViewSequence--LinkedListViewSequence+findByIndex"></a>
#### linkedListViewSequence.findByIndex(index) ⇒ <code>LinkedListViewSequence</code>
Finds the view-sequence item at the given index.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>LinkedListViewSequence</code> - View-sequence node or undefined.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>Number</code> | 0-based index. |

<a name="module_LinkedListViewSequence--LinkedListViewSequence+findByValue"></a>
#### linkedListViewSequence.findByValue(value) ⇒ <code>LinkedListViewSequence</code>
Finds the view-sequence node by the given renderable.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>LinkedListViewSequence</code> - View-sequence node or undefined.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>Renderable</code> | Render-node to search for. |

<a name="module_LinkedListViewSequence--LinkedListViewSequence+insert"></a>
#### linkedListViewSequence.insert(index, renderNode) ⇒ <code>LinkedListViewSequence</code>
Inserts an item into the view-sequence.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>LinkedListViewSequence</code> - newly inserted view-sequence node.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>Number</code> | 0-based index (-1 inserts at the tail). |
| renderNode | <code>Renderable</code> | Renderable to insert. |

<a name="module_LinkedListViewSequence--LinkedListViewSequence+remove"></a>
#### linkedListViewSequence.remove(sequence) ⇒ <code>LinkedListViewSequence</code>
Removes the view-sequence item at the given index.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>LinkedListViewSequence</code> - New current view-sequence node to display.  

| Param | Type | Description |
| --- | --- | --- |
| sequence | <code>LinkedListViewSequence</code> | Node to remove |

<a name="module_LinkedListViewSequence--LinkedListViewSequence+getLength"></a>
#### linkedListViewSequence.getLength() ⇒ <code>Number</code>
Gets the number of items in the view-sequence.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>Number</code> - length.  
<a name="module_LinkedListViewSequence--LinkedListViewSequence+clear"></a>
#### linkedListViewSequence.clear() ⇒ <code>LinkedListViewSequence</code>
Removes all items.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>LinkedListViewSequence</code> - Last remaining view-sequence node.  
<a name="module_LinkedListViewSequence--LinkedListViewSequence+unshift"></a>
#### linkedListViewSequence.unshift(renderNode) ⇒ <code>LinkedListViewSequence</code>
Inserts an item at the beginning of the view-sequence.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>LinkedListViewSequence</code> - newly inserted view-sequence node.  

| Param | Type | Description |
| --- | --- | --- |
| renderNode | <code>Renderable</code> | Renderable to insert. |

<a name="module_LinkedListViewSequence--LinkedListViewSequence+push"></a>
#### linkedListViewSequence.push(renderNode) ⇒ <code>LinkedListViewSequence</code>
Inserts an item at the end of the view-sequence.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>LinkedListViewSequence</code> - newly inserted view-sequence node.  

| Param | Type | Description |
| --- | --- | --- |
| renderNode | <code>Renderable</code> | Renderable to insert. |

<a name="module_LinkedListViewSequence--LinkedListViewSequence+swap"></a>
#### linkedListViewSequence.swap(index, index2) ⇒ <code>LinkedListViewSequence</code>
Swaps the values of two view-sequence nodes.

**Kind**: instance method of <code>[LinkedListViewSequence](#exp_module_LinkedListViewSequence--LinkedListViewSequence)</code>  
**Returns**: <code>LinkedListViewSequence</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>Number</code> | Index of the first item to swap. |
| index2 | <code>Number</code> | Index of item to swap with. |

