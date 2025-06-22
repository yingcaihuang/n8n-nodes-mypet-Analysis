import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
	IDataObject,
} from 'n8n-workflow';

import { AnalyticsEngine } from './analytics/AnalyticsEngine';
import { DataProcessor } from './analytics/DataProcessor';
import { VisualizationGenerator } from './analytics/VisualizationGenerator';
import { ReportGenerator } from './analytics/ReportGenerator';

export class MyPetAnalytics implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MyPet Analytics',
		name: 'myPetAnalytics',
		icon: 'file:mypet-analytics.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Advanced analytics and AI-powered insights for MyPet Stocks trading data',
		defaults: {
			name: 'MyPet Analytics',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'myPetAnalyticsApi',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Trading Analysis',
						value: 'tradingAnalysis',
					},
					{
						name: 'Risk Assessment',
						value: 'riskAssessment',
					},
					{
						name: 'Performance Metrics',
						value: 'performanceMetrics',
					},
					{
						name: 'Market Analysis',
						value: 'marketAnalysis',
					},
					{
						name: 'Predictive Models',
						value: 'predictiveModels',
					},
					{
						name: 'Portfolio Optimization',
						value: 'portfolioOptimization',
					},
				],
				default: 'tradingAnalysis',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['tradingAnalysis'],
					},
				},
				options: [
					{
						name: 'Profit & Loss Analysis',
						value: 'profitLossAnalysis',
						description: 'Analyze profit and loss patterns across trades',
						action: 'Analyze profit and loss patterns',
					},
					{
						name: 'Trading Pattern Recognition',
						value: 'patternRecognition',
						description: 'Identify trading patterns and behaviors',
						action: 'Recognize trading patterns',
					},
					{
						name: 'Position Analysis',
						value: 'positionAnalysis',
						description: 'Analyze position sizing and holding periods',
						action: 'Analyze trading positions',
					},
					{
						name: 'Trade Efficiency Analysis',
						value: 'tradeEfficiency',
						description: 'Evaluate trade execution efficiency',
						action: 'Analyze trade efficiency',
					},
				],
				default: 'profitLossAnalysis',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['riskAssessment'],
					},
				},
				options: [
					{
						name: 'Value at Risk (VaR)',
						value: 'valueAtRisk',
						description: 'Calculate Value at Risk metrics',
						action: 'Calculate Value at Risk',
					},
					{
						name: 'Risk Metrics',
						value: 'riskMetrics',
						description: 'Calculate comprehensive risk metrics',
						action: 'Calculate risk metrics',
					},
					{
						name: 'Stress Testing',
						value: 'stressTesting',
						description: 'Perform portfolio stress testing',
						action: 'Perform stress testing',
					},
					{
						name: 'Risk Alerts',
						value: 'riskAlerts',
						description: 'Generate risk-based alerts and warnings',
						action: 'Generate risk alerts',
					},
				],
				default: 'valueAtRisk',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['performanceMetrics'],
					},
				},
				options: [
					{
						name: 'Return Analysis',
						value: 'returnAnalysis',
						description: 'Calculate various return metrics',
						action: 'Analyze returns',
					},
					{
						name: 'Sharpe Ratio',
						value: 'sharpeRatio',
						description: 'Calculate risk-adjusted returns',
						action: 'Calculate Sharpe ratio',
					},
					{
						name: 'Maximum Drawdown',
						value: 'maxDrawdown',
						description: 'Calculate maximum drawdown metrics',
						action: 'Calculate maximum drawdown',
					},
					{
						name: 'Performance Benchmarking',
						value: 'benchmarking',
						description: 'Compare performance against benchmarks',
						action: 'Benchmark performance',
					},
				],
				default: 'returnAnalysis',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['marketAnalysis'],
					},
				},
				options: [
					{
						name: 'Correlation Analysis',
						value: 'correlationAnalysis',
						description: 'Analyze correlations between instruments',
						action: 'Analyze correlations',
					},
					{
						name: 'Volatility Analysis',
						value: 'volatilityAnalysis',
						description: 'Analyze market volatility patterns',
						action: 'Analyze volatility',
					},
					{
						name: 'Trend Analysis',
						value: 'trendAnalysis',
						description: 'Identify and analyze market trends',
						action: 'Analyze trends',
					},
					{
						name: 'Market Regime Detection',
						value: 'regimeDetection',
						description: 'Detect market regime changes',
						action: 'Detect market regimes',
					},
				],
				default: 'correlationAnalysis',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['predictiveModels'],
					},
				},
				options: [
					{
						name: 'Price Prediction',
						value: 'pricePrediction',
						description: 'Predict future price movements',
						action: 'Predict prices',
					},
					{
						name: 'Risk Prediction',
						value: 'riskPrediction',
						description: 'Predict future risk levels',
						action: 'Predict risks',
					},
					{
						name: 'Signal Generation',
						value: 'signalGeneration',
						description: 'Generate trading signals',
						action: 'Generate signals',
					},
					{
						name: 'Anomaly Detection',
						value: 'anomalyDetection',
						description: 'Detect anomalous trading patterns',
						action: 'Detect anomalies',
					},
				],
				default: 'pricePrediction',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['portfolioOptimization'],
					},
				},
				options: [
					{
						name: 'Portfolio Allocation',
						value: 'portfolioAllocation',
						description: 'Optimize portfolio allocation',
						action: 'Optimize allocation',
					},
					{
						name: 'Risk Budgeting',
						value: 'riskBudgeting',
						description: 'Optimize risk budget allocation',
						action: 'Budget risk',
					},
					{
						name: 'Rebalancing Strategy',
						value: 'rebalancingStrategy',
						description: 'Generate rebalancing recommendations',
						action: 'Generate rebalancing strategy',
					},
				],
				default: 'portfolioAllocation',
			},
			// Common parameters
			{
				displayName: 'Data Source',
				name: 'dataSource',
				type: 'options',
				options: [
					{
						name: 'Input Data (from previous node)',
						value: 'input',
					},
					{
						name: 'MyPet Stocks API',
						value: 'api',
					},
				],
				default: 'input',
				description: 'Source of trading data for analysis',
			},
			{
				displayName: 'Time Period',
				name: 'timePeriod',
				type: 'options',
				options: [
					{
						name: 'Last 7 Days',
						value: '7d',
					},
					{
						name: 'Last 30 Days',
						value: '30d',
					},
					{
						name: 'Last 90 Days',
						value: '90d',
					},
					{
						name: 'Last 1 Year',
						value: '1y',
					},
					{
						name: 'All Available Data',
						value: 'all',
					},
					{
						name: 'Custom Range',
						value: 'custom',
					},
				],
				default: '30d',
				description: 'Time period for analysis',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'string',
				default: '',
				placeholder: '2025-01-01',
				description: 'Start date for custom time range (YYYY-MM-DD)',
				displayOptions: {
					show: {
						timePeriod: ['custom'],
					},
				},
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'string',
				default: '',
				placeholder: '2025-12-31',
				description: 'End date for custom time range (YYYY-MM-DD)',
				displayOptions: {
					show: {
						timePeriod: ['custom'],
					},
				},
			},
			{
				displayName: 'Include Visualization',
				name: 'includeVisualization',
				type: 'boolean',
				default: true,
				description: 'Whether to generate charts and visualizations',
			},
			{
				displayName: 'Generate Report',
				name: 'generateReport',
				type: 'boolean',
				default: true,
				description: 'Whether to generate a comprehensive analysis report',
			},
			{
				displayName: 'Confidence Level (%)',
				name: 'confidenceLevel',
				type: 'number',
				default: 95,
				description: 'Confidence level for statistical calculations (e.g., VaR)',
				displayOptions: {
					show: {
						resource: ['riskAssessment'],
					},
				},
			},
			{
				displayName: 'Prediction Horizon (Days)',
				name: 'predictionHorizon',
				type: 'number',
				default: 30,
				description: 'Number of days to predict into the future',
				displayOptions: {
					show: {
						resource: ['predictiveModels'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const dataSource = this.getNodeParameter('dataSource', 0) as string;
		const timePeriod = this.getNodeParameter('timePeriod', 0) as string;
		const includeVisualization = this.getNodeParameter('includeVisualization', 0) as boolean;
		const generateReport = this.getNodeParameter('generateReport', 0) as boolean;

		for (let i = 0; i < items.length; i++) {
			try {
				// Initialize analytics components
				const dataProcessor = new DataProcessor();
				const analyticsEngine = new AnalyticsEngine();
				const visualizationGenerator = new VisualizationGenerator();
				const reportGenerator = new ReportGenerator();

				// Process input data
				let processedData;
				if (dataSource === 'input') {
					processedData = await dataProcessor.processInputData(items[i].json);
				} else {
					// TODO: Implement API data fetching
					throw new NodeOperationError(
						this.getNode(),
						'API data source not yet implemented',
						{ itemIndex: i }
					);
				}

				// Apply time period filter
				const filteredData = dataProcessor.filterByTimePeriod(processedData, timePeriod, {
					startDate: this.getNodeParameter('startDate', i, '') as string,
					endDate: this.getNodeParameter('endDate', i, '') as string,
				});

				// Perform analysis based on resource and operation
				let analysisResult;
				switch (resource) {
					case 'tradingAnalysis':
						analysisResult = await this.performTradingAnalysis(
							analyticsEngine,
							filteredData,
							operation,
							i
						);
						break;
					case 'riskAssessment':
						analysisResult = await this.performRiskAssessment(
							analyticsEngine,
							filteredData,
							operation,
							i
						);
						break;
					case 'performanceMetrics':
						analysisResult = await this.performPerformanceAnalysis(
							analyticsEngine,
							filteredData,
							operation,
							i
						);
						break;
					case 'marketAnalysis':
						analysisResult = await this.performMarketAnalysis(
							analyticsEngine,
							filteredData,
							operation,
							i
						);
						break;
					case 'predictiveModels':
						analysisResult = await this.performPredictiveAnalysis(
							analyticsEngine,
							filteredData,
							operation,
							i
						);
						break;
					case 'portfolioOptimization':
						analysisResult = await this.performPortfolioOptimization(
							analyticsEngine,
							filteredData,
							operation,
							i
						);
						break;
					default:
						throw new NodeOperationError(
							this.getNode(),
							`Unknown resource: ${resource}`,
							{ itemIndex: i }
						);
				}

				// Generate visualizations if requested
				let visualizations;
				if (includeVisualization) {
					visualizations = await visualizationGenerator.generateCharts(
						analysisResult,
						resource,
						operation
					);
				}

				// Generate report if requested
				let report;
				if (generateReport) {
					report = await reportGenerator.generateReport(
						analysisResult,
						visualizations,
						resource,
						operation
					);
				}

				// Prepare output data
				const outputData: IDataObject = {
					resource,
					operation,
					timePeriod,
					dataPoints: filteredData.length,
					analysis: analysisResult,
					...(visualizations && { visualizations }),
					...(report && { report }),
					metadata: {
						processedAt: new Date().toISOString(),
						version: '1.0.0',
						nodeVersion: this.description.version,
					},
				};

				returnData.push({
					json: outputData,
					pairedItem: { item: i },
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}

	private async performTradingAnalysis(
		engine: AnalyticsEngine,
		data: any[],
		operation: string,
		itemIndex: number
	): Promise<IDataObject> {
		switch (operation) {
			case 'profitLossAnalysis':
				return engine.analyzeProfitLoss(data);
			case 'patternRecognition':
				return engine.recognizePatterns(data);
			case 'positionAnalysis':
				return engine.analyzePositions(data);
			case 'tradeEfficiency':
				return engine.analyzeTradeEfficiency(data);
			default:
				throw new NodeOperationError(
					this.getNode(),
					`Unknown trading analysis operation: ${operation}`,
					{ itemIndex }
				);
		}
	}

	private async performRiskAssessment(
		engine: AnalyticsEngine,
		data: any[],
		operation: string,
		itemIndex: number
	): Promise<IDataObject> {
		const confidenceLevel = this.getNodeParameter('confidenceLevel', itemIndex) as number;
		
		switch (operation) {
			case 'valueAtRisk':
				return engine.calculateVaR(data, confidenceLevel);
			case 'riskMetrics':
				return engine.calculateRiskMetrics(data);
			case 'stressTesting':
				return engine.performStressTesting(data);
			case 'riskAlerts':
				return engine.generateRiskAlerts(data);
			default:
				throw new NodeOperationError(
					this.getNode(),
					`Unknown risk assessment operation: ${operation}`,
					{ itemIndex }
				);
		}
	}

	private async performPerformanceAnalysis(
		engine: AnalyticsEngine,
		data: any[],
		operation: string,
		itemIndex: number
	): Promise<IDataObject> {
		switch (operation) {
			case 'returnAnalysis':
				return engine.analyzeReturns(data);
			case 'sharpeRatio':
				return engine.calculateSharpeRatio(data);
			case 'maxDrawdown':
				return engine.calculateMaxDrawdown(data);
			case 'benchmarking':
				return engine.performBenchmarking(data);
			default:
				throw new NodeOperationError(
					this.getNode(),
					`Unknown performance analysis operation: ${operation}`,
					{ itemIndex }
				);
		}
	}

	private async performMarketAnalysis(
		engine: AnalyticsEngine,
		data: any[],
		operation: string,
		itemIndex: number
	): Promise<IDataObject> {
		switch (operation) {
			case 'correlationAnalysis':
				return engine.analyzeCorrelations(data);
			case 'volatilityAnalysis':
				return engine.analyzeVolatility(data);
			case 'trendAnalysis':
				return engine.analyzeTrends(data);
			case 'regimeDetection':
				return engine.detectRegimes(data);
			default:
				throw new NodeOperationError(
					this.getNode(),
					`Unknown market analysis operation: ${operation}`,
					{ itemIndex }
				);
		}
	}

	private async performPredictiveAnalysis(
		engine: AnalyticsEngine,
		data: any[],
		operation: string,
		itemIndex: number
	): Promise<IDataObject> {
		const predictionHorizon = this.getNodeParameter('predictionHorizon', itemIndex) as number;
		
		switch (operation) {
			case 'pricePrediction':
				return engine.predictPrices(data, predictionHorizon);
			case 'riskPrediction':
				return engine.predictRisk(data, predictionHorizon);
			case 'signalGeneration':
				return engine.generateSignals(data);
			case 'anomalyDetection':
				return engine.detectAnomalies(data);
			default:
				throw new NodeOperationError(
					this.getNode(),
					`Unknown predictive analysis operation: ${operation}`,
					{ itemIndex }
				);
		}
	}

	private async performPortfolioOptimization(
		engine: AnalyticsEngine,
		data: any[],
		operation: string,
		itemIndex: number
	): Promise<IDataObject> {
		switch (operation) {
			case 'portfolioAllocation':
				return engine.optimizeAllocation(data);
			case 'riskBudgeting':
				return engine.optimizeRiskBudget(data);
			case 'rebalancingStrategy':
				return engine.generateRebalancingStrategy(data);
			default:
				throw new NodeOperationError(
					this.getNode(),
					`Unknown portfolio optimization operation: ${operation}`,
					{ itemIndex }
				);
		}
	}
}
