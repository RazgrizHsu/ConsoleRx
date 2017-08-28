'use strict';
const Electron = require( 'electron' );
const Clipboard = Electron.clipboard;

const defines = require( './defines' );

let index =
{
	load()
	{
		Editor.Menu.register
		(
			defines.keys.OpenLogFile,
			() => { return defines.OpenLogFileOptions; },
			true
		);
	},
	unload()
	{
		Editor.Menu.unregister( defines.keys.OpenLogFile );
	},
	messages: {}
};

//------------------------------------------------------------------------------
// setting messages
//------------------------------------------------------------------------------
index.messages[ defines.keys.msgs.Open ] = () =>
{
	Editor.Panel.open( defines.PackageName );
};
index.messages[ defines.keys.msgs.OpenLogFile ] = () =>
{
	Electron.shell.openItem( Editor.logfile );
};

index.messages[ defines.keys.cmds.Clear ] = ( event, pattern, useRegex ) =>
{
	Editor.clearLog( pattern, useRegex );
};

index.messages[ defines.keys.msgs.PopupLogMenu ] = ( event, x, y ) =>
{
	let menuTmpl = Editor.Menu.getMenu( 'open-log-file' );

	let editorMenu = new Editor.Menu( menuTmpl, event.sender );
	x = Math.floor( x );
	y = Math.floor( y );
	editorMenu.nativeMenu.popup( Electron.BrowserWindow.fromWebContents( event.sender ), x, y );
	editorMenu.dispose();
};

index.messages[ defines.keys.msgs.PopupItemMenu ] = ( event, x, y, text ) =>
{
	var menuTmpl =
	[
		{
			label:  Editor.T( 'CONSOLE.copy_to_clipboard' ),
			params: [],
			click()
			{
				Clipboard.writeText( text || '' );
			}
		}
	];
	let editorMenu = new Editor.Menu( menuTmpl, event.sender );
	x = Math.floor( x );
	y = Math.floor( y );
	editorMenu.nativeMenu.popup( Electron.BrowserWindow.fromWebContents( event.sender ), x, y );
	editorMenu.dispose();
}
index.messages[ 'import-asset' ] =  ( event, path ) =>
{
	Editor.log( '[ConsoleRx] Start Import assets...' )
	// Editor.assetdb.refresh( path, ( err, results ) =>
	// {
	// 	if ( err ) { Editor.assetdb.error( '[langs] Failed to reimport asset %s, %s', path, err.stack ); return; }
	// 	Editor.assetdb._handleRefreshResults( results );
	//
	// 	let metaPath = path + '.meta';
	// 	if ( Fs.existsSync( Editor.url( metaPath ) ) )
	// 	{
	// 		let meta = Fs.readJsonSync( Editor.url( metaPath ) );
	// 		meta.isPlugin = true;
	// 		Fs.outputJsonSync( Editor.url( metaPath ), meta );
	// 		Editor.log( '[langs.IDE] Import Asset success: ' + metaPath )
	// 	}
	// 	else
	// 	{
	// 		Editor.log( '[langs] Failed to set language data file to plugin script' );
	// 		return;
	// 	}
	// } );
};



module.exports = index;
