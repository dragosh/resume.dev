;(function ( $, window, document, undefined ) {

    'use strict';

    var prefix = (function () {
        var styles = window.getComputedStyle(document.documentElement, ''),
            pre = (Array.prototype.slice
                    .call(styles)
                    .join('')
                    .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
                )[1],
            dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
        return {
            dom: dom,
            lowercase: pre,
            css: '-' + pre + '-',
            js: pre[0].toUpperCase() + pre.substr(1)
        };
    })();

    var pluginName = 'timeMachine',
        /*
        |--------------------------------------------------------------------------
        | Options & callbacks
        */
        defaults = {
            namespace  : 'tm',
            maxDisplayed: 5,
            distance: 20,
            ySpace: 55,
            zSpace: 55,

            onReady    : function(){},

            onShow    : function(){}

        },
        methods = {
            /*
            |--------------------------------------------------------------------------
            | Public methods
            */
            init: function () {

                //set the perspective here TODO

                this._items = this.$el.children('.project');
                this._totalItems = this._items.length;
                this._currentIndex = this._totalItems - 1;
                var j = this._totalItems,
                    translateY = 0,
                    translateZ = 0;

                $.each(this._items, function(i,el) {
                    --j;
                    this._items[j].style[ prefix.css + 'transform'] = 'translate3d(0px, ' + translateY + 'px, ' + translateZ + 'px)';
                    $(this._items[j]).addClass('past');
                    $(this._items[j]).data('translateY', translateY);
                    $(this._items[j]).data('translateZ', translateZ);
                    el.style['z-index'] = i;
                    translateY -= this.options.ySpace;
                    translateZ -= this.options.zSpace;
                }.bind(this));

                var $item = this._items.eq(this._currentIndex,10);
                $item.addClass('current');
                this._call('ready',this._currentIndex,$item);
            },

            leap: function(where) {

                var pos = this._currentIndex;
                var  s = (~~(where === 'down')  || -1);

                pos += s;
                if(pos >= this._totalItems || pos < 0) { return; }

                this._currentIndex = ( pos < 0 ) ? this._totalItems - 1 :  (pos % this._totalItems);
                var pastItemIndex = this._currentIndex - 1;
                var futureItemIndex = this._currentIndex + 1;
                var $item = this._items.eq(this._currentIndex);

                $.each(this._items,function(i,el) {
                    this._transition(el, -this.options.ySpace*s, -this.options.zSpace*s);
                }.bind(this));
                $item.removeClass('future past').addClass('current');
                this._items.eq(futureItemIndex).removeClass('current past').addClass('future');

                this._items.eq(pastItemIndex).removeClass('current future').addClass('past');

                this._call('show',this._currentIndex,$item);
            },

            _transition: function(el,y,z) {


                var newY =  $(el).data('translateY') + y;
                var newZ =  $(el).data('translateZ') + z;

                el.style[ prefix.css + 'transform'] = 'translate3d(0px, ' + newY + 'px, ' + newZ + 'px)';

                $(el).data('translateY', newY)
                    .data('translateZ', newZ);


            },
            /*
            |--------------------------------------------------------------------------
            | Private methods
            */
            // Callback function definition
            _call: function(fn) {
                var clb = 'on'+fn.charAt(0).toUpperCase() + fn.slice(1); //append the on prefix for callback functions
                var args = Array.prototype.slice.call( arguments, 1 );
                if (typeof this.options[clb] === 'function') { // make sure the callback is a function
                    args.push(this.el,this);
                    this.options[clb].apply(this, args ); // brings the scope to the callback
                }
            }
        };


    function Plugin( el, options ) {
        this.el = el;
        this.$el = $(el);
        this.options = $.extend( {}, defaults, options) ;
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    //extend the methods
    Plugin.prototype = methods;

    $.fn[pluginName] = function ( options ) {
        var args = arguments;
        // Is the first parameter an object (options), or was omitted,
        // instantiate a new instance of the plugin.
        if (options === undefined || typeof options === 'object') {

            return this.each(function () {

                // Only allow the plugin to be instantiated once,
                // so we check that the element has no plugin instantiation yet
                if (!$.data(this, 'plugin_' + pluginName)) {

                    // if it has no instance, create a new one,
                    // pass options to our plugin constructor,
                    // and store the plugin instance
                    // in the elements jQuery data object.
                    $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
                }
            });

        // If the first parameter is a string and it doesn't start
        // with an underscore or "contains" the `init`-function,
        // treat this as a call to a public method.
        } else if ( typeof options === 'string' && options[0] !== '_' && options !== 'init') {

            // Cache the method call
            // to make it possible
            // to return a value
            var returns;

            this.each(function () {
                var instance = $.data(this, 'plugin_' + pluginName);
                // Tests that there's already a plugin-instance
                // and checks that the requested public method exists
                if (instance instanceof Plugin && typeof instance[options] === 'function') {

                    // Call the method of our plugin instance,
                    // and pass it the supplied arguments.
                    returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }
                // Allow instances to be destroyed via the 'destroy' method
                if (options === 'destroy') {
                    $.data(this, 'plugin_' + pluginName, null);
                }
            });

            // If the earlier cached method
            // gives a value back return the value,
            // otherwise return this to preserve chainability.
            return returns !== undefined ? returns : this;
        }
    };

})(jQuery, window, document);
