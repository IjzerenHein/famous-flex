/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    watch: {
      source: {
          spawn: false,
          debounceDelay: 1000,
          atBegin: true,
          files: ['src/**/*.js'],
          tasks: ['lint', 'build']
      }
    },
    eslint: {
      target: ['src/**/*.js'],
      options: {
        config: '.eslintrc'
      }
    },
    jscs: {
        src: ['src/**/*.js'],
        options: {
            config: '.jscsrc'
        }
    },
    csslint: {
      strict: {
        options: {
          import: 2
        },
        src: ['src/**/*.css']
      },
      lax: {
        options: {
          import: false
        },
        src: ['src/**/*.css']
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
            { src: 'src/AnimationController.js', dest: 'docs/AnimationController.md' },
            // widgets
            { src: 'src/widgets/DatePicker.js', dest: 'docs/widgets/DatePicker.md' },
            { src: 'src/widgets/TabBar.js', dest: 'docs/widgets/TabBar.md' },
            { src: 'src/widgets/TabBarController.js', dest: 'docs/widgets/TabBarController.md' },
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
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: '.',
          name: 'template.js',
          out: 'dist/famous-flex.js',
          paths: {
            'famous': 'empty:',
            'famous-flex': './src'
          },
          optimize: 'none'
        }
      }
    },
    browserify: {
      dist: {
        files: {
          './dist/famous-flex-global.js': ['./template-global.js']
        },
        options: {
          transform: ['browserify-shim']
        }
      }
    },
    uglify: {
      noglobal: {
        src: './dist/famous-flex.js',
        dest: './dist/famous-flex.min.js'
      },
      global: {
        src: './dist/famous-flex-global.js',
        dest: './dist/famous-flex-global.min.js'
      }
    },
    usebanner: {
      dist: {
        options: {
          position: 'top',
          banner:
            '/**\n' +
            '* This Source Code is licensed under the MIT license. If a copy of the\n' +
            '* MIT-license was not distributed with this file, You can obtain one at:\n' +
            '* http://opensource.org/licenses/mit-license.html.\n' +
            '*\n' +
            '* @author: Hein Rutjes (IjzerenHein)\n' +
            '* @license MIT\n' +
            '* @copyright Gloey Apps, 2014/2015\n' +
            '*\n' +
            '* @library famous-flex\n' +
            '* @version ' + grunt.file.readJSON('package.json').version + '\n' +
            '* @generated <%= grunt.template.today("dd-mm-yyyy") %>\n' +
            '*/'
        },
        files: {
          src: ['dist/*.js']
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-jsdoc-to-markdown');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-banner');

  // Tasks
  grunt.registerTask('lint', ['eslint', 'jscs', 'csslint']);
  grunt.registerTask('doc', ['jsdoc2md']);
  grunt.registerTask('dist', ['requirejs', 'browserify', 'uglify', 'usebanner']);
  grunt.registerTask('develop', ['watch:source']); // Develop: Watches source files. Trigger lint & build upon change.
  grunt.registerTask('default', ['lint', 'doc', 'dist']);
};
