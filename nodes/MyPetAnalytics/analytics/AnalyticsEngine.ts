import { IDataObject } from 'n8n-workflow';
import * as ss from 'simple-statistics';
import * as _ from 'lodash';
import { TradeData, AccountData, ProcessedData } from './DataProcessor';

export class AnalyticsEngine {
	/**
	 * Analyze profit and loss patterns
	 */
	async analyzeProfitLoss(data: TradeData[]): Promise<IDataObject> {
		const closedTrades = data.filter(trade => trade.closePrice && trade.profit !== undefined);
		
		if (closedTrades.length === 0) {
			return {
				error: 'No closed trades found for P&L analysis',
				totalTrades: data.length,
			};
		}

		const profits = closedTrades.map(trade => trade.profit || 0);
		const winningTrades = closedTrades.filter(trade => (trade.profit || 0) > 0);
		const losingTrades = closedTrades.filter(trade => (trade.profit || 0) < 0);

		const totalProfit = _.sum(profits);
		const averageProfit = ss.mean(profits);
		const profitStdDev = ss.standardDeviation(profits);
		const winRate = (winningTrades.length / closedTrades.length) * 100;
		const averageWin = winningTrades.length > 0 ? ss.mean(winningTrades.map(t => t.profit || 0)) : 0;
		const averageLoss = losingTrades.length > 0 ? ss.mean(losingTrades.map(t => t.profit || 0)) : 0;
		const profitFactor = averageLoss !== 0 ? Math.abs(averageWin / averageLoss) : 0;

		// Calculate profit distribution by symbol
		const symbolProfits = _(closedTrades)
			.groupBy('symbol')
			.mapValues(trades => ({
				totalProfit: _.sumBy(trades, 'profit'),
				tradeCount: trades.length,
				winRate: (trades.filter(t => (t.profit || 0) > 0).length / trades.length) * 100,
			}))
			.value();

		return {
			summary: {
				totalTrades: closedTrades.length,
				totalProfit,
				averageProfit,
				profitStdDev,
				winRate,
				lossRate: 100 - winRate,
				profitFactor,
			},
			winningTrades: {
				count: winningTrades.length,
				averageWin,
				largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.profit || 0)) : 0,
			},
			losingTrades: {
				count: losingTrades.length,
				averageLoss,
				largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.profit || 0)) : 0,
			},
			symbolBreakdown: symbolProfits,
			riskMetrics: {
				sharpeRatio: profitStdDev !== 0 ? averageProfit / profitStdDev : 0,
				volatility: profitStdDev,
			},
		};
	}

	/**
	 * Recognize trading patterns
	 */
	async recognizePatterns(data: TradeData[]): Promise<IDataObject> {
		// Analyze trading frequency patterns
		const hourlyDistribution = this.analyzeHourlyDistribution(data);
		const dailyDistribution = this.analyzeDailyDistribution(data);
		const symbolFrequency = this.analyzeSymbolFrequency(data);
		const volumePatterns = this.analyzeVolumePatterns(data);
		const holdingPeriods = this.analyzeHoldingPeriods(data);

		return {
			temporalPatterns: {
				hourlyDistribution,
				dailyDistribution,
			},
			tradingBehavior: {
				symbolFrequency,
				volumePatterns,
				holdingPeriods,
			},
			insights: this.generatePatternInsights(data),
		};
	}

	/**
	 * Analyze trading positions
	 */
	async analyzePositions(data: TradeData[]): Promise<IDataObject> {
		const openPositions = data.filter(trade => !trade.closeTime);
		const closedPositions = data.filter(trade => trade.closeTime);

		// Position sizing analysis
		const volumes = data.map(trade => trade.volume);
		const avgVolume = ss.mean(volumes);
		const volumeStdDev = ss.standardDeviation(volumes);

		// Position duration analysis for closed positions
		const durations = closedPositions
			.filter(trade => trade.closeTime)
			.map(trade => {
				const duration = (trade.closeTime!.getTime() - trade.openTime.getTime()) / (1000 * 60 * 60); // hours
				return duration;
			});

		const avgDuration = durations.length > 0 ? ss.mean(durations) : 0;
		const durationStdDev = durations.length > 0 ? ss.standardDeviation(durations) : 0;

		// Risk exposure analysis
		const totalExposure = _.sumBy(openPositions, trade => trade.volume * trade.openPrice);
		const symbolExposure = _(openPositions)
			.groupBy('symbol')
			.mapValues(trades => ({
				volume: _.sumBy(trades, 'volume'),
				exposure: _.sumBy(trades, trade => trade.volume * trade.openPrice),
				count: trades.length,
			}))
			.value();

		return {
			openPositions: {
				count: openPositions.length,
				totalExposure,
				symbolBreakdown: symbolExposure,
			},
			closedPositions: {
				count: closedPositions.length,
				averageDuration: avgDuration,
				durationStdDev,
			},
			positionSizing: {
				averageVolume: avgVolume,
				volumeStdDev,
				minVolume: Math.min(...volumes),
				maxVolume: Math.max(...volumes),
			},
			riskMetrics: {
				concentrationRisk: this.calculateConcentrationRisk(symbolExposure),
				diversificationRatio: Object.keys(symbolExposure).length / openPositions.length,
			},
		};
	}

	/**
	 * Analyze trade execution efficiency
	 */
	async analyzeTradeEfficiency(data: TradeData[]): Promise<IDataObject> {
		const closedTrades = data.filter(trade => trade.closePrice && trade.closeTime);
		
		if (closedTrades.length === 0) {
			return { error: 'No closed trades found for efficiency analysis' };
		}

		// Calculate slippage (difference between expected and actual execution)
		const slippageAnalysis = closedTrades.map(trade => {
			const expectedSpread = 0.0001; // Assume 1 pip spread for major pairs
			const actualSpread = Math.abs(trade.closePrice! - trade.openPrice);
			return {
				symbol: trade.symbol,
				slippage: actualSpread - expectedSpread,
				executionTime: trade.closeTime!.getTime() - trade.openTime.getTime(),
			};
		});

		const avgSlippage = ss.mean(slippageAnalysis.map(s => s.slippage));
		const avgExecutionTime = ss.mean(slippageAnalysis.map(s => s.executionTime)) / 1000; // seconds

		// Commission efficiency
		const totalCommission = _.sumBy(closedTrades, 'commission');
		const totalVolume = _.sumBy(closedTrades, 'volume');
		const avgCommissionPerLot = totalVolume > 0 ? totalCommission / totalVolume : 0;

		// Timing efficiency (how well trades are timed)
		const timingEfficiency = this.calculateTimingEfficiency(closedTrades);

		return {
			executionMetrics: {
				averageSlippage: avgSlippage,
				averageExecutionTime: avgExecutionTime,
				slippageStdDev: ss.standardDeviation(slippageAnalysis.map(s => s.slippage)),
			},
			costAnalysis: {
				totalCommission,
				averageCommissionPerLot: avgCommissionPerLot,
				commissionAsPercentOfProfit: this.calculateCommissionRatio(closedTrades),
			},
			timingAnalysis: timingEfficiency,
			efficiency: {
				overall: this.calculateOverallEfficiency(closedTrades),
				bySymbol: this.calculateEfficiencyBySymbol(closedTrades),
			},
		};
	}

	/**
	 * Calculate Value at Risk (VaR)
	 */
	async calculateVaR(data: TradeData[], confidenceLevel: number = 95): Promise<IDataObject> {
		const closedTrades = data.filter(trade => trade.profit !== undefined);
		
		if (closedTrades.length < 10) {
			return { error: 'Insufficient data for VaR calculation (minimum 10 trades required)' };
		}

		const returns = closedTrades.map(trade => trade.profit || 0);
		const sortedReturns = returns.sort((a, b) => a - b);
		
		// Historical VaR
		const varIndex = Math.floor((100 - confidenceLevel) / 100 * sortedReturns.length);
		const historicalVaR = sortedReturns[varIndex];

		// Parametric VaR (assuming normal distribution)
		const mean = ss.mean(returns);
		const stdDev = ss.standardDeviation(returns);
		const zScore = this.getZScore(confidenceLevel);
		const parametricVaR = mean - (zScore * stdDev);

		// Expected Shortfall (Conditional VaR)
		const tailReturns = sortedReturns.slice(0, varIndex + 1);
		const expectedShortfall = tailReturns.length > 0 ? ss.mean(tailReturns) : 0;

		return {
			confidenceLevel,
			historicalVaR,
			parametricVaR,
			expectedShortfall,
			statistics: {
				mean,
				standardDeviation: stdDev,
				skewness: this.calculateSkewness(returns),
				kurtosis: this.calculateKurtosis(returns),
			},
			riskMetrics: {
				worstCase: Math.min(...returns),
				bestCase: Math.max(...returns),
				volatility: stdDev,
			},
		};
	}

	/**
	 * Calculate comprehensive risk metrics
	 */
	async calculateRiskMetrics(data: TradeData[]): Promise<IDataObject> {
		const closedTrades = data.filter(trade => trade.profit !== undefined);
		const returns = closedTrades.map(trade => trade.profit || 0);
		
		if (returns.length === 0) {
			return { error: 'No profit data available for risk calculation' };
		}

		const mean = ss.mean(returns);
		const stdDev = ss.standardDeviation(returns);
		const downside = returns.filter(r => r < mean);
		const downsideDeviation = downside.length > 0 ? ss.standardDeviation(downside) : 0;

		// Calculate various risk metrics
		const sharpeRatio = stdDev !== 0 ? mean / stdDev : 0;
		const sortinoRatio = downsideDeviation !== 0 ? mean / downsideDeviation : 0;
		const maxDrawdown = this.calculateMaxDrawdownValue(returns);
		const calmarRatio = maxDrawdown !== 0 ? mean / Math.abs(maxDrawdown) : 0;

		// Risk-adjusted returns
		const informationRatio = this.calculateInformationRatio(returns);
		const treynorRatio = this.calculateTreynorRatio(returns);

		return {
			basicMetrics: {
				volatility: stdDev,
				downsideDeviation,
				maxDrawdown,
				skewness: this.calculateSkewness(returns),
				kurtosis: this.calculateKurtosis(returns),
			},
			riskAdjustedReturns: {
				sharpeRatio,
				sortinoRatio,
				calmarRatio,
				informationRatio,
				treynorRatio,
			},
			distributionAnalysis: {
				mean,
				median: ss.median(returns),
				percentiles: {
					p5: ss.quantile(returns, 0.05),
					p25: ss.quantile(returns, 0.25),
					p75: ss.quantile(returns, 0.75),
					p95: ss.quantile(returns, 0.95),
				},
			},
		};
	}

	// Helper methods
	private analyzeHourlyDistribution(data: TradeData[]): Record<string, number> {
		const hourCounts = _.countBy(data, trade => trade.openTime.getHours());
		return hourCounts;
	}

	private analyzeDailyDistribution(data: TradeData[]): Record<string, number> {
		const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		const dayCounts = _.countBy(data, trade => dayNames[trade.openTime.getDay()]);
		return dayCounts;
	}

	private analyzeSymbolFrequency(data: TradeData[]): Record<string, number> {
		return _.countBy(data, 'symbol');
	}

	private analyzeVolumePatterns(data: TradeData[]): IDataObject {
		const volumes = data.map(trade => trade.volume);
		return {
			average: ss.mean(volumes),
			median: ss.median(volumes),
			standardDeviation: ss.standardDeviation(volumes),
			min: Math.min(...volumes),
			max: Math.max(...volumes),
		};
	}

	private analyzeHoldingPeriods(data: TradeData[]): IDataObject {
		const closedTrades = data.filter(trade => trade.closeTime);
		const durations = closedTrades.map(trade => 
			(trade.closeTime!.getTime() - trade.openTime.getTime()) / (1000 * 60 * 60) // hours
		);

		if (durations.length === 0) {
			return { error: 'No closed trades found' };
		}

		return {
			averageHours: ss.mean(durations),
			medianHours: ss.median(durations),
			standardDeviation: ss.standardDeviation(durations),
			minHours: Math.min(...durations),
			maxHours: Math.max(...durations),
		};
	}

	private generatePatternInsights(data: TradeData[]): string[] {
		const insights: string[] = [];
		
		// Add pattern-based insights
		const symbolCounts = _.countBy(data, 'symbol');
		const mostTradedSymbol = _.maxBy(Object.keys(symbolCounts), symbol => symbolCounts[symbol]);
		if (mostTradedSymbol) {
			insights.push(`Most frequently traded symbol: ${mostTradedSymbol} (${symbolCounts[mostTradedSymbol]} trades)`);
		}

		const hourCounts = this.analyzeHourlyDistribution(data);
		const peakHour = _.maxBy(Object.keys(hourCounts), hour => hourCounts[hour]);
		if (peakHour) {
			insights.push(`Peak trading hour: ${peakHour}:00 (${hourCounts[peakHour]} trades)`);
		}

		return insights;
	}

	private calculateConcentrationRisk(symbolExposure: Record<string, any>): number {
		const exposures = Object.values(symbolExposure).map((s: any) => s.exposure);
		const totalExposure = _.sum(exposures);
		
		if (totalExposure === 0) return 0;
		
		// Calculate Herfindahl-Hirschman Index
		const hhi = _.sum(exposures.map(exp => Math.pow(exp / totalExposure, 2)));
		return hhi;
	}

	private calculateTimingEfficiency(trades: TradeData[]): IDataObject {
		// Simplified timing efficiency based on profit per unit time
		const efficiencies = trades.map(trade => {
			const duration = (trade.closeTime!.getTime() - trade.openTime.getTime()) / (1000 * 60 * 60); // hours
			return duration > 0 ? (trade.profit || 0) / duration : 0;
		});

		return {
			averageEfficiency: ss.mean(efficiencies),
			medianEfficiency: ss.median(efficiencies),
			standardDeviation: ss.standardDeviation(efficiencies),
		};
	}

	private calculateOverallEfficiency(trades: TradeData[]): number {
		const totalProfit = _.sumBy(trades, 'profit');
		const totalCommission = _.sumBy(trades, 'commission');
		const netProfit = totalProfit - totalCommission;
		
		return totalCommission > 0 ? netProfit / totalCommission : 0;
	}

	private calculateEfficiencyBySymbol(trades: TradeData[]): Record<string, number> {
		const symbolGroups = _.groupBy(trades, 'symbol');
		
		return _.mapValues(symbolGroups, (symbolTrades) => {
			const totalProfit = _.sumBy(symbolTrades, 'profit');
			const totalCommission = _.sumBy(symbolTrades, 'commission');
			const netProfit = totalProfit - totalCommission;
			
			return totalCommission > 0 ? netProfit / totalCommission : 0;
		});
	}

	private calculateCommissionRatio(trades: TradeData[]): number {
		const totalProfit = _.sumBy(trades, 'profit');
		const totalCommission = _.sumBy(trades, 'commission');
		
		return totalProfit > 0 ? (totalCommission / totalProfit) * 100 : 0;
	}

	private getZScore(confidenceLevel: number): number {
		// Simplified z-score lookup for common confidence levels
		const zScores: Record<number, number> = {
			90: 1.28,
			95: 1.65,
			99: 2.33,
		};
		return zScores[confidenceLevel] || 1.65;
	}

	private calculateSkewness(data: number[]): number {
		if (data.length < 3) return 0;
		
		const mean = ss.mean(data);
		const stdDev = ss.standardDeviation(data);
		const n = data.length;
		
		const skewness = data.reduce((sum, value) => {
			return sum + Math.pow((value - mean) / stdDev, 3);
		}, 0) / n;
		
		return skewness;
	}

	private calculateKurtosis(data: number[]): number {
		if (data.length < 4) return 0;
		
		const mean = ss.mean(data);
		const stdDev = ss.standardDeviation(data);
		const n = data.length;
		
		const kurtosis = data.reduce((sum, value) => {
			return sum + Math.pow((value - mean) / stdDev, 4);
		}, 0) / n - 3; // Excess kurtosis
		
		return kurtosis;
	}

	private calculateMaxDrawdownValue(returns: number[]): number {
		let maxDrawdown = 0;
		let peak = returns[0];

		for (let i = 1; i < returns.length; i++) {
			if (returns[i] > peak) {
				peak = returns[i];
			}
			const drawdown = (peak - returns[i]) / peak;
			if (drawdown > maxDrawdown) {
				maxDrawdown = drawdown;
			}
		}

		return maxDrawdown;
	}

	private calculateSharpeRatioValue(returns: number[]): number {
		const riskFreeRate = 0.02; // Assume 2% annual risk-free rate
		const averageReturn = ss.mean(returns);
		const returnStdDev = ss.standardDeviation(returns);

		return returnStdDev !== 0 ? (averageReturn - riskFreeRate) / returnStdDev : 0;
	}

	private calculateInformationRatio(returns: number[]): number {
		// Simplified calculation - would need benchmark returns for proper calculation
		const mean = ss.mean(returns);
		const stdDev = ss.standardDeviation(returns);
		return stdDev !== 0 ? mean / stdDev : 0;
	}

	private calculateTreynorRatio(returns: number[]): number {
		// Simplified calculation - would need beta for proper calculation
		const mean = ss.mean(returns);
		const riskFreeRate = 0.02; // Assume 2% risk-free rate
		return mean - riskFreeRate; // Simplified without beta
	}

	/**
	 * Perform stress testing on portfolio
	 */
	async performStressTesting(data: TradeData[]): Promise<IDataObject> {
		const closedTrades = data.filter(trade => trade.profit !== undefined);
		const returns = closedTrades.map(trade => trade.profit || 0);

		if (returns.length === 0) {
			return { error: 'No profit data available for stress testing' };
		}

		// Scenario analysis
		const scenarios = {
			marketCrash: this.simulateMarketCrash(returns),
			highVolatility: this.simulateHighVolatility(returns),
			liquidityCrisis: this.simulateLiquidityCrisis(returns),
			interestRateShock: this.simulateInterestRateShock(returns),
		};

		// Monte Carlo simulation
		const monteCarloResults = this.runMonteCarloSimulation(returns, 1000);

		return {
			scenarios,
			monteCarlo: monteCarloResults,
			riskMetrics: {
				worstCaseScenario: Math.min(...Object.values(scenarios).map((s: any) => s.totalLoss)),
				averageStressLoss: ss.mean(Object.values(scenarios).map((s: any) => s.totalLoss)),
				stressVaR: this.calculateStressVaR(scenarios),
			},
		};
	}

	/**
	 * Generate risk alerts
	 */
	async generateRiskAlerts(data: TradeData[]): Promise<IDataObject> {
		const alerts: Array<{ type: string; severity: 'low' | 'medium' | 'high'; message: string; value?: number }> = [];

		// Check for concentration risk
		const symbolExposure = _(data)
			.groupBy('symbol')
			.mapValues((trades: TradeData[]) => _.sumBy(trades, (trade: TradeData) => trade.volume * trade.openPrice))
			.value();

		const totalExposure = _.sum(Object.values(symbolExposure));
		const maxExposure = Math.max(...Object.values(symbolExposure) as number[]);
		const concentrationRatio = totalExposure > 0 ? maxExposure / totalExposure : 0;

		if (concentrationRatio > 0.5) {
			alerts.push({
				type: 'concentration_risk',
				severity: 'high',
				message: `High concentration risk detected: ${(concentrationRatio * 100).toFixed(1)}% of exposure in single symbol`,
				value: concentrationRatio,
			});
		}

		// Check for excessive leverage
		const openPositions = data.filter(trade => !trade.closeTime);
		const totalVolume = _.sumBy(openPositions, 'volume');
		if (totalVolume > 100) { // Arbitrary threshold
			alerts.push({
				type: 'high_leverage',
				severity: 'medium',
				message: `High total volume detected: ${totalVolume.toFixed(2)} lots`,
				value: totalVolume,
			});
		}

		// Check for recent losses
		const recentTrades = data
			.filter(trade => trade.closeTime && trade.profit !== undefined)
			.sort((a, b) => b.closeTime!.getTime() - a.closeTime!.getTime())
			.slice(0, 10);

		const recentLosses = recentTrades.filter(trade => (trade.profit || 0) < 0).length;
		if (recentLosses >= 7) {
			alerts.push({
				type: 'consecutive_losses',
				severity: 'high',
				message: `High number of recent losses: ${recentLosses} out of last 10 trades`,
				value: recentLosses,
			});
		}

		return {
			alerts,
			summary: {
				totalAlerts: alerts.length,
				highSeverity: alerts.filter(a => a.severity === 'high').length,
				mediumSeverity: alerts.filter(a => a.severity === 'medium').length,
				lowSeverity: alerts.filter(a => a.severity === 'low').length,
			},
		};
	}

	/**
	 * Analyze returns
	 */
	async analyzeReturns(data: TradeData[]): Promise<IDataObject> {
		const closedTrades = data.filter(trade => trade.profit !== undefined);
		const returns = closedTrades.map(trade => trade.profit || 0);

		if (returns.length === 0) {
			return { error: 'No profit data available for return analysis' };
		}

		// Calculate various return metrics
		const totalReturn = _.sum(returns);
		const averageReturn = ss.mean(returns);
		const medianReturn = ss.median(returns);
		const returnStdDev = ss.standardDeviation(returns);

		// Calculate cumulative returns
		const cumulativeReturns = this.calculateCumulativeReturns(returns);

		// Calculate rolling returns
		const rollingReturns = this.calculateRollingReturns(returns, 10); // 10-trade rolling window

		// Return distribution analysis
		const positiveReturns = returns.filter(r => r > 0);
		const negativeReturns = returns.filter(r => r < 0);

		return {
			summary: {
				totalReturn,
				averageReturn,
				medianReturn,
				standardDeviation: returnStdDev,
				skewness: this.calculateSkewness(returns),
				kurtosis: this.calculateKurtosis(returns),
			},
			distribution: {
				positiveReturns: {
					count: positiveReturns.length,
					percentage: (positiveReturns.length / returns.length) * 100,
					average: positiveReturns.length > 0 ? ss.mean(positiveReturns) : 0,
				},
				negativeReturns: {
					count: negativeReturns.length,
					percentage: (negativeReturns.length / returns.length) * 100,
					average: negativeReturns.length > 0 ? ss.mean(negativeReturns) : 0,
				},
			},
			timeSeries: {
				cumulativeReturns,
				rollingReturns,
			},
			percentiles: {
				p10: ss.quantile(returns, 0.1),
				p25: ss.quantile(returns, 0.25),
				p50: ss.quantile(returns, 0.5),
				p75: ss.quantile(returns, 0.75),
				p90: ss.quantile(returns, 0.9),
			},
		};
	}

	/**
	 * Calculate Sharpe ratio
	 */
	async calculateSharpeRatio(data: TradeData[]): Promise<IDataObject> {
		const closedTrades = data.filter(trade => trade.profit !== undefined);
		const returns = closedTrades.map(trade => trade.profit || 0);

		if (returns.length === 0) {
			return { error: 'No profit data available for Sharpe ratio calculation' };
		}

		const riskFreeRate = 0.02; // Assume 2% annual risk-free rate
		const averageReturn = ss.mean(returns);
		const returnStdDev = ss.standardDeviation(returns);

		const sharpeRatio = returnStdDev !== 0 ? (averageReturn - riskFreeRate) / returnStdDev : 0;

		// Calculate rolling Sharpe ratio
		const rollingSharpe = this.calculateRollingSharpeRatio(returns, 20, riskFreeRate);

		// Sharpe ratio interpretation
		let interpretation = '';
		if (sharpeRatio > 2) {
			interpretation = 'Excellent risk-adjusted performance';
		} else if (sharpeRatio > 1) {
			interpretation = 'Good risk-adjusted performance';
		} else if (sharpeRatio > 0) {
			interpretation = 'Acceptable risk-adjusted performance';
		} else {
			interpretation = 'Poor risk-adjusted performance';
		}

		return {
			sharpeRatio,
			interpretation,
			components: {
				averageReturn,
				riskFreeRate,
				excessReturn: averageReturn - riskFreeRate,
				volatility: returnStdDev,
			},
			rollingSharpe,
			benchmarks: {
				excellent: 2.0,
				good: 1.0,
				acceptable: 0.0,
			},
		};
	}

	// Additional helper methods for stress testing and return analysis
	private simulateMarketCrash(returns: number[]): IDataObject {
		// Simulate a 20% market crash
		const crashMultiplier = 0.8;
		const stressedReturns = returns.map(r => r * crashMultiplier);
		const totalLoss = _.sum(stressedReturns) - _.sum(returns);

		return {
			scenario: 'Market Crash (-20%)',
			totalLoss,
			averageLoss: ss.mean(stressedReturns) - ss.mean(returns),
			worstTrade: Math.min(...stressedReturns),
		};
	}

	private simulateHighVolatility(returns: number[]): IDataObject {
		// Simulate doubled volatility
		const mean = ss.mean(returns);
		const stdDev = ss.standardDeviation(returns);
		const stressedReturns = returns.map(r => mean + (r - mean) * 2);
		const totalLoss = _.sum(stressedReturns) - _.sum(returns);

		return {
			scenario: 'High Volatility (2x)',
			totalLoss,
			averageLoss: ss.mean(stressedReturns) - ss.mean(returns),
			worstTrade: Math.min(...stressedReturns),
		};
	}

	private simulateLiquidityCrisis(returns: number[]): IDataObject {
		// Simulate liquidity crisis with wider spreads
		const spreadCost = 0.001; // 0.1% additional cost
		const stressedReturns = returns.map(r => r - spreadCost);
		const totalLoss = _.sum(stressedReturns) - _.sum(returns);

		return {
			scenario: 'Liquidity Crisis',
			totalLoss,
			averageLoss: ss.mean(stressedReturns) - ss.mean(returns),
			worstTrade: Math.min(...stressedReturns),
		};
	}

	private simulateInterestRateShock(returns: number[]): IDataObject {
		// Simulate interest rate shock affecting carry trades
		const rateShockMultiplier = 0.9;
		const stressedReturns = returns.map(r => r * rateShockMultiplier);
		const totalLoss = _.sum(stressedReturns) - _.sum(returns);

		return {
			scenario: 'Interest Rate Shock',
			totalLoss,
			averageLoss: ss.mean(stressedReturns) - ss.mean(returns),
			worstTrade: Math.min(...stressedReturns),
		};
	}

	private runMonteCarloSimulation(returns: number[], iterations: number): IDataObject {
		const mean = ss.mean(returns);
		const stdDev = ss.standardDeviation(returns);
		const simulations: number[] = [];

		for (let i = 0; i < iterations; i++) {
			// Generate random returns based on historical distribution
			const simulatedReturns = Array.from({ length: returns.length }, () => {
				// Box-Muller transformation for normal distribution
				const u1 = Math.random();
				const u2 = Math.random();
				const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
				return mean + z * stdDev;
			});

			simulations.push(_.sum(simulatedReturns));
		}

		return {
			iterations,
			results: {
				mean: ss.mean(simulations),
				standardDeviation: ss.standardDeviation(simulations),
				percentiles: {
					p5: ss.quantile(simulations, 0.05),
					p25: ss.quantile(simulations, 0.25),
					p50: ss.quantile(simulations, 0.5),
					p75: ss.quantile(simulations, 0.75),
					p95: ss.quantile(simulations, 0.95),
				},
				worstCase: Math.min(...simulations),
				bestCase: Math.max(...simulations),
			},
		};
	}

	private calculateStressVaR(scenarios: Record<string, any>): number {
		const losses = Object.values(scenarios).map((s: any) => s.totalLoss);
		return ss.quantile(losses, 0.05); // 5th percentile of stress losses
	}

	private calculateCumulativeReturns(returns: number[]): Array<{ index: number; cumulative: number }> {
		let cumulative = 0;
		return returns.map((ret, index) => {
			cumulative += ret;
			return { index, cumulative };
		});
	}

	private calculateRollingReturns(returns: number[], window: number): Array<{ index: number; rolling: number }> {
		const rolling: Array<{ index: number; rolling: number }> = [];

		for (let i = window - 1; i < returns.length; i++) {
			const windowReturns = returns.slice(i - window + 1, i + 1);
			const rollingReturn = _.sum(windowReturns);
			rolling.push({ index: i, rolling: rollingReturn });
		}

		return rolling;
	}

	private calculateRollingSharpeRatio(returns: number[], window: number, riskFreeRate: number): Array<{ index: number; sharpe: number }> {
		const rolling: Array<{ index: number; sharpe: number }> = [];

		for (let i = window - 1; i < returns.length; i++) {
			const windowReturns = returns.slice(i - window + 1, i + 1);
			const mean = ss.mean(windowReturns);
			const stdDev = ss.standardDeviation(windowReturns);
			const sharpe = stdDev !== 0 ? (mean - riskFreeRate) / stdDev : 0;
			rolling.push({ index: i, sharpe });
		}

		return rolling;
	}

	/**
	 * Calculate maximum drawdown
	 */
	async calculateMaxDrawdown(data: TradeData[]): Promise<IDataObject> {
		const closedTrades = data.filter(trade => trade.profit !== undefined);
		const returns = closedTrades.map(trade => trade.profit || 0);

		if (returns.length === 0) {
			return { error: 'No profit data available for drawdown calculation' };
		}

		const cumulativeReturns = this.calculateCumulativeReturns(returns);
		let maxDrawdown = 0;
		let maxDrawdownStart = 0;
		let maxDrawdownEnd = 0;
		let peak = cumulativeReturns[0].cumulative;
		let peakIndex = 0;

		for (let i = 1; i < cumulativeReturns.length; i++) {
			const current = cumulativeReturns[i].cumulative;

			if (current > peak) {
				peak = current;
				peakIndex = i;
			}

			const drawdown = (peak - current) / Math.abs(peak);
			if (drawdown > maxDrawdown) {
				maxDrawdown = drawdown;
				maxDrawdownStart = peakIndex;
				maxDrawdownEnd = i;
			}
		}

		// Calculate recovery time
		let recoveryTime = 0;
		for (let i = maxDrawdownEnd + 1; i < cumulativeReturns.length; i++) {
			if (cumulativeReturns[i].cumulative >= peak) {
				recoveryTime = i - maxDrawdownEnd;
				break;
			}
		}

		return {
			maxDrawdown: maxDrawdown * 100, // Convert to percentage
			drawdownPeriod: {
				start: maxDrawdownStart,
				end: maxDrawdownEnd,
				duration: maxDrawdownEnd - maxDrawdownStart,
			},
			recovery: {
				time: recoveryTime,
				recovered: recoveryTime > 0,
			},
			statistics: {
				averageDrawdown: this.calculateAverageDrawdown(cumulativeReturns),
				drawdownFrequency: this.calculateDrawdownFrequency(cumulativeReturns),
			},
		};
	}

	/**
	 * Perform benchmarking analysis
	 */
	async performBenchmarking(data: TradeData[]): Promise<IDataObject> {
		const closedTrades = data.filter(trade => trade.profit !== undefined);
		const returns = closedTrades.map(trade => trade.profit || 0);

		if (returns.length === 0) {
			return { error: 'No profit data available for benchmarking' };
		}

		// Calculate portfolio metrics
		const portfolioMetrics = {
			totalReturn: _.sum(returns),
			averageReturn: ss.mean(returns),
			volatility: ss.standardDeviation(returns),
			sharpeRatio: this.calculateSharpeRatioValue(returns),
			maxDrawdown: this.calculateMaxDrawdownValue(returns),
		};

		// Benchmark comparisons (simplified - would need actual benchmark data)
		const benchmarks = {
			market: {
				name: 'Market Average',
				totalReturn: portfolioMetrics.totalReturn * 0.8, // Assume 80% of portfolio return
				volatility: portfolioMetrics.volatility * 0.9,
				sharpeRatio: 0.5,
			},
			riskFree: {
				name: 'Risk-Free Rate',
				totalReturn: 0.02 * (returns.length / 252), // Assume 2% annual rate
				volatility: 0,
				sharpeRatio: 0,
			},
		};

		// Calculate relative performance
		const relativePerformance = {
			vsMarket: {
				excessReturn: portfolioMetrics.totalReturn - benchmarks.market.totalReturn,
				informationRatio: this.calculateInformationRatio(returns),
				trackingError: portfolioMetrics.volatility - benchmarks.market.volatility,
			},
			vsRiskFree: {
				excessReturn: portfolioMetrics.totalReturn - benchmarks.riskFree.totalReturn,
				riskPremium: portfolioMetrics.averageReturn - (benchmarks.riskFree.totalReturn / returns.length),
			},
		};

		return {
			portfolio: portfolioMetrics,
			benchmarks,
			relativePerformance,
			ranking: this.calculatePerformanceRanking(portfolioMetrics),
		};
	}

	/**
	 * Analyze correlations between instruments
	 */
	async analyzeCorrelations(data: TradeData[]): Promise<IDataObject> {
		// Group trades by symbol
		const symbolGroups = _.groupBy(data, 'symbol');
		const symbols = Object.keys(symbolGroups);

		if (symbols.length < 2) {
			return { error: 'Need at least 2 symbols for correlation analysis' };
		}

		// Calculate returns for each symbol
		const symbolReturns: Record<string, number[]> = {};
		for (const symbol of symbols) {
			const trades = symbolGroups[symbol].filter((trade: TradeData) => trade.profit !== undefined);
			symbolReturns[symbol] = trades.map((trade: TradeData) => trade.profit || 0);
		}

		// Calculate correlation matrix
		const correlationMatrix: Record<string, Record<string, number>> = {};
		for (const symbol1 of symbols) {
			correlationMatrix[symbol1] = {};
			for (const symbol2 of symbols) {
				if (symbol1 === symbol2) {
					correlationMatrix[symbol1][symbol2] = 1;
				} else {
					const correlation = this.calculateCorrelation(
						symbolReturns[symbol1],
						symbolReturns[symbol2]
					);
					correlationMatrix[symbol1][symbol2] = correlation;
				}
			}
		}

		// Find highest and lowest correlations
		const correlations: Array<{ pair: string; correlation: number }> = [];
		for (let i = 0; i < symbols.length; i++) {
			for (let j = i + 1; j < symbols.length; j++) {
				correlations.push({
					pair: `${symbols[i]}-${symbols[j]}`,
					correlation: correlationMatrix[symbols[i]][symbols[j]],
				});
			}
		}

		const sortedCorrelations = correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

		return {
			correlationMatrix,
			summary: {
				symbolCount: symbols.length,
				averageCorrelation: ss.mean(correlations.map(c => c.correlation)),
				highestCorrelation: sortedCorrelations[0],
				lowestCorrelation: sortedCorrelations[sortedCorrelations.length - 1],
			},
			insights: this.generateCorrelationInsights(correlations),
		};
	}

	/**
	 * Analyze market volatility patterns
	 */
	async analyzeVolatility(data: TradeData[]): Promise<IDataObject> {
		const closedTrades = data.filter(trade => trade.profit !== undefined);
		const returns = closedTrades.map(trade => trade.profit || 0);

		if (returns.length === 0) {
			return { error: 'No profit data available for volatility analysis' };
		}

		// Calculate various volatility measures
		const historicalVolatility = ss.standardDeviation(returns);
		const rollingVolatility = this.calculateRollingVolatility(returns, 20);

		// Volatility clustering analysis
		const volatilityClustering = this.analyzeVolatilityClustering(returns);

		// GARCH-like volatility modeling (simplified)
		const volatilityForecast = this.forecastVolatility(returns, 5);

		// Volatility by symbol
		const symbolVolatility = this.calculateSymbolVolatility(data);

		return {
			overall: {
				historicalVolatility,
				annualizedVolatility: historicalVolatility * Math.sqrt(252), // Assuming daily returns
				volatilityRank: this.classifyVolatility(historicalVolatility),
			},
			timeSeries: {
				rollingVolatility,
				volatilityClustering,
			},
			forecast: volatilityForecast,
			bySymbol: symbolVolatility,
			insights: this.generateVolatilityInsights(historicalVolatility, rollingVolatility),
		};
	}

	// Helper methods for additional analysis functions
	private calculateAverageDrawdown(cumulativeReturns: Array<{ index: number; cumulative: number }>): number {
		const drawdowns: number[] = [];
		let peak = cumulativeReturns[0].cumulative;

		for (let i = 1; i < cumulativeReturns.length; i++) {
			const current = cumulativeReturns[i].cumulative;
			if (current > peak) {
				peak = current;
			} else {
				const drawdown = (peak - current) / Math.abs(peak);
				drawdowns.push(drawdown);
			}
		}

		return drawdowns.length > 0 ? ss.mean(drawdowns) * 100 : 0;
	}

	private calculateDrawdownFrequency(cumulativeReturns: Array<{ index: number; cumulative: number }>): number {
		let drawdownPeriods = 0;
		let inDrawdown = false;
		let peak = cumulativeReturns[0].cumulative;

		for (let i = 1; i < cumulativeReturns.length; i++) {
			const current = cumulativeReturns[i].cumulative;
			if (current > peak) {
				peak = current;
				if (inDrawdown) {
					inDrawdown = false;
				}
			} else if (!inDrawdown) {
				inDrawdown = true;
				drawdownPeriods++;
			}
		}

		return drawdownPeriods;
	}

	private calculatePerformanceRanking(metrics: any): string {
		const { sharpeRatio, maxDrawdown } = metrics;

		if (sharpeRatio > 1.5 && maxDrawdown < 0.1) {
			return 'Excellent';
		} else if (sharpeRatio > 1 && maxDrawdown < 0.2) {
			return 'Good';
		} else if (sharpeRatio > 0.5 && maxDrawdown < 0.3) {
			return 'Average';
		} else {
			return 'Below Average';
		}
	}

	private calculateCorrelation(x: number[], y: number[]): number {
		if (x.length !== y.length || x.length === 0) return 0;

		const n = x.length;
		const sumX = _.sum(x);
		const sumY = _.sum(y);
		const sumXY = _.sum(x.map((xi, i) => xi * y[i]));
		const sumX2 = _.sum(x.map(xi => xi * xi));
		const sumY2 = _.sum(y.map(yi => yi * yi));

		const numerator = n * sumXY - sumX * sumY;
		const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

		return denominator !== 0 ? numerator / denominator : 0;
	}

	private generateCorrelationInsights(correlations: Array<{ pair: string; correlation: number }>): string[] {
		const insights: string[] = [];

		const highCorrelations = correlations.filter(c => Math.abs(c.correlation) > 0.7);
		if (highCorrelations.length > 0) {
			insights.push(`Found ${highCorrelations.length} highly correlated pairs (|r| > 0.7)`);
		}

		const lowCorrelations = correlations.filter(c => Math.abs(c.correlation) < 0.3);
		if (lowCorrelations.length > 0) {
			insights.push(`Found ${lowCorrelations.length} weakly correlated pairs (|r| < 0.3)`);
		}

		return insights;
	}

	private calculateRollingVolatility(returns: number[], window: number): Array<{ index: number; volatility: number }> {
		const rolling: Array<{ index: number; volatility: number }> = [];

		for (let i = window - 1; i < returns.length; i++) {
			const windowReturns = returns.slice(i - window + 1, i + 1);
			const volatility = ss.standardDeviation(windowReturns);
			rolling.push({ index: i, volatility });
		}

		return rolling;
	}

	private analyzeVolatilityClustering(returns: number[]): IDataObject {
		// Simplified volatility clustering analysis
		const volatilities = returns.map(Math.abs);
		const avgVolatility = ss.mean(volatilities);

		let clusters = 0;
		let inHighVolCluster = false;

		for (const vol of volatilities) {
			if (vol > avgVolatility * 1.5) {
				if (!inHighVolCluster) {
					clusters++;
					inHighVolCluster = true;
				}
			} else {
				inHighVolCluster = false;
			}
		}

		return {
			clusterCount: clusters,
			averageVolatility: avgVolatility,
			clusteringRatio: clusters / volatilities.length,
		};
	}

	private forecastVolatility(returns: number[], periods: number): Array<{ period: number; forecast: number }> {
		// Simplified volatility forecasting using exponential smoothing
		const alpha = 0.1; // Smoothing parameter
		const volatilities = returns.map(Math.abs);
		let forecast = ss.mean(volatilities);

		const forecasts: Array<{ period: number; forecast: number }> = [];

		for (let i = 1; i <= periods; i++) {
			forecast = alpha * volatilities[volatilities.length - 1] + (1 - alpha) * forecast;
			forecasts.push({ period: i, forecast });
		}

		return forecasts;
	}

	private calculateSymbolVolatility(data: TradeData[]): Record<string, number> {
		const symbolGroups = _.groupBy(data, 'symbol');

		return _.mapValues(symbolGroups, (trades) => {
			const returns = trades
				.filter(trade => trade.profit !== undefined)
				.map(trade => trade.profit || 0);

			return returns.length > 1 ? ss.standardDeviation(returns) : 0;
		});
	}

	private classifyVolatility(volatility: number): string {
		if (volatility < 0.01) return 'Low';
		if (volatility < 0.03) return 'Medium';
		if (volatility < 0.05) return 'High';
		return 'Very High';
	}

	private generateVolatilityInsights(
		historicalVol: number,
		rollingVol: Array<{ index: number; volatility: number }>
	): string[] {
		const insights: string[] = [];

		const recentVol = rollingVol.slice(-5).map(r => r.volatility);
		const avgRecentVol = ss.mean(recentVol);

		if (avgRecentVol > historicalVol * 1.2) {
			insights.push('Recent volatility is significantly higher than historical average');
		} else if (avgRecentVol < historicalVol * 0.8) {
			insights.push('Recent volatility is lower than historical average');
		}

		const volTrend = recentVol[recentVol.length - 1] - recentVol[0];
		if (volTrend > 0) {
			insights.push('Volatility is trending upward');
		} else {
			insights.push('Volatility is trending downward');
		}

		return insights;
	}

	/**
	 * Analyze market trends
	 */
	async analyzeTrends(data: TradeData[]): Promise<IDataObject> {
		const closedTrades = data.filter(trade => trade.profit !== undefined && trade.closeTime);

		if (closedTrades.length === 0) {
			return { error: 'No closed trades found for trend analysis' };
		}

		// Group trades by symbol for trend analysis
		const symbolGroups = _.groupBy(closedTrades, 'symbol');
		const symbolTrends: Record<string, any> = {};

		for (const [symbol, trades] of Object.entries(symbolGroups)) {
			const sortedTrades = trades.sort((a, b) => a.openTime.getTime() - b.openTime.getTime());
			const prices = sortedTrades.map(trade => trade.openPrice);

			// Calculate trend using linear regression
			const trend = this.calculateTrend(prices);
			const momentum = this.calculateMomentum(prices);

			symbolTrends[symbol] = {
				trend: trend.slope > 0 ? 'Upward' : trend.slope < 0 ? 'Downward' : 'Sideways',
				slope: trend.slope,
				correlation: trend.correlation,
				momentum: momentum,
				volatility: ss.standardDeviation(prices),
				priceRange: {
					min: Math.min(...prices),
					max: Math.max(...prices),
				},
			};
		}

		// Overall market trend
		const allPrices = closedTrades.map(trade => trade.openPrice);
		const overallTrend = this.calculateTrend(allPrices);

		return {
			overall: {
				trend: overallTrend.slope > 0 ? 'Upward' : overallTrend.slope < 0 ? 'Downward' : 'Sideways',
				slope: overallTrend.slope,
				correlation: overallTrend.correlation,
				strength: Math.abs(overallTrend.correlation),
			},
			bySymbol: symbolTrends,
			insights: this.generateTrendInsights(symbolTrends, overallTrend),
		};
	}

	/**
	 * Detect market regimes
	 */
	async detectRegimes(data: TradeData[]): Promise<IDataObject> {
		const closedTrades = data.filter(trade => trade.profit !== undefined);
		const returns = closedTrades.map(trade => trade.profit || 0);

		if (returns.length < 20) {
			return { error: 'Insufficient data for regime detection (minimum 20 trades required)' };
		}

		// Simple regime detection based on volatility and returns
		const regimes = this.identifyRegimes(returns);
		const currentRegime = regimes[regimes.length - 1];

		// Calculate regime statistics
		const regimeStats = this.calculateRegimeStatistics(regimes);

		return {
			currentRegime,
			regimeHistory: regimes,
			statistics: regimeStats,
			insights: this.generateRegimeInsights(regimes, regimeStats),
		};
	}

	/**
	 * Predict future prices (simplified)
	 */
	async predictPrices(data: TradeData[], horizon: number): Promise<IDataObject> {
		const closedTrades = data.filter(trade => trade.closePrice);

		if (closedTrades.length < 10) {
			return { error: 'Insufficient data for price prediction (minimum 10 trades required)' };
		}

		// Group by symbol for individual predictions
		const symbolGroups = _.groupBy(closedTrades, 'symbol');
		const predictions: Record<string, any> = {};

		for (const [symbol, trades] of Object.entries(symbolGroups)) {
			const sortedTrades = trades.sort((a, b) => a.openTime.getTime() - b.openTime.getTime());
			const prices = sortedTrades.map(trade => trade.closePrice!);

			// Simple linear regression prediction
			const prediction = this.predictPriceLinear(prices, horizon);

			predictions[symbol] = {
				currentPrice: prices[prices.length - 1],
				predictedPrices: prediction.predictions,
				confidence: prediction.confidence,
				trend: prediction.trend,
			};
		}

		return {
			horizon,
			predictions,
			methodology: 'Linear regression with trend analysis',
			disclaimer: 'Predictions are estimates based on historical data and should not be used as sole basis for trading decisions',
		};
	}

	/**
	 * Predict future risk levels
	 */
	async predictRisk(data: TradeData[], horizon: number): Promise<IDataObject> {
		const closedTrades = data.filter(trade => trade.profit !== undefined);
		const returns = closedTrades.map(trade => trade.profit || 0);

		if (returns.length < 20) {
			return { error: 'Insufficient data for risk prediction (minimum 20 trades required)' };
		}

		// Calculate rolling volatility
		const rollingVol = this.calculateRollingVolatility(returns, 10);
		const currentVol = rollingVol[rollingVol.length - 1]?.volatility || 0;

		// Simple volatility forecasting
		const volForecast = this.forecastVolatility(returns, horizon);

		// Risk level classification
		const riskLevels = volForecast.map(forecast => ({
			period: forecast.period,
			volatility: forecast.forecast,
			riskLevel: this.classifyVolatility(forecast.forecast),
		}));

		return {
			currentRisk: {
				volatility: currentVol,
				level: this.classifyVolatility(currentVol),
			},
			forecast: riskLevels,
			horizon,
			insights: this.generateRiskPredictionInsights(riskLevels),
		};
	}

	/**
	 * Generate trading signals
	 */
	async generateSignals(data: TradeData[]): Promise<IDataObject> {
		const closedTrades = data.filter(trade => trade.profit !== undefined && trade.closePrice);

		if (closedTrades.length < 20) {
			return { error: 'Insufficient data for signal generation (minimum 20 trades required)' };
		}

		// Group by symbol
		const symbolGroups = _.groupBy(closedTrades, 'symbol');
		const signals: Record<string, any> = {};

		for (const [symbol, trades] of Object.entries(symbolGroups)) {
			const sortedTrades = trades.sort((a, b) => a.openTime.getTime() - b.openTime.getTime());
			const prices = sortedTrades.map(trade => trade.closePrice!);
			const returns = sortedTrades.map(trade => trade.profit || 0);

			// Generate signals based on multiple indicators
			const trendSignal = this.generateTrendSignal(prices);
			const momentumSignal = this.generateMomentumSignal(returns);
			const volatilitySignal = this.generateVolatilitySignal(prices);

			// Combine signals
			const combinedSignal = this.combineSignals([trendSignal, momentumSignal, volatilitySignal]);

			signals[symbol] = {
				signal: combinedSignal.signal,
				strength: combinedSignal.strength,
				confidence: combinedSignal.confidence,
				components: {
					trend: trendSignal,
					momentum: momentumSignal,
					volatility: volatilitySignal,
				},
			};
		}

		return {
			signals,
			summary: {
				totalSymbols: Object.keys(signals).length,
				buySignals: Object.values(signals).filter((s: any) => s.signal === 'BUY').length,
				sellSignals: Object.values(signals).filter((s: any) => s.signal === 'SELL').length,
				holdSignals: Object.values(signals).filter((s: any) => s.signal === 'HOLD').length,
			},
			disclaimer: 'Signals are generated based on historical data and technical analysis. Use with caution.',
		};
	}

	/**
	 * Detect anomalous trading patterns
	 */
	async detectAnomalies(data: TradeData[]): Promise<IDataObject> {
		const anomalies: Array<{
			type: string;
			description: string;
			severity: 'Low' | 'Medium' | 'High';
			trades: TradeData[];
		}> = [];

		// Detect volume anomalies
		const volumeAnomalies = this.detectVolumeAnomalies(data);
		anomalies.push(...volumeAnomalies);

		// Detect profit anomalies
		const profitAnomalies = this.detectProfitAnomalies(data);
		anomalies.push(...profitAnomalies);

		// Detect timing anomalies
		const timingAnomalies = this.detectTimingAnomalies(data);
		anomalies.push(...timingAnomalies);

		return {
			anomalies,
			summary: {
				totalAnomalies: anomalies.length,
				highSeverity: anomalies.filter(a => a.severity === 'High').length,
				mediumSeverity: anomalies.filter(a => a.severity === 'Medium').length,
				lowSeverity: anomalies.filter(a => a.severity === 'Low').length,
			},
			recommendations: this.generateAnomalyRecommendations(anomalies),
		};
	}

	// Helper methods for new analysis functions
	private calculateTrend(prices: number[]): { slope: number; correlation: number } {
		if (prices.length < 2) return { slope: 0, correlation: 0 };

		const x = Array.from({ length: prices.length }, (_, i) => i);
		const n = prices.length;

		const sumX = _.sum(x);
		const sumY = _.sum(prices);
		const sumXY = _.sum(x.map((xi, i) => xi * prices[i]));
		const sumX2 = _.sum(x.map(xi => xi * xi));
		const sumY2 = _.sum(prices.map(yi => yi * yi));

		const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
		const correlation = (n * sumXY - sumX * sumY) /
			Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

		return { slope, correlation: isNaN(correlation) ? 0 : correlation };
	}

	private calculateMomentum(prices: number[]): number {
		if (prices.length < 2) return 0;

		const recentPrices = prices.slice(-5); // Last 5 prices
		const earlierPrices = prices.slice(-10, -5); // Previous 5 prices

		if (earlierPrices.length === 0) return 0;

		const recentAvg = ss.mean(recentPrices);
		const earlierAvg = ss.mean(earlierPrices);

		return (recentAvg - earlierAvg) / earlierAvg;
	}

	private generateTrendInsights(symbolTrends: Record<string, any>, overallTrend: any): string[] {
		const insights: string[] = [];

		const upwardTrends = Object.values(symbolTrends).filter((t: any) => t.trend === 'Upward').length;
		const downwardTrends = Object.values(symbolTrends).filter((t: any) => t.trend === 'Downward').length;

		insights.push(`Overall market trend: ${overallTrend.slope > 0 ? 'Upward' : overallTrend.slope < 0 ? 'Downward' : 'Sideways'}`);
		insights.push(`${upwardTrends} symbols showing upward trends, ${downwardTrends} showing downward trends`);

		if (Math.abs(overallTrend.correlation) > 0.7) {
			insights.push('Strong trend correlation detected');
		}

		return insights;
	}

	private identifyRegimes(returns: number[]): Array<{ start: number; end: number; type: string; characteristics: any }> {
		// Simplified regime detection based on volatility clustering
		const regimes: Array<{ start: number; end: number; type: string; characteristics: any }> = [];
		const windowSize = 10;

		for (let i = 0; i < returns.length - windowSize; i += windowSize) {
			const window = returns.slice(i, i + windowSize);
			const volatility = ss.standardDeviation(window);
			const meanReturn = ss.mean(window);

			let regimeType = 'Normal';
			if (volatility > ss.standardDeviation(returns) * 1.5) {
				regimeType = 'High Volatility';
			} else if (Math.abs(meanReturn) > Math.abs(ss.mean(returns)) * 2) {
				regimeType = meanReturn > 0 ? 'Bull Market' : 'Bear Market';
			}

			regimes.push({
				start: i,
				end: Math.min(i + windowSize - 1, returns.length - 1),
				type: regimeType,
				characteristics: {
					volatility,
					meanReturn,
					duration: windowSize,
				},
			});
		}

		return regimes;
	}

	private calculateRegimeStatistics(regimes: any[]): any {
		const regimeTypes = _.countBy(regimes, 'type');
		const avgDuration = ss.mean(regimes.map(r => r.characteristics.duration));

		return {
			regimeTypes,
			averageDuration: avgDuration,
			totalRegimes: regimes.length,
			mostCommonRegime: _.maxBy(Object.keys(regimeTypes), type => regimeTypes[type]),
		};
	}

	private generateRegimeInsights(regimes: any[], stats: any): string[] {
		const insights: string[] = [];

		insights.push(`Identified ${stats.totalRegimes} market regimes`);
		insights.push(`Most common regime: ${stats.mostCommonRegime}`);
		insights.push(`Average regime duration: ${stats.averageDuration.toFixed(1)} periods`);

		return insights;
	}

	private predictPriceLinear(prices: number[], horizon: number): any {
		const trend = this.calculateTrend(prices);
		const lastPrice = prices[prices.length - 1];
		const predictions: number[] = [];

		for (let i = 1; i <= horizon; i++) {
			const predictedPrice = lastPrice + (trend.slope * i);
			predictions.push(predictedPrice);
		}

		return {
			predictions,
			confidence: Math.abs(trend.correlation) * 100,
			trend: trend.slope > 0 ? 'Upward' : trend.slope < 0 ? 'Downward' : 'Sideways',
		};
	}

	private generateRiskPredictionInsights(riskLevels: any[]): string[] {
		const insights: string[] = [];

		const highRiskPeriods = riskLevels.filter(r => r.riskLevel === 'High' || r.riskLevel === 'Very High').length;

		if (highRiskPeriods > 0) {
			insights.push(`${highRiskPeriods} periods of elevated risk expected`);
		}

		const trendDirection = riskLevels[riskLevels.length - 1].volatility > riskLevels[0].volatility ? 'increasing' : 'decreasing';
		insights.push(`Risk trend: ${trendDirection}`);

		return insights;
	}

	private generateTrendSignal(prices: number[]): { signal: string; strength: number } {
		const trend = this.calculateTrend(prices);

		if (trend.slope > 0 && Math.abs(trend.correlation) > 0.5) {
			return { signal: 'BUY', strength: Math.abs(trend.correlation) };
		} else if (trend.slope < 0 && Math.abs(trend.correlation) > 0.5) {
			return { signal: 'SELL', strength: Math.abs(trend.correlation) };
		}

		return { signal: 'HOLD', strength: 0 };
	}

	private generateMomentumSignal(returns: number[]): { signal: string; strength: number } {
		const recentReturns = returns.slice(-5);
		const momentum = ss.mean(recentReturns);

		if (momentum > 0.01) {
			return { signal: 'BUY', strength: Math.min(momentum * 10, 1) };
		} else if (momentum < -0.01) {
			return { signal: 'SELL', strength: Math.min(Math.abs(momentum) * 10, 1) };
		}

		return { signal: 'HOLD', strength: 0 };
	}

	private generateVolatilitySignal(prices: number[]): { signal: string; strength: number } {
		const volatility = ss.standardDeviation(prices);
		const recentVol = ss.standardDeviation(prices.slice(-5));

		if (recentVol < volatility * 0.8) {
			return { signal: 'BUY', strength: 0.5 }; // Low volatility might indicate opportunity
		} else if (recentVol > volatility * 1.5) {
			return { signal: 'SELL', strength: 0.7 }; // High volatility indicates risk
		}

		return { signal: 'HOLD', strength: 0 };
	}

	private combineSignals(signals: Array<{ signal: string; strength: number }>): { signal: string; strength: number; confidence: number } {
		const buySignals = signals.filter(s => s.signal === 'BUY');
		const sellSignals = signals.filter(s => s.signal === 'SELL');

		const buyStrength = _.sumBy(buySignals, 'strength');
		const sellStrength = _.sumBy(sellSignals, 'strength');

		if (buyStrength > sellStrength && buyStrength > 0.5) {
			return {
				signal: 'BUY',
				strength: buyStrength,
				confidence: (buySignals.length / signals.length) * 100,
			};
		} else if (sellStrength > buyStrength && sellStrength > 0.5) {
			return {
				signal: 'SELL',
				strength: sellStrength,
				confidence: (sellSignals.length / signals.length) * 100,
			};
		}

		return {
			signal: 'HOLD',
			strength: 0,
			confidence: 50,
		};
	}

	private detectVolumeAnomalies(data: TradeData[]): Array<{ type: string; description: string; severity: 'Low' | 'Medium' | 'High'; trades: TradeData[] }> {
		const volumes = data.map(trade => trade.volume);
		const avgVolume = ss.mean(volumes);
		const stdVolume = ss.standardDeviation(volumes);

		const anomalies: Array<{ type: string; description: string; severity: 'Low' | 'Medium' | 'High'; trades: TradeData[] }> = [];

		// Detect unusually large volumes
		const largeVolumeTrades = data.filter(trade => trade.volume > avgVolume + 3 * stdVolume);
		if (largeVolumeTrades.length > 0) {
			anomalies.push({
				type: 'Large Volume',
				description: `${largeVolumeTrades.length} trades with unusually large volume detected`,
				severity: 'Medium',
				trades: largeVolumeTrades,
			});
		}

		return anomalies;
	}

	private detectProfitAnomalies(data: TradeData[]): Array<{ type: string; description: string; severity: 'Low' | 'Medium' | 'High'; trades: TradeData[] }> {
		const closedTrades = data.filter(trade => trade.profit !== undefined);
		const profits = closedTrades.map(trade => trade.profit || 0);
		const avgProfit = ss.mean(profits);
		const stdProfit = ss.standardDeviation(profits);

		const anomalies: Array<{ type: string; description: string; severity: 'Low' | 'Medium' | 'High'; trades: TradeData[] }> = [];

		// Detect unusually large losses
		const largeLossTrades = closedTrades.filter(trade => (trade.profit || 0) < avgProfit - 3 * stdProfit);
		if (largeLossTrades.length > 0) {
			anomalies.push({
				type: 'Large Loss',
				description: `${largeLossTrades.length} trades with unusually large losses detected`,
				severity: 'High',
				trades: largeLossTrades,
			});
		}

		return anomalies;
	}

	private detectTimingAnomalies(data: TradeData[]): Array<{ type: string; description: string; severity: 'Low' | 'Medium' | 'High'; trades: TradeData[] }> {
		const anomalies: Array<{ type: string; description: string; severity: 'Low' | 'Medium' | 'High'; trades: TradeData[] }> = [];

		// Detect trades outside normal hours (simplified)
		const offHoursTrades = data.filter(trade => {
			const hour = trade.openTime.getHours();
			return hour < 6 || hour > 22; // Assuming normal hours are 6 AM to 10 PM
		});

		if (offHoursTrades.length > 0) {
			anomalies.push({
				type: 'Off Hours Trading',
				description: `${offHoursTrades.length} trades executed outside normal trading hours`,
				severity: 'Low',
				trades: offHoursTrades,
			});
		}

		return anomalies;
	}

	private generateAnomalyRecommendations(anomalies: any[]): string[] {
		const recommendations: string[] = [];

		const highSeverityAnomalies = anomalies.filter(a => a.severity === 'High');
		if (highSeverityAnomalies.length > 0) {
			recommendations.push('Investigate high-severity anomalies immediately');
		}

		const largeLossAnomalies = anomalies.filter(a => a.type === 'Large Loss');
		if (largeLossAnomalies.length > 0) {
			recommendations.push('Review risk management procedures for large loss trades');
		}

		return recommendations;
	}

	/**
	 * Optimize portfolio allocation
	 */
	async optimizeAllocation(data: TradeData[]): Promise<IDataObject> {
		const symbolGroups = _.groupBy(data, 'symbol');
		const symbols = Object.keys(symbolGroups);

		if (symbols.length < 2) {
			return { error: 'Need at least 2 symbols for portfolio optimization' };
		}

		// Calculate returns for each symbol
		const symbolReturns: Record<string, number[]> = {};
		const symbolStats: Record<string, any> = {};

		for (const symbol of symbols) {
			const trades = symbolGroups[symbol].filter((trade: TradeData) => trade.profit !== undefined);
			const returns = trades.map((trade: TradeData) => trade.profit || 0);

			symbolReturns[symbol] = returns;
			symbolStats[symbol] = {
				meanReturn: ss.mean(returns),
				volatility: ss.standardDeviation(returns),
				sharpeRatio: this.calculateSharpeRatioValue(returns),
			};
		}

		// Simple equal-weight and risk-parity allocations
		const equalWeight = this.calculateEqualWeightAllocation(symbols);
		const riskParity = this.calculateRiskParityAllocation(symbolStats);
		const meanVariance = this.calculateMeanVarianceAllocation(symbolStats);

		return {
			symbols,
			allocations: {
				equalWeight,
				riskParity,
				meanVariance,
			},
			symbolStatistics: symbolStats,
			recommendations: this.generateAllocationRecommendations(symbolStats),
		};
	}

	/**
	 * Optimize risk budget allocation
	 */
	async optimizeRiskBudget(data: TradeData[]): Promise<IDataObject> {
		const symbolGroups = _.groupBy(data, 'symbol');
		const symbols = Object.keys(symbolGroups);

		if (symbols.length < 2) {
			return { error: 'Need at least 2 symbols for risk budgeting' };
		}

		// Calculate risk metrics for each symbol
		const symbolRisks: Record<string, any> = {};
		let totalRisk = 0;

		for (const symbol of symbols) {
			const trades = symbolGroups[symbol].filter((trade: TradeData) => trade.profit !== undefined);
			const returns = trades.map((trade: TradeData) => trade.profit || 0);

			const volatility = ss.standardDeviation(returns);
			const var95 = this.calculateVaRValue(returns, 95);
			const maxDrawdown = this.calculateMaxDrawdownValue(returns);

			const riskScore = volatility + Math.abs(var95) + maxDrawdown;

			symbolRisks[symbol] = {
				volatility,
				var95,
				maxDrawdown,
				riskScore,
			};

			totalRisk += riskScore;
		}

		// Allocate risk budget inversely proportional to risk
		const riskBudget: Record<string, number> = {};
		for (const symbol of symbols) {
			riskBudget[symbol] = (1 / symbolRisks[symbol].riskScore) /
				_.sum(symbols.map(s => 1 / symbolRisks[s].riskScore));
		}

		return {
			riskBudget,
			symbolRisks,
			totalRisk,
			insights: this.generateRiskBudgetInsights(riskBudget, symbolRisks),
		};
	}

	/**
	 * Generate rebalancing strategy
	 */
	async generateRebalancingStrategy(data: TradeData[]): Promise<IDataObject> {
		const symbolGroups = _.groupBy(data, 'symbol');
		const symbols = Object.keys(symbolGroups);

		// Calculate current allocation based on recent trades
		const currentAllocation = this.calculateCurrentAllocation(data);

		// Calculate target allocation (using mean-variance optimization)
		const symbolStats: Record<string, any> = {};
		for (const symbol of symbols) {
			const trades = symbolGroups[symbol].filter((trade: TradeData) => trade.profit !== undefined);
			const returns = trades.map((trade: TradeData) => trade.profit || 0);

			symbolStats[symbol] = {
				meanReturn: ss.mean(returns),
				volatility: ss.standardDeviation(returns),
			};
		}

		const targetAllocation = this.calculateMeanVarianceAllocation(symbolStats);

		// Calculate rebalancing actions
		const rebalancingActions: Array<{
			symbol: string;
			action: 'BUY' | 'SELL' | 'HOLD';
			currentWeight: number;
			targetWeight: number;
			adjustment: number;
		}> = [];

		for (const symbol of symbols) {
			const current = currentAllocation[symbol] || 0;
			const target = targetAllocation[symbol] || 0;
			const adjustment = target - current;

			let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
			if (Math.abs(adjustment) > 0.05) { // 5% threshold
				action = adjustment > 0 ? 'BUY' : 'SELL';
			}

			rebalancingActions.push({
				symbol,
				action,
				currentWeight: current,
				targetWeight: target,
				adjustment,
			});
		}

		return {
			currentAllocation,
			targetAllocation,
			rebalancingActions,
			summary: {
				totalAdjustments: rebalancingActions.filter(a => a.action !== 'HOLD').length,
				buyActions: rebalancingActions.filter(a => a.action === 'BUY').length,
				sellActions: rebalancingActions.filter(a => a.action === 'SELL').length,
			},
			recommendations: this.generateRebalancingRecommendations(rebalancingActions),
		};
	}

	// Helper methods for portfolio optimization
	private calculateEqualWeightAllocation(symbols: string[]): Record<string, number> {
		const weight = 1 / symbols.length;
		const allocation: Record<string, number> = {};

		for (const symbol of symbols) {
			allocation[symbol] = weight;
		}

		return allocation;
	}

	private calculateRiskParityAllocation(symbolStats: Record<string, any>): Record<string, number> {
		const symbols = Object.keys(symbolStats);
		const allocation: Record<string, number> = {};

		// Inverse volatility weighting
		const totalInverseVol = _.sum(symbols.map(s => 1 / symbolStats[s].volatility));

		for (const symbol of symbols) {
			allocation[symbol] = (1 / symbolStats[symbol].volatility) / totalInverseVol;
		}

		return allocation;
	}

	private calculateMeanVarianceAllocation(symbolStats: Record<string, any>): Record<string, number> {
		const symbols = Object.keys(symbolStats);
		const allocation: Record<string, number> = {};

		// Simplified mean-variance: weight by return/risk ratio
		const totalScore = _.sum(symbols.map(s =>
			Math.max(0, symbolStats[s].meanReturn) / symbolStats[s].volatility
		));

		for (const symbol of symbols) {
			const score = Math.max(0, symbolStats[symbol].meanReturn) / symbolStats[symbol].volatility;
			allocation[symbol] = totalScore > 0 ? score / totalScore : 1 / symbols.length;
		}

		return allocation;
	}

	private calculateCurrentAllocation(data: TradeData[]): Record<string, number> {
		const symbolVolumes = _(data)
			.groupBy('symbol')
			.mapValues((trades: TradeData[]) => _.sumBy(trades, 'volume'))
			.value();

		const totalVolume = _.sum(Object.values(symbolVolumes) as number[]);
		const allocation: Record<string, number> = {};

		for (const [symbol, volume] of Object.entries(symbolVolumes)) {
			allocation[symbol] = totalVolume > 0 ? (volume as number) / totalVolume : 0;
		}

		return allocation;
	}

	private calculateVaRValue(returns: number[], confidenceLevel: number): number {
		if (returns.length === 0) return 0;

		const sortedReturns = returns.sort((a, b) => a - b);
		const varIndex = Math.floor((100 - confidenceLevel) / 100 * sortedReturns.length);

		return sortedReturns[varIndex] || 0;
	}

	private generateAllocationRecommendations(symbolStats: Record<string, any>): string[] {
		const recommendations: string[] = [];

		const symbols = Object.keys(symbolStats);
		const bestSharpe = _.maxBy(symbols, s => symbolStats[s].sharpeRatio);
		const worstSharpe = _.minBy(symbols, s => symbolStats[s].sharpeRatio);

		if (bestSharpe) {
			recommendations.push(`${bestSharpe} has the highest Sharpe ratio (${symbolStats[bestSharpe].sharpeRatio.toFixed(2)})`);
		}

		if (worstSharpe && symbolStats[worstSharpe].sharpeRatio < 0) {
			recommendations.push(`Consider reducing allocation to ${worstSharpe} due to negative Sharpe ratio`);
		}

		return recommendations;
	}

	private generateRiskBudgetInsights(riskBudget: Record<string, number>, symbolRisks: Record<string, any>): string[] {
		const insights: string[] = [];

		const highestRiskSymbol = _.maxBy(Object.keys(symbolRisks), s => symbolRisks[s].riskScore);
		const lowestRiskSymbol = _.minBy(Object.keys(symbolRisks), s => symbolRisks[s].riskScore);

		if (highestRiskSymbol) {
			insights.push(`${highestRiskSymbol} has the highest risk score, allocated ${(riskBudget[highestRiskSymbol] * 100).toFixed(1)}%`);
		}

		if (lowestRiskSymbol) {
			insights.push(`${lowestRiskSymbol} has the lowest risk score, allocated ${(riskBudget[lowestRiskSymbol] * 100).toFixed(1)}%`);
		}

		return insights;
	}

	private generateRebalancingRecommendations(actions: any[]): string[] {
		const recommendations: string[] = [];

		const significantActions = actions.filter(a => Math.abs(a.adjustment) > 0.1);

		if (significantActions.length > 0) {
			recommendations.push(`${significantActions.length} symbols require significant rebalancing (>10%)`);
		}

		const buyActions = actions.filter(a => a.action === 'BUY');
		const sellActions = actions.filter(a => a.action === 'SELL');

		if (buyActions.length > 0) {
			recommendations.push(`Consider increasing positions in: ${buyActions.map(a => a.symbol).join(', ')}`);
		}

		if (sellActions.length > 0) {
			recommendations.push(`Consider reducing positions in: ${sellActions.map(a => a.symbol).join(', ')}`);
		}

		return recommendations;
	}
}
