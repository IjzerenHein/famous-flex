/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    eslint: {
      target: ['src/*.js', 'src/**/*.js'],
      options: {
        config: '.eslintrc'
      }
    },
    jscs: {
        src: ['src/*.js', 'src/**/*.js'],
        options: {
            config: '.jscsrc'
        }
    },
    csslint: {
      strict: {
        options: {
          import: 2
        },
        src: ['src/*.css', 'src/**/*.css']
      },
      lax: {
        options: {
          import: false
        },
        src: ['src/*.css', 'src/**/*.css']
      },
      options: {
        csslintrc: '.csslintrc'
      }
    },
    jsdoc2md: {
      separateOutputFilePerInput: {
        options: {
          index: true
        },
        files: [
            // core
            { src: 'src/LayoutContext.js', dest: 'docs/LayoutContext.md' },
            { src: 'src/LayoutController.js', dest: 'docs/LayoutController.md' },
            { src: 'src/ScrollController.js', dest: 'docs/ScrollController.md' },
            { src: 'src/FlexScrollView.js', dest: 'docs/FlexScrollView.md' },
            { src: 'src/LayoutUtility.js', dest: 'docs/LayoutUtility.md' },
            { src: 'src/VirtualViewSequence.js', dest: 'docs/VirtualViewSequence.md' },
            // widgets
            { src: 'src/widgets/DatePicker.js', dest: 'docs/widgets/DatePicker.md' },
            { src: 'src/widgets/TabBar.js', dest: 'docs/widgets/TabBar.md' },
            // helpers
            { src: 'src/helpers/LayoutDockHelper.js', dest: 'docs/helpers/LayoutDockHelper.md' },
            // layouts
            { src: 'src/layouts/CollectionLayout.js', dest: 'docs/layouts/CollectionLayout.md' },
            { src: 'src/layouts/GridLayout.js', dest: 'docs/layouts/GridLayout.md' },
            { src: 'src/layouts/ListLayout.js', dest: 'docs/layouts/ListLayout.md' },
            { src: 'src/layouts/HeaderFooterLayout.js', dest: 'docs/layouts/HeaderFooterLayout.md' },
            { src: 'src/layouts/NavBarLayout.js', dest: 'docs/layouts/NavBarLayout.md' },
            { src: 'src/layouts/WheelLayout.js', dest: 'docs/layouts/WheelLayout.md' },
            { src: 'src/layouts/ProportionalLayout.js', dest: 'docs/layouts/ProportionalLayout.md' },
            { src: 'src/layouts/TabBarLayout.js', dest: 'docs/layouts/TabBarLayout.md' }
        ]
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-jsdoc-to-markdown');

  // Default task.
  grunt.registerTask('default', ['eslint', 'jscs', 'csslint', 'jsdoc2md']);
};
