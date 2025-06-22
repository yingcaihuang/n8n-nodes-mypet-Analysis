"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyPetAnalytics = void 0;

class MyPetAnalytics {
    constructor() {
        this.description = {
            displayName: 'MyPet Analytics',
            name: 'myPetAnalytics',
            icon: 'file:mypet-analytics.svg',
            group: ['transform'],
            version: 1,
            description: 'Advanced analytics for MyPet Stocks trading data',
            defaults: {
                name: 'MyPet Analytics',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Analysis Type',
                    name: 'analysisType',
                    type: 'options',
                    options: [
                        {
                            name: 'Basic Statistics',
                            value: 'basic',
                            description: 'Calculate basic trading statistics',
                        },
                        {
                            name: 'Profit Analysis',
                            value: 'profit',
                            description: 'Analyze profit and loss patterns',
                        },
                        {
                            name: 'Risk Metrics',
                            value: 'risk',
                            description: 'Calculate risk assessment metrics',
                        },
                        {
                            name: 'Performance Summary',
                            value: 'performance',
                            description: 'Generate performance summary report',
                        },
                    ],
                    default: 'basic',
                    description: 'Type of analysis to perform',
                },
                {
                    displayName: 'Time Period',
                    name: 'timePeriod',
                    type: 'options',
                    options: [
                        { name: 'Last 7 days', value: '7d' },
                        { name: 'Last 30 days', value: '30d' },
                        { name: 'Last 90 days', value: '90d' },
                        { name: 'All data', value: 'all' },
                    ],
                    default: '30d',
                    description: 'Time period for analysis',
                },
                {
                    displayName: 'Include Charts',
                    name: 'includeCharts',
                    type: 'boolean',
                    default: false,
                    description: 'Whether to include chart data in output',
                },
            ],
        };
    }

    async execute() {
        const items = this.getInputData();
        const returnData = [];

        for (let i = 0; i < items.length; i++) {
            try {
                const analysisType = this.getNodeParameter('analysisType', i);
                const timePeriod = this.getNodeParameter('timePeriod', i);
                const includeCharts = this.getNodeParameter('includeCharts', i);
                const inputData = items[i].json;

                // Extract trading data
                const trades = this.extractTradingData(inputData);
                
                // Perform analysis based on type
                let analysisResult;
                switch (analysisType) {
                    case 'basic':
                        analysisResult = this.performBasicAnalysis(trades);
                        break;
                    case 'profit':
                        analysisResult = this.performProfitAnalysis(trades);
                        break;
                    case 'risk':
                        analysisResult = this.performRiskAnalysis(trades);
                        break;
                    case 'performance':
                        analysisResult = this.performPerformanceAnalysis(trades);
                        break;
                    default:
                        analysisResult = this.performBasicAnalysis(trades);
                }

                // Add metadata
                const result = {
                    analysis: analysisResult,
                    metadata: {
                        analysisType,
                        timePeriod,
                        includeCharts,
                        timestamp: new Date().toISOString(),
                        dataPoints: trades.length,
                        version: '1.0.0',
                    },
                };

                // Add chart data if requested
                if (includeCharts) {
                    result.charts = this.generateChartData(analysisResult, analysisType);
                }

                returnData.push({ json: result });
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                } else {
                    throw error;
                }
            }
        }

        return [returnData];
    }

    extractTradingData(inputData) {
        // Extract trading data from various possible formats
        let trades = [];
        
        if (inputData.orders && Array.isArray(inputData.orders)) {
            trades = inputData.orders;
        } else if (inputData.trades && Array.isArray(inputData.trades)) {
            trades = inputData.trades;
        } else if (Array.isArray(inputData)) {
            trades = inputData;
        } else if (inputData.data && Array.isArray(inputData.data)) {
            trades = inputData.data;
        }

        // Filter and normalize trade data
        return trades.filter(trade => trade && typeof trade === 'object')
                    .map(trade => ({
                        id: trade.id || trade.orderId,
                        symbol: trade.symbol || trade.instrument,
                        volume: parseFloat(trade.volume || trade.size || 0),
                        openPrice: parseFloat(trade.openPrice || trade.price || 0),
                        closePrice: parseFloat(trade.closePrice || trade.exitPrice || 0),
                        profit: parseFloat(trade.profit || trade.pnl || 0),
                        commission: parseFloat(trade.commission || trade.fee || 0),
                        openTime: new Date(trade.openTime || trade.timestamp || Date.now()),
                        closeTime: trade.closeTime ? new Date(trade.closeTime) : null,
                    }));
    }

    performBasicAnalysis(trades) {
        const totalTrades = trades.length;
        const closedTrades = trades.filter(t => t.closeTime && t.profit !== undefined);
        
        if (totalTrades === 0) {
            return { error: 'No trading data found' };
        }

        const totalVolume = trades.reduce((sum, t) => sum + t.volume, 0);
        const totalProfit = closedTrades.reduce((sum, t) => sum + t.profit, 0);
        const totalCommission = closedTrades.reduce((sum, t) => sum + t.commission, 0);

        // Symbol distribution
        const symbolCounts = {};
        trades.forEach(t => {
            symbolCounts[t.symbol] = (symbolCounts[t.symbol] || 0) + 1;
        });

        return {
            summary: {
                totalTrades,
                closedTrades: closedTrades.length,
                openTrades: totalTrades - closedTrades.length,
                totalVolume: Math.round(totalVolume * 100) / 100,
                totalProfit: Math.round(totalProfit * 100) / 100,
                totalCommission: Math.round(totalCommission * 100) / 100,
                netProfit: Math.round((totalProfit - totalCommission) * 100) / 100,
            },
            symbolDistribution: symbolCounts,
            insights: this.generateBasicInsights(trades, closedTrades),
        };
    }

    performProfitAnalysis(trades) {
        const closedTrades = trades.filter(t => t.closeTime && t.profit !== undefined);
        
        if (closedTrades.length === 0) {
            return { error: 'No closed trades found for profit analysis' };
        }

        const profits = closedTrades.map(t => t.profit);
        const winningTrades = profits.filter(p => p > 0);
        const losingTrades = profits.filter(p => p < 0);

        const totalProfit = profits.reduce((sum, p) => sum + p, 0);
        const winRate = (winningTrades.length / profits.length) * 100;
        const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, p) => sum + p, 0) / winningTrades.length : 0;
        const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, p) => sum + p, 0) / losingTrades.length) : 0;
        const profitFactor = avgLoss > 0 ? (winningTrades.reduce((sum, p) => sum + p, 0) / Math.abs(losingTrades.reduce((sum, p) => sum + p, 0))) : 0;

        return {
            summary: {
                totalProfit: Math.round(totalProfit * 100) / 100,
                winRate: Math.round(winRate * 100) / 100,
                profitFactor: Math.round(profitFactor * 100) / 100,
                averageWin: Math.round(avgWin * 100) / 100,
                averageLoss: Math.round(avgLoss * 100) / 100,
                winningTrades: winningTrades.length,
                losingTrades: losingTrades.length,
                largestWin: Math.max(...profits),
                largestLoss: Math.min(...profits),
            },
            distribution: {
                profits: profits.sort((a, b) => b - a),
                profitRanges: this.calculateProfitRanges(profits),
            },
            insights: this.generateProfitInsights(winRate, profitFactor, totalProfit),
        };
    }

    performRiskAnalysis(trades) {
        const closedTrades = trades.filter(t => t.closeTime && t.profit !== undefined);
        
        if (closedTrades.length === 0) {
            return { error: 'No closed trades found for risk analysis' };
        }

        const profits = closedTrades.map(t => t.profit);
        const returns = profits.map(p => p / 1000); // Normalize returns
        
        // Basic risk metrics
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        
        // Simple VaR calculation (95% confidence)
        const sortedReturns = [...returns].sort((a, b) => a - b);
        const varIndex = Math.floor(0.05 * sortedReturns.length);
        const var95 = sortedReturns[varIndex] || 0;

        // Maximum drawdown calculation
        let maxDrawdown = 0;
        let peak = profits[0] || 0;
        let cumulativeProfit = 0;
        
        for (const profit of profits) {
            cumulativeProfit += profit;
            if (cumulativeProfit > peak) {
                peak = cumulativeProfit;
            }
            const drawdown = (peak - cumulativeProfit) / Math.abs(peak);
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }

        return {
            summary: {
                volatility: Math.round(stdDev * 10000) / 100, // As percentage
                var95: Math.round(var95 * 1000 * 100) / 100,
                maxDrawdown: Math.round(maxDrawdown * 10000) / 100, // As percentage
                sharpeRatio: stdDev > 0 ? Math.round((mean / stdDev) * 100) / 100 : 0,
                riskLevel: this.classifyRiskLevel(stdDev, maxDrawdown),
            },
            metrics: {
                meanReturn: Math.round(mean * 1000 * 100) / 100,
                standardDeviation: Math.round(stdDev * 1000 * 100) / 100,
                skewness: this.calculateSkewness(returns),
                kurtosis: this.calculateKurtosis(returns),
            },
            insights: this.generateRiskInsights(stdDev, maxDrawdown, var95),
        };
    }

    performPerformanceAnalysis(trades) {
        const basicAnalysis = this.performBasicAnalysis(trades);
        const profitAnalysis = this.performProfitAnalysis(trades);
        const riskAnalysis = this.performRiskAnalysis(trades);

        if (basicAnalysis.error || profitAnalysis.error || riskAnalysis.error) {
            return { error: 'Insufficient data for performance analysis' };
        }

        // Performance score calculation
        const winRate = profitAnalysis.summary.winRate;
        const profitFactor = profitAnalysis.summary.profitFactor;
        const sharpeRatio = riskAnalysis.summary.sharpeRatio;
        const maxDrawdown = riskAnalysis.summary.maxDrawdown;

        const performanceScore = this.calculatePerformanceScore(winRate, profitFactor, sharpeRatio, maxDrawdown);

        return {
            summary: {
                performanceScore,
                grade: this.getPerformanceGrade(performanceScore),
                totalTrades: basicAnalysis.summary.totalTrades,
                netProfit: basicAnalysis.summary.netProfit,
                winRate: profitAnalysis.summary.winRate,
                profitFactor: profitAnalysis.summary.profitFactor,
                maxDrawdown: riskAnalysis.summary.maxDrawdown,
                sharpeRatio: riskAnalysis.summary.sharpeRatio,
            },
            breakdown: {
                profitability: Math.min(100, (profitFactor / 2) * 100),
                consistency: Math.min(100, winRate),
                riskManagement: Math.max(0, 100 - maxDrawdown),
                efficiency: Math.min(100, (sharpeRatio + 1) * 50),
            },
            recommendations: this.generatePerformanceRecommendations(winRate, profitFactor, maxDrawdown),
        };
    }

    generateChartData(analysisResult, analysisType) {
        // Generate simple chart configurations
        const charts = [];

        switch (analysisType) {
            case 'profit':
                if (analysisResult.summary) {
                    charts.push({
                        type: 'pie',
                        title: 'Win/Loss Distribution',
                        data: {
                            labels: ['Winning Trades', 'Losing Trades'],
                            values: [analysisResult.summary.winningTrades, analysisResult.summary.losingTrades],
                        },
                    });
                }
                break;
            case 'risk':
                if (analysisResult.metrics) {
                    charts.push({
                        type: 'bar',
                        title: 'Risk Metrics',
                        data: {
                            labels: ['Volatility %', 'Max Drawdown %', 'Sharpe Ratio'],
                            values: [
                                analysisResult.summary.volatility,
                                analysisResult.summary.maxDrawdown,
                                analysisResult.summary.sharpeRatio * 10, // Scale for visibility
                            ],
                        },
                    });
                }
                break;
        }

        return charts;
    }

    // Helper methods
    generateBasicInsights(trades, closedTrades) {
        const insights = [];
        
        if (trades.length > 0) {
            insights.push(`Analyzed ${trades.length} total trades`);
        }
        
        if (closedTrades.length > 0) {
            const profitableTrades = closedTrades.filter(t => t.profit > 0).length;
            const winRate = (profitableTrades / closedTrades.length) * 100;
            insights.push(`Win rate: ${Math.round(winRate)}%`);
        }

        return insights;
    }

    generateProfitInsights(winRate, profitFactor, totalProfit) {
        const insights = [];
        
        if (winRate > 60) {
            insights.push('High win rate indicates good trade selection');
        } else if (winRate < 40) {
            insights.push('Low win rate suggests need for better entry criteria');
        }

        if (profitFactor > 1.5) {
            insights.push('Strong profit factor shows good risk/reward management');
        } else if (profitFactor < 1.0) {
            insights.push('Profit factor below 1.0 indicates losses exceed profits');
        }

        if (totalProfit > 0) {
            insights.push('Overall profitable trading performance');
        } else {
            insights.push('Overall trading performance shows losses');
        }

        return insights;
    }

    generateRiskInsights(volatility, maxDrawdown, var95) {
        const insights = [];
        
        if (maxDrawdown > 0.2) {
            insights.push('High maximum drawdown indicates significant risk exposure');
        } else if (maxDrawdown < 0.1) {
            insights.push('Low maximum drawdown shows good risk control');
        }

        if (volatility > 0.05) {
            insights.push('High volatility suggests aggressive trading style');
        } else if (volatility < 0.02) {
            insights.push('Low volatility indicates conservative approach');
        }

        return insights;
    }

    generatePerformanceRecommendations(winRate, profitFactor, maxDrawdown) {
        const recommendations = [];
        
        if (winRate < 50) {
            recommendations.push('Consider improving trade entry criteria to increase win rate');
        }
        
        if (profitFactor < 1.2) {
            recommendations.push('Focus on improving risk/reward ratio per trade');
        }
        
        if (maxDrawdown > 15) {
            recommendations.push('Implement stricter risk management to reduce drawdowns');
        }

        if (recommendations.length === 0) {
            recommendations.push('Trading performance is within acceptable ranges');
        }

        return recommendations;
    }

    calculateProfitRanges(profits) {
        const ranges = {
            'Large Loss (< -100)': 0,
            'Medium Loss (-100 to -50)': 0,
            'Small Loss (-50 to 0)': 0,
            'Small Profit (0 to 50)': 0,
            'Medium Profit (50 to 100)': 0,
            'Large Profit (> 100)': 0,
        };

        profits.forEach(p => {
            if (p < -100) ranges['Large Loss (< -100)']++;
            else if (p < -50) ranges['Medium Loss (-100 to -50)']++;
            else if (p < 0) ranges['Small Loss (-50 to 0)']++;
            else if (p < 50) ranges['Small Profit (0 to 50)']++;
            else if (p < 100) ranges['Medium Profit (50 to 100)']++;
            else ranges['Large Profit (> 100)']++;
        });

        return ranges;
    }

    classifyRiskLevel(volatility, maxDrawdown) {
        if (volatility > 0.05 || maxDrawdown > 0.25) return 'High';
        if (volatility > 0.03 || maxDrawdown > 0.15) return 'Medium';
        return 'Low';
    }

    calculateSkewness(returns) {
        const n = returns.length;
        const mean = returns.reduce((sum, r) => sum + r, 0) / n;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        
        if (stdDev === 0) return 0;
        
        const skewness = returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 3), 0) / n;
        return Math.round(skewness * 100) / 100;
    }

    calculateKurtosis(returns) {
        const n = returns.length;
        const mean = returns.reduce((sum, r) => sum + r, 0) / n;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        
        if (stdDev === 0) return 0;
        
        const kurtosis = returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 4), 0) / n - 3;
        return Math.round(kurtosis * 100) / 100;
    }

    calculatePerformanceScore(winRate, profitFactor, sharpeRatio, maxDrawdown) {
        const winRateScore = Math.min(winRate / 60 * 25, 25);
        const profitFactorScore = Math.min(profitFactor / 2 * 25, 25);
        const sharpeScore = Math.min((sharpeRatio + 1) / 2 * 25, 25);
        const drawdownScore = Math.max(0, 25 - (maxDrawdown / 20 * 25));
        
        return Math.round(winRateScore + profitFactorScore + sharpeScore + drawdownScore);
    }

    getPerformanceGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    }
}

exports.MyPetAnalytics = MyPetAnalytics;
