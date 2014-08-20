/*	
 * jQuery mmenu dragOpen addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */


(function( $ ) {

	var _PLUGIN_ = 'mmenu',
		_ADDON_  = 'dragOpen';

	var _c, _d, _e, glbl,
		addon_initiated = false;


	$[ _PLUGIN_ ].prototype[ '_init_' + _ADDON_ ] = function( $panels )
	{
		if ( typeof Hammer != 'function' )
		{
			return;
		}
		if ( !this.opts.offCanvas )
		{
			return;
		}
		if ( this.vars[ _ADDON_ + '_added' ] )
		{
			return;
		}
		this.vars[ _ADDON_ + '_added' ] = true;

		if ( !addon_initiated )
		{
			_initAddon();
		}

		this.opts[ _ADDON_ ] = extendOptions( this.opts[ _ADDON_ ] );
		this.conf[ _ADDON_ ] = extendConfiguration( this.conf[ _ADDON_ ] );

		var that = this,
			opts = this.opts[ _ADDON_ ],
			conf = this.conf[ _ADDON_ ];

		if ( opts.open )
		{
			if ( Hammer.VERSION < 2 )
			{
				$[ _PLUGIN_ ].deprecated( 'Older version of the Hammer library', 'version 2 or newer' );
				return false;
			}

			//	Set up variables
			var drag			= {},
				_stage 			= 0,
				_direction 		= false,
				_dimension		= false,
				_distance 		= 0,
				_maxDistance 	= 0;

			switch( this.opts.offCanvas.position )
			{
				case 'left':
				case 'right':
					drag.events		= 'panleft panright';
					drag.typeLower	= 'x';
					drag.typeUpper	= 'X';
					
					_dimension		= 'width';
					break;

				case 'top':
				case 'bottom':
					drag.events		= 'panup pandown';
					drag.typeLower	= 'y';
					drag.typeUpper	= 'Y';

					_dimension = 'height';
					break;
			}
			
			switch( this.opts.offCanvas.position )
			{
				case 'left':
				case 'top':
					drag.negative 	= false;
					break;
				
				case 'right':
				case 'bottom':
					drag.negative 	= true;
					break;
			}

			switch( this.opts.offCanvas.position )
			{
				case 'left':
					drag.open_dir 	= 'right';
					drag.close_dir 	= 'left';
					break;

				case 'right':
					drag.open_dir 	= 'left';
					drag.close_dir 	= 'right';
					break;

				case 'top':
					drag.open_dir 	= 'down';
					drag.close_dir 	= 'up';
					break;

				case 'bottom':
					drag.open_dir 	= 'up';
					drag.close_dir 	= 'down';
					break;
			}

			var $dragNode = this.__valueOrFn( opts.pageNode, this.$menu, glbl.$page );
			if ( typeof $dragNode == 'string' )
			{
				$dragNode = $($dragNode);
			}

			var $fixed = glbl.$page.find( '.' + _c.mm( 'fixed-top' ) + ', .' + _c.mm( 'fixed-bottom' ) ),
				$dragg = glbl.$page;

			switch ( this.opts.offCanvas.zposition )
			{
				case 'back':
					$dragg = $dragg.add( $fixed );
					break;

				case 'front':
					$dragg = this.$menu;
					break;

				case 'next':
					$dragg = $dragg.add( this.$menu ).add( $fixed );
					break;
			};


			//	Bind events
			var _hammer = new Hammer( $dragNode[ 0 ] );

			_hammer
				.on( 'panstart',
					function( e )
					{
						var pos = e.center[ drag.typeLower ];
						switch( that.opts.offCanvas.position )
						{
							case 'right':
							case 'bottom':
								if ( pos >= glbl.$wndw[ _dimension ]() - opts.maxStartPos )
								{
									_stage = 1;
								}
								break;

							default:
								if ( pos <= opts.maxStartPos )
								{
									_stage = 1;
								}
								break;
						}
					}
				)
				.on( drag.events + ' panend',
					function( e )
					{
						if ( _stage > 0 )
						{
							e.preventDefault();
						}
					}
				)
				.on( drag.events,
					function( e )
					{
						var new_distance = drag.negative
							? -e[ 'delta' + drag.typeUpper ]
							:  e[ 'delta' + drag.typeUpper ];

						_direction = ( new_distance >= _distance )
							? drag.open_dir
							: drag.close_dir;

						_distance = new_distance;

						if ( _distance > opts.threshold )
						{
							if ( _stage == 1 )
							{
								if ( glbl.$html.hasClass( _c.opened ) )
								{
									return;
								}
								_stage = 2;
								that._openSetup();
								glbl.$html.addClass( _c.dragging );

								_maxDistance = minMax( 
									glbl.$wndw[ _dimension ]() * conf[ _dimension ].perc, 
									conf[ _dimension ].min, 
									conf[ _dimension ].max
								);
							}
						}
						if ( _stage == 2 )
						{
							$dragg.css( that.opts.offCanvas.position, minMax( _distance, 10, _maxDistance ) - ( that.opts.offCanvas.zposition == 'front' ? _maxDistance : 0 ) );
						}
					}
				)
				.on( 'panend',
					function( e )
					{
						if ( _stage == 2 )
						{
							glbl.$html.removeClass( _c.dragging );
							$dragg.css( that.opts.offCanvas.position, '' );
							that[ _direction == drag.open_dir ? '_openFinish' : 'close' ]();
						}
			        	_stage = 0;
				    }
				);
		}
	};


	//	Add to plugin
	$[ _PLUGIN_ ].addons.push( _ADDON_ );


	//	Defaults
	$[ _PLUGIN_ ].defaults[ _ADDON_ ] = {
		open		: false,
//		pageNode	: null,
		maxStartPos	: 100,
		threshold	: 50
	};
	$[ _PLUGIN_ ].configuration[ _ADDON_ ] = {
		width	: {
			perc	: 0.8,
			min		: 140,
			max		: 440
		},
		height	: {
			perc	: 0.8,
			min		: 140,
			max		: 880
		}
	};


	function extendOptions( o )
	{
		if ( typeof o == 'boolean' )
		{
			o = {
				open: o
			};
		}
		if ( typeof o != 'object' )
		{
			o = {};
		}
		o = $.extend( true, {}, $[ _PLUGIN_ ].defaults[ _ADDON_ ], o );

		return o;
	}

	function extendConfiguration( c )
	{
		return c;
	}
	
	function _initAddon()
	{
		addon_initiated = true;

		_c = $[ _PLUGIN_ ]._c;
		_d = $[ _PLUGIN_ ]._d;
		_e = $[ _PLUGIN_ ]._e;

		_c.add( 'dragging' );

		glbl = $[ _PLUGIN_ ].glbl;
	}

	function minMax( val, min, max )
	{
		if ( val < min )
		{
			val = min;
		}
		if ( val > max )
		{
			val = max;
		}
		return val;
	}

})( jQuery );