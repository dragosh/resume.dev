define([
    'app',
    'module/models',
    'module/views'
],
function(app, Models, Views) {

    'use strict';

    var Router = Backbone.Router.extend({

        routes: {
            ''         : 'index',
            'projects' : 'projects',
            'skills'   : 'skills',
            'education': 'education',
            'contact'  : 'contact',
            '*other'   : 'index' // 404 page
        },

        initialize: function() {

            var layoutOptions = {
                //keep: true,
                template: 'layouts/default',
                el      : app.dom.main
            };
            app.layout = app.useLayout(layoutOptions);
            app.layout.projectsViews = [];
            // get the collection
            app.projects = new Models.Projects();
            app.projects.fetch();
            app.projects.once('sync',function(collection) {
                app.eventBus.trigger('app:addProject',Views,collection);
            },app);
            //clean up the controls
            this.on('route', function(route) {
                if(route !== 'projects' && ! _.isUndefined(app.controlsView)) {
                    app.controlsView.clean();
                }
            });

        },
        index: function() {
            app.layout.setView(app.dom.page, new Views.Home());
            app.layout.render();
        },
        projects: function() {
            app.layout.setView(app.dom.page, new Views.Projects({collection: app.projects}));
            app.layout.render();
        },

        skills: function() {
            app.layout.setView(app.dom.page, new Views.Skills());
            app.layout.render();
        },
        education: function() {
            app.layout.setView(app.dom.page, new Views.Education());
            app.layout.render();
        },
        contact: function() {
            app.layout.setView(app.dom.page, new Views.Contact());
            app.layout.render();
        },
        error404: function() {
            app.layout.setView(app.dom.page, new Views.Error404());
            app.layout.render();
        }

    });

    return Router;

});
