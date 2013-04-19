/*
* GruntJs config
*
* Copyright © - Dragos Oancea-Zevri 2013
*/


module.exports = function(grunt) {

	'use strict';

	// configurable paths
	var spaConfig = {
		app: 'public_html'
		//dist: 'public_html/dist'
	};
	//Load Tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		config: spaConfig,
		pkg: grunt.file.readJSON('package.json'),
		watch: {
            compass: {
                files: ['<%= config.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['compass']
            }
        },
		//Tasks
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'<%= config.app %>/scripts/{,*/}*.js',
				'!<%= config.app %>/scripts/vendors/*',
				'!<%= config.app %>/scripts/components/*',
				'test/spec/{,*/}*.js'
			]
		},
		compass: {
			options: {
				basePath:'<%= config.app %>',
				sassDir: '<%= config.app %>/styles/scss',
				cssDir: '<%= config.app %>/styles/css',
				debugInfo: true
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %> */'
			},
			min: {
				files: {
					'<%= config.app %>/scripts/script.min.js': [
						'<%= config.app %>/scripts/components/requirejs/require.js',
						'<%= config.app %>/scripts/script.min.js'
					]
				}
			}
		},
		imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= config.app %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= config.app %>/styles/style.css': [
                        '<%= config.app %>/styles/{,*/}*.css'
                    ]
                }
            }
        },
		// This task uses James Burke's excellent r.js AMD build tool.  In the
		// future other builders may be contributed as drop-in alternatives.
		requirejs: {
			compile: {
				options: {
					// Include the main configuration file
					mainConfigFile: '<%= config.app %>/scripts/app/config.js',
					// Output file
					out:  '<%= config.app %>/scripts/script.min.js',
					// Root application module
					name: 'config',
					// Do not wrap everything in an IIFE
					wrap: false,

					preserveLicenseComments: false,

					useStrict: true,
					//uglify2: {}
				}
			}
		}
	});

	//Default task
	grunt.registerTask('build', ['cssmin','requirejs', 'uglify']);
	grunt.registerTask('default', 'jshint');

};
