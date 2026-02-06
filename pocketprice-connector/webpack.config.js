const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );
const CopyPlugin = require( 'copy-webpack-plugin' );

module.exports = {
	...defaultConfig,
	entry: {
		'blocks/service-single/index': path.resolve(
			__dirname,
			'src/blocks/service-single/index.js'
		),
		'blocks/service-category/index': path.resolve(
			__dirname,
			'src/blocks/service-category/index.js'
		),
		'blocks/service-collection/index': path.resolve(
			__dirname,
			'src/blocks/service-collection/index.js'
		),
	},
	output: {
		...defaultConfig.output,
		path: path.resolve( __dirname, 'build' ),
	},
	plugins: [
		...( defaultConfig.plugins || [] ),
		new CopyPlugin( {
			patterns: [
				{
					from: 'src/blocks/*/block.json',
					to( { absoluteFilename } ) {
						const relative = path.relative(
							path.resolve( __dirname, 'src' ),
							absoluteFilename
						);
						return path.resolve( __dirname, 'build', relative );
					},
				},
				{
					from: 'src/blocks/*/render.php',
					to( { absoluteFilename } ) {
						const relative = path.relative(
							path.resolve( __dirname, 'src' ),
							absoluteFilename
						);
						return path.resolve( __dirname, 'build', relative );
					},
				},
			],
		} ),
	],
};
