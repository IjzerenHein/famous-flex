<a name="module_DatePicker"></a>
#DatePicker
Date/time picker (slot-machine/wheel layout) for famo.us.

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
  },
  components: [
    new DatePicker.Component.FullDay(),  // full-day component (year + month + day)
    new DatePicker.Component.Hour(),     // hour component (0..23)
    new DatePicker.Component.Minute()    // minute compoent (0..59)
  ]
});
this.add(datePicker); // add to the render-tree

datePicker.on('datechange', function(event) {
  console.log('new date selected: ' + event.date.toLocaleString());
});
```

CSS:

```css
.famous-flex-datepicker .item > div {
  text-align: center;
  font-size: 40px;
  line-height: 60px; // this should equal the WheelLayout itemSize
}
```

<a name="exp_module_DatePicker"></a>
##class: DatePicker ⏏
**Extends**: `View`  
**Members**

* [class: DatePicker ⏏](#exp_module_DatePicker)
  * [new DatePicker(options)](#exp_new_module_DatePicker)
  * [datePicker.setOptions(options)](#module_DatePicker#setOptions)
  * [datePicker.setDate(date)](#module_DatePicker#setDate)
  * [datePicker.getDate()](#module_DatePicker#getDate)

<a name="exp_new_module_DatePicker"></a>
###new DatePicker(options)
**Params**

- options `Object` - Configurable options.  
  - \[perspective\] `Number` - Perspective to use when rendering the wheel.  
  - \[components\] `Array` - Date/time components that are displayed.  
  - \[wheelLayout\] `Object` - Layout-options that are passed to the WheelLayout.  
  - \[overlay\] `Object` - Overlay renderables (`top`, `middle` & `bottom`).  
  - \[scrollController\] `Object` - Options that are passed to the underlying ScrollControllers.  
  - \[container\] `Object` - Container-options that are passed to the underlying ContainerSurface.  

**Extends**: `View`  
<a name="module_DatePicker#setOptions"></a>
###datePicker.setOptions(options)
Patches the DatePicker instance's options with the passed-in ones.

**Params**

- options `Object` - Configurable options (see ScrollController for all inherited options).  
  - \[perspective\] `Number` - Perspective to use when rendering the wheel.  
  - \[components\] `Array` - Date/time components that are displayed.  
  - \[overlay\] `Object` - Overlay renderables (`top`, `middle` & `bottom`).  
  - \[wheelLayout\] `Object` - Layout-options that are passed to the WheelLayout.  
  - \[scrollController\] `Object` - Options that are passed to the underlying ScrollControllers.  

**Returns**: `DatePicker` - this  
<a name="module_DatePicker#setDate"></a>
###datePicker.setDate(date)
Set the selected date.

**Params**

- date `Date` - Selected date/time.  

**Returns**: `DatePicker` - this  
<a name="module_DatePicker#getDate"></a>
###datePicker.getDate()
Get the selected date.

**Returns**: `Date` - selected date  
