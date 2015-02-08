<a name="module_CollectionLayout"></a>
##CollectionLayout
Lays a collection of renderables from left to right or top to bottom, and when the right/bottom edge is reached,
continues at the next column/row.

|options|type|description|
|---|---|---|
|`itemSize`|Size/Function|Size of an item to layout or callback function which should return the size, e.g.: `function(renderNode, contextSize)`|
|`[margins]`|Number/Array|Margins shorthand (e.g. 5, [10, 20], [2, 5, 2, 10])|
|`[spacing]`|Number/Array|Spacing between items (e.g. 5, [10, 10])|
|`[justify]`|Bool/Array.Bool|Justify the renderables accross the width/height|

Example:

```javascript
var FlexScrollView = require('famous-flex/FlexScrollView');
var CollectionLayout = require('famous-flex/layouts/CollectionLayout');

var scrollView = new FlexScrollView({
  layout: CollectionLayout,
  layoutOptions: {
    itemSize: [100, 100],    // item has width and height of 100 pixels
    margins: [10, 5, 10, 5], // outer margins
    spacing: [10, 10]        // spacing between items
  },
  dataSource: [
    new Surface({content: 'item 1'}),
    new Surface({content: 'item 2'}),
    new Surface({content: 'item 3'})
  ]
});
```

Notes:

* Recall that the **`direction`** option is given to `FlexScrollView` and not
the `ColllectionLayout`.  As such, it affects *scroll direction* and not
*layout direction*.  With direction `Y`, items are *laid out horizontally*,
but multiple rows *scroll vertically*, and this is the correct behaviour.