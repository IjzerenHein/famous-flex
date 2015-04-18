<a name="module_LayoutUtility"></a>
## LayoutUtility
Utility class for famous-flex.


* [LayoutUtility](#module_LayoutUtility)
  * [LayoutUtility](#exp_module_LayoutUtility--LayoutUtility) ⏏
    * [.normalizeMargins(margins)](#module_LayoutUtility--LayoutUtility.normalizeMargins)
    * [.cloneSpec(spec)](#module_LayoutUtility--LayoutUtility.cloneSpec) ⇒ <code>Spec</code>
    * [.isEqualSpec(spec1, spec2)](#module_LayoutUtility--LayoutUtility.isEqualSpec) ⇒ <code>Boolean</code>
    * [.getSpecDiffText(spec1, spec2)](#module_LayoutUtility--LayoutUtility.getSpecDiffText) ⇒ <code>String</code>
    * [.error(message)](#module_LayoutUtility--LayoutUtility.error)
    * [.warning(message)](#module_LayoutUtility--LayoutUtility.warning)
    * [.log(args)](#module_LayoutUtility--LayoutUtility.log)
    * [.combineOptions(options1, options2, [forceClone])](#module_LayoutUtility--LayoutUtility.combineOptions) ⇒ <code>Object</code>
    * [.registerHelper(name, Helper)](#module_LayoutUtility--LayoutUtility.registerHelper)
    * [.unregisterHelper(name)](#module_LayoutUtility--LayoutUtility.unregisterHelper)
    * [.getRegisteredHelper(name)](#module_LayoutUtility--LayoutUtility.getRegisteredHelper) ⇒ <code>function</code>

<a name="exp_module_LayoutUtility--LayoutUtility"></a>
### LayoutUtility ⏏
**Kind**: Exported class  
<a name="module_LayoutUtility--LayoutUtility.normalizeMargins"></a>
#### LayoutUtility.normalizeMargins(margins)
Normalizes the margins argument.

**Kind**: static method of <code>[LayoutUtility](#exp_module_LayoutUtility--LayoutUtility)</code>  

| Param | Type |
| --- | --- |
| margins | <code>Array.Number</code> | 

<a name="module_LayoutUtility--LayoutUtility.cloneSpec"></a>
#### LayoutUtility.cloneSpec(spec) ⇒ <code>Spec</code>
Makes a (shallow) copy of a spec.

**Kind**: static method of <code>[LayoutUtility](#exp_module_LayoutUtility--LayoutUtility)</code>  
**Returns**: <code>Spec</code> - cloned spec  

| Param | Type | Description |
| --- | --- | --- |
| spec | <code>Spec</code> | Spec to clone |

<a name="module_LayoutUtility--LayoutUtility.isEqualSpec"></a>
#### LayoutUtility.isEqualSpec(spec1, spec2) ⇒ <code>Boolean</code>
Compares two specs for equality.

**Kind**: static method of <code>[LayoutUtility](#exp_module_LayoutUtility--LayoutUtility)</code>  
**Returns**: <code>Boolean</code> - true/false  

| Param | Type | Description |
| --- | --- | --- |
| spec1 | <code>Spec</code> | Spec to compare |
| spec2 | <code>Spec</code> | Spec to compare |

<a name="module_LayoutUtility--LayoutUtility.getSpecDiffText"></a>
#### LayoutUtility.getSpecDiffText(spec1, spec2) ⇒ <code>String</code>
Helper function that returns a string containing the differences
between two specs.

**Kind**: static method of <code>[LayoutUtility](#exp_module_LayoutUtility--LayoutUtility)</code>  
**Returns**: <code>String</code> - text  

| Param | Type | Description |
| --- | --- | --- |
| spec1 | <code>Spec</code> | Spec to compare |
| spec2 | <code>Spec</code> | Spec to compare |

<a name="module_LayoutUtility--LayoutUtility.error"></a>
#### LayoutUtility.error(message)
Helper function to call whenever a critical error has occurred.

**Kind**: static method of <code>[LayoutUtility](#exp_module_LayoutUtility--LayoutUtility)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | error-message |

<a name="module_LayoutUtility--LayoutUtility.warning"></a>
#### LayoutUtility.warning(message)
Helper function to call whenever a warning error has occurred.

**Kind**: static method of <code>[LayoutUtility](#exp_module_LayoutUtility--LayoutUtility)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | warning-message |

<a name="module_LayoutUtility--LayoutUtility.log"></a>
#### LayoutUtility.log(args)
Helper function to log 1 or more arguments. All the arguments
are concatenated to produce a single string which is logged.

**Kind**: static method of <code>[LayoutUtility](#exp_module_LayoutUtility--LayoutUtility)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>String</code> &#124; <code>Array</code> &#124; <code>Object</code> | arguments to stringify and concatenate |

<a name="module_LayoutUtility--LayoutUtility.combineOptions"></a>
#### LayoutUtility.combineOptions(options1, options2, [forceClone]) ⇒ <code>Object</code>
Combines two sets of options into a single set.

**Kind**: static method of <code>[LayoutUtility](#exp_module_LayoutUtility--LayoutUtility)</code>  
**Returns**: <code>Object</code> - Combined options  

| Param | Type | Description |
| --- | --- | --- |
| options1 | <code>Object</code> | base set of options |
| options2 | <code>Object</code> | set of options to merge into `options1` |
| [forceClone] | <code>Bool</code> | ensures that a clone is returned rather that one of the original options objects |

<a name="module_LayoutUtility--LayoutUtility.registerHelper"></a>
#### LayoutUtility.registerHelper(name, Helper)
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

**Kind**: static method of <code>[LayoutUtility](#exp_module_LayoutUtility--LayoutUtility)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | name of the helper (e.g. 'dock') |
| Helper | <code>function</code> | Helper to register (e.g. LayoutDockHelper) |

<a name="module_LayoutUtility--LayoutUtility.unregisterHelper"></a>
#### LayoutUtility.unregisterHelper(name)
Unregisters a layout-helper.

**Kind**: static method of <code>[LayoutUtility](#exp_module_LayoutUtility--LayoutUtility)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | name of the layout-helper |

<a name="module_LayoutUtility--LayoutUtility.getRegisteredHelper"></a>
#### LayoutUtility.getRegisteredHelper(name) ⇒ <code>function</code>
Gets a registered layout-helper by its name.

**Kind**: static method of <code>[LayoutUtility](#exp_module_LayoutUtility--LayoutUtility)</code>  
**Returns**: <code>function</code> - layout-helper or undefined  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | name of the layout-helper |

