let scriptClass = cc.Class(
{
    extends: cc.Component,
	editor:
	{
		executeInEditMode: true,
		menu: 'i18n:Plugins/script@NodeDebugger',
	},
    properties:
    {
		DrawOutline:	{ default:false, notify(){ this.onDebug(); } },
		Color:			{ default:cc.Color.RED, notify(){ this.onDebug(); } },
		LineWidth:		{ default:2, notify(){ this.onDebug(); } },
    },
    onLoad()
    {
    },
	onEnable()
	{
    	let root = this;
    	root.onDebug();
    	root.node.on( 'size-changed', () => { root.onDebug(); } );
	},
	onDisable() { this.cleanup(); },


	cleanup()
	{
		this.node.removeComponent( cc.Graphics );
		this.node.off( 'size-changed' );
	},
	onDebug()
	{
		let root = this;
		let node = root.node;
		if( root.DrawOutline && CC_EDITOR )
		{
			let g = node.getComponent( cc.Graphics );
			if( !g ) g = node.addComponent( cc.Graphics );
			g.lineWidth = root.LineWidth;
			g.strokeColor = root.Color;
			g.clear();
			g.moveTo( 0, 0 );
			g.lineTo( node.width, 0 );
			g.lineTo( node.width, node.height );
			g.lineTo( 0, node.height );
			g.lineTo( 0, 0 );
			g.stroke();

			cc.log( '[Debug] DrawOutline: ' + root.node.name );
		}
		else root.cleanup();
	},
});
module.exports = scriptClass;