define([
    'app',
    'backbone',
    'module/models'

],

function(app, Backbone, Models) {

    'use strict';

    var Views = {};

    Views.Home = Backbone.Layout.extend({
        template: 'home'
    });

    Views.Project = Backbone.Layout.extend({
        template: 'project',
        initialize: function() {
            this.on('afterRender',function() {
                var sliderOptions =  {
                    autoplay:0,
                    controls: false,
                    maxwidth: 805,
                    maxheight: 410,
                    onReady: function(totalItems,el){
                        app.layout.projectsViews[this._index].slider = el;
                        app.layout.projectsViews[this._index].sliderPos = 0;
                        app.layout.projectsViews[this._index].totalItems = totalItems;
                        app.eventBus.trigger('slider:ready', totalItems,0);
                    }.bind(this),
                    onStart: function(pos){
                        app.layout.projectsViews[this._index].sliderPos = pos;
                        app.eventBus.trigger('slider:start', app.layout.projectsViews[this._index].totalItems, pos);

                    }.bind(this)
                };

                this.$el.find('.rs-slider').rslider(sliderOptions);
            },this);
        },
        serialize: function() {
            return {
                project: this.model.toJSON()
            };
        },
    });

    Views.Projects = Backbone.Layout.extend({
        template: 'projects',
        id:'timemachine',

        events: {
            'click .up:not(".disabled")': function(ev) {
                this.$el.timeMachine('leap','up');
                ev.preventDefault();
            },
            'click .down:not(".disabled")': function(ev) {
                this.$el.timeMachine('leap','down');
                ev.preventDefault();
            },
            'click .left:not(".disabled")': function(ev) {
                $(app.layout.currentProjectView.slider).rslider('slide','prev');
                ev.preventDefault();

            },
            'click .right:not(".disabled")': function(ev) {
                $(app.layout.currentProjectView.slider).rslider('slide','next');
                ev.preventDefault();
            }
        },
        serialize: function() {
            return {
                projects: this.collection.toJSON()
            };
        },
        initialize: function() {
            this.once('afterRender',this.initTimeMachine,this);
            //Slider Ready
            app.eventBus.on('slider:ready', this.checkSliderArrows,this);
            //Slider moved
            app.eventBus.on('slider:start', this.checkSliderArrows,this);
            //Timemachine moved
            app.eventBus.on('timemachine:moved', this.checkTMArrows,this);
        },

        checkTMArrows: function(pos) {
            var total = this.collection.length;

            //up
            if(total -1 <= pos) {
                this.$el.find('.up').removeClass('disabled');
                this.$el.find('.down').addClass('disabled');
            } else {
                //this.$el.find('.up').addClass('disabled');
                this.$el.find('.down').removeClass('disabled');
            }
            //down
            if(pos <= 0) {
                this.$el.find('.up').addClass('disabled');
            }

        },
        checkSliderArrows: function(total,pos) {

            //right
            if(total - 1 > pos) {
                this.$el.find('.right').removeClass('disabled');
            } else {
                this.$el.find('.right').addClass('disabled');
            }
            //left
            if(pos > 0) {
                this.$el.find('.left').removeClass('disabled');
            }else{
                this.$el.find('.left').addClass('disabled');
            }

        },


        initTimeMachine: function() {

            var tmOptions = {
                onReady: function(i,$el) {

                    app.layout.currentProjectView = app.layout.projectsViews[i];
                    this.renderProject(i,$el);
                }.bind(this),
                onShow: function(i,$el) {
                    app.layout.currentProjectView = app.layout.projectsViews[i];
                    var self = this;
                    if( _.isUndefined(app.layout.projectsViews[i].rendered) ) {
                        self.renderProject(i,$el);
                    }else{
                        app.eventBus.trigger('timemachine:moved',i);
                        app.eventBus.trigger('slider:ready', app.layout.currentProjectView.totalItems,app.layout.currentProjectView.sliderPos);
                    }
                }.bind(this)
            };

            this.$el.timeMachine(tmOptions);
        },
        renderProject: function(i,$el) {

            app.layout.currentProjectView.render().then(function(view) {
                view.$el.appendTo($el);
                app.layout.currentProjectView.rendered = true;
                app.layout.currentProjectView._index = i;
                app.eventBus.trigger('timemachine:moved',i);
            });
        }

    });

    Views.Contact = Backbone.Layout.extend({
        template: 'contact'
    });

    Views.Error404 = Backbone.Layout.extend({
        template: 'error_404'
    });

    return Views;

});
