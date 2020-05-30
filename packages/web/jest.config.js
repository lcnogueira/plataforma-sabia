module.exports = {
	setupFilesAfterEnv: ['./setupTests.js'],
	testPathIgnorePatterns: ['/node_modules/', '/tests/visual/'],
	collectCoverageFrom: ['**/*.js'],
	coveragePathIgnorePatterns: ['/node_modules/', 'config.js', 'server.js'],
	watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};
