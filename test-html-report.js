/**
 * 测试 HTML 报告生成
 * 生成一个示例 HTML 文件用于验证图表显示
 */

const fs = require('fs');
const path = require('path');

// 加载节点
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

// 测试数据
const testData = [
    {
        json: {
            orders: [
                {
                    id: 1120119,
                    ticket: "178941434",
                    symbol: "XAUUSD",
                    tradeType: "Buy",
                    lots: 0.2,
                    openPrice: 3359.298,
                    closePrice: 3362.439,
                    orderProfit: 62.82,
                    commission: -1.4,
                    swap: 0,
                    openTime: "2025-06-20T13:31:31",
                    closeTime: "2025-06-20T13:36:28"
                },
                {
                    id: 1119986,
                    ticket: "178803346",
                    symbol: "XAUUSD",
                    tradeType: "Sell",
                    lots: 0.1,
                    openPrice: 3344.733,
                    closePrice: 3350.733,
                    orderProfit: -60,
                    commission: -0.7,
                    swap: 0,
                    openTime: "2025-06-20T05:53:06",
                    closeTime: "2025-06-20T07:05:56"
                },
                {
                    id: 1119836,
                    ticket: "178773386",
                    symbol: "XAUUSD",
                    tradeType: "Sell",
                    lots: 0.5,
                    openPrice: 3357.512,
                    closePrice: 3353.389,
                    orderProfit: 206.15,
                    commission: -3.5,
                    swap: 0,
                    openTime: "2025-06-20T01:59:03",
                    closeTime: "2025-06-20T02:37:32"
                }
            ],
            orderInfo: {
                total: {
                    total: 3,
                    total_lots: 0.8,
                    total_orderProfit: 208.97,
                    max_lots: 0.5,
                    min_lots: 0.1
                },
                sell_close: {
                    total: 2,
                    total_lots: 0.6,
                    total_orderProfit: 146.15
                },
                buy_close: {
                    total: 1,
                    total_lots: 0.2,
                    total_orderProfit: 62.82
                }
            }
        }
    }
];

async function generateTestReports() {
    console.log('🧪 生成测试 HTML 报告...\n');
    
    const analysisTypes = ['basic', 'profit', 'risk', 'performance'];
    
    for (const analysisType of analysisTypes) {
        try {
            console.log(`📊 生成 ${analysisType} 分析报告...`);
            
            const context = new MockContext(testData, {
                analysisType: analysisType,
                includeCharts: false,
                generateHtmlReport: true
            });

            const node = new MyPetAnalytics();
            node.getInputData = context.getInputData.bind(context);
            node.getNodeParameter = context.getNodeParameter.bind(context);
            node.continueOnFail = context.continueOnFail.bind(context);

            const result = await node.execute();
            
            if (result && result[0] && result[0].length > 0) {
                const output = result[0][0].json;
                
                if (output.htmlReport) {
                    const filename = `test-report-${analysisType}.html`;
                    fs.writeFileSync(filename, output.htmlReport);
                    console.log(`✅ 报告已保存: ${filename} (${Math.round(output.htmlReport.length / 1024)}KB)`);
                    
                    // 检查图表数量
                    const chartCount = (output.htmlReport.match(/data:image\/svg\+xml;base64,/g) || []).length;
                    console.log(`📊 包含图表数量: ${chartCount}`);
                } else {
                    console.log(`❌ 未生成 HTML 报告`);
                }
            }
            
        } catch (error) {
            console.error(`❌ 生成 ${analysisType} 报告失败:`, error.message);
        }
        
        console.log('');
    }
    
    console.log('🎉 测试完成！请打开生成的 HTML 文件查看图表显示效果。');
}

// 运行测试
generateTestReports().catch(console.error);
