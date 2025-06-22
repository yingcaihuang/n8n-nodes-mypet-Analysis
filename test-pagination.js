/**
 * 测试分页数据处理功能
 * 模拟多页数据输入，验证合并功能
 */

const { MyPetAnalytics } = require('./dist/nodes/MyPetAnalytics/MyPetAnalytics.node.js');

// 模拟上下文
class MockContext {
    constructor(inputData, params = {}) {
        this.inputData = inputData;
        this.params = params;
    }
    
    getInputData() { return this.inputData; }
    getNodeParameter(name) { return this.params[name]; }
    continueOnFail() { return false; }
}

// 模拟分页数据 - 第一页
const page1Data = {
    json: {
        orders: [
            {
                id: 1,
                ticket: "100001",
                symbol: "XAUUSD",
                tradeType: "Buy",
                lots: 0.1,
                openPrice: 3350.0,
                closePrice: 3355.0,
                orderProfit: 50.0,
                commission: -1.0,
                swap: 0,
                openTime: "2025-06-20T10:00:00",
                closeTime: "2025-06-20T10:30:00"
            },
            {
                id: 2,
                ticket: "100002",
                symbol: "XAUUSD",
                tradeType: "Sell",
                lots: 0.2,
                openPrice: 3360.0,
                closePrice: 3355.0,
                orderProfit: 100.0,
                commission: -2.0,
                swap: 0,
                openTime: "2025-06-20T11:00:00",
                closeTime: "2025-06-20T11:30:00"
            }
        ],
        orderInfo: {
            total: {
                total: 5,
                total_lots: 0.8,
                total_orderProfit: 200.0,
                max_lots: 0.3,
                min_lots: 0.1
            }
        }
    }
};

// 模拟分页数据 - 第二页
const page2Data = {
    json: {
        orders: [
            {
                id: 3,
                ticket: "100003",
                symbol: "EURUSD",
                tradeType: "Buy",
                lots: 0.3,
                openPrice: 1.1000,
                closePrice: 1.1050,
                orderProfit: 150.0,
                commission: -3.0,
                swap: 0,
                openTime: "2025-06-20T12:00:00",
                closeTime: "2025-06-20T12:30:00"
            },
            {
                id: 4,
                ticket: "100004",
                symbol: "GBPUSD",
                tradeType: "Sell",
                lots: 0.2,
                openPrice: 1.2500,
                closePrice: 1.2450,
                orderProfit: -100.0,
                commission: -2.0,
                swap: 0,
                openTime: "2025-06-20T13:00:00",
                closeTime: "2025-06-20T13:30:00"
            }
        ],
        orderInfo: {
            total: {
                total: 5,
                total_lots: 0.8,
                total_orderProfit: 200.0,
                max_lots: 0.3,
                min_lots: 0.1
            }
        }
    }
};

// 模拟分页数据 - 第三页
const page3Data = {
    json: {
        orders: [
            {
                id: 5,
                ticket: "100005",
                symbol: "USDJPY",
                tradeType: "Buy",
                lots: 0.1,
                openPrice: 150.0,
                closePrice: 150.5,
                orderProfit: 50.0,
                commission: -1.0,
                swap: 0,
                openTime: "2025-06-20T14:00:00",
                closeTime: "2025-06-20T14:30:00"
            }
        ],
        orderInfo: {
            total: {
                total: 5,
                total_lots: 0.8,
                total_orderProfit: 200.0,
                max_lots: 0.3,
                min_lots: 0.1
            }
        }
    }
};

async function testPagination() {
    console.log('🧪 测试分页数据处理功能...\n');
    
    try {
        // 测试1: 单页数据
        console.log('📄 测试1: 单页数据处理');
        const singlePageContext = new MockContext([page1Data], {
            analysisType: 'basic',
            includeCharts: false,
            generateHtmlReport: false
        });

        const node1 = new MyPetAnalytics();
        node1.getInputData = singlePageContext.getInputData.bind(singlePageContext);
        node1.getNodeParameter = singlePageContext.getNodeParameter.bind(singlePageContext);
        node1.continueOnFail = singlePageContext.continueOnFail.bind(singlePageContext);

        const result1 = await node1.execute();
        console.log('✅ 单页结果:', {
            totalTrades: result1[0][0].json.analysis.summary.totalTrades,
            netProfit: result1[0][0].json.analysis.summary.netProfit
        });

        // 测试2: 多页数据合并
        console.log('\n📄 测试2: 多页数据合并');
        const multiPageContext = new MockContext([page1Data, page2Data, page3Data], {
            analysisType: 'basic',
            includeCharts: false,
            generateHtmlReport: false
        });

        const node2 = new MyPetAnalytics();
        node2.getInputData = multiPageContext.getInputData.bind(multiPageContext);
        node2.getNodeParameter = multiPageContext.getNodeParameter.bind(multiPageContext);
        node2.continueOnFail = multiPageContext.continueOnFail.bind(multiPageContext);

        const result2 = await node2.execute();
        console.log('✅ 多页合并结果:', {
            totalTrades: result2[0][0].json.analysis.summary.totalTrades,
            netProfit: result2[0][0].json.analysis.summary.netProfit,
            symbolDistribution: result2[0][0].json.analysis.symbolDistribution
        });

        // 验证合并结果
        const expectedTotalTrades = 5; // 2 + 2 + 1
        const expectedNetProfit = 250 - 9; // (50+100+150-100+50) - (1+2+3+2+1)
        
        if (result2[0][0].json.analysis.summary.totalTrades === expectedTotalTrades) {
            console.log('✅ 交易数量合并正确');
        } else {
            console.log('❌ 交易数量合并错误');
        }

        if (Math.abs(result2[0][0].json.analysis.summary.netProfit - expectedNetProfit) < 0.01) {
            console.log('✅ 净盈利计算正确');
        } else {
            console.log('❌ 净盈利计算错误');
        }

        console.log('\n🎉 分页测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error(error.stack);
    }
}

// 运行测试
testPagination().catch(console.error);
