if (typeof ijzerenhein === 'undefined') {
    ijzerenhein = {};
}
_.extend(ijzerenhein, {
    FlexScrollView: require('./src/FlexScrollView'),
    layouts: {
        CoverLayout: require('./src/layouts/CoverLayout')
    }
});
