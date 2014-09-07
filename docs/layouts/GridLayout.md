<a name="module_GridLayout"></a>
#GridLayout
Lays-out renderables from left to right, in a grid with fixed number of
columns and rows.

|options|type|description|
|---|---|---|
|`cells`|Size|Number of cells: [columns, rows]|
|`[gutter]`|Size|Gutter-space between renderables|

Example:

```javascript
var GridLayout = require('famous-flex/layouts/GridLayout');

new LayoutController({
  layout: GridLayout,
  layoutOptions: {
    cells: [10, 5],    // 10 columns, 5 rows
    gutter: [20, 20],  // gutter of 20 pixels in between cells
  },
  dataSource: [
    new Surface({content: 'item 1'}),
    new Surface({content: 'item 2'}),
    new Surface({content: 'item 3'})
  ]
})
```

