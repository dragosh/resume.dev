define([
    'app',
    'backbone',
    'module/models'

],

function(app, Backbone, Models) {

    'use strict';

    var Views = {};
/*
|--------------------------------------------------------------------------
|
*/
    Views.Home = Backbone.Layout.extend({
        template: 'home'
    });
/*
|--------------------------------------------------------------------------
|
*/
    Views.Skills = Backbone.Layout.extend({
        template: 'skills'
    });
    Views.Education = Backbone.Layout.extend({
        template: 'education'
    });

    Views.Project = Backbone.Layout.extend({
        template: 'project',
        events: {
            'click .toggle-caption' : 'toggleCaption'
        },
        initialize: function() {
            this.on('afterRender',function() {
                var sliderOptions =  {
                    autoplay:0,
                    controls: false,
                    speed: 200,
                    ease:'easeInOutSine',
                    maxwidth: 805,
                    maxheight: 410,
                    onReady: function(totalItems,el){
                        //el.style.visibility = 'visible';
                        app.layout.projectsViews[this._index].slider = el;
                        app.layout.projectsViews[this._index].sliderPos = 0;
                        app.layout.projectsViews[this._index].totalItems = totalItems;
                        app.eventBus.trigger('slider:ready', totalItems,0);
                        var carouselOptions = {
                                itemWidth:          70,
                                itemHeight:         64,
                                minWidth:           300,
                            onReady: function(el) {
                                //el.style.visibility = 'visible';
                                app.layout.projectsViews[this._index].carousel = el;
                            }.bind(this),
                            onSelected: function(index){
                                $(el).rslider('slide',index);
                            }.bind(this)
                        };

                        this.$el.find('.carousel').rcarousel(carouselOptions);
                    }.bind(this),

                    onStart: function(pos) {
                        app.layout.projectsViews[this._index].sliderPos = pos;
                        app.eventBus.trigger('slider:start', app.layout.projectsViews[this._index].totalItems, pos);

                    }.bind(this)
                };
                this.$el.find('.rs-slider').rslider(sliderOptions);
                this.$el.find('.caption').delay(2800).slideDown();
            },this);
        },
        serialize: function() {
            return {
                project: this.model.toJSON()
            };
        },
        toggleCaption: function(ev) {
            ev.preventDefault();
            var $caption = this.$el.find('.caption');
            if($caption.hasClass('collapsed')){
                $caption.find('.details').show();
                $caption.animate({height: '275'}, 200, function(){
                    $caption.removeClass('collapsed');
                    $(ev.currentTarget).attr('rel', 'down');
                });
            }else {
                $caption.find('.details').hide();
                $caption.animate({height: '75'}, 200, function(){
                    $caption.addClass('collapsed');
                    $(ev.currentTarget).attr('rel', 'up');
                });
            }
        }
    });

    Views.ProjectsControls = Backbone.Layout.extend({

        template: '#controls-template',
        events: {
            'click .up:not(".disabled")': function(ev) {
                $('#timemachine').timeMachine('leap','up');
                ev.preventDefault();
            },
            'click .down:not(".disabled")': function(ev) {
                $('#timemachine').timeMachine('leap','down');
                ev.preventDefault();
            },
            'click .left:not(".disabled")': function(ev) {
                $(app.layout.currentProjectView.slider).rslider('slide','prev');
                $(app.layout.currentProjectView.carousel).rcarousel('select','prev');
                ev.preventDefault();

            },
            'click .right:not(".disabled")': function(ev) {
                $(app.layout.currentProjectView.slider).rslider('slide','next');
                $(app.layout.currentProjectView.carousel).rcarousel('select','next');
                ev.preventDefault();
            }
        },
        clean: function(){
            alert('clean');
        }

    });
    Views.Projects = Backbone.Layout.extend({
        template: 'projects',
        id:'timemachine',

        events: {

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
            this.controlsView = new Views.ProjectsControls();

            this.$controls = this.controlsView.render().view.$el;
            this.$controls.appendTo('body');
        },

        checkTMArrows: function(pos) {
            var total = this.collection.length;
            this.$controls.find('.down').removeClass('disabled');
            if(pos === total-1 ) {
                this.$controls.find('.down').addClass('disabled');
            }

            if(pos <= total-1 ) {
                this.$controls.find('.up').removeClass('disabled');
            }
            //down
            if(pos <= 0) {
                this.$controls.find('.up').addClass('disabled');
            }

        },
        checkSliderArrows: function(total,pos) {

            //right
            if(total - 1 > pos) {
                this.$controls.find('.right').removeClass('disabled');
            } else {
                this.$controls.find('.right').addClass('disabled');
            }
            //left
            if(pos > 0) {
                this.$controls.find('.left').removeClass('disabled');
            }else{
                this.$controls.find('.left').addClass('disabled');
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
