<a name="module_CollectionLayout"></a>
#CollectionLayout
Lays a collection of renderables from left to right or top to bottom, and when the right/bottom edge is reached,
continues at the next column/row.

|options|type|description|
|---|---|---|
|`itemSize`|Size|Size of an item to layout|
|`[gutter]`|Size|Gutter-space between renderables|
|`[justify]`|Bool/Array.Bool|Justify the renderables accross the width/height|

Example:

```javascript
var CollectionLayout = require('famous-flex/layouts/CollectionLayout');

new LayoutController({
  layout: CollectionLayout,
  layoutOptions: {
    itemSize: [100, 100],  // item has width and height of 100 pixels
    gutter: [5, 5],        // gutter of 5 pixels in between cells
    justify: true          // justify the items neatly across the whole width and height
  },
  dataSource: [
    new Surface({content: 'item 1'}),
    new Surface({content: 'item 2'}),
    new Surface({content: 'item 3'})
  ]
})
```

