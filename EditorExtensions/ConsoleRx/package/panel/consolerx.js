'use strict';
const defines = require( Editor.url( 'packages://consolerx/defines' ) );
const manager = require( Editor.url( 'packages://consolerx/panel/manager' ) );
const components =
{
	List:	require( Editor.url( 'packages://consolerx/panel/components/list' ) ),
	Item:	require( Editor.url( 'packages://consolerx/panel/components/item' ) ),
};

const stylesheet = `
@import url('app://bower_components/fontawesome/css/font-awesome.min.css');
#consolerx { display: flex; flex-direction: column; font-family: Monaco, monospace; }
header { display: flex; padding: 4px; position: relative; }
section { flex: 1; border: 1px solid black; box-shadow: inset 0 0 8px 2px rgba(0, 0, 0, 0.2); background: #333; }
ui-checkbox { padding: 3px 4px; }
.collapse { position: absolute; right: 0; }
section { overflow-y: auto; position: relative; }
section .item { color: #999; line-height: 30px; padding: 0 10px; box-sizing: border-box; position: absolute; top: 0; font-size: 12px; width: 100%; -webkit-user-select: initial; overflow-x: scroll; }
section .item[fold] { overflow-x: hidden; }
section .item[texture=light] { background-color: #292929; }
section .item[texture=dark] { background-color: #222; }
section .item[type=log]	{ color: #999; }
section .item[type=error] { color: #DA2121; }
section .item[type=warn] { color: #990; }
section .item[type=info] { color: #09F; }
section .item[type=failed] { color: #DA2121; }
section .item[type=success] { color: #090; }
section .item i { }
section .item i.fold { color: #555; cursor: pointer; padding: 2px; }
section .item i.fa-caret-right { padding: 2px 5px 2px 6px; margin: 0 -2px; }
section div .warp { display: flex; }
section div .text { position: relative; flex: 1; white-space: nowrap; text-overflow: ellipsis; padding-right: 2px; }
section div[fold] .text { overflow: hidden; }
section div .info { margin-left: 25px; }
section div[fold] .info > div { display: none; }
section div .info div { white-space: nowrap; text-overflow: ellipsis; line-height: 26px; font-size: 13px; }
section div .info div pre { margin: 0; display: inline; }
section div[fold] .info div { overflow: hidden; }
section .item[type=error] .info div { color: #A73637; }
section .item:hover { background: #353535; }

label { line-height:23px; font-size:9px; font-family:Monaco; }
#crx_FontFamilies input { font-size:9px!important; font-family:Monaco; }
#consolerx .split { height:20px; margin:2px 0 0 5px; border-right:#999 1px dotted; width:5px; }
#consolerx input { color: #fd942b; background: #09f; font-size:9px; font-family:Monaco; margin: 0; padding: .2em .6em; display: inline-block; outline: 0; border-radius: 3px; border: 1px solid #888; box-shadow: inset 0 0 3px 1px rgba(0, 0, 0, .3); background: #252525 }
#consolerx input:focus { border: 1px solid #fd942b!important; }
#consolerx input:hover { border: 1px solid #bababa; }
#consolerx input:-webkit-input-placeholder { font-style: italic; color: #595959 }
#consolerx .fa { font-size:18px; line-height:24px; margin:0px 5px 0px 6px; }
`;

const uiTemplate =`
<div id="consolerx" class="fit">

	<header>
		<ui-button class="red small transparent" v-on:confirm="onClear"><i class="icon-block"></i></ui-button>
		<ui-button id="openLogBtn" class="small transparent" v-on:click="onPopup"><i class="icon-doc-text"></i></ui-button>
		<ui-input v-on:change="onFilterText"></ui-input>
		<ui-checkbox v-on:confirm="onFilterRegex">Regex</ui-checkbox>
		<ui-select v-on:confirm="onFilterType">
			<option value="">All</option>
			<option value="log">Log</option>
			<option value="success">Success</option>
			<option value="failed">Failed</option>
			<option value="info">Info</option>
			<option value="warn">Warn</option>
			<option value="error">Error</option>
		</ui-select>
		
		<ui-checkbox class="collapse" v-on:confirm="onCollapse" checked>Collapse</ui-checkbox>
	</header>
	<header>
		<!--<i class="split">&lt;!&ndash;split line&ndash;&gt;</i>-->
		<!--------------------------------------------------------------------------------------------------------------->
		<i class="fa fa-text-width"></i>
		<ui-select id="crx_FontSize" v-on:confirm="onFontSizeChanged" v-value="fontsize">
			<option v-for="number in SizesOfFont" value="{{ number }}">{{ number }}</option>
		</ui-select>
		
		<i class="fa fa-arrows-v"></i>
		<ui-select id="crx_LineHeight" v-on:confirm="onLineHeightChanged" v-value="lineheight">
			<option v-for="number in SizesOfLine" value="{{ number }}">{{ number }}</option>
		</ui-select>
		 
		<i class="fa fa-font"></i>
		<input id="crx_FontFamilies" v-model="fontfamilies" v-on:change="onFontFamiliesChanged" style="width:130px" />
		
		<!--------------------------------------------------------------------------------------------------------------->
	</header>
	
	
	<style type="text/css">
		.text span{ font-size: {{ fontsize }}px!important; font-family: {{ fontfamilies }}; }
		section .item { line-height: {{ lineheight }}px!important; }
	</style>
	
	<consolerx-list v-bind:messages="messages"></consolerx-list>
</div>
`;


//Push runtime data to Editor.ConsoleEx.data
let _data =
{
	messages:		[],
	fontsize:		11,
	lineheight:		28,
	fontfamilies:	'Monaco, Droid Sans',

	SizesOfFont:	[],
	SizesOfLine:	[],
};


if( !Editor.ConsoleEx ) Editor.ConsoleEx =
{
	LineHeight:	28,
	CalculateNeedAddLineHeightBy( item )
	{
		return ( item.fold ) ? this.LineHeight : item.rows * 26 + 14;
		//cc.log( 'Editor: fontSize:' + this.data.fontsize );
	},
	CalculateMultiLineHeightBy( source )
	{
		return source.rows * 26 + 14 - this.LineHeight;
	},
	_ProcessProfileBy( profile )
	{

		_data.fontsize		= defines.GetValidNumberBy( profile, 'fontsize', 11 );
		_data.lineheight	= defines.GetValidNumberBy( profile, 'lineheight', 26 );
		_data.fontfamilies	= defines.GetValidStringBy( profile, 'fontfamilies', 'Monaco' );

		Editor.ConsoleEx.LineHeight = _data.lineheight;
	},
};


//push options
for( let idx = 8; idx <= 20; idx++ ) { _data.SizesOfFont.push( idx ); }
for( let idx = 18; idx <= 36; idx++ ) { _data.SizesOfLine.push( idx ); }

let _buildMethods = ( runtime ) =>
{
	let profile = runtime.profiles.project;
	//Editor.log( '[ConsoleRx] profile:' + JSON.stringify( profile.data ) );

	let methods =
	{
		onClear(){ Editor.Ipc.sendToMain( defines.keys.cmds.Clear, '^(?!.*?SyntaxError)', true ); },
		onPopup()
		{
			let rect = runtime.$openLogBtn.getBoundingClientRect();
			Editor.Ipc.sendToPackage( defines.PackageName, 'popup-open-log-menu', rect.left, rect.bottom + 5 );
		},
		onFilterType( event ) { manager.setFilterType( event.target.value ); },
		onCollapse( event ) { manager.setCollapse( event.target.checked ); },
		onFilterRegex( event ) { manager.setFilterRegex( event.target.value ); },
		onFilterText( event ) { manager.setFilterText( event.target.value ); },
		onFontSizeChanged( event )
		{
			let value	= event.target.value;
			let size	=  parseInt( value );
			profile.data['fontsize'] = parseInt( size );
			profile.save();
		},
		onLineHeightChanged( event )
		{
			let value	= event.target.value;
			let size	=  parseInt( value );

			profile.data['lineheight'] = size;
			profile.save();
			Editor.ConsoleEx.LineHeight = size;
			manager.update();
		},
		onFontFamiliesChanged( event )
		{
			let fonts = event.target.value;
			profile.data['fontfamilies'] = fonts;
			profile.save();

			//manager.update();
		},
	};
	return methods;
}




const _DefineOfPanel =
{
	style: stylesheet,
	template: uiTemplate,

	$:{ consolerx: '#consolerx', openLogBtn:  '#openLogBtn' },

	listeners:
	{
		'panel-resize'(){ manager.update(); },
		'panel-show'()	{ manager.update(); }
	},
	messages:
	{
		'editor:console-log'( event, message )		{ manager.addItem( { type: 'log', message: message } ); },
		'editor:console-success'( event, message )	{ manager.addItem( { type: 'success', message: message } ); },
		'editor:console-failed'( event, message )	{ manager.addItem( { type: 'failed', message: message } ); },
		'editor:console-info'( event, message )		{ manager.addItem( { type: 'info', message: message } ); },
		'editor:console-warn'( event, message )		{ manager.addItem( { type: 'warn', message: message } ); },
		'editor:console-error'( event, message )	{ manager.addItem( { type: 'error', message: message } ); },
		'editor:console-clear'( event, pattern, useRegex )
		{
			if ( !pattern ) return manager.clear();

			let filter;
			if ( useRegex )
			{
				try { filter = new RegExp( pattern ); }
				catch ( err ) { filter = new RegExp( '' ); }
			}
			else filter = pattern;

			for ( let i = manager.list.length - 1; i >= 0; i-- )
			{
				let log = manager.list[i];
				if ( useRegex )
				{ if ( filter.exec( log.title ) ) manager.list.splice( i, 1 ); }
				else
				{ if ( log.title.indexOf( filter ) !== -1 ) manager.list.splice( i, 1 ); }
			}

			manager.update();
		},

		'consolerx:query-last-error-log'( event )
		{
			Editor.log( '[ConsoleEx] query last error!' );
			if ( !event.reply ) return;

			let list = manager.list;
			let index = list.length - 1;
			while ( index >= 0 )
			{
				let item = list[index--];
				if ( item.type === 'error' || item.type === 'failed' || item.type === 'warn' ) return event.reply( null, item );
			}

			event.reply( null, undefined );
		}
	},
	ready()
	{
		let buildVue =
		{
			el:         this.$consolerx,
			components:
			{
				'consolerx-list':	components.List,
			},
			data: _data,
			methods: _buildMethods( this ),
		};

		let profile = this.profiles.project;
		Editor.ConsoleEx._ProcessProfileBy( profile );

		//New Vue
		this._vm = new Vue( buildVue );


		// 将显示的数组设置进Manager
		// manager可以直接修改这个数组，更新数据
		manager.setRenderCmds( this._vm.messages );

		Editor.Ipc.sendToMain( defines.keys.editor.ConsoleQuery, ( err, results ) =>{ manager.addItems( results ); } );
	},

	clear()
	{
		manager.clear();
		Editor.Ipc.sendToMain( defines.keys.cmds.Clear );
	}

};



Editor.Panel.extend( _DefineOfPanel );
