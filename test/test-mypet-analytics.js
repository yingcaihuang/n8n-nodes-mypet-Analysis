#!/usr/bin/env node

/**
 * MyPet Analytics 节点测试脚本
 * 用于在发布前验证所有功能
 */

const fs = require('fs');
const path = require('path');

// 模拟 n8n 执行上下文
class MockExecutionContext {
    constructor(inputData, nodeParameters = {}) {
        this.inputData = inputData;
        this.nodeParameters = nodeParameters;
        this.continueOnFailFlag = false;
    }

    getInputData() {
        return this.inputData;
    }

    getNodeParameter(paramName, itemIndex = 0) {
        return this.nodeParameters[paramName];
    }

    continueOnFail() {
        return this.continueOnFailFlag;
    }
}

// 加载节点代码
function loadNodeClass() {
    try {
        // 尝试加载修复版本
        const nodePath = path.join(__dirname, '../dist/nodes/MyPetAnalytics/MyPetAnalytics.node.js');
        if (fs.existsSync(nodePath)) {
            delete require.cache[require.resolve(nodePath)];
            const { MyPetAnalytics } = require(nodePath);
            return MyPetAnalytics;
        } else {
            throw new Error('Node file not found: ' + nodePath);
        }
    } catch (error) {
        console.error('Failed to load node class:', error.message);
        process.exit(1);
    }
}

// 测试数据集
const testDataSets = {
    // 测试1: MyPet Stocks 标准格式
    mypetStocksFormat: [
        {
            json: {
                orders: [
                    {
                        id: "12345",
                        symbol: "EURUSD",
                        volume: 0.1,
                        openPrice: 1.1000,
                        closePrice: 1.1050,
                        profit: 50,
                        commission: 2,
                        openTime: "2025-01-01T10:00:00Z",
                        closeTime: "2025-01-01T11:00:00Z"
                    },
                    {
                        id: "12346",
                        symbol: "GBPUSD",
                        volume: 0.2,
                        openPrice: 1.2500,
                        closePrice: 1.2480,
                        profit: -40,
                        commission: 3,
                        openTime: "2025-01-01T14:00:00Z",
                        closeTime: "2025-01-01T15:30:00Z"
                    },
                    {
                        id: "12347",
                        symbol: "USDJPY",
                        volume: 0.15,
                        openPrice: 110.50,
                        closePrice: 111.00,
                        profit: 75,
                        commission: 2.5,
                        openTime: "2025-01-02T09:00:00Z",
                        closeTime: "2025-01-02T10:15:00Z"
                    }
                ]
            }
        }
    ],

    // 测试2: 直接数组格式
    directArrayFormat: [
        {
            json: [
                {
                    ticket: "98765",
                    pair: "EURUSD",
                    lots: 0.05,
                    entryPrice: 1.0950,
                    exitPrice: 1.0980,
                    pnl: 15,
                    fee: 1,
                    opentime: "2025-01-03T08:00:00Z",
                    closetime: "2025-01-03T09:30:00Z"
                },
                {
                    ticket: "98766",
                    pair: "GBPUSD",
                    lots: 0.1,
                    entryPrice: 1.2600,
                    exitPrice: 1.2550,
                    pnl: -50,
                    fee: 2,
                    opentime: "2025-01-03T12:00:00Z",
                    closetime: "2025-01-03T13:45:00Z"
                }
            ]
        }
    ],

    // 测试3: 包装在 data 中的格式
    dataWrappedFormat: [
        {
            json: {
                data: [
                    {
                        orderId: "555",
                        instrument: "USDCAD",
                        size: 0.08,
                        price: 1.3500,
                        closePrice: 1.3520,
                        netProfit: 16,
                        cost: 1.5,
                        timestamp: "2025-01-04T11:00:00Z",
                        closeTimestamp: "2025-01-04T12:30:00Z"
                    }
                ],
                metadata: {
                    account: "demo123",
                    broker: "MyPet"
                }
            }
        }
    ],

    // 测试4: 空数据
    emptyData: [
        {
            json: {
                orders: []
            }
        }
    ],

    // 测试5: 无效数据
    invalidData: [
        {
            json: {
                message: "No trades found",
                status: "empty"
            }
        }
    ],

    // 测试6: 大数据集
    largeDataSet: [
        {
            json: {
                trades: Array.from({ length: 100 }, (_, i) => ({
                    id: `trade_${i}`,
                    symbol: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD'][i % 4],
                    volume: Math.random() * 0.5 + 0.01,
                    openPrice: 1.1000 + Math.random() * 0.1,
                    closePrice: 1.1000 + Math.random() * 0.1,
                    profit: (Math.random() - 0.5) * 200,
                    commission: Math.random() * 5,
                    openTime: new Date(2025, 0, 1 + Math.floor(i / 10)).toISOString(),
                    closeTime: new Date(2025, 0, 1 + Math.floor(i / 10) + 1).toISOString()
                }))
            }
        }
    ]
};

// 测试参数配置
const testConfigurations = [
    { analysisType: 'basic', timePeriod: '30d', includeCharts: false },
    { analysisType: 'profit', timePeriod: '30d', includeCharts: true },
    { analysisType: 'risk', timePeriod: '90d', includeCharts: true },
    { analysisType: 'performance', timePeriod: 'all', includeCharts: false }
];

// 执行单个测试
async function runSingleTest(testName, inputData, nodeParameters, NodeClass) {
    console.log(`\n🧪 测试: ${testName}`);
    console.log(`📊 分析类型: ${nodeParameters.analysisType}`);
    console.log(`📅 时间周期: ${nodeParameters.timePeriod}`);
    console.log(`📈 包含图表: ${nodeParameters.includeCharts}`);
    
    try {
        const context = new MockExecutionContext(inputData, nodeParameters);
        const node = new NodeClass();
        
        const startTime = Date.now();
        const result = await node.execute(context);
        const executionTime = Date.now() - startTime;
        
        console.log(`✅ 执行成功 (${executionTime}ms)`);
        
        if (result && result[0] && result[0].length > 0) {
            const output = result[0][0].json;
            
            if (output.error) {
                console.log(`⚠️  分析错误: ${output.error}`);
                if (output.errorDetails) {
                    console.log(`🔍 错误详情:`, output.errorDetails);
                }
            } else {
                console.log(`📈 分析结果:`);
                if (output.analysis && output.analysis.summary) {
                    const summary = output.analysis.summary;
                    console.log(`   - 总交易数: ${summary.totalTrades || 'N/A'}`);
                    console.log(`   - 已平仓: ${summary.closedTrades || 'N/A'}`);
                    console.log(`   - 总盈利: ${summary.totalProfit || summary.netProfit || 'N/A'}`);
                    if (summary.winRate !== undefined) {
                        console.log(`   - 胜率: ${summary.winRate}%`);
                    }
                    if (summary.performanceScore !== undefined) {
                        console.log(`   - 绩效评分: ${summary.performanceScore} (${summary.grade})`);
                    }
                }
                
                if (output.charts && output.charts.length > 0) {
                    console.log(`📊 图表数据: ${output.charts.length} 个图表`);
                }
                
                if (output.analysis && output.analysis.insights) {
                    console.log(`💡 洞察建议: ${output.analysis.insights.length} 条`);
                }
            }
        } else {
            console.log(`❌ 无输出结果`);
        }
        
        return { success: true, executionTime, result };
        
    } catch (error) {
        console.log(`❌ 执行失败: ${error.message}`);
        console.log(`🔍 错误堆栈:`, error.stack);
        return { success: false, error: error.message };
    }
}

// 主测试函数
async function runAllTests() {
    console.log('🚀 MyPet Analytics 节点测试开始');
    console.log('=' .repeat(60));
    
    const NodeClass = loadNodeClass();
    console.log('✅ 节点类加载成功');
    
    const testResults = [];
    let totalTests = 0;
    let passedTests = 0;
    
    // 遍历所有测试数据集和配置
    for (const [dataSetName, inputData] of Object.entries(testDataSets)) {
        for (const config of testConfigurations) {
            totalTests++;
            const testName = `${dataSetName} - ${config.analysisType}`;
            
            const result = await runSingleTest(testName, inputData, config, NodeClass);
            testResults.push({
                name: testName,
                dataSet: dataSetName,
                config,
                ...result
            });
            
            if (result.success) {
                passedTests++;
            }
            
            // 添加延迟避免过快执行
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // 测试总结
    console.log('\n' + '=' .repeat(60));
    console.log('📊 测试总结');
    console.log('=' .repeat(60));
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过测试: ${passedTests}`);
    console.log(`失败测试: ${totalTests - passedTests}`);
    console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    // 详细结果
    console.log('\n📋 详细结果:');
    testResults.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        const time = result.executionTime ? `(${result.executionTime}ms)` : '';
        console.log(`${index + 1}. ${status} ${result.name} ${time}`);
        if (!result.success) {
            console.log(`   错误: ${result.error}`);
        }
    });
    
    // 性能统计
    const successfulTests = testResults.filter(r => r.success && r.executionTime);
    if (successfulTests.length > 0) {
        const avgTime = successfulTests.reduce((sum, r) => sum + r.executionTime, 0) / successfulTests.length;
        const maxTime = Math.max(...successfulTests.map(r => r.executionTime));
        const minTime = Math.min(...successfulTests.map(r => r.executionTime));
        
        console.log('\n⚡ 性能统计:');
        console.log(`平均执行时间: ${Math.round(avgTime)}ms`);
        console.log(`最快执行时间: ${minTime}ms`);
        console.log(`最慢执行时间: ${maxTime}ms`);
    }
    
    // 保存测试报告
    const reportPath = path.join(__dirname, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
            totalTests,
            passedTests,
            failedTests: totalTests - passedTests,
            successRate: Math.round((passedTests / totalTests) * 100)
        },
        results: testResults
    }, null, 2));
    
    console.log(`\n📄 测试报告已保存: ${reportPath}`);
    
    // 返回测试是否全部通过
    return passedTests === totalTests;
}

// 如果直接运行此脚本
if (require.main === module) {
    runAllTests()
        .then(allPassed => {
            if (allPassed) {
                console.log('\n🎉 所有测试通过！节点可以安全发布。');
                process.exit(0);
            } else {
                console.log('\n⚠️  部分测试失败，请检查问题后再发布。');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n💥 测试执行出错:', error);
            process.exit(1);
        });
}

module.exports = { runAllTests, testDataSets, testConfigurations };
