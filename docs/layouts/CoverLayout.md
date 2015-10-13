<a name="module_CoverLayout"></a>
## CoverLayout
Lays out renderables in scrollable coverflow.

|options|type|description|
|---|---|---|
|`itemSize`|Size|Size of an item to layout|
|`zOffset`|Size|Z-space offset for all the renderables except the current 'selected' renderable|
|`itemAngle`|Angle|Angle of the renderables, in radians|
|`[radialOpacity]`|Number|Opacity (0..1) at the edges of the layout (default: 1).|
Example:

```javascript
var CoverLayout = require('famous-flex/layouts/CoverLayout');

new LayoutController({
  layout: CoverLayout,
  layoutOptions: {
       itemSize: 400,
       zOffset: 400,      // z-space offset for all the renderables except the current 'selected' renderable
       itemAngle: 0.78,   // Angle of the renderables, in radians
       radialOpacity: 1   // make items at the edges more transparent
  },
  dataSource: [
    new Surface({content: 'item 1'}),
    new Surface({content: 'item 2'}),
    new Surface({content: 'item 3'})
  ]
})
```

