<a name="module_TabBar"></a>
#TabBar
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

<a name="exp_module_TabBar"></a>
##class: TabBar ⏏
**Extends**: `View`  
**Members**

* [class: TabBar ⏏](#exp_module_TabBar)
  * [new TabBar(options)](#exp_new_module_TabBar)
  * [tabBar.setOptions(options)](#module_TabBar#setOptions)
  * [tabBar.setItems(items)](#module_TabBar#setItems)
  * [tabBar.getItems()](#module_TabBar#getItems)
  * [tabBar.getItemSpec(index)](#module_TabBar#getItemSpec)
  * [tabBar.setSelectedItemIndex(index)](#module_TabBar#setSelectedItemIndex)
  * [tabBar.getSelectedItemIndex()](#module_TabBar#getSelectedItemIndex)
  * [tabBar.getSize()](#module_TabBar#getSize)

<a name="exp_new_module_TabBar"></a>
###new TabBar(options)
**Params**

- options `Object` - Configurable options.  
  - \[tabBarLayout\] `Object` - Layout-options that are passed to the TabBarLayout.  
  - \[layoutController\] `Object` - Options that are passed to the underlying layout-controller.  
  - \[classes\] `Array.String` - Css-classes that are added to the surfaces that are created.  
  - \[createRenderables\] `Object` - Options that specify which renderables should be created.  

**Extends**: `View`  
<a name="module_TabBar#setOptions"></a>
###tabBar.setOptions(options)
Patches the TabBar instance's options with the passed-in ones.

**Params**

- options `Object` - Configurable options.  
  - \[tabBarLayout\] `Object` - Layout-options that are passed to the TabBarLayout.  
  - \[layoutController\] `Object` - Options that are passed to the underlying layout-controller.  

**Returns**: `TabBar` - this  
<a name="module_TabBar#setItems"></a>
###tabBar.setItems(items)
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

**Params**

- items `Array` - Array of tab-item renderables.  

**Returns**: `TabBar` - this  
<a name="module_TabBar#getItems"></a>
###tabBar.getItems()
Get the tab-item renderables for the tab-bar.

**Returns**: `Array` - tab-item renderables  
<a name="module_TabBar#getItemSpec"></a>
###tabBar.getItemSpec(index)
Get the spec (size, transform, etc..) of the given tab-item.

**Params**

- index `Number` - Index of the tab-item.  

**Returns**: `Spec` - item spec  
<a name="module_TabBar#setSelectedItemIndex"></a>
###tabBar.setSelectedItemIndex(index)
Sets the index of the selected tab.

**Params**

- index `Number` - selected index.  

**Returns**: `TabBar` - this  
<a name="module_TabBar#getSelectedItemIndex"></a>
###tabBar.getSelectedItemIndex()
Get the index of the selected tab-item.

**Returns**: `Number` - selected index  
<a name="module_TabBar#getSize"></a>
###tabBar.getSize()
Get the size of the widget.

**Returns**: `Array` - size.  
