
module.exports = {
	entry: './scripts/main.js',
	output: {
		filename: "bundle.js",
		path: __dirname + "/dist"
	},
	devServer: {
		contentBase: "./dist",
		watchContentBase: true
	}
}