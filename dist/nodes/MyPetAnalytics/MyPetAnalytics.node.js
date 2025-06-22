"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyPetAnalytics = void 0;

// Helper functions
function parseNumber(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

function parseDate(value) {
    if (!value) {
        return new Date();
    }

    if (value instanceof Date) {
        return value;
    }

    try {
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    } catch (error) {
        console.warn('Failed to parse date:', value);
        return new Date();
    }
}

function normalizeTradeDataArray(trades) {
    // Normalize array of trade data
    return trades.filter(trade => trade && typeof trade === 'object')
                .map((trade, index) => {
                    try {
                        return {
                            id: trade.id || trade.orderId || trade.ticket || `trade_${index}`,
                            symbol: trade.symbol || trade.instrument || trade.pair || 'UNKNOWN',
                            volume: parseNumber(trade.volume || trade.size || trade.lots || trade.amount, 0),
                            openPrice: parseNumber(trade.openPrice || trade.price || trade.entryPrice, 0),
                            closePrice: parseNumber(trade.closePrice || trade.exitPrice, null),
                            profit: parseNumber(trade.orderProfit || trade.profit || trade.pnl || trade.netProfit, 0),
                            commission: parseNumber(trade.commission || trade.fee || trade.cost, 0),
                            openTime: parseDate(trade.openTime || trade.timestamp || trade.time || trade.opentime),
                            closeTime: trade.closeTime || trade.closeTimestamp || trade.closetime ?
                                      parseDate(trade.closeTime || trade.closeTimestamp || trade.closetime) : null,
                            type: trade.tradeType || trade.type || trade.side || 'unknown',
                            swap: parseNumber(trade.swap, 0),
                            comment: trade.comment || trade.description || '',
                        };
                    } catch (error) {
                        console.error('Error normalizing trade:', error, trade);
                        return null;
                    }
                })
                .filter(trade => trade !== null);
}

function extractTradingData(inputData) {
    console.log('=== EXTRACTING TRADING DATA ===');
    console.log('Input data type:', typeof inputData);
    console.log('Input data keys:', Object.keys(inputData || {}));
    console.log('Input data size (JSON):', JSON.stringify(inputData).length, 'characters');

    // Handle null or undefined input
    if (!inputData) {
        console.log('No input data provided');
        return { trades: [], orderInfo: null };
    }

    let trades = [];
    let orderInfo = null;

    // Handle multiple pages of data (if input is an array of pages)
    if (Array.isArray(inputData) && inputData.length > 0 && inputData[0].orders) {
        console.log('🔄 Detected multiple pages of data:', inputData.length, 'pages');
        let allTrades = [];
        let combinedOrderInfo = null;

        inputData.forEach((page, index) => {
            console.log(`Processing page ${index + 1}:`, page.orders?.length || 0, 'trades');
            if (page.orders && Array.isArray(page.orders)) {
                allTrades = allTrades.concat(page.orders);
            }

            // Use the most recent orderInfo (usually from the last page)
            if (page.orderInfo) {
                combinedOrderInfo = page.orderInfo;
            }
        });

        console.log('✅ Combined all pages:', allTrades.length, 'total trades');
        return { trades: normalizeTradeDataArray(allTrades), orderInfo: combinedOrderInfo };
    }

    // Extract orderInfo if available
    if (inputData.orderInfo) {
        orderInfo = inputData.orderInfo;
        console.log('Found orderInfo with keys:', Object.keys(orderInfo));
    }

    // Try different possible data structures with pagination support
    console.log('Checking for orders array:', !!inputData.orders, Array.isArray(inputData.orders));

    // Handle MyPet API structure: result.results.data
    if (inputData.result && inputData.result.results && Array.isArray(inputData.result.results.data)) {
        console.log('✅ Found MyPet API structure: result.results.data with', inputData.result.results.data.length, 'items');
        console.log('Pagination info:', {
            count: inputData.result.count,
            next: !!inputData.result.next,
            previous: !!inputData.result.previous
        });
        trades = inputData.result.results.data;
        // Extract orderInfo from result.results
        if (inputData.result.results.order_info) {
            orderInfo = inputData.result.results.order_info;
            console.log('Found orderInfo in result.results');
        }
    }
    // Handle direct orders array
    else if (inputData.orders && Array.isArray(inputData.orders)) {
        console.log('✅ Found orders array with', inputData.orders.length, 'items');
        console.log('First order sample:', JSON.stringify(inputData.orders[0], null, 2));
        trades = inputData.orders;
    }
    // Handle trades array
    else if (inputData.trades && Array.isArray(inputData.trades)) {
        console.log('✅ Found trades array with', inputData.trades.length, 'items');
        trades = inputData.trades;
    }
    // Handle data array
    else if (inputData.data && Array.isArray(inputData.data)) {
        console.log('✅ Found data array with', inputData.data.length, 'items');
        trades = inputData.data;
    }
    // Handle direct array input
    else if (Array.isArray(inputData)) {
        console.log('✅ Input is direct array with', inputData.length, 'items');
        trades = inputData;
    }
    // Handle result array
    else if (inputData.result && Array.isArray(inputData.result)) {
        console.log('✅ Found result array with', inputData.result.length, 'items');
        trades = inputData.result;
    }
    // Search for any array property
    else {
        console.log('🔍 Searching for array properties...');
        for (const key in inputData) {
            console.log(`Checking property "${key}":`, Array.isArray(inputData[key]), inputData[key]?.length || 'N/A');
            if (Array.isArray(inputData[key]) && inputData[key].length > 0) {
                console.log('✅ Found array in property:', key, 'with', inputData[key].length, 'items');
                trades = inputData[key];
                break;
            }
        }
    }

    // If still no trades found, try to wrap single object
    if (trades.length === 0 && typeof inputData === 'object' && inputData !== null) {
        console.log('Wrapping single object as trade');
        trades = [inputData];
    }

    console.log('Raw trades found:', trades.length);

    // Filter and normalize trade data
    const normalizedTrades = trades.filter(trade => trade && typeof trade === 'object')
                .map((trade, index) => {
                    try {
                        return {
                            id: trade.id || trade.orderId || trade.ticket || `trade_${index}`,
                            symbol: trade.symbol || trade.instrument || trade.pair || 'UNKNOWN',
                            volume: parseNumber(trade.volume || trade.size || trade.lots || trade.amount, 0),
                            openPrice: parseNumber(trade.openPrice || trade.price || trade.entryPrice, 0),
                            closePrice: parseNumber(trade.closePrice || trade.exitPrice, null),
                            profit: parseNumber(trade.orderProfit || trade.profit || trade.pnl || trade.netProfit, 0),
                            commission: parseNumber(trade.commission || trade.fee || trade.cost, 0),
                            openTime: parseDate(trade.openTime || trade.timestamp || trade.time || trade.opentime),
                            closeTime: trade.closeTime || trade.closeTimestamp || trade.closetime ?
                                      parseDate(trade.closeTime || trade.closeTimestamp || trade.closetime) : null,
                            type: trade.tradeType || trade.type || trade.side || 'unknown',
                            swap: parseNumber(trade.swap, 0),
                            comment: trade.comment || trade.description || '',
                        };
                    } catch (error) {
                        console.error('Error normalizing trade:', error, trade);
                        return null;
                    }
                })
                .filter(trade => trade !== null);

    console.log('Normalized trades:', normalizedTrades.length);
    return { trades: normalizedTrades, orderInfo };
}

function generateBasicInsights(trades, closedTrades) {
    const insights = [];

    if (trades.length > 0) {
        insights.push(`Analyzed ${trades.length} total trades`);
    }

    if (closedTrades.length > 0) {
        const profitableTrades = closedTrades.filter(t => (t.profit || 0) > 0).length;
        const winRate = (profitableTrades / closedTrades.length) * 100;
        insights.push(`Win rate: ${Math.round(winRate)}%`);
    }

    return insights;
}

function performBasicAnalysis(trades, orderInfo = null) {
    console.log('Performing basic analysis on', trades.length, 'trades');

    const totalTrades = trades.length;
    const closedTrades = trades.filter(t => t.closeTime && t.profit !== undefined && t.profit !== null);

    if (totalTrades === 0) {
        return {
            error: 'No trading data found',
            debug: {
                totalTrades,
                closedTrades: closedTrades.length,
                sampleTrade: trades[0] || null
            }
        };
    }

    const totalVolume = trades.reduce((sum, t) => sum + (t.volume || 0), 0);
    const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalCommission = closedTrades.reduce((sum, t) => sum + (t.commission || 0), 0);

    // Symbol distribution
    const symbolCounts = {};
    trades.forEach(t => {
        const symbol = t.symbol || 'UNKNOWN';
        symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    });

    const result = {
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
        insights: generateBasicInsights(trades, closedTrades),
        debug: {
            sampleTrade: trades[0] || null,
            tradeFields: trades[0] ? Object.keys(trades[0]) : []
        }
    };

    // Add orderInfo if available
    if (orderInfo) {
        result.orderInfo = {
            total: orderInfo.total || {},
            open: orderInfo.open || {},
            sell_close: orderInfo.sell_close || {},
            buy_close: orderInfo.buy_close || {},
            fund: orderInfo.fund || {}
        };

        // Add comparison between calculated and API provided data
        if (orderInfo.total) {
            result.dataComparison = {
                calculatedVsApi: {
                    totalTrades: { calculated: totalTrades, api: orderInfo.total.total || 0 },
                    totalProfit: { calculated: Math.round(totalProfit * 100) / 100, api: orderInfo.total.total_orderProfit || 0 },
                    totalVolume: { calculated: Math.round(totalVolume * 100) / 100, api: orderInfo.total.total_lots || 0 }
                }
            };
        }
    }

    return result;
}

function generateProfitInsights(winRate, profitFactor, totalProfit) {
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

function calculateProfitRanges(profits) {
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

function performProfitAnalysis(trades) {
    const closedTrades = trades.filter(t => t.closeTime && t.profit !== undefined && t.profit !== null);

    if (closedTrades.length === 0) {
        return {
            error: 'No closed trades found for profit analysis',
            debug: {
                totalTrades: trades.length,
                tradesWithProfit: trades.filter(t => t.profit !== undefined).length,
                tradesWithCloseTime: trades.filter(t => t.closeTime).length
            }
        };
    }

    const profits = closedTrades.map(t => t.profit || 0);
    const winningTrades = profits.filter(p => p > 0);
    const losingTrades = profits.filter(p => p < 0);

    const totalProfit = profits.reduce((sum, p) => sum + p, 0);
    const winRate = profits.length > 0 ? (winningTrades.length / profits.length) * 100 : 0;
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
            largestWin: profits.length > 0 ? Math.max(...profits) : 0,
            largestLoss: profits.length > 0 ? Math.min(...profits) : 0,
        },
        distribution: {
            profits: profits.sort((a, b) => b - a),
            profitRanges: calculateProfitRanges(profits),
        },
        insights: generateProfitInsights(winRate, profitFactor, totalProfit),
    };
}

function generateRiskInsights(volatility, maxDrawdown, var95) {
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

function classifyRiskLevel(volatility, maxDrawdown) {
    if (volatility > 0.05 || maxDrawdown > 0.25) return 'High';
    if (volatility > 0.03 || maxDrawdown > 0.15) return 'Medium';
    return 'Low';
}

function calculateSkewness(returns) {
    if (returns.length < 3) return 0;

    const n = returns.length;
    const mean = returns.reduce((sum, r) => sum + r, 0) / n;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    const skewness = returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 3), 0) / n;
    return Math.round(skewness * 100) / 100;
}

function calculateKurtosis(returns) {
    if (returns.length < 4) return 0;

    const n = returns.length;
    const mean = returns.reduce((sum, r) => sum + r, 0) / n;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    const kurtosis = returns.reduce((sum, r) => sum + Math.pow((r - mean) / stdDev, 4), 0) / n - 3;
    return Math.round(kurtosis * 100) / 100;
}

function performRiskAnalysis(trades) {
    const closedTrades = trades.filter(t => t.closeTime && t.profit !== undefined && t.profit !== null);

    if (closedTrades.length === 0) {
        return { error: 'No closed trades found for risk analysis' };
    }

    const profits = closedTrades.map(t => t.profit || 0);
    const returns = profits.map(p => p / 1000); // Normalize returns

    // Basic risk metrics
    const mean = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0;
    const variance = returns.length > 0 ? returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length : 0;
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
        const drawdown = peak !== 0 ? (peak - cumulativeProfit) / Math.abs(peak) : 0;
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
            riskLevel: classifyRiskLevel(stdDev, maxDrawdown),
        },
        metrics: {
            meanReturn: Math.round(mean * 1000 * 100) / 100,
            standardDeviation: Math.round(stdDev * 1000 * 100) / 100,
            skewness: calculateSkewness(returns),
            kurtosis: calculateKurtosis(returns),
        },
        insights: generateRiskInsights(stdDev, maxDrawdown, var95),
    };
}

function generatePerformanceRecommendations(winRate, profitFactor, maxDrawdown) {
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

function calculatePerformanceScore(winRate, profitFactor, sharpeRatio, maxDrawdown) {
    const winRateScore = Math.min(winRate / 60 * 25, 25);
    const profitFactorScore = Math.min(profitFactor / 2 * 25, 25);
    const sharpeScore = Math.min((sharpeRatio + 1) / 2 * 25, 25);
    const drawdownScore = Math.max(0, 25 - (maxDrawdown / 20 * 25));

    return Math.round(winRateScore + profitFactorScore + sharpeScore + drawdownScore);
}

function getPerformanceGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
}

function performPerformanceAnalysis(trades) {
    const basicAnalysis = performBasicAnalysis(trades);
    const profitAnalysis = performProfitAnalysis(trades);
    const riskAnalysis = performRiskAnalysis(trades);

    if (basicAnalysis.error || profitAnalysis.error || riskAnalysis.error) {
        return {
            error: 'Insufficient data for performance analysis',
            details: {
                basicError: basicAnalysis.error,
                profitError: profitAnalysis.error,
                riskError: riskAnalysis.error
            }
        };
    }

    // Performance score calculation
    const winRate = profitAnalysis.summary.winRate || 0;
    const profitFactor = profitAnalysis.summary.profitFactor || 0;
    const sharpeRatio = riskAnalysis.summary.sharpeRatio || 0;
    const maxDrawdown = riskAnalysis.summary.maxDrawdown || 0;

    const performanceScore = calculatePerformanceScore(winRate, profitFactor, sharpeRatio, maxDrawdown);

    return {
        summary: {
            performanceScore,
            grade: getPerformanceGrade(performanceScore),
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
        recommendations: generatePerformanceRecommendations(winRate, profitFactor, maxDrawdown),
    };
}

function generateChartData(analysisResult, analysisType) {
    const charts = [];

    try {
        switch (analysisType) {
            case 'profit':
                if (analysisResult.summary && !analysisResult.error) {
                    charts.push({
                        type: 'pie',
                        title: 'Win/Loss Distribution',
                        data: {
                            labels: ['Winning Trades', 'Losing Trades'],
                            values: [analysisResult.summary.winningTrades || 0, analysisResult.summary.losingTrades || 0],
                        },
                    });
                }
                break;
            case 'risk':
                if (analysisResult.metrics && !analysisResult.error) {
                    charts.push({
                        type: 'bar',
                        title: 'Risk Metrics',
                        data: {
                            labels: ['Volatility %', 'Max Drawdown %', 'Sharpe Ratio x10'],
                            values: [
                                analysisResult.summary.volatility || 0,
                                analysisResult.summary.maxDrawdown || 0,
                                (analysisResult.summary.sharpeRatio || 0) * 10,
                            ],
                        },
                    });
                }
                break;
        }
    } catch (error) {
        console.error('Error generating chart data:', error);
    }

    return charts;
}

function generateHtmlReportContent(analysisResult, analysisType, metadata) {
    const timestamp = new Date().toLocaleString();

    // Generate chart data for HTML
    const chartData = generateChartDataForHtml(analysisResult, analysisType);

    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyPet Analytics Report - ${analysisType}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
            padding: 25px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .section h2 {
            margin-top: 0;
            color: #667eea;
            font-size: 1.8em;
            font-weight: 500;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            border-top: 3px solid #667eea;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
            margin: 10px 0;
        }
        .metric-label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .positive { color: #28a745; }
        .negative { color: #dc3545; }
        .neutral { color: #6c757d; }
        .insights {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2196f3;
        }
        .insights h3 {
            margin-top: 0;
            color: #1976d2;
        }
        .insights ul {
            margin: 0;
            padding-left: 20px;
        }
        .insights li {
            margin: 8px 0;
            color: #424242;
        }
        .chart-container {
            margin: 30px 0;
            text-align: center;
        }
        .chart-canvas {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #666;
            border-top: 1px solid #dee2e6;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .data-table th,
        .data-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        .data-table th {
            background: #667eea;
            color: white;
            font-weight: 500;
            text-transform: uppercase;
            font-size: 0.9em;
            letter-spacing: 1px;
        }
        .data-table tr:hover {
            background: #f8f9fa;
        }
        @media (max-width: 768px) {
            .metrics-grid {
                grid-template-columns: 1fr;
            }
            .header h1 {
                font-size: 2em;
            }
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 MyPet Analytics Report</h1>
            <p>Analysis Type: ${analysisType.toUpperCase()} | Generated: ${timestamp}</p>
        </div>

        <div class="content">
            ${generateSummarySection(analysisResult)}
            ${generateChartsSection(chartData)}
            ${generateInsightsSection(analysisResult)}
            ${generateOrderInfoSection(analysisResult)}
            ${generateDetailedDataSection(analysisResult)}
        </div>

        <div class="footer">
            <p>Generated by MyPet Analytics v${metadata.version} | Data Points: ${metadata.dataPoints}</p>
            <p>${metadata.note || ''}</p>
        </div>
    </div>
</body>
</html>`;

    return html;
}

function generateChartDataForHtml(analysisResult, analysisType) {
    // Generate base64 chart images for HTML embedding
    const charts = [];

    try {
        switch (analysisType) {
            case 'basic':
                // 1. Symbol Distribution Pie Chart
                if (analysisResult.symbolDistribution) {
                    const symbolChart = generatePieChartBase64(
                        'Symbol Distribution',
                        Object.keys(analysisResult.symbolDistribution),
                        Object.values(analysisResult.symbolDistribution)
                    );
                    if (symbolChart) charts.push(symbolChart);
                }

                // 2. Volume Distribution Bar Chart
                if (analysisResult.summary) {
                    const volumeChart = generateBarChartBase64(
                        'Trading Volume Metrics',
                        ['Total Volume', 'Avg Volume', 'Total Trades'],
                        [
                            analysisResult.summary.totalVolume || 0,
                            (analysisResult.summary.totalVolume || 0) / Math.max(analysisResult.summary.totalTrades || 1, 1),
                            analysisResult.summary.totalTrades || 0
                        ]
                    );
                    if (volumeChart) charts.push(volumeChart);
                }

                // 3. Profit vs Commission Chart
                if (analysisResult.summary) {
                    const profitChart = generateBarChartBase64(
                        'Profit vs Commission',
                        ['Total Profit', 'Total Commission', 'Net Profit'],
                        [
                            analysisResult.summary.totalProfit || 0,
                            Math.abs(analysisResult.summary.totalCommission || 0),
                            analysisResult.summary.netProfit || 0
                        ]
                    );
                    if (profitChart) charts.push(profitChart);
                }
                break;

            case 'profit':
                // 1. Win/Loss Distribution Pie Chart
                if (analysisResult.summary && !analysisResult.error) {
                    const winLossChart = generatePieChartBase64(
                        'Win/Loss Distribution',
                        ['Winning Trades', 'Losing Trades'],
                        [analysisResult.summary.winningTrades || 0, analysisResult.summary.losingTrades || 0]
                    );
                    if (winLossChart) charts.push(winLossChart);
                }

                // 2. Profit Metrics Bar Chart
                if (analysisResult.summary && !analysisResult.error) {
                    const profitMetricsChart = generateBarChartBase64(
                        'Profit Metrics',
                        ['Total Profit', 'Average Win', 'Average Loss', 'Profit Factor'],
                        [
                            analysisResult.summary.totalProfit || 0,
                            analysisResult.summary.averageWin || 0,
                            Math.abs(analysisResult.summary.averageLoss || 0),
                            (analysisResult.summary.profitFactor || 0) * 10
                        ]
                    );
                    if (profitMetricsChart) charts.push(profitMetricsChart);
                }

                // 3. Profit Range Distribution
                if (analysisResult.distribution && analysisResult.distribution.profitRanges) {
                    const rangeChart = generateBarChartBase64(
                        'Profit Range Distribution',
                        Object.keys(analysisResult.distribution.profitRanges),
                        Object.values(analysisResult.distribution.profitRanges)
                    );
                    if (rangeChart) charts.push(rangeChart);
                }
                break;

            case 'risk':
                // 1. Risk Metrics Bar Chart
                if (analysisResult.summary && !analysisResult.error) {
                    const riskChart = generateBarChartBase64(
                        'Risk Metrics',
                        ['Volatility %', 'Max Drawdown %', 'Sharpe Ratio x10', 'VaR 95%'],
                        [
                            analysisResult.summary.volatility || 0,
                            analysisResult.summary.maxDrawdown || 0,
                            (analysisResult.summary.sharpeRatio || 0) * 10,
                            Math.abs(analysisResult.summary.var95 || 0)
                        ]
                    );
                    if (riskChart) charts.push(riskChart);
                }

                // 2. Risk Level Pie Chart
                if (analysisResult.summary && !analysisResult.error) {
                    const riskLevel = analysisResult.summary.riskLevel || 'Medium';
                    const riskLevelChart = generatePieChartBase64(
                        'Risk Level Assessment',
                        ['Low Risk', 'Medium Risk', 'High Risk'],
                        [
                            riskLevel === 'Low' ? 1 : 0,
                            riskLevel === 'Medium' ? 1 : 0,
                            riskLevel === 'High' ? 1 : 0
                        ]
                    );
                    if (riskLevelChart) charts.push(riskLevelChart);
                }
                break;

            case 'performance':
                // 1. Performance Breakdown Bar Chart
                if (analysisResult.breakdown && !analysisResult.error) {
                    const performanceChart = generateBarChartBase64(
                        'Performance Breakdown',
                        ['Profitability', 'Consistency', 'Risk Management', 'Efficiency'],
                        [
                            analysisResult.breakdown.profitability || 0,
                            analysisResult.breakdown.consistency || 0,
                            analysisResult.breakdown.riskManagement || 0,
                            analysisResult.breakdown.efficiency || 0
                        ]
                    );
                    if (performanceChart) charts.push(performanceChart);
                }

                // 2. Performance Score Gauge (as pie chart)
                if (analysisResult.summary && !analysisResult.error) {
                    const score = analysisResult.summary.performanceScore || 0;
                    const scoreChart = generatePieChartBase64(
                        'Performance Score',
                        ['Score', 'Remaining'],
                        [score, Math.max(0, 100 - score)]
                    );
                    if (scoreChart) charts.push(scoreChart);
                }

                // 3. Key Metrics Comparison
                if (analysisResult.summary && !analysisResult.error) {
                    const metricsChart = generateBarChartBase64(
                        'Key Performance Metrics',
                        ['Win Rate %', 'Profit Factor x10', 'Max DD %', 'Sharpe x10'],
                        [
                            analysisResult.summary.winRate || 0,
                            (analysisResult.summary.profitFactor || 0) * 10,
                            analysisResult.summary.maxDrawdown || 0,
                            (analysisResult.summary.sharpeRatio || 0) * 10
                        ]
                    );
                    if (metricsChart) charts.push(metricsChart);
                }
                break;
        }
    } catch (error) {
        console.error('Error generating chart data for HTML:', error);
    }

    return charts.filter(chart => chart !== null);
}

function generatePieChartBase64(title, labels, data) {
    // Generate SVG pie chart
    const width = 400;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 40;
    const centerX = width / 2;
    const centerY = height / 2;

    // 数据验证
    if (!data || !labels || data.length === 0 || labels.length === 0) {
        console.log('Invalid data for pie chart:', { title, labels, data });
        return null;
    }

    const total = data.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
    if (total === 0) {
        console.log('Total is zero for pie chart:', title);
        return null;
    }

    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    let currentAngle = 0;

    let paths = '';
    let legends = '';

    data.forEach((value, index) => {
        const percentage = (value / total) * 100;
        const angle = (value / total) * 2 * Math.PI;
        const endAngle = currentAngle + angle;

        const x1 = centerX + radius * Math.cos(currentAngle);
        const y1 = centerY + radius * Math.sin(currentAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);

        const largeArcFlag = angle > Math.PI ? 1 : 0;

        paths += `<path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z" fill="${colors[index % colors.length]}" stroke="white" stroke-width="2"/>`;

        legends += `<div style="display: flex; align-items: center; margin: 5px 0;">
            <div style="width: 20px; height: 20px; background: ${colors[index % colors.length]}; margin-right: 10px; border-radius: 3px;"></div>
            <span>${labels[index]}: ${value} (${percentage.toFixed(1)}%)</span>
        </div>`;

        currentAngle = endAngle;
    });

    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text x="${centerX}" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#333">${title}</text>
        ${paths}
    </svg>`;

    // 确保 SVG 正确编码
    const cleanSvg = svg.replace(/\s+/g, ' ').trim();
    const base64 = Buffer.from(cleanSvg, 'utf8').toString('base64');

    return {
        title,
        type: 'pie',
        image: `data:image/svg+xml;base64,${base64}`,
        legend: legends
    };
}

function generateBarChartBase64(title, labels, data) {
    // 数据验证
    if (!data || !labels || data.length === 0 || labels.length === 0) {
        console.log('Invalid data for bar chart:', { title, labels, data });
        return null;
    }

    const width = 500;
    const height = 300;
    const margin = { top: 50, right: 30, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // 确保数据是数字
    const numericData = data.map(d => parseFloat(d) || 0);
    const maxValue = Math.max(...numericData, 0);
    const minValue = Math.min(...numericData, 0);
    const range = maxValue - minValue || 1;

    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;

    let bars = '';
    let xLabels = '';

    numericData.forEach((value, index) => {
        const barHeight = Math.abs(value - minValue) / range * chartHeight;
        const x = margin.left + index * (barWidth + barSpacing) + barSpacing / 2;
        const y = margin.top + chartHeight - barHeight;

        bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${colors[index % colors.length]}" stroke="white" stroke-width="1"/>`;
        bars += `<text x="${x + barWidth/2}" y="${y - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#333">${value.toFixed(1)}</text>`;

        // X-axis labels - 截断长标签
        const label = labels[index] ? labels[index].toString().substring(0, 10) : '';
        xLabels += `<text x="${x + barWidth/2}" y="${height - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">${label}</text>`;
    });

    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text x="${width/2}" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#333">${title}</text>
        <rect x="${margin.left}" y="${margin.top}" width="${chartWidth}" height="${chartHeight}" fill="#f8f9fa" stroke="#dee2e6"/>
        <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + chartHeight}" stroke="#666" stroke-width="1"/>
        <line x1="${margin.left}" y1="${margin.top + chartHeight}" x2="${margin.left + chartWidth}" y2="${margin.top + chartHeight}" stroke="#666" stroke-width="1"/>
        ${bars}
        ${xLabels}
    </svg>`;

    // 确保 SVG 正确编码
    const cleanSvg = svg.replace(/\s+/g, ' ').trim();
    const base64 = Buffer.from(cleanSvg, 'utf8').toString('base64');

    return {
        title,
        type: 'bar',
        image: `data:image/svg+xml;base64,${base64}`,
        legend: ''
    };
}

function generateSimpleChartBase64(title, labels, data, type = 'bar') {
    // 生成简单的 HTML Canvas 图表作为备选方案
    const width = 400;
    const height = 300;

    const canvasScript = `
    <canvas id="chart" width="${width}" height="${height}"></canvas>
    <script>
        const canvas = document.getElementById('chart');
        const ctx = canvas.getContext('2d');

        // 清除画布
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, ${width}, ${height});

        // 绘制标题
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('${title}', ${width/2}, 25);

        const data = [${data.join(',')}];
        const labels = [${labels.map(l => `'${l}'`).join(',')}];
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

        if ('${type}' === 'pie') {
            // 饼图
            const centerX = ${width/2};
            const centerY = ${height/2};
            const radius = 80;
            const total = data.reduce((sum, val) => sum + val, 0);

            let currentAngle = 0;
            data.forEach((value, index) => {
                const sliceAngle = (value / total) * 2 * Math.PI;

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = colors[index % colors.length];
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();

                currentAngle += sliceAngle;
            });
        } else {
            // 柱状图
            const margin = 60;
            const chartWidth = ${width} - margin * 2;
            const chartHeight = ${height} - margin * 2;
            const barWidth = chartWidth / data.length * 0.8;
            const maxValue = Math.max(...data);

            data.forEach((value, index) => {
                const barHeight = (value / maxValue) * chartHeight;
                const x = margin + index * (chartWidth / data.length) + (chartWidth / data.length - barWidth) / 2;
                const y = margin + chartHeight - barHeight;

                ctx.fillStyle = colors[index % colors.length];
                ctx.fillRect(x, y, barWidth, barHeight);

                // 标签
                ctx.fillStyle = '#666666';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(labels[index], x + barWidth/2, ${height} - 10);
                ctx.fillText(value.toFixed(1), x + barWidth/2, y - 5);
            });
        }

        // 转换为 base64
        const dataURL = canvas.toDataURL('image/png');
        document.body.innerHTML = '<img src="' + dataURL + '" alt="${title}" style="max-width: 100%; height: auto;" />';
    </script>`;

    return {
        title,
        type,
        image: `data:text/html;base64,${Buffer.from(canvasScript).toString('base64')}`,
        legend: ''
    };
}

function generateSummarySection(analysisResult) {
    if (!analysisResult.summary) return '';

    const s = analysisResult.summary;
    return `
        <div class="section">
            <h2>📈 Summary Statistics</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-label">Total Trades</div>
                    <div class="metric-value">${s.totalTrades || 0}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Closed Trades</div>
                    <div class="metric-value">${s.closedTrades || 0}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Total Profit</div>
                    <div class="metric-value ${(s.totalProfit || 0) >= 0 ? 'positive' : 'negative'}">${(s.totalProfit || 0).toFixed(2)}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Net Profit</div>
                    <div class="metric-value ${(s.netProfit || 0) >= 0 ? 'positive' : 'negative'}">${(s.netProfit || 0).toFixed(2)}</div>
                </div>
                ${s.winRate !== undefined ? `
                <div class="metric-card">
                    <div class="metric-label">Win Rate</div>
                    <div class="metric-value">${s.winRate.toFixed(1)}%</div>
                </div>` : ''}
                ${s.performanceScore !== undefined ? `
                <div class="metric-card">
                    <div class="metric-label">Performance Score</div>
                    <div class="metric-value">${s.performanceScore} (${s.grade})</div>
                </div>` : ''}
            </div>
        </div>
    `;
}

function generateChartsSection(chartData) {
    if (!chartData || chartData.length === 0) return '';

    let chartsHtml = '';
    chartData.forEach(chart => {
        if (chart) {
            chartsHtml += `
                <div class="chart-container">
                    <h3>${chart.title}</h3>
                    <img src="${chart.image}" alt="${chart.title}" class="chart-canvas" />
                    ${chart.legend ? `<div style="margin-top: 20px; display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">${chart.legend}</div>` : ''}
                </div>
            `;
        }
    });

    return chartsHtml ? `
        <div class="section">
            <h2>📊 Charts</h2>
            ${chartsHtml}
        </div>
    ` : '';
}

function generateInsightsSection(analysisResult) {
    if (!analysisResult.insights || analysisResult.insights.length === 0) return '';

    const insightsList = analysisResult.insights.map(insight => `<li>${insight}</li>`).join('');

    return `
        <div class="section">
            <div class="insights">
                <h3>💡 Key Insights</h3>
                <ul>${insightsList}</ul>
            </div>
        </div>
    `;
}

function generateOrderInfoSection(analysisResult) {
    if (!analysisResult.orderInfo) return '';

    const orderInfo = analysisResult.orderInfo;

    return `
        <div class="section">
            <h2>📋 Order Information (API Data)</h2>
            <div class="metrics-grid">
                ${orderInfo.total ? `
                <div class="metric-card">
                    <div class="metric-label">API Total Trades</div>
                    <div class="metric-value">${orderInfo.total.total || 0}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">API Total Lots</div>
                    <div class="metric-value">${orderInfo.total.total_lots || 0}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">API Total Profit</div>
                    <div class="metric-value ${(orderInfo.total.total_orderProfit || 0) >= 0 ? 'positive' : 'negative'}">${(orderInfo.total.total_orderProfit || 0).toFixed(2)}</div>
                </div>` : ''}
                ${orderInfo.sell_close ? `
                <div class="metric-card">
                    <div class="metric-label">Sell Trades</div>
                    <div class="metric-value">${orderInfo.sell_close.total || 0}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Sell Profit</div>
                    <div class="metric-value ${(orderInfo.sell_close.total_orderProfit || 0) >= 0 ? 'positive' : 'negative'}">${(orderInfo.sell_close.total_orderProfit || 0).toFixed(2)}</div>
                </div>` : ''}
                ${orderInfo.buy_close ? `
                <div class="metric-card">
                    <div class="metric-label">Buy Trades</div>
                    <div class="metric-value">${orderInfo.buy_close.total || 0}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Buy Profit</div>
                    <div class="metric-value ${(orderInfo.buy_close.total_orderProfit || 0) >= 0 ? 'positive' : 'negative'}">${(orderInfo.buy_close.total_orderProfit || 0).toFixed(2)}</div>
                </div>` : ''}
            </div>

            ${analysisResult.dataComparison ? `
            <h3>🔍 Data Comparison (Calculated vs API)</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Calculated</th>
                        <th>API</th>
                        <th>Difference</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Total Trades</td>
                        <td>${analysisResult.dataComparison.calculatedVsApi.totalTrades.calculated}</td>
                        <td>${analysisResult.dataComparison.calculatedVsApi.totalTrades.api}</td>
                        <td class="${analysisResult.dataComparison.calculatedVsApi.totalTrades.calculated === analysisResult.dataComparison.calculatedVsApi.totalTrades.api ? 'positive' : 'negative'}">
                            ${analysisResult.dataComparison.calculatedVsApi.totalTrades.calculated - analysisResult.dataComparison.calculatedVsApi.totalTrades.api}
                        </td>
                    </tr>
                    <tr>
                        <td>Total Profit</td>
                        <td>${analysisResult.dataComparison.calculatedVsApi.totalProfit.calculated}</td>
                        <td>${analysisResult.dataComparison.calculatedVsApi.totalProfit.api}</td>
                        <td class="${Math.abs(analysisResult.dataComparison.calculatedVsApi.totalProfit.calculated - analysisResult.dataComparison.calculatedVsApi.totalProfit.api) < 0.01 ? 'positive' : 'negative'}">
                            ${(analysisResult.dataComparison.calculatedVsApi.totalProfit.calculated - analysisResult.dataComparison.calculatedVsApi.totalProfit.api).toFixed(2)}
                        </td>
                    </tr>
                    <tr>
                        <td>Total Volume</td>
                        <td>${analysisResult.dataComparison.calculatedVsApi.totalVolume.calculated}</td>
                        <td>${analysisResult.dataComparison.calculatedVsApi.totalVolume.api}</td>
                        <td class="${Math.abs(analysisResult.dataComparison.calculatedVsApi.totalVolume.calculated - analysisResult.dataComparison.calculatedVsApi.totalVolume.api) < 0.01 ? 'positive' : 'negative'}">
                            ${(analysisResult.dataComparison.calculatedVsApi.totalVolume.calculated - analysisResult.dataComparison.calculatedVsApi.totalVolume.api).toFixed(2)}
                        </td>
                    </tr>
                </tbody>
            </table>` : ''}
        </div>
    `;
}

function generateDetailedDataSection(analysisResult) {
    let content = '';

    if (analysisResult.symbolDistribution) {
        const symbols = Object.entries(analysisResult.symbolDistribution);
        if (symbols.length > 0) {
            content += `
                <h3>📈 Symbol Distribution</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Trade Count</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${symbols.map(([symbol, count]) => {
                            const total = symbols.reduce((sum, [, c]) => sum + c, 0);
                            const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
                            return `
                                <tr>
                                    <td>${symbol}</td>
                                    <td>${count}</td>
                                    <td>${percentage}%</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }
    }

    return content ? `
        <div class="section">
            <h2>📊 Detailed Data</h2>
            ${content}
        </div>
    ` : '';
}

class MyPetAnalytics {
    constructor() {
        this.description = {
            displayName: 'MyPet Analytics',
            name: 'myPetAnalytics',
            icon: 'file:mypet-analytics.svg',
            group: ['transform'],
            version: 2,
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
                    displayName: 'Include Charts',
                    name: 'includeCharts',
                    type: 'boolean',
                    default: false,
                    description: 'Whether to include chart data in output',
                },
                {
                    displayName: 'Generate HTML Report',
                    name: 'generateHtmlReport',
                    type: 'boolean',
                    default: false,
                    description: 'Generate a complete HTML report with embedded charts (suitable for email)',
                },
            ],
        };
    }



    async execute() {
        const items = this.getInputData();
        const returnData = [];

        // 检查是否有输入数据
        if (!items || items.length === 0) {
            throw new Error('No input data received. Please connect a data source.');
        }

        console.log('=== MyPet Analytics v1.0.14 Execution ===');
        console.log('Total input items:', items.length);

        // 处理每个输入项
        for (let i = 0; i < items.length; i++) {
            try {
                const inputData = items[i].json;
                const analysisType = this.getNodeParameter('analysisType', i);
                const includeCharts = this.getNodeParameter('includeCharts', i);
                const generateHtmlReport = this.getNodeParameter('generateHtmlReport', i);

                console.log(`=== PROCESSING ITEM ${i + 1} ===`);
                console.log('Analysis type:', analysisType);
                console.log('Generate HTML Report:', generateHtmlReport);

                // Extract trading data and orderInfo
                const extractedData = extractTradingData(inputData);
                const trades = extractedData.trades;
                const orderInfo = extractedData.orderInfo;
                console.log('Extracted trades count:', trades.length);
                if (orderInfo) console.log('Found orderInfo with keys:', Object.keys(orderInfo));

                // Perform analysis based on type
                let analysisResult;
                switch (analysisType) {
                    case 'basic':
                        analysisResult = performBasicAnalysis(trades, orderInfo);
                        break;
                    case 'profit':
                        analysisResult = performProfitAnalysis(trades);
                        break;
                    case 'risk':
                        analysisResult = performRiskAnalysis(trades);
                        break;
                    case 'performance':
                        analysisResult = performPerformanceAnalysis(trades);
                        break;
                    default:
                        analysisResult = performBasicAnalysis(trades, orderInfo);
                }

                // Add metadata
                const metadata = {
                    analysisType,
                    includeCharts,
                    generateHtmlReport,
                    timestamp: new Date().toISOString(),
                    dataPoints: trades.length,
                    version: '1.0.14',
                    inputDataStructure: Object.keys(inputData || {}),
                    note: 'Simplified execution without pagination complexity',
                };

                const result = {
                    analysis: analysisResult,
                    metadata,
                };

                // Add chart data if requested
                if (includeCharts) {
                    result.charts = generateChartData(analysisResult, analysisType);
                }

                // Generate HTML report if requested
                if (generateHtmlReport) {
                    result.htmlReport = generateHtmlReportContent(analysisResult, analysisType, metadata);
                }

                returnData.push({ json: result });
            } catch (error) {
                console.error('Error processing item:', error);
                if (this.continueOnFail && this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message,
                            errorDetails: {
                                stack: error.stack,
                                inputData: items[i]?.json,
                                itemIndex: i
                            }
                        }
                    });
                } else {
                    throw error;
                }
            }
        }

        return [returnData];
    }


}

exports.MyPetAnalytics = MyPetAnalytics;