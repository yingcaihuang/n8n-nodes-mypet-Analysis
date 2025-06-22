"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyPetAnalyticsApi = void 0;

class MyPetAnalyticsApi {
    constructor() {
        this.name = 'myPetAnalyticsApi';
        this.displayName = 'MyPet Analytics API';
        this.documentationUrl = 'https://github.com/yingcaihuang/n8n-nodes-mypet-analytics';
        this.properties = [
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
        ];
        
        // Authentication is optional for this analytics node
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    'X-API-Key': '={{$credentials.apiKey}}',
                },
            },
        };

        // Test credentials if API is enabled
        this.test = {
            request: {
                baseURL: '={{$credentials.baseUrl}}',
                url: '/health',
                method: 'GET',
            },
            rules: [
                {
                    type: 'responseSuccessBody',
                    properties: {
                        message: 'API connection successful',
                        key: 'status',
                        value: 'ok',
                    },
                },
            ],
        };
    }
}

exports.MyPetAnalyticsApi = MyPetAnalyticsApi;
