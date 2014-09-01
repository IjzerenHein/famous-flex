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
  * [LayoutUtility.log(arguments)](#module_LayoutUtility.log)

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

<a name="module_LayoutUtility.log"></a>
###LayoutUtility.log(arguments)
Helper function to log 1 or more arguments. All the arguments
are concatenated to produce a single string which is logged.

**Params**

- arguments `String` | `Array` | `Object` - arguments to stringify and concatenate  

