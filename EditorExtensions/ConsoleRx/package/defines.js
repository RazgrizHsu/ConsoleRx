let defines =
{
	PackageName:	'consolerx',

	keys:
	{
		msgs:
		{
			Open:			'open',
			OpenLogFile:	'open-log-file',
			PopupLogMenu:	'popup-open-log-menu',
			PopupItemMenu:	'popup-item-menu',
		},
		cmds:
		{
			Clear:				'consolerx:clear',
			QueryLastErrorLog:	'consolerx:query-last-error-log',
		},
		editor:
		{
			ConsoleQuery:	'editor:console-query'
		},
	},
};


defines.OpenLogFileOptions =
[
	{
		label:  Editor.T( 'CONSOLE.editor_log' ),
		params: [],
		click()
		{
			Editor.Ipc.sendToMain( 'consolerx:open-log-file' );
		}
	},
	{
		label:  Editor.T( 'CONSOLE.cocos_console_log' ),
		params: [],
		click()
		{
			Editor.Ipc.sendToMain( 'app:open-cocos-console-log' );
		}
	},
];

defines.GetValidNumberBy = function( profile, key, defaultValue )
{
	let value = profile.data[key];
	if( !value || typeof( value ) !== 'number' )
	{
		value = defaultValue;
		profile.data[key] = value;
		profile.save();
	}
	return value;
},


defines.GetValidStringBy = function( profile, key, defaultValue )
{
	let value = profile.data[key];
	if( !value || typeof( value ) !== 'string' )
	{
		value = defaultValue;
		profile.data[key] = value;
		profile.save();
	}
	return value;
},






//-------------------------------------------------------------------------------------------



module.exports = defines;