/*!
 * MelonJS Game Engine
 * Copyright (C) 2011, Olivier BIOT
 * http://www.melonjs.org
 * 
 * melonJS is licensed under a Creative Commons 
 * Attribution-NonCommercial-NoDerivs 3.0 Unported License.
 * http://creativecommons.org/licenses/by-nc-nd/3.0/
 *
 * @author Olivier Biot 2011
 *
 */
(function($, undefined) 
{
	// Use the correct document accordingly to window argument
	var document = $.document;
	
	/**
	  * (<b>m</b>)elon (<b>e</b>)ngine : All melonJS functions are defined inside of this namespace.<p>
	  * You generally should not add new properties to this namespace as it may be overwritten in future versions. 
	  * @namespace
	  */
	me  = 
	{
      // settings & configuration
		// library name & version
		mod		:	"melonJS",
		nocache	:	'',
			
		// Public Object (To be completed)
		audio				: null,
		video				: null,
		timer				: null,
		input				: null,
		state				: null,
		game				: null,
		entityPool		: null,
		levelDirector  : null,
		// System Object (instances)
		XMLParser		: null,
		loadingScreen	: null,
		// TMX Stuff
		TMXTileMap		: null
			
	};
   
   /**
    * debug stuff.
    * @namespace
    */
	me.debug = 
   {
      /**
       * this flag is automatically set <br>
       * upon detection of a "framecounter" element <br>
       * in the HTML file holding the cancas.
       * @memberOf me.debug 
       */
		 displayFPS	 : false,
      /**
       * render object Rectangle & Collision Box<br>
       * default value : false
       * @type {Boolean}
       * @memberOf me.debug 
       */
		 renderHitBox : false
   };
               
   /**
    * global system settings and browser capabilities
    * @namespace
    */
   me.sys = 
   {
      // Browser capabilities
      /** 
       * Browser User Agent (read-only)
       * @type {Boolean}
       * @memberOf me.sys
       */
       ua : navigator.userAgent.toLowerCase(),
      /** 
       * Browser Audio capabilities (read-only) <br>
       * @type {Boolean}
       * @memberOf me.sys
       */
       sound : false,
      /** 
       * Browser Local Storage capabilities (read-only) <br>
       * @type {Boolean}
       * @memberOf me.sys
       */
       storage : false,
      /** 
       * Browser Gyroscopic Motion Event capabilities (read-only) <br>
       * @type {Boolean}
       * @memberOf me.sys
       */
       gyro		: ($.DeviceMotionEvent!==undefined),
                        
       // Global settings
      /** 
       * Game FPS (default 60)
       * @type {Int}
       * @memberOf me.sys
       */
       fps	:  60,

      /** 
       * enable/disable frame interpolation (default disable)<br>
       * @type {Boolean}
       * @memberOf me.sys
       */
       interpolation :  false,
    
      /** 
       * Global scaling factor(default 1.0)
       * @type {int}
       * @memberOf me.sys
       */
       scale :  1.0,
    
      /** 
       * Use native "requestAnimFrame" function if supported <br>
       * (!) not supported on all browsers
       * @type {Boolean}
       * @memberOf me.sys
       */
       useNativeAnimFrame :  false,
       
      /**
       * cache Image using a Canvas element, instead of directly using the Image Object<br>
       * using this, performances are lower on OSX desktop (others, including mobile untested)<br>
       * default value : false
       * @type {Boolean}
       * @memberOf me.sys 
       */
		 cacheImage : false,
       
      /** 
       * Enable dirtyRegion Feature <br>
       * default value : false
       * @type {Boolean}
       * @memberOf me.sys
       */
       dirtyRegion :  false,


   };
	   
   // add me to the global window variable
   $.me = me;
      
   // a flag to know if melonJS
	// is initialized
	var me_initialized = false;
	
	/*---
	 	
		DOM loading stuff
		
				---*/
	
	var readyBound  = false,	
		 isReady		 = false,
		 readyList	 = [];

	// Handle when the DOM is ready
	function domReady() 
	{
		// Make sure that the DOM is not already loaded
		if(!isReady)
		{
			// be sure document.body is there
			if(!document.body)
			{
				return setTimeout(domReady, 13);
			}
			
			// clean up loading event
			if (document.removeEventListener)
				document.removeEventListener("DOMContentLoaded", domReady, false);
			else
				$.removeEventListener( "load", domReady, false );
			
			// Remember that the DOM is ready
			isReady = true;
			
			// execute the defined callback
			for(var fn = 0; fn < readyList.length; fn++) 
			{
				readyList[fn].call($, []);
			}
			readyList = [];
		}
	};
	
	// bind ready
	function bindReady() 
	{
		if(readyBound) 
		{
		    return;
	   }
		readyBound = true;

		if (document.addEventListener)
		{
			// Use the handy event callback
			document.addEventListener("DOMContentLoaded", domReady, false);
		}
		// A fallback to window.onload, that will always work
		$.addEventListener( "load", domReady, false );
	};

	/**
	 * Specify a function to execute when the DOM is fully loaded
  	 * @param {Function} handler A function to execute after the DOM is ready.
    * @example
    * // small main skeleton
    * var jsApp	= 
    * {	
    *    // Initialize the jsApp
    *    // called by the window.onReady function
    *    onload: function()
    *    {
    *       // init video
    *       if (!me.video.init('jsapp', 640, 480))
    *       {
    *          alert("Sorry but your browser does not support html 5 canvas. ");
    *          return;
    *       }
	 *
    *       // initialize the "audio"
    *       me.audio.init("mp3,ogg");
    *
    *       // set callback for ressources loaded event
    *       me.loader.onload = this.loaded.bind(this);
	 *
    *       // set all ressources to be loaded
    *       me.loader.preload(g_ressources);
    *
    *       // load everything & display a loading screen
    *       me.state.change(me.state.LOADING);
	 *    },
    *
    *    // callback when everything is loaded
    *    loaded: function ()
	 *    {
    *       // define stuff
    *       // ....
    *       
    *       // change to the menu screen
	 *       me.state.change(me.state.MENU);
    *    }
    * }; // jsApp
    *
    * // "bootstrap"
    * window.onReady(function() 
    * {
    *    jsApp.onload();
    * });
	 */
	onReady = function(fn) 
	{
		// Attach the listeners
		bindReady();
    
		// If the DOM is already ready
		if (isReady) 
		{
			// Execute the function immediately
			fn.call($, []);
	    } 
		 else 
		 {
			// Add the function to the wait list
	        readyList.push( function() { return fn.call($, []); } );
	    }
		 return this;
	};
	
	// call the library init function when ready
	$.onReady(function(){ _init_ME(); });

	/************************************************************************************/
		
	/*---
	
	 	some "Javascript API" patch & enhancement
	
						---*/
	
		
	var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\bparent\b/ : /.*/;

		
	/**
    * JavaScript Inheritance Helper <br>
	 * Based on <a href="http://ejohn.org/">John Resig</a> Simple Inheritance<br>
	 * MIT Licensed.<br>
	 * Inspired by <a href="http://code.google.com/p/base2/">base2</a> and <a href="http://www.prototypejs.org/">Prototype</a><br>
	 * @param {Object} object Object (or Properties) to inherit from
    * @example
    * var Person = Object.extend(
    * {
    *    init: function(isDancing)
    *    {
    *       this.dancing = isDancing;
    *    },
    *    dance: function()
    *    {
    *       return this.dancing;
    *    }
    * });
    *  
    * var Ninja = Person.extend(
    * {
    *    init: function()
    *    {
    *       this.parent( false );
    *    },
    *    
    *    dance: function()
    *    {
    *       // Call the inherited version of dance()
    *       return this.parent();
    *    },
    *    
    *    swingSword: function()
    *    {
    *       return true;
    *    }
    * });
    *
    * var p = new Person(true);
    * p.dance(); // => true
    *
    * var n = new Ninja();
    * n.dance(); // => false
    * n.swingSword(); // => true
    *
    * // Should all be true
    * p instanceof Person && p instanceof Class &&
    * n instanceof Ninja && n instanceof Person && n instanceof Class
    */
   Object.extend = function(prop) 
	{
		// _super rename to parent to ease code reading
		var parent = this.prototype;
	 
		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var proto = new this();
		initializing = false;
	 
		// Copy the properties over onto the new prototype
		for (var name in prop) 
		{
			// Check if we're overwriting an existing function
			proto[name] = typeof prop[name] == "function" && 
			typeof parent[name] == "function" && fnTest.test(prop[name]) ?
			(function(name, fn)
			{
				return function()
				{
					var tmp = this.parent;
						
					// Add a new ._super() method that is the same method
					// but on the super-class
					this.parent = parent[name];
						
					// The method only need to be bound temporarily, so we
					// remove it when we're done executing
					var ret = fn.apply(this, arguments);        
					this.parent = tmp;
						
					return ret;
				};
			})(name, prop[name]) : prop[name];
		}
		
		// The dummy class constructor
		function Class() 
		{
			if( !initializing && this.init ) 
			{
				this.init.apply(this, arguments);
			}
			//return this;
		}
		// Populate our constructed prototype object
		Class.prototype	= proto;
		// Enforce the constructor to be what we expect
		Class.constructor = Class;
		// And make this class extendable
		Class.extend		= arguments.callee;
		 
		return Class;
	};

	if (typeof Object.create !=='function') 
	{
      /**
       * Prototypal Inheritance Create Helper
       * @param {Object} Object
       * @example
       * // declare oldObject
       * oldObject = new Object();
       * // make some crazy stuff with oldObject (adding functions, etc...)
       * ...
       * ...
       *
       * // make newObject inherits from oldObject
       * newObject = Object.create(oldObject);
       */
		Object.create = function(o) 
		{
			function _fn(){}; 
			_fn.prototype = o;
			return new _fn();
		};
	};

	if (!Function.bind) 
	{
      /**
       * ensure bind is properly supported<br>
       * (c) <a href="http://www.prototypejs.org/">Prototype.js</a><p>
       * Binds this function to the given context by wrapping it in another function and returning the wrapper.<p>
       * Whenever the resulting "bound" function is called, it will call the original ensuring that this is set to context. <p>
       * Also optionally curries arguments for the function.
	    * @param {Object} context the object to bind to.
       * @param {Array.<string>} [args] Optional additional arguments to curry for the function.
       * @example
       * // A typical use of Function bind is to ensure that a callback
       * // (event handler, etc.) that is an object method gets called with 
       * // the correct object as its context (this value):
       *
       * // -> WRONG
       * myObject.onComplete(this.callback);
       *
       * // -> RIGHT 
       * myObject.onComplete(this.callback.bind(this));
       */
      /*
		Function.prototype.bind = function(scope) 
		{
			var _function = this; 
			return function() 
			{
				return _function.apply(scope, arguments);
			}
		};
      */
      
      Function.prototype.bind = function()
		{
			var fn = this, args = Array.prototype.slice.call(arguments),
			object = args.shift();
			return function(){
              return fn.apply(object,
                   args.concat(Array.prototype.slice.call(arguments)));
			};
		};

	};
			
	/** 
	 * add trim fn to the string object 
	 * @extends String
    * @return {String} trimmed string
	 */
	String.prototype.trim = function() 
	{
		return (this.replace(/^\s+/, '')).replace(/\s+$/, '');
	};
	
	/**
	 * add isNumeric fn to the string object 
	 * @extends String
    * @return {Boolean} true if string contains only digits
	 */
	String.prototype.isNumeric = function() 
	{
		return (this!=null && !isNaN(this) && this.trim()!="");
	};

	/**
	 * add a isBoolean fn to the string object 
	 * @extends String
    * @return {Boolean} true if the string is either true or false
	 */
	String.prototype.isBoolean = function() 
	{
		return (this!=null && ( "true" == this.trim() || "false"  == this.trim()));
	};

	/**
	 * add a contains fn to the string object
	 * @extends String
    * @return {Boolean} 
	 */
	String.prototype.contains = function(word) 
	{
      return this.indexOf(word) > -1;
	};
	
   /**
	 * add a clamp fn to the Number object
	 * @extends Number
    * @return {Number} clamped value
	 */
   Number.prototype.clamp = function (low, high) 
   {
      return this < low ? low : this > high ? high : this;
   }

		

	/************************************************************************************/
	
	/**
	 * @class
	 * @constructor
	 * @ignore
	 *	a basic XML Parser
	 *
	 **/
	function _TinyXMLParser()
	{
		var parserObj = 
		{
			xmlDoc : null,
			parser : null,
			
			// parse a xml from a string (xmlhttpObj.responseText)
			parseFromString: function(textxml)
			{
				// get a reference to the requested corresponding xml file 
				if ($.DOMParser)
				{
					parser = new DOMParser();
					xmlDoc = parser.parseFromString(textxml, "text/xml");
				}
				else // Internet Explorer (untested!)
				{
					xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
					xmlDoc.async = "false";
					xmlDoc.loadXML(textxml); 
				}
				if (xmlDoc == null)
				{
					console.log ("xml " + xmlDoc + " not found!");
				}
			},

			getFirstElementByTagName: function(name)
			{
				return xmlDoc?xmlDoc.getElementsByTagName(name)[0]:null;
			},
			
			getAllTagElements: function()
			{
				return xmlDoc?xmlDoc.getElementsByTagName('*'):null;
			},
			
			getStringAttribute: function (elt, str, val)
			{
				var ret = elt.getAttribute(str);
				return ret?ret.trim().toLowerCase():val;
			},
			
			getIntAttribute: function (elt, str, val)
			{
				var ret = this.getStringAttribute(elt,str,val);
				return ret?parseInt(ret):val;
			},
			
			getFloatAttribute: function (elt, str, val)
			{
				var ret = this.getStringAttribute(elt,str,val);
				return ret?parseFloat(ret):val;
			},

			
			getBooleanAttribute: function (elt, str, val)
			{
				var ret = this.getStringAttribute(elt,str,val);
				return ret?(ret == "true"):val;
			},
			
			// free the allocated parser
			free: function ()
			{
				xmlDoc = null;
				parser = null;
			}
		}
		return parserObj;
	};
	/************************************************************************************/
	
	
	/************************************************************************************/
	
	/*---
	 	ME init stuff
						---*/
	
	function _init_ME() 
	{
		// don't do anything if already initialized (should not happen anyway)
		if (me_initialized)
		 return;
			
		// init some audio variables		
		var a = document.createElement('audio');
		
		// enable/disable the cache
		me.utils.setNocache(document.location.href.match(/\?nocache/));
		
		if (a.canPlayType)
		{
			me.audio.capabilities.mp3 = ("no" != a.canPlayType("audio/mpeg")) && 
												 ("" != a.canPlayType("audio/mpeg"));
							
			me.audio.capabilities.ogg = ("no" != a.canPlayType('audio/ogg; codecs="vorbis"')) &&  
												 ("" != a.canPlayType('audio/ogg; codecs="vorbis"'));
							
			me.audio.capabilities.wav = ("no" != a.canPlayType('audio/wav; codecs="1"')) && 	
												 ("" != a.canPlayType('audio/wav; codecs="1"'));
			
			// enable sound if any of the audio format is supported
			me.sys.sound = me.audio.capabilities.mp3 || me.audio.capabilities.ogg || me.audio.capabilities.wav;
							
		}
		// hack, check for specific platform
		if ((me.sys.ua.search("iphone") > -1) || 
			 (me.sys.ua.search("ipod") > -1)	|| 
			 (me.sys.ua.search("ipad") > -1)	||
			 (me.sys.ua.search("android") > -1))
		{
			//if on mobile device, disable sound for now 
			me.sys.sound = false;
		}
		
		// init the FPS counter if needed
		me.timer.init();
		
		// create an instance of the XML parser
		me.XMLParser = new _TinyXMLParser();
		
		// create a default loading screen
		me.loadingScreen = new me.DefaultLoadingScreen();
		
		// init the App Manager
		me.state.init();
		
		// init the Entity Pool
		me.entityPool.init();
		
		// init the level Director
		me.levelDirector.reset();
		
		me_initialized = true;
		
	};
	
 	
	/************************************************************************************/
	/*		OBJECT MNGT & DRAWING FUNCTIONS	:															*/
	/*		hold & manage app/game objects																*/
	/************************************************************************************/
	
   /**
    * a dirty region management object
    * only use by the game manager
	 * @ignore
	 */
	dirtyRegion = (function()
   {
      // hold public stuff in our singletong
		var api	= {};
      
      /*---------------------------------------------
			
			PRIVATE STUFF
				
		---------------------------------------------*/
      
      
      /*---------------------------------------------
			
			PUBLIC STUFF
				
		---------------------------------------------*/
      
   })();

   
   
   
   /**
	 * me.game represents your current game, it contains all the objects, tilemap layers,<br>
    * HUD information, current viewport, collision map, etc..<br>
    * me.game is also responsible for updating (each frame) the object status and draw them<br>
    * There is no constructor function for me.game.
	 * @final
	 * @memberOf me
	 * @constructor Should not be called by the user.
	 */
	game = (function()
	{
		// hold public stuff in our singletong
		var api	= {};
		/*---------------------------------------------
			
			PRIVATE STUFF
				
			---------------------------------------------*/
		
		// x,y coordindates where to draw the game
		var x							= 0;
		var y							= 0;
		
		// ref to the "system" context
		var frameBuffer			= null;
		
		// hold all the objects							
		var gameObjects			= [];//new Array(),
		
		// hold number of object in the array
		var objCount					= 0;
		
		var updating					= false;

		// parent canvas on where to draw our stuff
		//parentCanvas			: null,
		
		// flag to redraw the sprites 
		var canvas_invalidated	= true;
		// flag to redraw the sprites 
		var initialized			= false;
		
		// to handle mouse event
		var registeredMouseEventObj = [];
		
		
		/*---------------------------------------------
			
			PUBLIC STUFF
				
			---------------------------------------------*/
	  /**
       * a reference to the game viewport.
       * @public
       * @type me.ViewportEntity
       * @name me.game#viewport
       */
		api.viewport				= null;
		/**
       * a reference to the game HUD (if defined).
       * @public
       * @type me.HUD_Object
       * @name me.game#HUD
       */
		api.HUD						= null;
      /**
       * a reference to the game collision Map
       * @public
       * @type me.TiledLayer
       * @name me.game#collisionMap
       */
      api.collisionMap			= null;
		/**
       * a reference to the game current level
       * @public
       * @type me.TMXTileMap
       * @name me.game#currentLevel
       */
      api.currentLevel			= null;

		// FIX ME : put this somewhere else
		api.NO_OBJECT				= 0;
     
      /**
	    * Default object type constant.<br>
       * See type property of the returned collision vector.
		 * @constant
		 * @name me.game#ENEMY_OBJECT
		 */
		api.ENEMY_OBJECT			= 1;
      
      /**
	    * Default object type constant.<br>
       * See type property of the returned collision vector.
		 * @constant
		 * @name me.game#COLLECTABLE_OBJECT
		 */
		api.COLLECTABLE_OBJECT	= 2;
		
      /**
	    * Default object type constant.<br>
       * See type property of the returned collision vector.
		 * @constant
		 * @name me.game#ACTION_OBJECT
		 */
	   api.ACTION_OBJECT			= 3; // door, etc...
		

		/**
		 * Initialize the game manager
		 * @name me.game#init
		 * @public
		 * @function
		 *	@param {int} [x="0"] x coordinates of the canvas
		 * @param {int} [y="0"] y coordinates of the canvas
		 * @param {int} [width="full size of the created canvas"] width of the canvas
		 * @param {int} [height="full size of the created canvas"] width of the canvas
		 * init function.
		 */
		api.init = function(x, y, width, height)
		{	
			if (!initialized)
			{
				x = x || 0;
				y = y || 0;
				// if no parameter specified use the system size
				var width  = width  || me.video.getWidth();
				var height = height || me.video.getHeight();
				
				// create a canvas where to draw everything
				spriteCanvasSurface = me.video.createCanvasSurface(width, height);
				
				// create a defaut viewport of the same size
				api.viewport = new me.Viewport(0, 0, width, height);
				
				// get a ref to the screen buffer
				frameBuffer = me.video.getScreenFrameBuffer();
				
				initialized = true;
			}
		};
		
		/**
		 * reset the game Object manager<p>
		 * destroy all current object except the HUD
       * @see me.game#disableHUD
		 * @name me.game#reset
		 * @public
		 * @function
		 */
		api.reset = function()
		{
			// initialized the object if not yet done
			if (!initialized)
				api.init();
				
			// remove all objects
			api.removeAll();
			
			// reset the viewport to zero ?
			if (api.viewport)
				api.viewport.reset();

			// invalidate the canvas
			canvas_invalidated = true;
			
			//api.HUD = null;
		};
		
		
		/**
		 * Load a TMX level
		 * @name me.game#loadTMXLevel
		 * @private
		 * @function
		 */
	
		api.loadTMXLevel = function(level)
		{
			// load our map
			api.currentLevel = level;
			
			// get the collision map
			api.collisionMap = api.currentLevel.getLayerByName("collision");
			if (!api.collisionMap || !api.collisionMap.isCollisionMap)
			{
				alert ("WARNING : no collision map detected");
			}
			
			// add ou tile map object to the game mngr
			api.currentLevel.addTo(me.game);
									
			// change the viewport limit
			api.viewport.setBounds(api.currentLevel.realwidth, api.currentLevel.realheight);
			
			// load all game entities
			var objectGroups = api.currentLevel.getObjectGroups();
			for(var group=0;group<objectGroups.length;group++)
			{	
				for(var entity=0;entity<objectGroups[group].objects.length;entity++)
				{
					api.addEntity(objectGroups[group].objects[entity], objectGroups[group].z);
				}
			}
			
			// sort all our stuff !!
			api.sort();
	
		};
		
      
    	/**
		 * add object to the game manager
		 * @name me.game#add
		 * @public
		 * @function
		 */	
			
		api.add = function(object, zOrder)
		{  
			object.z = (zOrder) ? zOrder:object.z;
			
			// add the object in the game obj list
			gameObjects.push(object);

			// TO BE REMOVED
			if (object.mouseEvent)
			{
				// also add a reference in the object even list
				registeredMouseEventObj.push(object);
			}
			
			// cache the number of object
			objCount = gameObjects.length;
			
		};

		
		/**
		 * add an entity to the game manager
		 * @name me.game#addEntity
		 * @public
       * @private
		 * @function
		 */
		api.addEntity = function(entityType, zOrder)
		{
			api.add(me.entityPool.newIstanceOf(entityType), zOrder);
		};
		

		/**
		 * add a HUD obj to the game manager
		 * @name me.game#addHUD
		 * @public
		 * @function
       *	@param {int} x x position of the HUD
       * @param {int} y y position of the HUD
       * @param {int} w width of the HUD
       * @param {int} h height of the HUD
       * @param {String} [bg="none"] a CSS string specifying the background color (e.g. "#0000ff" or "rgb(0,0,255)")
		 */	
		api.addHUD = function(x, y, w, h, bg)
		{	
		
			// if no HUD existing
			if (api.HUD == null)
			{
				// create a new default HUD object
				api.HUD = new me.HUD_Object(x, y, w, h, bg);
				//api.add(api.HUD);
			}
			// else just ignored
		};

		
		/**
		 * disable the current HUD
		 * @name me.game#disableHUD
		 * @public
		 * @function
		 */
		api.disableHUD = function()
		{	
		
			// if no HUD existing
			if (api.HUD != null)
			{
				// create a new default HUD object
				api.HUD = null;
				//api.add(api.HUD);
			}
			// else just ignored
		};

		/**- 
		 * propagate mouse event to objects
		 * @private
       */
		api.mouseEvent = function(x, y)
		{
			for (var i = registeredMouseEventObj.length; i-- ;)
			{
				registeredMouseEventObj[i].mouseEvent(x, y);
			}
		};
		
	
		
		/**
		 * update elements of the sprite manager
		 * @name me.game#update
		 * @private
		 * @function
		 */
		api.update = function()
		{
			// update the Frame counter
			me.timer.update();
			
			//for(var i=0, soundclip;soundclip = channels[i++];)
			for (var i = objCount, obj; i--, obj = gameObjects[i];)
			{
				// update return true, if the object changed (animation / pos)
				if (obj.update()) // && obj.visible <- this is check in Object Entity directly
				{
					canvas_invalidated = true;
				}
				// some quick & cheap broad(narrow) phase :)
				// check if the object is an entity and is in the display area
				if (obj.isEntity && !obj.flickering)
				{
			 	   obj.visible = api.viewport.isVisible(obj.collisionBox);
				}
			}
			// update the camera viewport
			canvas_invalidated = api.viewport.update(canvas_invalidated);
		};
		
			
		/**
		 * remove an object
		 * @name me.game#remove
		 * @public
		 * @function
		 */
		
		api.remove = function (obj)
		{
			gameObjects.splice(gameObjects.indexOf(obj),1);
			
			if (obj.mouseEvent)
			{
				// remove reference in the object even list
				registeredMouseEventObj.splice(registeredMouseEventObj.indexOf(obj),1);
			}
			
			// cache the number of object
			objCount = gameObjects.length;
			// force redraw
			canvas_invalidated = true;
			
		};
		
		
		/**
		 * remove all objects
		 * @name me.game#removeAll
		 * @public
		 * @function
		 */
		
		api.removeAll = function ()
		{
			//empty everything
			objCount = 0;
			gameObjects	= [];
			registeredMouseEventObj = [];
			// force redraw
			canvas_invalidated = true;
		};

		/**
		 * <p>Sort all objects (using object z property value).</p>
       * <p>Normally all objects loaded through the LevelDirector are automatically sorted.
       * this function is however usefull if you create and add object during the game.</p>
		 * @name me.game#sort
		 * @public
		 * @function
		 */

		api.sort = function()
		{
			// sort order is inverted, 
			// since we use a reverse loop for the display 
			gameObjects.sort(function (a, b){return (b.z - a.z);});
			canvas_invalidated = true;
		};

		
		/**
		 * check for collision between objects
		 * @name me.game#collide
		 * @public
		 * @function
       * @param {me.ObjectEntity} obj Object to be tested for collision
       * @return {me.Vector2d} collision vector {@link me.Rect#collideVsAABB}
       * @example
       * // update player movement
       * this.updateMovement();
		 *
       * // check for collision with other objects
		 * res = me.game.collide(this);
       *
       * // check if we collide with an enemy :
		 * if (res && (res.type == me.game.ENEMY_OBJECT))
		 * { 	
		 *   if (res.x != 0)
		 *   {
		 *      // x axis
		 *      if (res.x<0)
		 *         console.log("x axis : left side !");
		 *      else
		 *         console.log("x axis : right side !");
		 *   }
		 *   else
		 *   {
		 *      // y axis
		 *      if (res.y<0)
		 *         console.log("y axis : top side !");
		 *      else
		 *         console.log("y axis : bottom side !");			
		 *   }
		 *		
		 * }

 		 */
		api.collide = function(objB)
		{
			var result = null;
			
			// this should be replace by a list of the 4 adjacent cell around the object requesting collision
			for (var i = objCount, obj; i--, obj = gameObjects[i];)//for (var i = objlist.length; i-- ;)
			{
				if (obj.visible && obj.collidable && obj.isEntity )// && (obj!=objB))
				{
					// if return value != null, we have a collision
					if (result = obj.checkCollision(objB))
						// stop the loop return the value
						break;
				}
			}
			return result;

		};
		
		
		/**
		 * force the redraw (not update) of all objects
		 * @name me.game#repaint
		 * @public
		 * @function
		 */
	
		api.repaint = function()
		{
			canvas_invalidated = true;
		};

		/**
		 * draw all existing objects
		 * @name me.game#draw
		 * @private
		 * @function
		 */
		
		api.draw = function()
		{	
			//var count =0;
			if (canvas_invalidated)
			{	
				// draw all the game objects
				for (var i = objCount, obj; i--, obj = gameObjects[i];)
				{
					if (obj.visible)
					{
							//count++;
							obj.draw(spriteCanvasSurface, x, y);
					}
				}
				
				// draw a HUD if defined
				if (api.HUD != null)
					api.HUD.draw (spriteCanvasSurface, x, y);
				
				// call the viewport draw function (for effects)
				api.viewport.draw(spriteCanvasSurface)
								
				// blit everything to the specified canvas
				frameBuffer.drawImage(spriteCanvasSurface.canvas, x, y);
				
				// clear our flag
				canvas_invalidated = false;
			}

		};
		
		
		// return our object
		return api;

	})();


	/************************************************************************************/
	/*		Screen Object Type																				*/
	/*		Used by the App Manager																			*/
	/************************************************************************************/

	/* -----

		Screen object object
			
		------	*/
	/**
	 * A class skeleton for "Screen" Object <br>
    * every "screen" object (title screen, credits, ingame, etc...) to be managed <br>
    * through the state manager must inherit from this base class.
	 * @class
	 *	@extends Object
	 * @memberOf me
	 * @constructor
    * @see me.state
    * @example
    * // create a custom loading screen
    * var CustomLoadingScreen = me.ScreenObject.extend(
    * {
    *    // constructor
    *    init: function()
    *    {
    *       // pass true to the parent constructor
    *       // as we draw our progress bar in the draw function
    *       this.parent(true);
    *       // a font logo
    *       this.logo = new me.Font('century gothic', 32, 'white');
    *       // flag to know if we need to refresh the display
    *       this.invalidate = false;
    *       // load progress in percent
    *       this.loadPercent = 0;
    *       // setup a callback
    *       me.loader.onProgress = this.onProgressUpdate.bind(this);
    *
    *    },
	 *
    *    // will be fired by the loader each time a resource is loaded
    *    onProgressUpdate: function(progress)
    *    {
    *       this.loadPercent = progress;
    *       this.invalidate = true;
    *    },
    * 
    *   
    *    // make sure the screen is only refreshed on load progress 
    *    update: function()
	 *    {
	 *       if (this.invalidate===true)
    *       {
    *          // clear the flag
    *          this.invalidate = false;
    *          // and return true
    *          return true;
    *       }
    *       // else return false
    *       return false;
	 *    },
    * 
    *    // on destroy event
    *    onDestroyEvent : function ()
    *    {
    *       // "nullify" all fonts
    *       this.logo = null;
    *    },
    *
    *    //	draw function
    *    draw : function(context)
    *    {
    *       // clear the screen
    *       me.video.clearSurface (context, "black");
    *
    *       // measure the logo size
    *       logo_width = this.logo.measureText(context,"awesome loading screen").width;
    *
    *       // draw our text somewhere in the middle
    *       this.logo.draw(context, 
    *                      "awesome loading screen", 
    *                      ((context.canvas.width - logo_width) / 2), 
    *                      (context.canvas.height + 60) / 2);
    *   
    *       // display a progressive loading bar
    *       var width = Math.floor(this.loadPercent * context.canvas.width);
    *     
    *       // draw the progress bar
    *       context.strokeStyle = "silver";
    *       context.strokeRect(0, (context.canvas.height / 2) + 40, context.canvas.width, 6);
    *       context.fillStyle = "#89b002";
    *       context.fillRect(2, (context.canvas.height / 2) + 42, width-4, 2);
    *    },
    * });
    *
    */
	ScreenObject = Object.extend(
	/** @scope me.ScreenObject.prototype */
	{	
		
		visible		 : true,
		
		/**
       *	initialization function
		 * @param {Boolean} [addAsObjet] add the object in the game manager object pool<br> 
       * allowing to override the update & draw function to add specific treatment.
       */

		init: function(addAsObject)
		{
         this.visible = (addAsObject===true) || false;
		},
			
		/** 
       *	Object reset function
		 * @private
       */
		reset: function()
		{
			
			// reset the game manager
			me.game.reset();
	
			// add our object to the GameObject Manager
			// allowing to benefit from the keyboard event stuff
			if (this.visible)
           me.game.add(this,999);
			
			// call the onReset Function
         this.onResetEvent.apply(this, arguments);

			// sort the object pool
			me.game.sort();
			
		},
		
		/**
		 *	Destroy function
	    * @private
       */
		destroy: function ()
		{
			// call the destroy notification function
			this.onDestroyEvent();
		},

		/**
		 * update function<br>
       * optional empty function<br>
       * only used by the engine if the object has been initialized using addAsObject parameter set to true<br>
       * @example
       * // define a Title Screen 
       * var TitleScreen = me.ScreenObject.extend(
       * {
       *    // override the default constructor
       *    init : function()
       *    {
       *       //call the parent constructor giving true
       *       //as parameter, so that we use the update & draw functions
		 *       this.parent(true);
		 *       ...
       *       ...
       *     },
       *     ...
       * });
		 */
		update: function()
		{
			return false;
		},

	
		/**
       *	frame update function function
       * @private
       */
		onUpdateFrame: function()
		{
			// update the game object
			me.game.update();
	
			// draw the game objects
			me.game.draw();
			
			// blit our frame
			me.video.blitSurface();
		},
		
		/**
		 *	draw function<br>
       * optional empty function<br>
       * only used by the engine if the object has been initialized using addAsObject parameter set to true<br>
       * @example
       * // define a Title Screen 
       * var TitleScreen = me.ScreenObject.extend(
       * {
       *    // override the default constructor
       *    init : function()
       *    {
       *       //call the parent constructor giving true
       *       //as parameter, so that we use the update & draw functions
		 *       this.parent(true);
		 *       ...
       *       ...
       *     },
       *     ...
       * });
		 */
		draw: function()
		{
			// to be extended
		},
		
		/**
       *	onResetEvent function<br>
       * called by the state manager when reseting the object<br>
       * this is typically where you will load a level, etc...
       * to be extended
		 *	@param {String[]} [arguments] optional arguments passed when switching state
       */
		onResetEvent: function()
		{
			// to be extended
		},
		
		/**
       *	onDestroyEvent function<br>
       * called by the state manager before switching to another state<br>
       */
		onDestroyEvent: function()
		{
			// to be extended
		}
			
	});
	// expose our stuff to the global score
	$.me.ScreenObject	= ScreenObject;
	
	
	/************************************************************************************/
	/*		Game App Manager																					*/
	/*		Manage the basic logic of a game/app														*/
	/************************************************************************************/
	
	/*---
	
	 	cross browser requestAnimationFrame/cancelRequestAnimFrame.

		---*/
    window.requestAnimFrame = (function()
    {
      return   window.requestAnimationFrame       ||
               window.webkitRequestAnimationFrame || 
               window.mozRequestAnimationFrame    || 
               window.oRequestAnimationFrame      || 
               window.msRequestAnimationFrame     ||
               function (){ return -1;} // return -1 if unsupported
     })();
   
    window.cancelRequestAnimFrame = ( function() 
    {
      return window.cancelAnimationFrame              ||
             window.webkitCancelRequestAnimationFrame ||
             window.mozCancelRequestAnimationFrame    ||
             window.oCancelRequestAnimationFrame      ||
             window.msCancelRequestAnimationFrame     ||
             function (){ return -1;} // return -1 if unsupported
    })();
	
	
	/* -----

		the game App Manager (state machine)
			
		------	*/
	/**
	 * a State Manager (state machine)<p>
	 * There is no constructor function for me.state.
	 * @final
	 * @memberOf me
	 * @constructor Should not be called by the user.
	 */
	
	state = (function()
	{
		// hold public stuff in our singletong
		var obj	= {};
		
		/*---------------------------------------------
			
			PRIVATE STUFF
				
			---------------------------------------------*/
		
		// current state
		var _state			=	-1;
		// SetInterval Id
		var _intervalId	=	-1;
      // requestAnimeFrame Id
      var _animFrameId	=	-1;
		
		// list of screenObject
		var _screenObject  = {};
				
		// fading transition parameters between screen
		var _fade  = {color : "", duration : 0};
		
		// callback when state switch is done
		/** @private */
		var _onSwitchComplete = null;
		
		// just to keep track of possible extra arguments
		var _extraArgs = null;
      
      // cache reference to the active screen update frame
      var _activeUpdateFrame = null;
      
      // cache reference to the active screen update frame
      var _fps = null;

            
      
		/**
		 * @ignore
		 */
		function _startRunLoop ()
		{
			// ensure nothing is running first
			if ((_intervalId==-1)&&(_animFrameId==-1))
			{
				
				// reset the timer
				me.timer.reset();
			
				// start the main loop
				if (me.sys.useNativeAnimFrame)
				{	
               // attempt to setup the game loop using requestAnimationFrame
					_animFrameId = window.requestAnimFrame(_renderFrame);
               
               if (_animFrameId!=-1)
               {	
                  return;
               }
               // else feature not supported !
               
               // disable use of requestAnimationFrame (since unsupported)
               me.sys.useNativeAnimFrame = false;
               //console.log("using setInterval as fallback ("+_animFrameId+")");
            }
            
            // setup the game loop using setInterval
				_intervalId = setInterval(_activeUpdateFrame, _fps);
			}
		};
		
		/**
		 * @ignore
       * this is only called when using requestAnimFrame stuff
		 */
		function _renderFrame ()
		{
         _activeUpdateFrame();
         // we already checked it was supported earlier
         // so no need to do it again here
			window.requestAnimFrame(_renderFrame);
		};

		/**
		 * stop the SO main loop
		 * @ignore
		 */
		function _stopRunLoop()
		{
			// cancel any previous setInterval
			if (_intervalId!=-1)
			{
            clearInterval(_intervalId);
				_intervalId = -1;
			}
         // cancel any previous animationRequestFrame
         if (_animFrameId!=-1)
			{
            cancelRequestAnimFrame(_animFrameId);
				_animFrameId = -1;
			}
         
		};
		
		
		/**
		 * start the SO main loop
		 * @ignore
		 */
		function _switchState(state)
		{
			// clear previous interval if any
			_stopRunLoop();
					
			// call the screen object destroy method
			if (_screenObject[_state])
				_screenObject[_state].screen.destroy();
					
			// call the reset function with _extraArgs as arguments
          _screenObject[state].screen.reset.apply(_screenObject[state].screen, _extraArgs);
					
			// set the global variable
			_state = state;
         
         // cache the new screen object update function
         _activeUpdateFrame = _screenObject[_state].screen.onUpdateFrame
					
			// and start the main loop of the 
			// new requested state
					
			_startRunLoop();
			
			// execute callback if defined
			if (_onSwitchComplete)
				_onSwitchComplete();
		};


		
		/*---------------------------------------------
			
			PUBLIC STUFF
				
			---------------------------------------------*/
		/**
		 * default state value for Loading Screen
	    * @constant
		 * @name me.state#LOADING
		 */
		obj.LOADING		=	0;
		/**
	    * default state value for Menu Screen
		 * @constant
		 * @name me.state#MENU
		 */
		obj.MENU			=	1;
		/**
	    * default state value for "Ready" Screen
		 * @constant
		 * @name me.state#READY
		 */
		obj.READY		=	2;
		/**
	    * default state value for Play Screen
		 * @constant
		 * @name me.state#PLAY
		 */
		obj.PLAY			=	3;
		/**
	    * default state value for Game Over Screen
		 * @constant
		 * @name me.state#GAMEOVER
		 */
		obj.GAMEOVER	=	4;
		/**
	    * default state value for Game End Screen
		 * @constant
		 * @name me.state#GAME_END
		 */
		obj.GAME_END	=	5;
		/**
	    * default state value for High Score Screen
		 * @constant
		 * @name me.state#SCORE
		 */
		obj.SCORE		=	6;
		/**
	    * default state value for Credits Screen
		 * @constant
		 * @name me.state#CREDITS
		 */
		obj.CREDITS		=	7;
		/**
	    * default state value for Settings Screen
		 * @constant
		 * @name me.state#SETTINGS
		 */
		obj.SETTINGS   =  8;
      
      
      /**
	    * onPause callback
		 * @type function
		 * @name me.state#onPause
		 */
		obj.onPause = null;
      
      /**
	    * onResume callback
		 * @type function
		 * @name me.state#onResume
		 */
		obj.onResume = null;


		/**
		 * @ignore
		 */
		obj.init = function () 
		{
			// set the embedded loading screen
			obj.set(obj.LOADING, me.loadingScreen);
			
			// set pause action on losing focus
			$.addEventListener("blur", function () 
			{
				// only in case we are not loading stuff
				if (_state != obj.LOADING) 
				{
					obj.pause(true);
               
               // callback?
               if (obj.onPause)
               obj.onPause();

				}
			}, false);
			// set play action on gaining focus
			$.addEventListener("focus", function () 
			{
				// only in case we are not loading stuff
				if (_state != obj.LOADING)
				{
					obj.resume(true);
               
               // callback?
               if (obj.onResume)
                  obj.onResume();
               
               // force repaint
               me.game.repaint();

				}
			}, false);
         
         // cache the FPS information
         _fps = ~~(1000/me.sys.fps);
		};
	
	
	 	/**
		 * pause the current screen object
		 * @name me.state#pause
		 * @public
		 * @function
		 *	@param {Boolean} pauseTrack pause current track on screen pause
		 */
		obj.pause = function (music)
		{
			// stop the main loop
			_stopRunLoop();
			// current music stop
			if (music)
				me.audio.pauseTrack();
         
       };

	 	/**
		 * resume the resume screen object
		 * @name me.state#resume
		 * @public
		 * @function
		 *	@param {Boolean} resumeTrack resume current track on screen resume
		 */
		obj.resume = function (music)
		{
			// start the main loop
			_startRunLoop(_state);
			// current music stop
			if (music)
				me.audio.resumeTrack();
		};
			
					
		/**
		 * associate the specified state with a screen object
		 * @name me.state#set
		 * @public
		 * @function
		 *	@param {Int} state @see me.state#Constant
		 *	@param {me.ScreenObject} so
		 */
		obj.set = function (state, so)
		{
			_screenObject[state]				  = {};
			_screenObject[state].screen	  = so;
			_screenObject[state].transition = true;
		};
      
      /**
		 * return a reference to the current screen object<br>
       * usefull to call a object specific method
		 * @name me.state#set
		 * @public
		 * @function
		 *	@return {me.ScreenObject} so
		 */
		obj.current = function ()
		{
			return _screenObject[_state].screen;
		};

		
	
		/**
		 * specify a global transition effect
		 * @name me.state#transition
		 * @public
		 * @function
		 *	@param {String} effect (only "fade" is supported for now)
		 *	@param {String} color in RGB format (e.g. "#000000")
		 *	@param {Int}	 duration (e.g. 15) 
		 */
		obj.transition = function (effect, color, duration)
		{
			if (effect == "fade")
			{
				_fade.color = color;
				_fade.duration = duration;
			}
		};
	
		/**
		 * enable/disable transition for a specific state (by default enabled for all)
		 * @name me.state#setTransition
		 * @public
		 * @function
		 */

		obj.setTransition = function (state, enable)
		{
			_screenObject[state].transition = enable;
		};

	
		/**
		 * change the game/app state
		 * @name me.state#change
		 * @public
		 * @function
		 *	@param {Int} state @see me.state#Constant
       *	@param {Arguments} [args] extra arguments to be passed to the reset functions
		 */

		obj.change = function (state)
		{

			switch (state)
			{
				case obj.LOADING:
				case obj.MENU:
				case obj.PLAY:
				case obj.READY:
				case obj.GAMEOVER:
				case obj.GAME_END:
				case obj.SCORE:
				case obj.CREDITS:
				case obj.SETTINGS:
				{
					
               _extraArgs = null;
               if (arguments.length > 1)
               {
                 // store extra arguments if any
                 _extraArgs = Array.prototype.slice.call(arguments, 1);
					}
					// if fading effect
					if (_fade.duration && _screenObject[state].transition)
					{
						/** @private */
						_onSwitchComplete = function (){me.game.viewport.fadeOut(_fade.color, _fade.duration);};
						me.game.viewport.fadeIn(_fade.color, _fade.duration, function(){_switchState(state);});
						
					}
					// else just switch without any effects
					else
					{
						_switchState(state);
					}
					
									
					break;
				}


				default :
				{
					break;
				}	
			}
		};
		
		/**
		 * return true if the specified state is the current one
		 * @name me.state#isCurrent
		 * @public
		 * @function
		 *	@param {Int} state @see me.state#Constant
		 */
		obj.isCurrent = function (state)
		{
			return _state == state;
		};

			
		// return our object
		return obj;

	})();

	
	/*---------------------------------------------------------*/
	// expose our stuff to the global scope
	/*---------------------------------------------------------*/
	$.me.state						= state;
	$.me.game						= game;
	
/*---------------------------------------------------------*/
// END END END
/*---------------------------------------------------------*/
})(window);
