import { IDataObject } from 'n8n-workflow';
import * as moment from 'moment';
import { VisualizationOutput } from './VisualizationGenerator';

export interface AnalyticsReport {
	metadata: {
		title: string;
		generatedAt: string;
		reportType: string;
		operation: string;
		version: string;
	};
	executiveSummary: {
		keyFindings: string[];
		recommendations: string[];
		riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
		overallScore: number; // 0-100
	};
	detailedAnalysis: {
		sections: Array<{
			title: string;
			content: string;
			metrics: Record<string, any>;
			insights: string[];
		}>;
	};
	visualizations: {
		chartCount: number;
		chartTypes: string[];
		chartDescriptions: Array<{
			id: string;
			title: string;
			description: string;
		}>;
	};
	appendix: {
		methodology: string;
		limitations: string[];
		dataQuality: {
			score: number;
			issues: string[];
		};
	};
}

export class ReportGenerator {
	/**
	 * Generate comprehensive analysis report
	 */
	async generateReport(
		analysisResult: IDataObject,
		visualizations: VisualizationOutput | undefined,
		resource: string,
		operation: string
	): Promise<AnalyticsReport> {
		const reportTitle = this.generateReportTitle(resource, operation);
		
		return {
			metadata: {
				title: reportTitle,
				generatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
				reportType: resource,
				operation: operation,
				version: '1.0.0',
			},
			executiveSummary: this.generateExecutiveSummary(analysisResult, resource, operation),
			detailedAnalysis: this.generateDetailedAnalysis(analysisResult, resource, operation),
			visualizations: this.generateVisualizationSummary(visualizations),
			appendix: this.generateAppendix(resource, operation),
		};
	}

	/**
	 * Generate report title
	 */
	private generateReportTitle(resource: string, operation: string): string {
		const resourceTitles: Record<string, string> = {
			tradingAnalysis: 'Trading Analysis',
			riskAssessment: 'Risk Assessment',
			performanceMetrics: 'Performance Metrics',
			marketAnalysis: 'Market Analysis',
			predictiveModels: 'Predictive Models',
			portfolioOptimization: 'Portfolio Optimization',
		};

		const operationTitles: Record<string, string> = {
			profitLossAnalysis: 'Profit & Loss Analysis',
			patternRecognition: 'Trading Pattern Recognition',
			positionAnalysis: 'Position Analysis',
			tradeEfficiency: 'Trade Efficiency Analysis',
			valueAtRisk: 'Value at Risk Analysis',
			riskMetrics: 'Risk Metrics Assessment',
			stressTesting: 'Stress Testing',
			riskAlerts: 'Risk Alerts',
			returnAnalysis: 'Return Analysis',
			sharpeRatio: 'Sharpe Ratio Analysis',
			maxDrawdown: 'Maximum Drawdown Analysis',
			benchmarking: 'Performance Benchmarking',
			correlationAnalysis: 'Correlation Analysis',
			volatilityAnalysis: 'Volatility Analysis',
			trendAnalysis: 'Trend Analysis',
			regimeDetection: 'Market Regime Detection',
		};

		const resourceTitle = resourceTitles[resource] || resource;
		const operationTitle = operationTitles[operation] || operation;

		return `${resourceTitle}: ${operationTitle} Report`;
	}

	/**
	 * Generate executive summary
	 */
	private generateExecutiveSummary(
		analysisResult: IDataObject,
		resource: string,
		operation: string
	): AnalyticsReport['executiveSummary'] {
		const keyFindings: string[] = [];
		const recommendations: string[] = [];
		let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
		let overallScore = 50;

		switch (resource) {
			case 'tradingAnalysis':
				return this.generateTradingAnalysisSummary(analysisResult, operation);
			case 'riskAssessment':
				return this.generateRiskAssessmentSummary(analysisResult, operation);
			case 'performanceMetrics':
				return this.generatePerformanceSummary(analysisResult, operation);
			case 'marketAnalysis':
				return this.generateMarketAnalysisSummary(analysisResult, operation);
			default:
				return {
					keyFindings: ['Analysis completed successfully'],
					recommendations: ['Review detailed analysis for insights'],
					riskLevel: 'Medium',
					overallScore: 50,
				};
		}
	}

	/**
	 * Generate trading analysis summary
	 */
	private generateTradingAnalysisSummary(
		analysisResult: IDataObject,
		operation: string
	): AnalyticsReport['executiveSummary'] {
		const keyFindings: string[] = [];
		const recommendations: string[] = [];
		let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
		let overallScore = 50;

		if (operation === 'profitLossAnalysis' && analysisResult.summary) {
			const summary = analysisResult.summary as any;
			
			keyFindings.push(`Total trades analyzed: ${summary.totalTrades}`);
			keyFindings.push(`Win rate: ${summary.winRate?.toFixed(1)}%`);
			keyFindings.push(`Total profit: ${summary.totalProfit?.toFixed(2)}`);
			keyFindings.push(`Profit factor: ${summary.profitFactor?.toFixed(2)}`);

			// Determine risk level and score based on metrics
			if (summary.winRate > 60 && summary.profitFactor > 1.5) {
				riskLevel = 'Low';
				overallScore = 80;
				recommendations.push('Excellent trading performance. Consider scaling up position sizes.');
			} else if (summary.winRate > 50 && summary.profitFactor > 1.0) {
				riskLevel = 'Medium';
				overallScore = 65;
				recommendations.push('Good trading performance. Focus on improving profit factor.');
			} else {
				riskLevel = 'High';
				overallScore = 35;
				recommendations.push('Trading performance needs improvement. Review strategy and risk management.');
			}

			if (summary.profitFactor < 1.0) {
				recommendations.push('Profit factor below 1.0 indicates losses exceed profits. Immediate strategy review required.');
			}
		}

		if (operation === 'patternRecognition' && analysisResult.insights) {
			const insights = analysisResult.insights as string[];
			keyFindings.push(...insights);
			recommendations.push('Use identified patterns to optimize trading schedule and symbol selection.');
		}

		return {
			keyFindings,
			recommendations,
			riskLevel,
			overallScore,
		};
	}

	/**
	 * Generate risk assessment summary
	 */
	private generateRiskAssessmentSummary(
		analysisResult: IDataObject,
		operation: string
	): AnalyticsReport['executiveSummary'] {
		const keyFindings: string[] = [];
		const recommendations: string[] = [];
		let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
		let overallScore = 50;

		if (operation === 'valueAtRisk') {
			const varData = analysisResult as any;
			
			keyFindings.push(`Historical VaR (${varData.confidenceLevel}%): ${varData.historicalVaR?.toFixed(2)}`);
			keyFindings.push(`Expected Shortfall: ${varData.expectedShortfall?.toFixed(2)}`);
			
			const varMagnitude = Math.abs(varData.historicalVaR || 0);
			if (varMagnitude > 1000) {
				riskLevel = 'Critical';
				overallScore = 20;
				recommendations.push('Very high VaR detected. Immediate risk reduction required.');
			} else if (varMagnitude > 500) {
				riskLevel = 'High';
				overallScore = 40;
				recommendations.push('High VaR levels. Consider reducing position sizes.');
			} else {
				riskLevel = 'Medium';
				overallScore = 70;
				recommendations.push('VaR levels are manageable but monitor closely.');
			}
		}

		if (operation === 'riskMetrics' && analysisResult.riskAdjustedReturns) {
			const metrics = analysisResult.riskAdjustedReturns as any;
			
			keyFindings.push(`Sharpe Ratio: ${metrics.sharpeRatio?.toFixed(2)}`);
			keyFindings.push(`Sortino Ratio: ${metrics.sortinoRatio?.toFixed(2)}`);
			
			if (metrics.sharpeRatio > 1.0) {
				recommendations.push('Good risk-adjusted returns. Maintain current strategy.');
			} else {
				recommendations.push('Risk-adjusted returns could be improved. Review risk management.');
			}
		}

		if (operation === 'riskAlerts' && analysisResult.alerts) {
			const alerts = analysisResult.alerts as any[];
			const highSeverityAlerts = alerts.filter(alert => alert.severity === 'high');
			
			if (highSeverityAlerts.length > 0) {
				riskLevel = 'High';
				overallScore = 30;
				keyFindings.push(`${highSeverityAlerts.length} high-severity risk alerts detected`);
				recommendations.push('Address high-severity risk alerts immediately.');
			}
		}

		return {
			keyFindings,
			recommendations,
			riskLevel,
			overallScore,
		};
	}

	/**
	 * Generate performance summary
	 */
	private generatePerformanceSummary(
		analysisResult: IDataObject,
		operation: string
	): AnalyticsReport['executiveSummary'] {
		const keyFindings: string[] = [];
		const recommendations: string[] = [];
		let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
		let overallScore = 50;

		if (operation === 'returnAnalysis' && analysisResult.summary) {
			const summary = analysisResult.summary as any;
			
			keyFindings.push(`Total return: ${summary.totalReturn?.toFixed(2)}`);
			keyFindings.push(`Average return: ${summary.averageReturn?.toFixed(4)}`);
			keyFindings.push(`Return volatility: ${summary.standardDeviation?.toFixed(4)}`);

			if (summary.totalReturn > 0 && summary.averageReturn > 0) {
				overallScore = 70;
				recommendations.push('Positive returns achieved. Monitor consistency.');
			} else {
				overallScore = 30;
				recommendations.push('Negative returns detected. Strategy review recommended.');
			}
		}

		if (operation === 'sharpeRatio') {
			const sharpeData = analysisResult as any;
			
			keyFindings.push(`Sharpe Ratio: ${sharpeData.sharpeRatio?.toFixed(2)}`);
			keyFindings.push(`Interpretation: ${sharpeData.interpretation}`);

			if (sharpeData.sharpeRatio > 1.0) {
				riskLevel = 'Low';
				overallScore = 80;
			} else if (sharpeData.sharpeRatio > 0) {
				riskLevel = 'Medium';
				overallScore = 60;
			} else {
				riskLevel = 'High';
				overallScore = 30;
			}
		}

		if (operation === 'maxDrawdown') {
			const drawdownData = analysisResult as any;
			
			keyFindings.push(`Maximum drawdown: ${drawdownData.maxDrawdown?.toFixed(2)}%`);
			
			if (drawdownData.maxDrawdown > 20) {
				riskLevel = 'High';
				recommendations.push('High drawdown detected. Improve risk management.');
			} else if (drawdownData.maxDrawdown > 10) {
				riskLevel = 'Medium';
				recommendations.push('Moderate drawdown. Monitor risk exposure.');
			} else {
				riskLevel = 'Low';
				recommendations.push('Low drawdown indicates good risk control.');
			}
		}

		return {
			keyFindings,
			recommendations,
			riskLevel,
			overallScore,
		};
	}

	/**
	 * Generate market analysis summary
	 */
	private generateMarketAnalysisSummary(
		analysisResult: IDataObject,
		operation: string
	): AnalyticsReport['executiveSummary'] {
		const keyFindings: string[] = [];
		const recommendations: string[] = [];
		let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
		let overallScore = 50;

		if (operation === 'correlationAnalysis' && analysisResult.summary) {
			const summary = analysisResult.summary as any;
			
			keyFindings.push(`${summary.symbolCount} symbols analyzed`);
			keyFindings.push(`Average correlation: ${summary.averageCorrelation?.toFixed(3)}`);

			if (Math.abs(summary.averageCorrelation) > 0.7) {
				riskLevel = 'High';
				recommendations.push('High correlations detected. Consider diversification.');
			} else {
				riskLevel = 'Medium';
				recommendations.push('Correlation levels are reasonable.');
			}
		}

		if (operation === 'volatilityAnalysis' && analysisResult.overall) {
			const overall = analysisResult.overall as any;
			
			keyFindings.push(`Historical volatility: ${overall.historicalVolatility?.toFixed(4)}`);
			keyFindings.push(`Volatility rank: ${overall.volatilityRank}`);

			if (overall.volatilityRank === 'Very High') {
				riskLevel = 'High';
				recommendations.push('Very high volatility. Reduce position sizes.');
			} else if (overall.volatilityRank === 'High') {
				riskLevel = 'Medium';
				recommendations.push('High volatility detected. Monitor closely.');
			}
		}

		return {
			keyFindings,
			recommendations,
			riskLevel,
			overallScore,
		};
	}

	/**
	 * Generate detailed analysis sections
	 */
	private generateDetailedAnalysis(
		analysisResult: IDataObject,
		resource: string,
		operation: string
	): AnalyticsReport['detailedAnalysis'] {
		const sections: AnalyticsReport['detailedAnalysis']['sections'] = [];

		// Add methodology section
		sections.push({
			title: 'Methodology',
			content: this.getMethodologyDescription(resource, operation),
			metrics: {},
			insights: [],
		});

		// Add results section
		sections.push({
			title: 'Analysis Results',
			content: this.formatAnalysisResults(analysisResult, resource, operation),
			metrics: this.extractKeyMetrics(analysisResult, resource, operation),
			insights: this.extractInsights(analysisResult, resource, operation),
		});

		// Add interpretation section
		sections.push({
			title: 'Interpretation',
			content: this.generateInterpretation(analysisResult, resource, operation),
			metrics: {},
			insights: [],
		});

		return { sections };
	}

	/**
	 * Generate visualization summary
	 */
	private generateVisualizationSummary(
		visualizations: VisualizationOutput | undefined
	): AnalyticsReport['visualizations'] {
		if (!visualizations) {
			return {
				chartCount: 0,
				chartTypes: [],
				chartDescriptions: [],
			};
		}

		return {
			chartCount: visualizations.summary.totalCharts,
			chartTypes: visualizations.summary.chartTypes,
			chartDescriptions: visualizations.charts.map(chart => ({
				id: chart.id,
				title: chart.title,
				description: this.generateChartDescription(chart.id, chart.title, chart.type),
			})),
		};
	}

	/**
	 * Generate appendix
	 */
	private generateAppendix(resource: string, operation: string): AnalyticsReport['appendix'] {
		return {
			methodology: this.getDetailedMethodology(resource, operation),
			limitations: this.getLimitations(resource, operation),
			dataQuality: {
				score: 85, // Default score
				issues: [],
			},
		};
	}

	// Helper methods for content generation
	private getMethodologyDescription(resource: string, operation: string): string {
		const methodologies: Record<string, Record<string, string>> = {
			tradingAnalysis: {
				profitLossAnalysis: 'Analysis of profit and loss patterns using statistical measures including win rate, profit factor, and risk-adjusted returns.',
				patternRecognition: 'Identification of trading patterns through temporal and behavioral analysis of trade execution data.',
			},
			riskAssessment: {
				valueAtRisk: 'Value at Risk calculation using both historical and parametric methods with specified confidence levels.',
				riskMetrics: 'Comprehensive risk assessment using multiple risk-adjusted return metrics including Sharpe, Sortino, and Calmar ratios.',
			},
			performanceMetrics: {
				returnAnalysis: 'Statistical analysis of returns including distribution analysis, cumulative returns, and rolling performance metrics.',
				sharpeRatio: 'Risk-adjusted return analysis using the Sharpe ratio methodology with rolling window calculations.',
			},
		};

		return methodologies[resource]?.[operation] || 'Standard statistical analysis methodology applied to trading data.';
	}

	private formatAnalysisResults(analysisResult: IDataObject, resource: string, operation: string): string {
		// Convert analysis results to formatted text
		return JSON.stringify(analysisResult, null, 2);
	}

	private extractKeyMetrics(analysisResult: IDataObject, resource: string, operation: string): Record<string, any> {
		// Extract key numerical metrics from analysis results
		const metrics: Record<string, any> = {};
		
		if (analysisResult.summary) {
			Object.assign(metrics, analysisResult.summary);
		}
		
		return metrics;
	}

	private extractInsights(analysisResult: IDataObject, resource: string, operation: string): string[] {
		const insights: string[] = [];
		
		if (analysisResult.insights && Array.isArray(analysisResult.insights)) {
			insights.push(...analysisResult.insights);
		}
		
		return insights;
	}

	private generateInterpretation(analysisResult: IDataObject, resource: string, operation: string): string {
		// Generate interpretation based on analysis results
		return 'Analysis completed. Review key findings and recommendations in the executive summary.';
	}

	private generateChartDescription(id: string, title: string, type: string): string {
		const descriptions: Record<string, string> = {
			'symbol-profit': 'Bar chart showing profit breakdown by trading symbol',
			'profit-distribution': 'Pie chart displaying the distribution of winning vs losing trades',
			'hourly-distribution': 'Line chart showing trading activity patterns by hour of day',
			'daily-distribution': 'Bar chart displaying trading frequency by day of week',
			'position-exposure': 'Doughnut chart showing position exposure distribution by symbol',
			'var-analysis': 'Bar chart comparing different Value at Risk metrics',
			'cumulative-returns': 'Line chart tracking cumulative returns over time',
			'rolling-sharpe': 'Line chart showing rolling Sharpe ratio evolution',
		};

		return descriptions[id] || `${type} chart showing ${title.toLowerCase()}`;
	}

	private getDetailedMethodology(resource: string, operation: string): string {
		return `Detailed methodology for ${resource} - ${operation} analysis. This includes data preprocessing, statistical calculations, and result interpretation guidelines.`;
	}

	private getLimitations(resource: string, operation: string): string[] {
		return [
			'Analysis based on historical data and may not predict future performance',
			'Results are dependent on data quality and completeness',
			'Market conditions may affect the validity of statistical assumptions',
			'Risk metrics are estimates and actual risk may vary',
		];
	}
}
