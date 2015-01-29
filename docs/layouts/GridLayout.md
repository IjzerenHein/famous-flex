<a name="module_GridLayout"></a>
##GridLayout
Lays-out renderables from left to right, in a grid with fixed number of
columns and rows.

|options|type|description|
|---|---|---|
|`cells`|Size|Number of cells: [columns, rows]|
|`[margins]`|Number/Array|Margins shorthand (e.g. 5, [10, 20], [2, 5, 2, 10])|
|`[spacing]`|Size|Spacing between renderables. (e.g. [10, 10]|

Example:

```javascript
var GridLayout = require('famous-flex/layouts/GridLayout');

var layoutController = new LayoutController({
  layout: GridLayout,
  layoutOptions: {
    cells: [10, 5],            // 10 columns, 5 rows
    margins: [20, 20, 20, 20], // margins on the outside
    spacing: [10, 10]          // spacing between cells
  },
  dataSource: [
    new Surface({content: 'item 1'}),
    new Surface({content: 'item 2'}),
    new Surface({content: 'item 3'})
  ]
});
```

