<a name="module_DatePicker"></a>
## DatePicker
Date/time picker wheel for famo.us.

This component can be used as a date/time picker, a clock or
any other application which requires a date/time wheel.

Example:

```javascript
var DatePicker = require('famous-flex/widgets/DatePicker');

var datePicker = new DatePicker({
  date: new Date(),        // initial date
  wheelLayout: {
    itemSize: 100,         // height of an item on the date/wheel
    diameter: 300,         // diameter of the wheel (undefined = 3 x itemSize)
    radialOpacity: 0       // opacity at the top and bottom diameter edge
  });
});
datePicker.setComponents([
  new DatePicker.Component.FullDay(),  // full-day component (year + month + day)
  new DatePicker.Component.Hour(),     // hour component (0..23)
  new DatePicker.Component.Minute()    // minute compoent (0..59)
]);
this.add(datePicker); // add to the render-tree

datePicker.on('datechange', function(event) {
  console.log('new date selected: ' + event.date.toLocaleString());
});
```

CSS:

```css
.ff-datepicker .item {
  color: blue;
  font-size: 30px;
}
```


* [DatePicker](#module_DatePicker)
  * [DatePicker](#exp_module_DatePicker--DatePicker) ⇐ <code>View</code> ⏏
    * [new DatePicker(options)](#new_module_DatePicker--DatePicker_new)
    * [.setOptions(options)](#module_DatePicker--DatePicker+setOptions) ⇒ <code>DatePicker</code>
    * [.setComponents(components)](#module_DatePicker--DatePicker+setComponents) ⇒ <code>DatePicker</code>
    * [.getComponents()](#module_DatePicker--DatePicker+getComponents) ⇒ <code>Array</code>
    * [.setDate(date)](#module_DatePicker--DatePicker+setDate) ⇒ <code>DatePicker</code>
    * [.getDate()](#module_DatePicker--DatePicker+getDate) ⇒ <code>Date</code>

<a name="exp_module_DatePicker--DatePicker"></a>
### DatePicker ⇐ <code>View</code> ⏏
**Kind**: Exported class  
**Extends:** <code>View</code>  
<a name="new_module_DatePicker--DatePicker_new"></a>
#### new DatePicker(options)

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options. |
| [options.perspective] | <code>Number</code> | Perspective to use when rendering the wheel. |
| [options.wheelLayout] | <code>Object</code> | Layout-options that are passed to the WheelLayout. |
| [options.scrollController] | <code>Object</code> | Options that are passed to the underlying ScrollControllers. |
| [options.container] | <code>Object</code> | Container-options that are passed to the underlying ContainerSurface. |
| [options.classes] | <code>Array.String</code> | Css-classes that are added to the surfaces that are created. |
| [options.createRenderables] | <code>Object</code> | Options that specify which renderables should be created. |

<a name="module_DatePicker--DatePicker+setOptions"></a>
#### datePicker.setOptions(options) ⇒ <code>DatePicker</code>
Patches the DatePicker instance's options with the passed-in ones.

**Kind**: instance method of <code>[DatePicker](#exp_module_DatePicker--DatePicker)</code>  
**Returns**: <code>DatePicker</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Configurable options (see ScrollController for all inherited options). |
| [options.perspective] | <code>Number</code> | Perspective to use when rendering the wheel. |
| [options.wheelLayout] | <code>Object</code> | Layout-options that are passed to the WheelLayout. |
| [options.scrollController] | <code>Object</code> | Options that are passed to the underlying ScrollControllers. |

<a name="module_DatePicker--DatePicker+setComponents"></a>
#### datePicker.setComponents(components) ⇒ <code>DatePicker</code>
Sets the components for the date-picker.

**Kind**: instance method of <code>[DatePicker](#exp_module_DatePicker--DatePicker)</code>  
**Returns**: <code>DatePicker</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| components | <code>Array</code> | Array of DatePicker.Component objects. |

<a name="module_DatePicker--DatePicker+getComponents"></a>
#### datePicker.getComponents() ⇒ <code>Array</code>
Get the components for the date-picker.

**Kind**: instance method of <code>[DatePicker](#exp_module_DatePicker--DatePicker)</code>  
**Returns**: <code>Array</code> - components  
<a name="module_DatePicker--DatePicker+setDate"></a>
#### datePicker.setDate(date) ⇒ <code>DatePicker</code>
Set the selected date.

**Kind**: instance method of <code>[DatePicker](#exp_module_DatePicker--DatePicker)</code>  
**Returns**: <code>DatePicker</code> - this  

| Param | Type | Description |
| --- | --- | --- |
| date | <code>Date</code> | Selected date/time. |

<a name="module_DatePicker--DatePicker+getDate"></a>
#### datePicker.getDate() ⇒ <code>Date</code>
Get the selected date.

**Kind**: instance method of <code>[DatePicker](#exp_module_DatePicker--DatePicker)</code>  
**Returns**: <code>Date</code> - selected date  
