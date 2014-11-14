<a name="module_GridLayout"></a>
#GridLayout
Lays-out renderables from left to right, in a grid with fixed number of
columns and rows.

|options|type|description|
|---|---|---|
|`cells`|Size|Number of cells: [columns, rows]|
|`[margins]`|Array|Margins applied to the outside (e.g. [10, 20, 10, 20])|
|`[gutter]`|Size|Gutter-space between renderables. (e.g. [10, 10]|

Example:

```javascript
var GridLayout = require('famous-flex/layouts/GridLayout');

new LayoutController({
  layout: GridLayout,
  layoutOptions: {
    cells: [10, 5],            // 10 columns, 5 rows
    margins: [20, 20, 20, 20], // margins on the outside
    gutter: [20, 20]           // gutter between cells
  },
  dataSource: [
    new Surface({content: 'item 1'}),
    new Surface({content: 'item 2'}),
    new Surface({content: 'item 3'})
  ]
})
```

