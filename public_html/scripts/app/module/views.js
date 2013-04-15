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
        template: 'home',
        className: 'innerPage'
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
        el:false,
        template: 'project',
        className:'browser-page',
        events: {
            'click .toggle-caption' : 'toggleCaption'
        },
        initialize: function() {
            if(app.player){
                app.player.addEvent('ready', function() {

                    console.log(this);
                    //player.addEvent('pause', onPause);
                    //player.addEvent('finish', onFinish);
                    //player.addEvent('playProgress', onPlayProgress);
                });
            }

            this.on('afterRender',function() {

                var sliderOptions =  {
                    autoplay:0,
                    controls: false,
                    speed: 200,
                    ease:'easeInOutSine',
                    maxwidth: 805,
                    maxheight: 410,
                    onReady: function(totalItems,el){
                        this.projectIndex = app.layout.currentProjectView._index;
                        //el.style.visibility = 'visible';
                        app.layout.projectsViews[this._index].slider = el;
                        app.layout.projectsViews[this._index].sliderPos = 0;
                        app.layout.projectsViews[this._index].totalItems = totalItems;

                        var carouselOptions = {
                                itemWidth:          70,
                                itemHeight:         64,
                                minWidth:           300,
                                onReady: function(el) {
                                    //el.style.visibility = 'visible';
                                    app.layout.projectsViews[this._index].carousel = el;
                                }.bind(this),
                                onSelected: function(pos){
                                    app.layout.projectsViews[this._index].sliderPos = pos;
                                    $(el).rslider('slide',pos);
                                    app.eventBus.trigger('tm:checkControls',this.projectIndex,pos, app.layout.projectsViews[this._index].totalItems);
                                }.bind(this)
                            };

                        this.$el.find('.carousel').rcarousel(carouselOptions);
                    }.bind(this),
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
        el: false,
        id:'#controlsWrapper',
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
            this.remove();
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
            //Check controls
            app.eventBus.on('tm:checkControls', this.checkControls,this);
            app.controlsView = new Views.ProjectsControls();

            this.$controls = app.controlsView.render().view.$el;
            this.$controls.appendTo('body');


        },
        checkControls: function(projectIndex,slideIndex,totalSlides){

            var totalProjects = this.collection.length;
            this.$controls.find('.down').removeClass('disabled');

            //up
            if(projectIndex <= totalProjects-1 ) {
                this.$controls.find('.up').removeClass('disabled');
            }
            if(projectIndex === totalProjects-1 ) {
                this.$controls.find('.down').addClass('disabled');
            }
            //down
            if(projectIndex <= 0) {
                this.$controls.find('.up').addClass('disabled');
            }

            //right
            if(totalSlides - 1 > slideIndex) {
                this.$controls.find('.right').removeClass('disabled');
            } else {
                this.$controls.find('.right').addClass('disabled');
            }
            //left
            if(slideIndex > 0) {
                this.$controls.find('.left').removeClass('disabled');
            }else{
                this.$controls.find('.left').addClass('disabled');
            }

            //Check Also for Video API
            var videoId = this.collection.at(projectIndex).get('media')[slideIndex].id;
            var $iframe = $('#vimeoplayer_' + videoId);

            if( ! _.isNull(app.player)) {
                if(app.player.status === 'playing') {
                    app.player.api('pause');
                }
            }
            if( ! _.isUndefined(videoId) && $iframe.length > 0){
                app.player = $f($iframe[0]);
                app.player.status = 'paused';

                app.player.addEvent('play', function(){
                    app.player.status = 'playing';
                });

            } else {
                //reset
                app.player = null;
            }

        },

        initTimeMachine: function() {

            var tmOptions = {
                onReady: function(projectIndex,$el) {

                    app.layout.currentProjectView = app.layout.projectsViews[projectIndex];
                    this.renderProject(projectIndex,$el);
                }.bind(this),
                onShow: function(projectIndex,$el) {
                    app.layout.currentProjectView = app.layout.projectsViews[projectIndex];
                    var self = this;
                    if( _.isUndefined(app.layout.projectsViews[projectIndex].rendered) ) {
                        //give it som time
                        self.renderProject(projectIndex,$el);


                    }else{

                        var sliderIndex = app.layout.currentProjectView.sliderPos;
                        var totalSlides = app.layout.currentProjectView.totalItems;
                        app.eventBus.trigger('tm:checkControls',projectIndex,sliderIndex,totalSlides);
                    }
                }.bind(this)
            };

            this.$el.timeMachine(tmOptions);
        },
        renderProject: function(projectIndex,$el) {

            app.layout.currentProjectView.render().then(function(view) {
                view.$el.appendTo($el);
                app.layout.currentProjectView.rendered = true;
                app.layout.currentProjectView._index = projectIndex;
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
