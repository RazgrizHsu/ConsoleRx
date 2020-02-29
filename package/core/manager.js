// storage all messages
let __messages	= exports.list = [];

// for Vue Binding
let __RenderItems = exports.RenderItems = null;

exports.SetRenderItemsBy = function ( array )
{
	__messages.length = 0;
	__RenderItems = exports.RenderItems = array;
}

let ignorePatterns = [];
let collapse = true;
let filterType = '';
let filterText = '';
let filterRegex = false;
exports.addItems = function ( array )
{
	if ( !array )
	{
		Editor.log( 'addItems is Null!' );
		return;
	}
	array.forEach( ( item ) =>{ exports.addItem( item ); } );
}
exports.addItem = function ( item )
{
	let result = {};

	let split = item.message.split( '\n' );
	split = split.filter( ( item ) =>{ return item !== ""; } );

	//console.info( `[crx] addItem[ ${ JSON.stringify( item ) } ]` )

	result.type		= item.type;
	result.rows		= split.length;
	result.title	= split[0];
	result.info		= split.splice( 1 ).join( '\n' );
	result.fold		= true;
	result.num		= 1;
	// result.translateY = list.length * _lineHeight;

	//額外判斷
	let title = result.title || '';
	if( title.indexOf( 'ERROR' ) > 0 || title.indexOf( 'Error:' ) > 0 ) result.type = 'error';

	__messages.push( result );
	exports.update();
}

exports.clear = function ()
{
	//while ( list.length > 0 ) { list.pop(); }
	__messages.length = 0;
	exports.update();
}

let _updateLocker = false;
exports.update = function ()
{
	if ( _updateLocker || !__RenderItems ) return;
	_updateLocker = true;

	let _updateMessages = () =>
	{
		_updateLocker = false;
		let offsetY = 0;
		while ( __RenderItems.length > 0 ) { __RenderItems.pop(); }

		let filter = filterText;
		if ( filterRegex )
		{
			try { filter = new RegExp( filter ); }
			catch ( error ) { filter = /.*/; }
		}

		let messages = __messages.filter( ( item ) =>
		{
			// 过滤一遍 title 不存在的项目
			if ( !item.title ) return false;

			// 根据 type 过滤一遍 log
			if ( filterType && item.type !== filterType ) return false;

			// 根据填入的过滤条件再次过滤一遍
			if ( filterRegex ) return filter.test( item.title );
			else
			{
				return item.title.indexOf( filter ) !== -1;
			}
		} );

		//IgnorePatterns
		for( let idx = 0; idx < ignorePatterns.length; idx++ )
		{
			let ignoreRegExp = ignorePatterns[idx];
			messages = messages.filter( (item) => { return !ignoreRegExp.test( item.title ) });
		}

		messages.forEach( ( item ) =>
		{
			let reference = __RenderItems[__RenderItems.length - 1];
			// collapse
			if ( collapse && reference && item.title === reference.title && item.info === reference.info && item.type === reference.type )
			{
				reference.num += 1;
				return;
			}
			item.num = 1;
			item.translateY = offsetY;
			__RenderItems.push( item );

			offsetY += Editor.crx.CalculateNeedAddLineHeightBy( item );
		} );
	};

	requestAnimationFrame( _updateMessages );
}

exports.updateFontSize = function()
{
	exports.update();
}

exports.setCollapse = function ( bool )
{
	collapse = !!bool;
	exports.update();
}

exports.setFilterType = function ( str )
{
	filterType = str;
	exports.update();
}

exports.setFilterText = function ( str )
{
	filterText = str;
	exports.update();
}

exports.setFilterRegex = function ( bool )
{
	filterRegex = !!bool;
	exports.update();
}

exports.setIgnorePatternsBy = function( patterns )
{
	let regexps = [];
	let strings = patterns.split( "\n" );

	for( let idx = 0; idx < strings.length; idx++ )
	{
		let string = strings[idx];
		if( !string || !string.length || string.startsWith( '//' ) ) continue;
		try
		{
			let regexp = new RegExp( string );
			regexps.push( regexp );
		}
		catch ( error )
		{
			console.error( `[Error] 字串(${ idx })[${ string }]不是有效的RegularExpress!` );
		}
	}
	ignorePatterns = regexps;
	exports.update();
}