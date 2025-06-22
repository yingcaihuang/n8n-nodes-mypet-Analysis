#!/usr/bin/env node

/**
 * MyPet Analytics 快速测试脚本
 * 用于验证节点基本功能
 */

console.log('🚀 MyPet Analytics 快速测试开始...\n');

// 模拟 n8n 执行上下文
class MockContext {
    constructor(inputData, params = {}) {
        this.inputData = inputData;
        this.params = params;
    }
    
    getInputData() { return this.inputData; }
    getNodeParameter(name) { return this.params[name]; }
    continueOnFail() { return false; }
}

// 测试数据 - 模拟 MyPet Stocks 输出
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
                open: {
                    total: 0,
                    total_sell_open: 0,
                    total_buy_open: 0
                },
                sell_close: {
                    total: 2,
                    total_lots: 0.6,
                    total_orderProfit: 146.15,
                    max_lots: 0.5,
                    min_lots: 0.1
                },
                buy_close: {
                    total: 1,
                    total_lots: 0.2,
                    total_orderProfit: 62.82,
                    max_lots: 0.2,
                    min_lots: 0.2
                },
                fund: {
                    total: 0,
                    sum_fund: 0,
                    total_deposit: 0,
                    sum_deposit: 0,
                    total_withdrawal: 0,
                    sum_withdrawal: 0
                }
            }
        }
    }
];

// 加载节点类
let MyPetAnalytics;
try {
    const nodePath = './dist/nodes/MyPetAnalytics/MyPetAnalytics.node.js';
    const nodeModule = require(nodePath);
    MyPetAnalytics = nodeModule.MyPetAnalytics;
    console.log('✅ 节点类加载成功');
} catch (error) {
    console.error('❌ 节点类加载失败:', error.message);
    console.log('\n💡 请确保已运行构建命令并且文件存在');
    process.exit(1);
}

// 测试函数
async function runTest(analysisType, description) {
    console.log(`\n🧪 测试: ${description}`);
    console.log(`📊 分析类型: ${analysisType}`);
    
    try {
        const context = new MockContext(testData, {
            analysisType: analysisType,
            includeCharts: false,
            generateHtmlReport: analysisType === 'basic' // 只在基础分析时测试HTML报告
        });

        const node = new MyPetAnalytics();

        // 绑定上下文方法到节点
        node.getInputData = context.getInputData.bind(context);
        node.getNodeParameter = context.getNodeParameter.bind(context);
        node.continueOnFail = context.continueOnFail.bind(context);

        const startTime = Date.now();
        const result = await node.execute();
        const executionTime = Date.now() - startTime;
        
        console.log(`✅ 执行成功 (${executionTime}ms)`);
        
        if (result && result[0] && result[0].length > 0) {
            const output = result[0][0].json;
            
            if (output.error) {
                console.log(`⚠️  错误: ${output.error}`);
                return false;
            } else {
                console.log(`📈 结果预览:`);
                
                if (output.analysis && output.analysis.summary) {
                    const s = output.analysis.summary;
                    console.log(`   - 总交易: ${s.totalTrades || 'N/A'}`);
                    console.log(`   - 已平仓: ${s.closedTrades || 'N/A'}`);
                    console.log(`   - 净盈利: ${s.netProfit || s.totalProfit || 'N/A'}`);
                    if (s.winRate !== undefined) console.log(`   - 胜率: ${s.winRate}%`);
                    if (s.performanceScore !== undefined) console.log(`   - 评分: ${s.performanceScore} (${s.grade})`);
                }
                
                if (output.analysis && output.analysis.insights) {
                    console.log(`💡 洞察: ${output.analysis.insights.length} 条建议`);
                }

                if (output.analysis && output.analysis.orderInfo) {
                    console.log(`📋 API数据: 总交易 ${output.analysis.orderInfo.total?.total || 0}, API盈利 ${output.analysis.orderInfo.total?.total_orderProfit || 0}`);
                }

                if (output.htmlReport) {
                    console.log(`📄 HTML报告: ${Math.round(output.htmlReport.length / 1024)}KB`);
                }
                
                return true;
            }
        } else {
            console.log(`❌ 无输出结果`);
            return false;
        }
        
    } catch (error) {
        console.log(`❌ 执行失败: ${error.message}`);
        console.log(`🔍 详细错误:`, error.stack);
        return false;
    }
}

// 主测试流程
async function main() {
    const tests = [
        ['basic', '基础统计分析'],
        ['profit', '盈利分析'],
        ['risk', '风险评估'],
        ['performance', '绩效分析']
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const [type, desc] of tests) {
        const success = await runTest(type, desc);
        if (success) passed++;
        
        // 短暂延迟
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 测试总结
    console.log('\n' + '='.repeat(50));
    console.log('📊 测试总结');
    console.log('='.repeat(50));
    console.log(`总测试数: ${total}`);
    console.log(`通过测试: ${passed}`);
    console.log(`失败测试: ${total - passed}`);
    console.log(`成功率: ${Math.round((passed / total) * 100)}%`);
    
    if (passed === total) {
        console.log('\n🎉 所有测试通过！');
        console.log('✅ 节点功能正常，可以安全发布');
        console.log('\n📦 发布命令:');
        console.log('   npm publish');
        return true;
    } else {
        console.log('\n⚠️  部分测试失败');
        console.log('❌ 请修复问题后再发布');
        return false;
    }
}

// 运行测试
main()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('\n💥 测试执行出错:', error);
        process.exit(1);
    });
