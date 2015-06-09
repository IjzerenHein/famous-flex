<a name="module_TabBarController"></a>
## TabBarController
TabBarController.


* [TabBarController](#module_TabBarController)
  * [TabBarController](#exp_module_TabBarController--TabBarController) ⏏
    * [new TabBarController(options)](#new_module_TabBarController--TabBarController_new)
    * _instance_
      * [.setOptions(options)](#module_TabBarController--TabBarController+setOptions) ⇒ <code>TabBarController</code>
      * [.setItems(items)](#module_TabBarController--TabBarController+setItems) ⇒ <code>TabBarController</code>
      * [.getItems()](#module_TabBarController--TabBarController+getItems) ⇒ <code>Array</code>
      * [.setSelectedItemIndex(index)](#module_TabBarController--TabBarController+setSelectedItemIndex) ⇒ <code>TabBar</code>
      * [.getSelectedItemIndex()](#module_TabBarController--TabBarController+getSelectedItemIndex) ⇒ <code>Number</code>
    * _static_
      * [.DEFAULT_LAYOUT()](#module_TabBarController--TabBarController.DEFAULT_LAYOUT)

<a name="exp_module_TabBarController--TabBarController"></a>
### TabBarController ⏏
**Kind**: Exported class  
<a name="new_module_TabBarController--TabBarController_new"></a>
#### new TabBarController(options)

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options. |
| [options.tabBarPosition] | <code>TabBarController.Position</code> | Position (default: BOTTOM). |
| [options.tabBarSize] | <code>Number</code> | Size of the tabBar (default: 50). |
| [options.tabBarZIndex] | <code>Number</code> | Z-index the tabBar is put above the content (AnimationController) (default: 10). |
| [options.tabBar] | <code>Object</code> | Options that are passed to the TabBar. |
| [options.animationController] | <code>Object</code> | Options that are passed to the AnimationController. |

<a name="module_TabBarController--TabBarController+setOptions"></a>
#### tabBarController.setOptions(options) ⇒ <code>TabBarController</code>
Patches the TabBarController instance's options with the passed-in ones.

**Kind**: instance method of <code>[TabBarController](#exp_module_TabBarController--TabBarController)</code>  
**Returns**: <code>TabBarController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options. |
| [options.tabBarPosition] | <code>TabBarController.Position</code> | Position (default: BOTTOM). |
| [options.tabBarSize] | <code>Number</code> | Size of the tabBar (default: 50). |
| [options.tabBarZIndex] | <code>Number</code> | Z-index the tabBar is put above the content (AnimationController) (default: 10). |
| [options.tabBar] | <code>Object</code> | Options that are passed to the TabBar. |
| [options.animationController] | <code>Object</code> | Options that are passed to the AnimationController. |

<a name="module_TabBarController--TabBarController+setItems"></a>
#### tabBarController.setItems(items) ⇒ <code>TabBarController</code>
Sets the items for the tab-bar controller.

Example 1:

```javascript
var tabBarController = new TabBarController();
tabBarController.setItems([
  {tabItem: 'Profile', view: new ProfileView()},
  {tabItem: 'Map', view: new MapView()},
  {tabItem: 'Login', view: new LoginView()}
  {tabItem: 'Settings', view: new SettingsView()}
]);
```

**Kind**: instance method of <code>[TabBarController](#exp_module_TabBarController--TabBarController)</code>  
**Returns**: <code>TabBarController</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| items | <code>Array</code> | Array of tab-bar controller items. |

<a name="module_TabBarController--TabBarController+getItems"></a>
#### tabBarController.getItems() ⇒ <code>Array</code>
Get the tab-items (also see `setItems`).

**Kind**: instance method of <code>[TabBarController](#exp_module_TabBarController--TabBarController)</code>  
**Returns**: <code>Array</code> - tab-items  
<a name="module_TabBarController--TabBarController+setSelectedItemIndex"></a>
#### tabBarController.setSelectedItemIndex(index) ⇒ <code>TabBar</code>
Sets the index of the selected tab.

**Kind**: instance method of <code>[TabBarController](#exp_module_TabBarController--TabBarController)</code>  
**Returns**: <code>TabBar</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>Number</code> | selected index. |

<a name="module_TabBarController--TabBarController+getSelectedItemIndex"></a>
#### tabBarController.getSelectedItemIndex() ⇒ <code>Number</code>
Get the index of the selected tab-item.

**Kind**: instance method of <code>[TabBarController](#exp_module_TabBarController--TabBarController)</code>  
**Returns**: <code>Number</code> - selected index  
<a name="module_TabBarController--TabBarController.DEFAULT_LAYOUT"></a>
#### TabBarController.DEFAULT_LAYOUT()
Default layout-function for the TabBarController. Supports simple
docking to any of the four edges.

**Kind**: static method of <code>[TabBarController](#exp_module_TabBarController--TabBarController)</code>  
