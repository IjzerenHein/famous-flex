if (typeof famousflex === 'undefined') {
    famousflex = {};
}

famousflex.FlexScrollView = require('./src/FlexScrollView');
famousflex.FlowLayoutNode = require('./src/FlowLayoutNode');
famousflex.LayoutContext = require('./src/LayoutContext');
famousflex.LayoutController = require('./src/LayoutController');
famousflex.LayoutNode = require('./src/LayoutNode');
famousflex.LayoutNodeManager = require('./src/LayoutNodeManager');
famousflex.LayoutUtility = require('./src/LayoutUtility');
famousflex.ScrollController = require('./src/ScrollController');
famousflex.VirtualViewSequence = require('./src/VirtualViewSequence');
famousflex.AnimationController = require('./src/AnimationController');

famousflex.widgets = famousflex.widgets || {};
famousflex.widgets.DatePicker = require('./src/widgets/DatePicker');
famousflex.widgets.TabBar = require('./src/widgets/TabBar');
famousflex.widgets.TabBarController = require('./src/widgets/TabBarController');

famousflex.layouts = famousflex.layouts || {};
famousflex.layouts.CollectionLayout = require('./src/layouts/CollectionLayout');
famousflex.layouts.CoverLayout = require('./src/layouts/CoverLayout');
famousflex.layouts.CubeLayout = require('./src/layouts/CubeLayout');
famousflex.layouts.GridLayout = require('./src/layouts/GridLayout');
famousflex.layouts.HeaderFooterLayout = require('./src/layouts/HeaderFooterLayout');
famousflex.layouts.ListLayout = require('./src/layouts/ListLayout');
famousflex.layouts.NavBarLayout = require('./src/layouts/NavBarLayout');
famousflex.layouts.ProportionalLayout = require('./src/layouts/ProportionalLayout');
famousflex.layouts.WheelLayout = require('./src/layouts/WheelLayout');

famousflex.helpers = famousflex.helpers || {};
famousflex.helpers.LayoutDockHelper = require('./src/helpers/LayoutDockHelper');
