<a name="module_WheelLayout"></a>
## WheelLayout
Lays out renderables in a spinner wheel (slot-machine wheel) formation.

|options|type|description|
|---|---|---|
|`itemSize`|Size|Size (width or height) of an item to layout.|
|`[diameter]`|Number|Diameter of the wheel in pixels (default: `3 x itemSize`).|
|`[radialOpacity]`|Number|Opacity (0..1) at the diameter edges of the wheel (default: 1).|

Example:

```javascript
var ContainerSurface = require('famous/surfaces/ContainerSurface');
var ScrollController = require('famous-flex/ScrollController');
var WheelLayout = require('famous-flex/layouts/WheelLayout');

// Create scroll-wheel
var scrollWheel = new ScrollController({
  layout: WheelLayout,
  layoutOptions: {
    itemSize: 100,      // item has height of 100 pixels
    radialOpacity: 0.5  // make items at the edges more transparent
  },
  dataSource: [
    new Surface({content: 'item 1'}),
    new Surface({content: 'item 2'}),
    new Surface({content: 'item 3'})
  ]
});

// Create a container-surface for clipping and give it a nice perspective
var container = new ContainerSurface({
  properties: {
    overflow: 'hidden'
  }
});
container.context.setPerspective(1500);
container.add(scrollWheel);
```

