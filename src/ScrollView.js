// Deprecated, require FlexScrollView instead
/*global define, console*/
/*eslint no-console:0 */
define(function(require, exports, module) {
    if (console.warn) {
        console.warn('file famous-flex/ScrollView has been deprecated, use famous-flex/FlexScrollView instead');
    }
    module.exports = require('./FlexScrollView');
});
