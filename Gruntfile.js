module.exports = function(grunt) {
  require('time-grunt')(grunt);
  
  var pkg = grunt.file.readJSON('package.json');

  var typescriptDependencies = [];
  if(pkg.tscDependencies){
    typescriptDependencies = pkg.tscDependencies.map(function(dep){
      return 'node_modules/'+dep+'/dist/*.d.ts';
    });
  }
  
  // Project configuration.
  grunt.initConfig({
    pkg: pkg,
    typescript: {
      client: {
        src: ['src/dropdown.ts'].concat(typescriptDependencies),
        dest: './build/',
        options: {
          module: 'amd', //or commonjs
          target: 'es3', //or es5
          sourcemap: true,
          fullSourceMapPath: true,
          declaration: true,
        }
      },
      /*
      server: {
        src: ['gnd-server.ts'],
        dest: 'dist/gnd-server.js',
        options: {
          module: 'amd', //or commonjs
          target: 'es3', //or es5
          //base_path: 'path/to/typescript/files',
          sourcemap: true,
          fullSourceMapPath: true,
          declaration: true,
        }
      }*/
    },
    copy: {
      main: {
        cwd: 'build/src/',
        expand: true,
        src: '**',
        dest: 'build/',
        flatten: true,
        filter: 'isFile',
      }
    },
    clean: ['build/src'],
    uglify: {
      client: {
        files: {'build/dropdown.min.js': 'build/*.js'},
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
          compress: {
            warnings: false,
            unsafe: true,
          },
          mangle: true, 
          warnings: false
          // report: 'gzip',
        }
      }
    },
    compress: {
      main: {
        options: {
          mode: 'gzip',
          level: 9
        },
        expand: true,
        //cwd: 'assets/',
        src: 'build/*.min.js',
      }
    },

    // Constants for the Gruntfile so we can easily change the path for
    // our environments.
    BASE_PATH: './',
    DEVELOPMENT_PATH: './src',
    
    // The YUIDoc plugin to generate documentation for code files.
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          extension: '.ts', // Default '.js' <comma-separated list of file extensions>
          paths: '<%= DEVELOPMENT_PATH %>' + 'lib/',
          outdir: '<%= BASE_PATH %>' + 'docs/',
          themedir: "docstheme/gndtheme"
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task(s).
  grunt.registerTask('default', ['typescript', 'copy', 'uglify', 'compress', 'yuidoc', 'clean']);
};
