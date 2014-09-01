<a name="module_GridLayout"></a>
#GridLayout
Lays-out renderables from left to right, in a grid with fixed number of
columns and rows.

|options|type|description|
|---|---|---|
|`cells`|Size|Number of cells: [columns, rows]|
|`[direction]`|Number|Direction into which to layout: 0 = X, 1 = Y (default)|
|`[gutter]`|Size|Gutter-space between renderables|

Example:

```javascript
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

