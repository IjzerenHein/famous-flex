<a name="module_LayoutUtility"></a>
#LayoutUtility
Utility class for famous-flex.

<a name="exp_module_LayoutUtility"></a>
##class: LayoutUtility ⏏
**Members**

* [class: LayoutUtility ⏏](#exp_module_LayoutUtility)
  * [LayoutUtility.cloneSpec(spec)](#module_LayoutUtility.cloneSpec)
  * [LayoutUtility.clearSpec(spec)](#module_LayoutUtility.clearSpec)
  * [LayoutUtility.isEqualSpec(spec1, spec2)](#module_LayoutUtility.isEqualSpec)
  * [LayoutUtility.error(message)](#module_LayoutUtility.error)
  * [LayoutUtility.warning(message)](#module_LayoutUtility.warning)
  * [LayoutUtility.log(arguments)](#module_LayoutUtility.log)
  * [LayoutUtility.registerHelper(name, Helper)](#module_LayoutUtility.registerHelper)
  * [LayoutUtility.unregisterHelper(name)](#module_LayoutUtility.unregisterHelper)
  * [LayoutUtility.getRegisteredHelper(name)](#module_LayoutUtility.getRegisteredHelper)

<a name="module_LayoutUtility.cloneSpec"></a>
###LayoutUtility.cloneSpec(spec)
Makes a (shallow) copy of a spec.

**Params**

- spec `Spec` - Spec to clone  

**Returns**: `Spec` - cloned spec  
<a name="module_LayoutUtility.clearSpec"></a>
###LayoutUtility.clearSpec(spec)
Clears the contents of a spec.

**Params**

- spec `Spec` - Spec to clear  

**Returns**: `Spec` - spec  
<a name="module_LayoutUtility.isEqualSpec"></a>
###LayoutUtility.isEqualSpec(spec1, spec2)
Compares two specs for equality.

**Params**

- spec1 `Spec` - Spec to compare  
- spec2 `Spec` - Spec to compare  

**Returns**: `Boolean` - true/false  
<a name="module_LayoutUtility.error"></a>
###LayoutUtility.error(message)
Helper function to call whenever a critical error has occurred.

**Params**

- message `String` - error-message  

<a name="module_LayoutUtility.warning"></a>
###LayoutUtility.warning(message)
Helper function to call whenever a warning error has occurred.

**Params**

- message `String` - warning-message  

<a name="module_LayoutUtility.log"></a>
###LayoutUtility.log(arguments)
Helper function to log 1 or more arguments. All the arguments
are concatenated to produce a single string which is logged.

**Params**

- arguments `String` | `Array` | `Object` - arguments to stringify and concatenate  

<a name="module_LayoutUtility.registerHelper"></a>
###LayoutUtility.registerHelper(name, Helper)
Registers a layout-helper so it can be used as a layout-literal for
a layout-controller. The LayoutHelper instance must support the `parse`
function, which is fed the layout-literal content.

**Example:**

```javascript
Layout.registerHelper('dock', LayoutDockHelper);

var layoutController = new LayoutController({
  layout: { dock: [,
    ['top', 'header', 50],
    ['bottom', 'footer', 50],
    ['fill', 'content'],
  ]},
  dataSource: {
    header: new Surface({content: 'Header'}),
    footer: new Surface({content: 'Footer'}),
    content: new Surface({content: 'Content'}),
  }
})
```

**Params**

- name `String` - name of the helper (e.g. 'dock')  
- Helper `function` - Helper to register (e.g. LayoutDockHelper)  

<a name="module_LayoutUtility.unregisterHelper"></a>
###LayoutUtility.unregisterHelper(name)
Unregisters a layout-helper.

**Params**

- name `String` - name of the layout-helper  

<a name="module_LayoutUtility.getRegisteredHelper"></a>
###LayoutUtility.getRegisteredHelper(name)
Gets a registered layout-helper by its name.

**Params**

- name `String` - name of the layout-helper  

**Returns**: `function` - layout-helper or undefined  
