<a name="module_ListLayout"></a>
## ListLayout
Lays out items and optionally sticky sections from top to bottom or left to right.

|options|type|description|
|---|---|---|
|`[itemSize]`|Number/Function|Height or width in pixels of an item (used when renderNode has no size)|
|`[margins]`|Number/Array|Margins shorthand (e.g. 5, [10, 20], [2, 5, 2, 10])|
|`[spacing]`|Number|Spacing between items|
|`[isSectionCallback]`|Function|Callback that is called in order to check if a render-node is a section rather than a cell.|

Example:

```javascript
var FlexScrollView = require('famous-flex/FlexScrollView');
var ListLayout = require('famous-flex/layouts/ListLayout');

var scrollView = new FlexScrollView({
  layout: ListLayout,
  layoutOptions: {
    margins: [20, 10, 20, 10],
    spacing: 1,
    isSectionCallback: function(renderNode) {
      return renderNode.isSection;
    },
  },
  dataSource: [
    // first section
    _createSection(),
    _createCell(),
    _createCell(),
    // second section
    _createSection(),
    _createCell(),
  ]
});
this.add(scrollView);

function _createCell() {
  return new Surface({
    size: [undefined, 50],
    content: 'my cell'
  });
}

function _createSection() {
  var section = new Surface({
    size: [undefined, 30],
    content: 'my sticky section'
  });
  section.isSection = true; // mark renderNode as section
  return section;
}
```

