"use strict";

import {isString, isFunction, getModuleFromAbsBasePath, showWarning} from "./utils";
import jspmMappingReader from "./jspmMappingReader";

const getOptions = (options) => ({
	loadSjsConfFile: true,
	systemJs: "./jspm_packages/system",
	sjsConfigFile: "./config",
	jspmPackages: "jspm_packages",
	nodeModules: "node_modules",
	...options
});

const loadExistingJestConfig = (basePath, options) => {
	let config = {};

	if (options.jestConfig) {
		if (isString(options.jestConfig)) { //load from file
			config = getModuleFromAbsBasePath(basePath, options.jestConfig);
			config = (isFunction(config) ? config() : config);
		}
		else {
			config = {...options.jestConfig};
		}
	}

	return config;
};

const getModuleMappingsForJspm = (basePath, options) => {
	let mappings = jspmMappingReader(basePath, options);

	if (!mappings) {
		if (options.displayWarnings) {
			showWarning("[jest-jspm]: didn't find any mappings for JSPM!");
		}

		mappings = {};
	}

	mappings["^npm:(.*)"] = `<rootDir>/${options.jspmPackages}/npm/$1`;
	mappings["^github:(.*)"] = `<rootDir>/${options.jspmPackages}/github/$1`;

	return mappings;
};

const getModuleDirectories = (config, options) => {
	const moduleDirectories = config.moduleDirectories || [options.nodeModules];
	return moduleDirectories.concat([`${options.jspmPackages}/npm`, `${options.jspmPackages}/github`]);
};

export default (basePath, options) => {
	options = getOptions(options);

	const config = loadExistingJestConfig(basePath, options);

	config.moduleNameMapper = {...getModuleMappingsForJspm(basePath, options), ...config.moduleNameMapper};
	config.moduleDirectories = getModuleDirectories(config, options);
	config.rootDir = config.rootDir || basePath;

	return config;
};