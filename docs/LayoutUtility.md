<a name="module_LayoutUtility"></a>
#LayoutUtility
Utility class for famous-flex.

<a name="exp_module_LayoutUtility"></a>
##class: LayoutUtility ⏏
**Members**

* [class: LayoutUtility ⏏](#exp_module_LayoutUtility)
  * [LayoutUtility.normalizeMargins(margins)](#module_LayoutUtility.normalizeMargins)
  * [LayoutUtility.cloneSpec(spec)](#module_LayoutUtility.cloneSpec)
  * [LayoutUtility.isEqualSpec(spec1, spec2)](#module_LayoutUtility.isEqualSpec)
  * [LayoutUtility.getSpecDiffText(spec1, spec2)](#module_LayoutUtility.getSpecDiffText)
  * [LayoutUtility.error(message)](#module_LayoutUtility.error)
  * [LayoutUtility.warning(message)](#module_LayoutUtility.warning)
  * [LayoutUtility.log(args)](#module_LayoutUtility.log)
  * [LayoutUtility.combineOptions(options1, options2, [forceClone])](#module_LayoutUtility.combineOptions)
  * [LayoutUtility.registerHelper(name, Helper)](#module_LayoutUtility.registerHelper)
  * [LayoutUtility.unregisterHelper(name)](#module_LayoutUtility.unregisterHelper)
  * [LayoutUtility.getRegisteredHelper(name)](#module_LayoutUtility.getRegisteredHelper)

<a name="module_LayoutUtility.normalizeMargins"></a>
###LayoutUtility.normalizeMargins(margins)
Normalizes the margins argument.

**Params**

- margins `Array.Number`  

<a name="module_LayoutUtility.cloneSpec"></a>
###LayoutUtility.cloneSpec(spec)
Makes a (shallow) copy of a spec.

**Params**

- spec `Spec` - Spec to clone  

**Returns**: `Spec` - cloned spec  
<a name="module_LayoutUtility.isEqualSpec"></a>
###LayoutUtility.isEqualSpec(spec1, spec2)
Compares two specs for equality.

**Params**

- spec1 `Spec` - Spec to compare  
- spec2 `Spec` - Spec to compare  

**Returns**: `Boolean` - true/false  
<a name="module_LayoutUtility.getSpecDiffText"></a>
###LayoutUtility.getSpecDiffText(spec1, spec2)
Helper function that returns a string containing the differences
between two specs.

**Params**

- spec1 `Spec` - Spec to compare  
- spec2 `Spec` - Spec to compare  

**Returns**: `String` - text  
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
###LayoutUtility.log(args)
Helper function to log 1 or more arguments. All the arguments
are concatenated to produce a single string which is logged.

**Params**

- args `String` | `Array` | `Object` - arguments to stringify and concatenate  

<a name="module_LayoutUtility.combineOptions"></a>
###LayoutUtility.combineOptions(options1, options2, [forceClone])
Combines two sets of options into a single set.

**Params**

- options1 `Object` - base set of options  
- options2 `Object` - set of options to merge into `options1`  
- \[forceClone\] `Bool` - ensures that a clone is returned rather that one of the original options objects  

**Returns**: `Object` - Combined options  
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
