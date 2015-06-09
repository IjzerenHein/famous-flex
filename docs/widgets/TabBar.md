<a name="module_TabBar"></a>
## TabBar
TabBar widget for famo.us.

```javascript
var TabBar = require('famous-flex/widgets/TabBar');

var tabBar = new TabBar({
  classes: ['black'],
  createRenderables: {
    background: true,
    selectedItemOverlay: true,
    spacers: true
  }
});
tabBar.setItems([
  'one',
  'two',
  'three'
]);
this.add(tabBar); // add to the render-tree

tabBar.on('tabchange', function(event) {
  console.log('new tab selected: ' + event.index);
});
```

The surfaces that are created, use the the css-classes `ff-widget` and `ff-tabbar`.
You can add additional css-classes by using the `classes` option in the constructor.

Example css styles for a black theme:

```css
.ff-tabbar.background.black {
  background-color: #101010;
}
.ff-tabbar.item.black {
  color: #f7f3f7;
}
.ff-tabbar.selectedItemOverlay.black {
  border-bottom: 6px solid #30b6e7;
}
.ff-tabbar.spacer.black:after {
  content: "";
  background-color: #333333;
  width: 100%;
  top: 10px;
  bottom: 10px;
  position: absolute;
}
```


* [TabBar](#module_TabBar)
  * [TabBar](#exp_module_TabBar--TabBar) ⇐ <code>View</code> ⏏
    * [new TabBar(options)](#new_module_TabBar--TabBar_new)
    * [.setOptions(options)](#module_TabBar--TabBar+setOptions) ⇒ <code>TabBar</code>
    * [.setItems(items)](#module_TabBar--TabBar+setItems) ⇒ <code>TabBar</code>
    * [.getItems()](#module_TabBar--TabBar+getItems) ⇒ <code>Array</code>
    * [.getItemSpec(index)](#module_TabBar--TabBar+getItemSpec) ⇒ <code>Spec</code>
    * [.setSelectedItemIndex(index)](#module_TabBar--TabBar+setSelectedItemIndex) ⇒ <code>TabBar</code>
    * [.getSelectedItemIndex()](#module_TabBar--TabBar+getSelectedItemIndex) ⇒ <code>Number</code>
    * [.getSize()](#module_TabBar--TabBar+getSize) ⇒ <code>Array</code>

<a name="exp_module_TabBar--TabBar"></a>
### TabBar ⇐ <code>View</code> ⏏
**Kind**: Exported class  
**Extends:** <code>View</code>  
<a name="new_module_TabBar--TabBar_new"></a>
#### new TabBar(options)

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options. |
| [options.tabBarLayout] | <code>Object</code> | Layout-options that are passed to the TabBarLayout. |
| [options.layoutController] | <code>Object</code> | Options that are passed to the underlying layout-controller. |
| [options.classes] | <code>Array.String</code> | Css-classes that are added to the surfaces that are created. |
| [options.createRenderables] | <code>Object</code> | Options that specify which renderables should be created. |

<a name="module_TabBar--TabBar+setOptions"></a>
#### tabBar.setOptions(options) ⇒ <code>TabBar</code>
Patches the TabBar instance's options with the passed-in ones.

**Kind**: instance method of <code>[TabBar](#exp_module_TabBar--TabBar)</code>  
**Returns**: <code>TabBar</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options. |
| [options.tabBarLayout] | <code>Object</code> | Layout-options that are passed to the TabBarLayout. |
| [options.layoutController] | <code>Object</code> | Options that are passed to the underlying layout-controller. |

<a name="module_TabBar--TabBar+setItems"></a>
#### tabBar.setItems(items) ⇒ <code>TabBar</code>
Sets the items for the tab-bar.

Example 1:

```javascript
var tabBar = new TabBar();
tabBar.setItems([
  'one',
  'two',
  'three'
]);
```

Example using Ionic icons:

```javascript
var tabBar = new TabBar();
tabBar.setItems([
  '<div class="icon ion-flag"></div>Flag',
  '<div class="icon ion-map"></div>Map',
  '<div class="icon ion-gear-a"></div>Settings'
]);
```

CSS:

```css
.ff-tabbar.item {
  font-size: 12px;
}
.ff-tabbar.item .icon {
  font-size: 24px;
}
```

**Kind**: instance method of <code>[TabBar](#exp_module_TabBar--TabBar)</code>  
**Returns**: <code>TabBar</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| items | <code>Array</code> | Array of tab-item renderables. |

<a name="module_TabBar--TabBar+getItems"></a>
#### tabBar.getItems() ⇒ <code>Array</code>
Get the tab-item renderables for the tab-bar.

**Kind**: instance method of <code>[TabBar](#exp_module_TabBar--TabBar)</code>  
**Returns**: <code>Array</code> - tab-item renderables  
<a name="module_TabBar--TabBar+getItemSpec"></a>
#### tabBar.getItemSpec(index) ⇒ <code>Spec</code>
Get the spec (size, transform, etc..) of the given tab-item.

**Kind**: instance method of <code>[TabBar](#exp_module_TabBar--TabBar)</code>  
**Returns**: <code>Spec</code> - item spec  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>Number</code> | Index of the tab-item. |

<a name="module_TabBar--TabBar+setSelectedItemIndex"></a>
#### tabBar.setSelectedItemIndex(index) ⇒ <code>TabBar</code>
Sets the index of the selected tab.

**Kind**: instance method of <code>[TabBar](#exp_module_TabBar--TabBar)</code>  
**Returns**: <code>TabBar</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>Number</code> | selected index. |

<a name="module_TabBar--TabBar+getSelectedItemIndex"></a>
#### tabBar.getSelectedItemIndex() ⇒ <code>Number</code>
Get the index of the selected tab-item.

**Kind**: instance method of <code>[TabBar](#exp_module_TabBar--TabBar)</code>  
**Returns**: <code>Number</code> - selected index  
<a name="module_TabBar--TabBar+getSize"></a>
#### tabBar.getSize() ⇒ <code>Array</code>
Get the size of the widget.

**Kind**: instance method of <code>[TabBar](#exp_module_TabBar--TabBar)</code>  
**Returns**: <code>Array</code> - size.  
