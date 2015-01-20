<a name="module_DateWheel"></a>
#DateWheel
Date/time wheel (slot-machine layout) for famo.us.

This component can be used as a date/time picker, a clock or
any other application which requires a date/time wheel.

Example:

```javascript
var DateWheel = require('famous-flex/widgets/DateWheel');

var dateWheel = new DateWheel({
  date: new Date(),        // initial date
  wheelLayout: {
    itemSize: 100,         // height of an item on the date/wheel
    diameter: 300,         // diameter of the wheel (undefined = 3 x itemSize)
    radialOpacity: 0       // opacity at the top and bottom diameter edge
  },
  components: [
    new DateWheel.Component.FullDay(),  // full-day component (year + month + day)
    new DateWheel.Component.Hour(),     // hour component (0..23)
    new DateWheel.Component.Minute()    // minute compoent (0..59)
  ]
});
this.add(dateWheel); // add to the render-tree

dateWheel.on('datechange', function(event) {
  console.log('new date selected: ' + event.date.toLocaleString());
});
```

CSS:

```css
.famous-flex-datewheel .item > div {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  font-size: 40px;
}
```

<a name="exp_module_DateWheel"></a>
##class: DateWheel ⏏
**Extends**: `View`  
**Members**

* [class: DateWheel ⏏](#exp_module_DateWheel)
  * [new DateWheel(options)](#exp_new_module_DateWheel)
  * [dateWheel.setOptions(options)](#module_DateWheel#setOptions)
  * [dateWheel.setDate(date)](#module_DateWheel#setDate)
  * [dateWheel.getDate()](#module_DateWheel#getDate)

<a name="exp_new_module_DateWheel"></a>
###new DateWheel(options)
**Params**

- options `Object` - Configurable options.  
  - \[perspective\] `Number` - Perspective to use when rendering the wheel.  
  - \[components\] `Array` - Date/time components that are displayed.  
  - \[wheelLayout\] `Object` - Layout-options that are passed to the WheelLayout.  
  - \[scrollView\] `Object` - Options that are passed to the underlying ScrollControllers.  
  - \[container\] `Object` - Container-options that are passed to the underlying ContainerSurface.  

**Extends**: `View`  
<a name="module_DateWheel#setOptions"></a>
###dateWheel.setOptions(options)
Patches the DateWheel instance's options with the passed-in ones.

**Params**

- options `Object` - Configurable options (see ScrollController for all inherited options).  
  - \[perspective\] `Number` - Perspective to use when rendering the wheel.  
  - \[components\] `Array` - Date/time components that are displayed.  
  - \[wheelLayout\] `Object` - Layout-options that are passed to the WheelLayout.  
  - \[scrollView\] `Object` - Options that are passed to the underlying ScrollControllers.  

**Returns**: `DateWheel` - this  
<a name="module_DateWheel#setDate"></a>
###dateWheel.setDate(date)
Set the selected date.

**Params**

- date `Date` - Selected date/time.  

**Returns**: `DateWheel` - this  
<a name="module_DateWheel#getDate"></a>
###dateWheel.getDate()
Get the selected date.

**Returns**: `Date` - selected date  
