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
		min: {
			production: {
				src: ['<%= config.app %>/scripts/components/requirejs/require.js','<%= config.app %>/scripts/script.min.js'],
				dest: '<%= config.app %>/scripts/script.min.js'
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
					wrap: false
				}
			}
		}
	});

	//Default task
	grunt.registerTask('build', 'requirejs min:production');
	grunt.registerTask('default', 'jshint');

};
