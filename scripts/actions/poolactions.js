var Reflux = require('reflux');

var ActionCollections = Reflux.createActions([
	'loadPools',
	'createPool',
	'searchPoolList',
	'loadMyPools'
]);

module.exports = ActionCollections;