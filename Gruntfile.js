/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    eslint: {
      target: ['core/**/*.js', 'controls/**/*.js', 'animation/**/*.js', 'layouts/**/*.js', 'widgets/**/*.js', 'gestures/**/*.js', 'engine/**/*.js'],
      options: {
        config: '.eslintrc',
      }
    },
    jscs: {
      target: ['core/**/*.js', 'controls/**/*.js', 'animation/**/*.js', 'layouts/**/*.js', 'widgets/**/*.js', 'gestures/**/*.js', 'engine/**/*.js'],
      options: {
        config: '.jscsrc',
      }
    },
    csslint: {
      strict: {
        options: {
          import: 2,
        },
        src: ['src/**/*.css'],
      },
      lax: {
        options: {
          import: false,
        },
        src: ['src/**/*.css'],
      },
      options: {
        csslintrc: '.csslintrc',
      },
    },
    esdoc: {
      dist: {
        options: {
          source: './controls',
          destination: './docs',
          autoPrivate: true,
        },
      },
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-esdoc');

  // Tasks
  grunt.registerTask('lint', ['eslint', 'jscs', 'csslint']);
  grunt.registerTask('doc', ['esdoc']);
  grunt.registerTask('dist', []); // todo
  grunt.registerTask('default', ['lint', 'doc', 'dist']);
};
