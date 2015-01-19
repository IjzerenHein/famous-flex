DateWheel
==========

DateWheel is a date/time (picker) wheel based on the famous-flex LayoutController technology. It combines one or more
ScrollControllers using the WheelLayout layout to form a single date/time picker control.

![Margins & Spacing](DateWheel/datewheel.gif)

# Index

- [Getting started](#getting-started)
- [API reference](../docs/widgets/DateView.md)
- [Getting and setting the selected date](#getting-and-setting-the-selected-date)
- [Events](#events)
- [Customizing the appearance](#customizing-the-appearance)
    - [CSS classes](#css-classes)
    - [Internationalisation & custom formatting](#internationalisation--custom-formatting)
- [Components](#components)
    - [Customizing components](#customizing-components)
- [Advanced topics](#advanced-topics)
    - [Using custom renderables](#using-custom-renderables)

# Getting started

To use the DateWheel in your project, install famous-flex using npm or bower:

    npm install famous-flex

    bower install famous-flex

To create the DateWheel use:

```javascript
var DateWheel = require('famous-flex/widgets/DateWheel');

var dateWheel = new DateWheel({
  date: new Date(),        // initial date
  wheelOptions: {
    itemSize: 100,         // height of an item on the date/wheel
    diameter: 300,         // diameter of the wheel (undefined = 3 x itemSize)
  },
  components: [
    new DateWheel.Component.FullDay(),  // full-day component (year + month + day)
    new DateWheel.Component.Hour(),     // hour component (0..23)
    new DateWheel.Component.Minute()    // minute compoent (0..59)
  ]
});
this.add(dateWheel); // add to the render-tree
```

Specify your preferred style for an item in the CSS-file:

```css
.famous-flex-datewheel .item > div {
    text-align: center;
    font-size: 40px;
    /* align inner div vertically */
    position: relative;
    top: 50%;
    transform: translateY(-50%);
}
```

# Getting and setting the selected date

To get and set the date, use `getDate` and `setDate`:

```javascript
// To set the initial date, specify it in the constructor
dateWheel = new DateWheel({
    date: new Date(), // specify initial date
    ...
});

// Get and set the date
dateWheel.setDate(new Date());
var date = dateWheel.getDate();
```

# Events

When the date-wheels are scrolled or `setDate` is called, the following
events are emitted:

|event        |description|
|-------------|-----------|
|`scrollstart`|Emitted when scrolling starts.|
|`datechange` |Emitted immediately whenever the selected date changes.|
|`scrollend`  |Emitted after scrolling stops (after all the scroll particle have settled).|

To capture the newly selected date/time, use either `datechange` or
`scrollend`:

```javascript
// The `datechange` event is emitted immediately after the date
// has been changed.
dateWheel.on('datechange', function(event) {
    console.log('date-changed to: ' + event.date.toString());
});

// The `scrollend` event is emitted after all scroll-wheel
// components have come to a halt.
dateWheel.on('scrollend', function(event) {
    console.log('scrolling has ended: ' + event.date.toString());
});

```

# Customizing the appearance

The options for the DateWheel can be specified in the constructor
or using `setOptions`:

```javascript
var dateWheel = new DateWheel({
    perspective: 2000,     // perspective used for the wheel layout
    wheelOptions: {        // layout-options that are passed to the `WheelLayout`
        itemSize: 50,      // height of single item on the date-wheel
        diameter: 200,     // diameter of the wheel in pixels
        radialOpacity: 0.5 // opacity at the top & bottom edges of the wheels
    },
    components: [
        // use `sizeRatio' to define the width of each component
        new DateWheel.Component.Hour({sizeRatio: 5}),   // 50% width
        new DateWheel.Component.Minute({sizeRatio: 2}), // 20% width
        new DateWheel.Component.Second({sizeRatio: 3}), // 30% width
    ]
});
```

## CSS classes

At the topmost level, the DateWheel consists of a ContainerSurface using
the class `famous-flex-datewheel`. This class can be modified, by specifying
the `container` option in the constructor:

```javascript
var dateWheel = new DateWheel({
    container: {
        classes: ['famous-flex-datewheel'] // specify your custom class(es) here
    }
});
```

Each item in the DateWheel is assigned the class `item` and a class which
corresponds to the component (e.g. `year`, `hour`, `weekday`, ...).
To for instance set the line-height and font-size for all components, use:

```css
.famous-flex-datewheel .item {
    text-align: center;
    font-size: 40px;
    line-height: 100px;
}
```

To customize a specific component, use its css-class:

```css
.famous-flex-datewheel .year {
    text-align: left;
}
```

## Internationalisation & custom formatting

By default the `Month` and `WeekDay` components are formatted in English.
If you want to format a component using a different locale, use the
formatting library of your choice. The following example uses [momentjs](http://momentjs.com) to format the month in the currently selected locale:

```javascript
var moment = require('moment/moment');

var dateWheel = new DateWheel({
    components: [
    new DateWheel.Component.Year(),
    new DateWheel.Component.Month({
        // uses momentjs to format the full month in the current locale
        format: function(date) {
            return moment(date).format('MMMM');
        }
    }),
    new DateWheel.Component.Day(),
    ]
});
```

# Components

DateWheel is shipped with various components out of the box.

|Component|CSS-class|Description|
|---|---|---|
|`DateWheel.Component.Year`|`.year`|4 digit year component.|
|`DateWheel.Component.Month`|`.month`|Month component (e.g. 'July').|
|`DateWheel.Component.FullDay`|`.fullday`|Full day component including year, month & day.|
|`DateWheel.Component.WeekDay`|`.weekday`|Day of the week (e.g. 'Monday').|
|`DateWheel.Component.Day`|`.day`|1 or 2 digit day of the month (e.g. 31).|
|`DateWheel.Component.Hour`|`.hour`|2 digit hour component.|
|`DateWheel.Component.Minute`|`.minute`|2 digit minute component.|
|`DateWheel.Component.Second`|`.second`|2 digit second component.|
|`DateWheel.Component.Millisecond`|`.millisecond`|3 digit millisecond component.|

## Customizing components

All components share a set of properties which can customized:

|Property|Type|Description|
|---|---|---|
|`sizeRatio`|`Number`|Width-ratio the component occupies in the date-wheel (the sum of all sizeRatio's equals a width of 100%).|
|`step`|`Number`|The value by which the component is incremented/decremented when scrolling up/down.|
|`max`|`Number`|The minimum value of the component (e.g. `59` for an Hour component).|
|`min`|`Number`|The maximum value of the component (e.g. `0`).|
|`loop`|`Bool`|When set to `true` causes the component to loop when min/max is reached (default: `true`).|
|`format`|`Function`|Function that formats the component into a string (see [Internationalisation & custom formatting](#internationalisation--custom-formatting)).|
|`create`|`Function`|Function that creates the renderable for an item (see [Using custom renderables](#using-custom-renderables)).|

Example:

```javascript
var dateWheel = new DateWheel({
    components: [
        new DateWheel.Component.FullDay({
            sizeRatio: 5,   // occupy 50% width
            format: function (date) {
                // format the date the way you want
                return date.toLocaleDateString();
            }
        }),
        new DateWheel.Component.Hour({
            sizeRatio: 2.5  // occupy 25% width
        }),
        new DateWheel.Component.Minute({
            step: 15,       // Select increments of 15 minutes
            sizeRatio: 2.5  // occupy 25% width
        })
    ]
});
```

# Advanced topics

## Using custom renderables

By default the date-picker creates a Surface with class `item` for each item in a component. Instead of using this Surface you can also create
your own surfaces or views. To do this, override the `create` method for each component:

```javascript
function createRenderable(date) {
    date = date || new Date();
    var surface = new Surface({
        classes: ['mydatepickeritem'],
        content: this.format(date)
    });
    surface.date = date;
    return surface;
}

var dateWheel = new DateWheel({
    components: [
        new DateWheel.Component.FullDay({
            create: createRenderable
        });
    ]
});
```
