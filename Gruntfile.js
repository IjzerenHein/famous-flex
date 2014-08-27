/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    eslint: {
      target: ['src/*.js'],
      options: {
        config: '.eslintrc'
      }
    },
    jscs: {
        src: ['src/*.js'],
        options: {
            config: '.jscsrc'
        }
    },
    jsdoc2md: {
      separateOutputFilePerInput: {
        options: {
          index: true
        },
        files: [
            { src: 'src/LayoutNodesContext.js', dest: 'docs/LayoutNodesContext.md' },
            { src: 'src/LayoutController.js', dest: 'docs/LayoutController.md' },
            { src: 'src/FlowLayoutController.js', dest: 'docs/LayoutController.md' },
            { src: 'src/LayoutUtility.js', dest: 'docs/LayoutUtility.md' },
            { src: 'src/helpers/LayoutDockHelper.js', dest: 'docs/helpers/LayoutDockHelper.md' }
        ]
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-jsdoc-to-markdown');

  // Default task.
  grunt.registerTask('default', ['eslint', 'jscs', 'jsdoc2md']);
};
