import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MyPetAnalyticsApi implements ICredentialType {
	name = 'myPetAnalyticsApi';
	displayName = 'MyPet Analytics API';
	documentationUrl = 'https://github.com/yingcaihuang/n8n-nodes-mypet-analytics';
	properties: INodeProperties[] = [
		{
			displayName: 'API Configuration',
			name: 'apiConfig',
			type: 'notice',
			default: '',
			description: 'Optional API configuration for enhanced analytics features. Leave empty to use input data only.',
		},
		{
			displayName: 'Enable API Features',
			name: 'enableApi',
			type: 'boolean',
			default: false,
			description: 'Enable additional API-based analytics features',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for enhanced analytics features (optional)',
			displayOptions: {
				show: {
					enableApi: [true],
				},
			},
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://analytics.mypet.run',
			description: 'Base URL for the analytics API',
			displayOptions: {
				show: {
					enableApi: [true],
				},
			},
		},
		{
			displayName: 'Analytics Settings',
			name: 'analyticsSettings',
			type: 'collection',
			placeholder: 'Add Setting',
			default: {},
			options: [
				{
					displayName: 'Cache Results',
					name: 'cacheResults',
					type: 'boolean',
					default: true,
					description: 'Cache analysis results for improved performance',
				},
				{
					displayName: 'High Precision Mode',
					name: 'highPrecision',
					type: 'boolean',
					default: false,
					description: 'Use high precision calculations (slower but more accurate)',
				},
				{
					displayName: 'Include Debug Info',
					name: 'includeDebug',
					type: 'boolean',
					default: false,
					description: 'Include debug information in analysis results',
				},
				{
					displayName: 'Max Data Points',
					name: 'maxDataPoints',
					type: 'number',
					default: 10000,
					description: 'Maximum number of data points to process',
				},
			],
		},
	];

	// Authentication is optional for this analytics node
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	// Test credentials if API is enabled
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/health',
			method: 'GET',
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'status',
					value: 'ok',
				},
			},
		],
	};
}
