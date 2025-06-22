// Entry point for n8n community node package
// This file exports all nodes and credentials

module.exports = {
	nodes: [
		'./nodes/MyPetAnalytics/MyPetAnalytics.node.js'
	],
	credentials: [
		'./credentials/MyPetAnalyticsApi.credentials.js'
	]
};
