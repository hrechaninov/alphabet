const path = require("path");

const config = {
	entry: "./src/main.js",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js"
	},
	devServer: {
		contentBase: path.join(__dirname, "dist"),
		overlay: true
	}
};

module.exports = config;