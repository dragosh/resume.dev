define([
    'app',
    'module/models',
    'module/views'
],
function(app, Models, Views) {

    'use strict';

    var Router = Backbone.Router.extend({

        routes: {
            ''          : 'index',
            'projects'  : 'projects',
            'experience': 'experience',
            'skills'    : 'skills',
            'education' : 'education',
            'contact'   : 'contact',
            '*other'    : 'index' // 404 page
        },

        initialize: function() {

            var layoutOptions = {
                template: 'layouts/default',
                el      : app.dom.main,
                beforeRender: function(){
                    app.eventBus.trigger('layout:beforeRender');
                },
                afterRender: function(){
                    app.eventBus.trigger('layout:afterRender');
                }
            };
            app.layout = app.useLayout(layoutOptions);
            app.layout.projectsViews = [];
            // get the collection
            app.projects = new Models.Projects();
            app.projects.fetch();
            app.projects.once('sync',function(collection) {
                app.eventBus.trigger('app:addProject',Views,collection);
            },app);

            this.on('route', function(route) {
                if(route === 'index'){
                    $(app.dom.nav).find('li').removeClass('active').first().addClass('active');
                } else {
                    //activate the curent menu item
                    $(app.dom.nav).find('a[href="'+ route +'"]').parent().siblings()
                        .removeClass('active').end()
                        .addClass('active');
                }

                // clean the controls
                if(route !== 'projects' && ! _.isUndefined(app.controlsView)) {
                    app.layout.currentProjectView.clean();
                    app.controlsView.clean();
                    app.timeLineView.clean();
                }
            });

        },
        index: function() {
            app.layout.setView(app.dom.page, new Views.Home());
            app.layout.render();
        },

        projects: function() {
            app.layout.setView(app.dom.page, new Views.Projects({collection: app.projects}));

            setTimeout(function(){
                app.layout.render();
            },100);
        },

        experience: function() {
            app.layout.setView(app.dom.page, new Views.Experience());
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
