/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    eslint: {
      target: ['animation/**/*.js', 'controls/**/*.js', 'core/**/*.js', 'engine/**/*.js', 'gestures/**/*.js', 'layouts/**/*.js', 'theme/**/*.js', 'utils/**/*.js', 'views/**/*.js'],
      options: {
        config: '.eslintrc',
      }
    },
    jscs: {
      target: ['animation/**/*.js', 'controls/**/*.js', 'core/**/*.js', 'engine/**/*.js', 'gestures/**/*.js', 'layouts/**/*.js', 'theme/**/*.js', 'utils/**/*.js', 'views/**/*.js'],
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
