import { IDataObject } from 'n8n-workflow';

export interface ChartConfig {
	type: 'line' | 'bar' | 'pie' | 'scatter' | 'doughnut';
	title: string;
	data: any;
	options?: any;
}

export interface VisualizationOutput {
	charts: Array<{
		id: string;
		title: string;
		type: string;
		base64Image: string;
		config: ChartConfig;
	}>;
	summary: {
		totalCharts: number;
		chartTypes: string[];
	};
}

export class VisualizationGenerator {
	constructor() {
		// Simplified visualization generator without Chart.js dependency
	}

	/**
	 * Generate charts based on analysis results
	 */
	async generateCharts(
		analysisResult: IDataObject,
		resource: string,
		operation: string
	): Promise<VisualizationOutput> {
		const charts: VisualizationOutput['charts'] = [];

		try {
			switch (resource) {
				case 'tradingAnalysis':
					charts.push(...await this.generateTradingAnalysisCharts(analysisResult, operation));
					break;
				case 'riskAssessment':
					charts.push(...await this.generateRiskAssessmentCharts(analysisResult, operation));
					break;
				case 'performanceMetrics':
					charts.push(...await this.generatePerformanceCharts(analysisResult, operation));
					break;
				case 'marketAnalysis':
					charts.push(...await this.generateMarketAnalysisCharts(analysisResult, operation));
					break;
				case 'predictiveModels':
					charts.push(...await this.generatePredictiveCharts(analysisResult, operation));
					break;
				case 'portfolioOptimization':
					charts.push(...await this.generatePortfolioCharts(analysisResult, operation));
					break;
			}
		} catch (error) {
			console.error('Error generating charts:', error);
		}

		return {
			charts,
			summary: {
				totalCharts: charts.length,
				chartTypes: [...new Set(charts.map(chart => chart.type))],
			},
		};
	}

	/**
	 * Generate charts for trading analysis
	 */
	private async generateTradingAnalysisCharts(
		analysisResult: IDataObject,
		operation: string
	): Promise<VisualizationOutput['charts']> {
		const charts: VisualizationOutput['charts'] = [];

		switch (operation) {
			case 'profitLossAnalysis':
				if (analysisResult.symbolBreakdown) {
					charts.push(await this.createSymbolProfitChart(analysisResult.symbolBreakdown as Record<string, any>));
				}
				if (analysisResult.summary) {
					charts.push(await this.createProfitDistributionChart(analysisResult.summary as any));
				}
				break;

			case 'patternRecognition':
				if (analysisResult.temporalPatterns?.hourlyDistribution) {
					charts.push(await this.createHourlyDistributionChart(analysisResult.temporalPatterns.hourlyDistribution as Record<string, number>));
				}
				if (analysisResult.temporalPatterns?.dailyDistribution) {
					charts.push(await this.createDailyDistributionChart(analysisResult.temporalPatterns.dailyDistribution as Record<string, number>));
				}
				break;

			case 'positionAnalysis':
				if (analysisResult.openPositions?.symbolBreakdown) {
					charts.push(await this.createPositionExposureChart(analysisResult.openPositions.symbolBreakdown as Record<string, any>));
				}
				break;

			case 'tradeEfficiency':
				if (analysisResult.efficiency?.bySymbol) {
					charts.push(await this.createEfficiencyBySymbolChart(analysisResult.efficiency.bySymbol as Record<string, number>));
				}
				break;
		}

		return charts;
	}

	/**
	 * Generate charts for risk assessment
	 */
	private async generateRiskAssessmentCharts(
		analysisResult: IDataObject,
		operation: string
	): Promise<VisualizationOutput['charts']> {
		const charts: VisualizationOutput['charts'] = [];

		switch (operation) {
			case 'valueAtRisk':
				if (analysisResult.statistics) {
					charts.push(await this.createVaRChart(analysisResult as any));
				}
				break;

			case 'riskMetrics':
				if (analysisResult.riskAdjustedReturns) {
					charts.push(await this.createRiskMetricsChart(analysisResult.riskAdjustedReturns as any));
				}
				break;

			case 'stressTesting':
				if (analysisResult.scenarios) {
					charts.push(await this.createStressTestChart(analysisResult.scenarios as Record<string, any>));
				}
				break;
		}

		return charts;
	}

	/**
	 * Generate charts for performance metrics
	 */
	private async generatePerformanceCharts(
		analysisResult: IDataObject,
		operation: string
	): Promise<VisualizationOutput['charts']> {
		const charts: VisualizationOutput['charts'] = [];

		switch (operation) {
			case 'returnAnalysis':
				if (analysisResult.timeSeries?.cumulativeReturns) {
					charts.push(await this.createCumulativeReturnsChart(analysisResult.timeSeries.cumulativeReturns as any[]));
				}
				break;

			case 'sharpeRatio':
				if (analysisResult.rollingSharpe) {
					charts.push(await this.createRollingSharpeChart(analysisResult.rollingSharpe as any[]));
				}
				break;

			case 'maxDrawdown':
				if (analysisResult.drawdownPeriod) {
					charts.push(await this.createDrawdownChart(analysisResult as any));
				}
				break;
		}

		return charts;
	}

	/**
	 * Generate charts for market analysis
	 */
	private async generateMarketAnalysisCharts(
		analysisResult: IDataObject,
		operation: string
	): Promise<VisualizationOutput['charts']> {
		const charts: VisualizationOutput['charts'] = [];

		switch (operation) {
			case 'correlationAnalysis':
				if (analysisResult.correlationMatrix) {
					charts.push(await this.createCorrelationHeatmap(analysisResult.correlationMatrix as Record<string, Record<string, number>>));
				}
				break;

			case 'volatilityAnalysis':
				if (analysisResult.timeSeries?.rollingVolatility) {
					charts.push(await this.createVolatilityChart(analysisResult.timeSeries.rollingVolatility as any[]));
				}
				break;
		}

		return charts;
	}

	/**
	 * Generate charts for predictive models
	 */
	private async generatePredictiveCharts(
		analysisResult: IDataObject,
		operation: string
	): Promise<VisualizationOutput['charts']> {
		const charts: VisualizationOutput['charts'] = [];

		// Add predictive chart generation logic here
		// This would depend on the specific predictive model outputs

		return charts;
	}

	/**
	 * Generate charts for portfolio optimization
	 */
	private async generatePortfolioCharts(
		analysisResult: IDataObject,
		operation: string
	): Promise<VisualizationOutput['charts']> {
		const charts: VisualizationOutput['charts'] = [];

		// Add portfolio optimization chart generation logic here
		// This would depend on the specific optimization outputs

		return charts;
	}

	/**
	 * Create symbol profit breakdown chart
	 */
	private async createSymbolProfitChart(symbolBreakdown: Record<string, any>): Promise<VisualizationOutput['charts'][0]> {
		const symbols = Object.keys(symbolBreakdown);
		const profits = symbols.map(symbol => symbolBreakdown[symbol].totalProfit);
		const colors = this.generateColors(symbols.length);

		const config: ChartConfig = {
			type: 'bar',
			title: 'Profit by Symbol',
			data: {
				labels: symbols,
				datasets: [{
					label: 'Total Profit',
					data: profits,
					backgroundColor: colors,
					borderColor: colors.map(color => color.replace('0.6', '1')),
					borderWidth: 1,
				}],
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Profit by Symbol',
					},
					legend: {
						display: false,
					},
				},
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'Profit',
						},
					},
					x: {
						title: {
							display: true,
							text: 'Symbol',
						},
					},
				},
			},
		};

		const base64Image = await this.renderChart(config);

		return {
			id: 'symbol-profit',
			title: 'Profit by Symbol',
			type: 'bar',
			base64Image,
			config,
		};
	}

	/**
	 * Create profit distribution chart
	 */
	private async createProfitDistributionChart(summary: any): Promise<VisualizationOutput['charts'][0]> {
		const config: ChartConfig = {
			type: 'pie',
			title: 'Win/Loss Distribution',
			data: {
				labels: ['Winning Trades', 'Losing Trades'],
				datasets: [{
					data: [summary.winRate, 100 - summary.winRate],
					backgroundColor: ['#4CAF50', '#F44336'],
					borderWidth: 2,
				}],
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Win/Loss Distribution',
					},
					legend: {
						position: 'bottom',
					},
				},
			},
		};

		const base64Image = await this.renderChart(config);

		return {
			id: 'profit-distribution',
			title: 'Win/Loss Distribution',
			type: 'pie',
			base64Image,
			config,
		};
	}

	/**
	 * Create hourly distribution chart
	 */
	private async createHourlyDistributionChart(hourlyData: Record<string, number>): Promise<VisualizationOutput['charts'][0]> {
		const hours = Object.keys(hourlyData).sort((a, b) => parseInt(a) - parseInt(b));
		const counts = hours.map(hour => hourlyData[hour]);

		const config: ChartConfig = {
			type: 'line',
			title: 'Trading Activity by Hour',
			data: {
				labels: hours.map(h => `${h}:00`),
				datasets: [{
					label: 'Number of Trades',
					data: counts,
					borderColor: '#2196F3',
					backgroundColor: 'rgba(33, 150, 243, 0.1)',
					fill: true,
					tension: 0.4,
				}],
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Trading Activity by Hour',
					},
				},
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'Number of Trades',
						},
					},
					x: {
						title: {
							display: true,
							text: 'Hour of Day',
						},
					},
				},
			},
		};

		const base64Image = await this.renderChart(config);

		return {
			id: 'hourly-distribution',
			title: 'Trading Activity by Hour',
			type: 'line',
			base64Image,
			config,
		};
	}

	/**
	 * Render chart to base64 image (simplified version)
	 */
	private async renderChart(config: ChartConfig): Promise<string> {
		try {
			// Return chart configuration as JSON string for now
			// In a full implementation, this would render actual charts
			const jsonString = JSON.stringify(config, null, 2);
			return btoa(jsonString); // Use btoa for base64 encoding
		} catch (error) {
			console.error('Error rendering chart:', error);
			return '';
		}
	}

	/**
	 * Generate color palette
	 */
	private generateColors(count: number): string[] {
		const colors = [
			'rgba(255, 99, 132, 0.6)',
			'rgba(54, 162, 235, 0.6)',
			'rgba(255, 205, 86, 0.6)',
			'rgba(75, 192, 192, 0.6)',
			'rgba(153, 102, 255, 0.6)',
			'rgba(255, 159, 64, 0.6)',
			'rgba(199, 199, 199, 0.6)',
			'rgba(83, 102, 255, 0.6)',
		];

		if (count <= colors.length) {
			return colors.slice(0, count);
		}

		// Generate additional colors if needed
		const additionalColors: string[] = [];
		for (let i = colors.length; i < count; i++) {
			const hue = (i * 137.508) % 360; // Golden angle approximation
			additionalColors.push(`hsla(${hue}, 70%, 60%, 0.6)`);
		}

		return [...colors, ...additionalColors];
	}

	/**
	 * Create daily distribution chart
	 */
	private async createDailyDistributionChart(dailyData: Record<string, number>): Promise<VisualizationOutput['charts'][0]> {
		const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
		const counts = days.map(day => dailyData[day] || 0);

		const config: ChartConfig = {
			type: 'bar',
			title: 'Trading Activity by Day of Week',
			data: {
				labels: days,
				datasets: [{
					label: 'Number of Trades',
					data: counts,
					backgroundColor: 'rgba(76, 175, 80, 0.6)',
					borderColor: 'rgba(76, 175, 80, 1)',
					borderWidth: 1,
				}],
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Trading Activity by Day of Week',
					},
				},
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'Number of Trades',
						},
					},
				},
			},
		};

		const base64Image = await this.renderChart(config);

		return {
			id: 'daily-distribution',
			title: 'Trading Activity by Day of Week',
			type: 'bar',
			base64Image,
			config,
		};
	}

	/**
	 * Create position exposure chart
	 */
	private async createPositionExposureChart(symbolBreakdown: Record<string, any>): Promise<VisualizationOutput['charts'][0]> {
		const symbols = Object.keys(symbolBreakdown);
		const exposures = symbols.map(symbol => symbolBreakdown[symbol].exposure);
		const colors = this.generateColors(symbols.length);

		const config: ChartConfig = {
			type: 'doughnut',
			title: 'Position Exposure by Symbol',
			data: {
				labels: symbols,
				datasets: [{
					data: exposures,
					backgroundColor: colors,
					borderWidth: 2,
				}],
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Position Exposure by Symbol',
					},
					legend: {
						position: 'right',
					},
				},
			},
		};

		const base64Image = await this.renderChart(config);

		return {
			id: 'position-exposure',
			title: 'Position Exposure by Symbol',
			type: 'doughnut',
			base64Image,
			config,
		};
	}

	/**
	 * Create efficiency by symbol chart
	 */
	private async createEfficiencyBySymbolChart(efficiencyData: Record<string, number>): Promise<VisualizationOutput['charts'][0]> {
		const symbols = Object.keys(efficiencyData);
		const efficiencies = symbols.map(symbol => efficiencyData[symbol]);
		const colors = efficiencies.map(eff => eff > 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)');

		const config: ChartConfig = {
			type: 'bar',
			title: 'Trading Efficiency by Symbol',
			data: {
				labels: symbols,
				datasets: [{
					label: 'Efficiency Ratio',
					data: efficiencies,
					backgroundColor: colors,
					borderColor: colors.map(color => color.replace('0.6', '1')),
					borderWidth: 1,
				}],
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Trading Efficiency by Symbol',
					},
				},
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'Efficiency Ratio',
						},
					},
				},
			},
		};

		const base64Image = await this.renderChart(config);

		return {
			id: 'efficiency-by-symbol',
			title: 'Trading Efficiency by Symbol',
			type: 'bar',
			base64Image,
			config,
		};
	}

	/**
	 * Create VaR chart
	 */
	private async createVaRChart(varData: any): Promise<VisualizationOutput['charts'][0]> {
		const config: ChartConfig = {
			type: 'bar',
			title: 'Value at Risk Analysis',
			data: {
				labels: ['Historical VaR', 'Parametric VaR', 'Expected Shortfall'],
				datasets: [{
					label: 'Risk Metrics',
					data: [varData.historicalVaR, varData.parametricVaR, varData.expectedShortfall],
					backgroundColor: ['rgba(255, 152, 0, 0.6)', 'rgba(255, 193, 7, 0.6)', 'rgba(244, 67, 54, 0.6)'],
					borderColor: ['rgba(255, 152, 0, 1)', 'rgba(255, 193, 7, 1)', 'rgba(244, 67, 54, 1)'],
					borderWidth: 1,
				}],
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: `Value at Risk Analysis (${varData.confidenceLevel}% Confidence)`,
					},
				},
				scales: {
					y: {
						title: {
							display: true,
							text: 'Risk Value',
						},
					},
				},
			},
		};

		const base64Image = await this.renderChart(config);

		return {
			id: 'var-analysis',
			title: 'Value at Risk Analysis',
			type: 'bar',
			base64Image,
			config,
		};
	}

	/**
	 * Create risk metrics chart
	 */
	private async createRiskMetricsChart(riskMetrics: any): Promise<VisualizationOutput['charts'][0]> {
		const metrics = ['Sharpe Ratio', 'Sortino Ratio', 'Calmar Ratio', 'Information Ratio'];
		const values = [
			riskMetrics.sharpeRatio,
			riskMetrics.sortinoRatio,
			riskMetrics.calmarRatio,
			riskMetrics.informationRatio,
		];

		const config: ChartConfig = {
			type: 'bar',
			title: 'Risk-Adjusted Return Metrics',
			data: {
				labels: metrics,
				datasets: [{
					label: 'Ratio Value',
					data: values,
					backgroundColor: 'rgba(63, 81, 181, 0.6)',
					borderColor: 'rgba(63, 81, 181, 1)',
					borderWidth: 1,
				}],
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Risk-Adjusted Return Metrics',
					},
				},
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'Ratio Value',
						},
					},
				},
			},
		};

		const base64Image = await this.renderChart(config);

		return {
			id: 'risk-metrics',
			title: 'Risk-Adjusted Return Metrics',
			type: 'bar',
			base64Image,
			config,
		};
	}

	/**
	 * Create stress test chart
	 */
	private async createStressTestChart(scenarios: Record<string, any>): Promise<VisualizationOutput['charts'][0]> {
		const scenarioNames = Object.keys(scenarios);
		const losses = scenarioNames.map(name => scenarios[name].totalLoss);

		const config: ChartConfig = {
			type: 'bar',
			title: 'Stress Test Results',
			data: {
				labels: scenarioNames.map(name => name.replace(/([A-Z])/g, ' $1').trim()),
				datasets: [{
					label: 'Total Loss',
					data: losses,
					backgroundColor: 'rgba(244, 67, 54, 0.6)',
					borderColor: 'rgba(244, 67, 54, 1)',
					borderWidth: 1,
				}],
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Stress Test Results',
					},
				},
				scales: {
					y: {
						title: {
							display: true,
							text: 'Loss Amount',
						},
					},
				},
			},
		};

		const base64Image = await this.renderChart(config);

		return {
			id: 'stress-test',
			title: 'Stress Test Results',
			type: 'bar',
			base64Image,
			config,
		};
	}

	/**
	 * Create cumulative returns chart
	 */
	private async createCumulativeReturnsChart(cumulativeReturns: Array<{ index: number; cumulative: number }>): Promise<VisualizationOutput['charts'][0]> {
		const config: ChartConfig = {
			type: 'line',
			title: 'Cumulative Returns',
			data: {
				labels: cumulativeReturns.map(point => point.index.toString()),
				datasets: [{
					label: 'Cumulative Return',
					data: cumulativeReturns.map(point => point.cumulative),
					borderColor: 'rgba(33, 150, 243, 1)',
					backgroundColor: 'rgba(33, 150, 243, 0.1)',
					fill: true,
					tension: 0.1,
				}],
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Cumulative Returns Over Time',
					},
				},
				scales: {
					y: {
						title: {
							display: true,
							text: 'Cumulative Return',
						},
					},
					x: {
						title: {
							display: true,
							text: 'Trade Number',
						},
					},
				},
			},
		};

		const base64Image = await this.renderChart(config);

		return {
			id: 'cumulative-returns',
			title: 'Cumulative Returns',
			type: 'line',
			base64Image,
			config,
		};
	}

	/**
	 * Create rolling Sharpe ratio chart
	 */
	private async createRollingSharpeChart(rollingSharpe: Array<{ index: number; sharpe: number }>): Promise<VisualizationOutput['charts'][0]> {
		const config: ChartConfig = {
			type: 'line',
			title: 'Rolling Sharpe Ratio',
			data: {
				labels: rollingSharpe.map(point => point.index.toString()),
				datasets: [{
					label: 'Sharpe Ratio',
					data: rollingSharpe.map(point => point.sharpe),
					borderColor: 'rgba(156, 39, 176, 1)',
					backgroundColor: 'rgba(156, 39, 176, 0.1)',
					fill: false,
					tension: 0.1,
				}],
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Rolling Sharpe Ratio',
					},
				},
				scales: {
					y: {
						title: {
							display: true,
							text: 'Sharpe Ratio',
						},
					},
					x: {
						title: {
							display: true,
							text: 'Trade Number',
						},
					},
				},
			},
		};

		const base64Image = await this.renderChart(config);

		return {
			id: 'rolling-sharpe',
			title: 'Rolling Sharpe Ratio',
			type: 'line',
			base64Image,
			config,
		};
	}

	/**
	 * Create drawdown chart
	 */
	private async createDrawdownChart(drawdownData: any): Promise<VisualizationOutput['charts'][0]> {
		// This would need the actual drawdown time series data
		// For now, create a simple representation
		const config: ChartConfig = {
			type: 'bar',
			title: 'Maximum Drawdown Analysis',
			data: {
				labels: ['Max Drawdown', 'Average Drawdown'],
				datasets: [{
					label: 'Drawdown %',
					data: [drawdownData.maxDrawdown, drawdownData.statistics?.averageDrawdown || 0],
					backgroundColor: ['rgba(244, 67, 54, 0.6)', 'rgba(255, 152, 0, 0.6)'],
					borderColor: ['rgba(244, 67, 54, 1)', 'rgba(255, 152, 0, 1)'],
					borderWidth: 1,
				}],
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Drawdown Analysis',
					},
				},
				scales: {
					y: {
						title: {
							display: true,
							text: 'Drawdown %',
						},
					},
				},
			},
		};

		const base64Image = await this.renderChart(config);

		return {
			id: 'drawdown-analysis',
			title: 'Maximum Drawdown Analysis',
			type: 'bar',
			base64Image,
			config,
		};
	}

	/**
	 * Create correlation heatmap (simplified as bar chart)
	 */
	private async createCorrelationHeatmap(correlationMatrix: Record<string, Record<string, number>>): Promise<VisualizationOutput['charts'][0]> {
		// Convert correlation matrix to pairs for visualization
		const symbols = Object.keys(correlationMatrix);
		const pairs: Array<{ pair: string; correlation: number }> = [];

		for (let i = 0; i < symbols.length; i++) {
			for (let j = i + 1; j < symbols.length; j++) {
				pairs.push({
					pair: `${symbols[i]}-${symbols[j]}`,
					correlation: correlationMatrix[symbols[i]][symbols[j]],
				});
			}
		}

		// Sort by absolute correlation value
		pairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

		const config: ChartConfig = {
			type: 'bar',
			title: 'Symbol Correlations',
			data: {
				labels: pairs.map(p => p.pair),
				datasets: [{
					label: 'Correlation',
					data: pairs.map(p => p.correlation),
					backgroundColor: pairs.map(p => p.correlation > 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)'),
					borderColor: pairs.map(p => p.correlation > 0 ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)'),
					borderWidth: 1,
				}],
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Symbol Correlations',
					},
				},
				scales: {
					y: {
						min: -1,
						max: 1,
						title: {
							display: true,
							text: 'Correlation Coefficient',
						},
					},
				},
			},
		};

		const base64Image = await this.renderChart(config);

		return {
			id: 'correlation-heatmap',
			title: 'Symbol Correlations',
			type: 'bar',
			base64Image,
			config,
		};
	}

	/**
	 * Create volatility chart
	 */
	private async createVolatilityChart(rollingVolatility: Array<{ index: number; volatility: number }>): Promise<VisualizationOutput['charts'][0]> {
		const config: ChartConfig = {
			type: 'line',
			title: 'Rolling Volatility',
			data: {
				labels: rollingVolatility.map(point => point.index.toString()),
				datasets: [{
					label: 'Volatility',
					data: rollingVolatility.map(point => point.volatility),
					borderColor: 'rgba(255, 87, 34, 1)',
					backgroundColor: 'rgba(255, 87, 34, 0.1)',
					fill: true,
					tension: 0.1,
				}],
			},
			options: {
				responsive: true,
				plugins: {
					title: {
						display: true,
						text: 'Rolling Volatility Over Time',
					},
				},
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'Volatility',
						},
					},
					x: {
						title: {
							display: true,
							text: 'Time Period',
						},
					},
				},
			},
		};

		const base64Image = await this.renderChart(config);

		return {
			id: 'rolling-volatility',
			title: 'Rolling Volatility',
			type: 'line',
			base64Image,
			config,
		};
	}
}
