# MyPet Analytics - n8n 交易数据分析节点

## 📦 包描述 | Package Description

### 中文简介
MyPet Analytics 是专为 MyPet Stocks 交易数据设计的 n8n 社区节点，提供专业的交易绩效分析、风险评估和可视化报告功能。支持四种分析模式：基础统计、盈利分析、风险评估和绩效分析，自动生成专业 HTML 报告和图表数据。

### English Summary  
MyPet Analytics is an n8n community node specifically designed for MyPet Stocks trading data, providing professional trading performance analysis, risk assessment, and visualization reporting. Supports four analysis modes: basic statistics, profit analysis, risk assessment, and performance analysis, with automatic generation of professional HTML reports and chart data.

## 🎯 核心价值 | Core Value

### 中文
- **专业分析**: 四种分析模式，涵盖交易的各个维度
- **可视化报告**: 自动生成专业 HTML 报告，支持邮件发送
- **智能洞察**: 基于数据自动生成交易建议和改进方案
- **易于集成**: 无缝集成到 n8n 工作流中，支持多种数据格式

### English
- **Professional Analysis**: Four analysis modes covering all trading dimensions
- **Visual Reports**: Auto-generate professional HTML reports for email delivery
- **Smart Insights**: Data-driven trading recommendations and improvement suggestions  
- **Easy Integration**: Seamless integration into n8n workflows with multi-format support

## 🚀 快速特性 | Quick Features

### 分析功能 | Analysis Features
- ✅ **基础统计 | Basic Stats**: 交易概览、盈亏汇总 | Trading overview, P&L summary
- ✅ **盈利分析 | Profit Analysis**: 胜率、盈利因子 | Win rate, profit factor
- ✅ **风险评估 | Risk Assessment**: 波动率、最大回撤 | Volatility, max drawdown  
- ✅ **绩效分析 | Performance**: 综合评分、等级评定 | Composite score, grade rating

### 输出功能 | Output Features
- 📊 **图表数据 | Chart Data**: 饼图、柱状图数据生成 | Pie chart, bar chart data generation
- 📄 **HTML 报告 | HTML Reports**: 专业报告，内嵌图表 | Professional reports with embedded charts
- 📧 **邮件友好 | Email-Friendly**: 自包含格式，无外部依赖 | Self-contained format, no external dependencies

## 💻 技术规格 | Technical Specs

### 兼容性 | Compatibility
- **n8n**: v0.190.0+
- **Node.js**: v16.0.0+
- **数据格式 | Data Formats**: orders, trades, data, result.results.data

### 性能 | Performance  
- **高效处理 | Efficient**: 优化的数据处理算法 | Optimized data processing algorithms
- **容错性强 | Fault-Tolerant**: 智能处理异常数据 | Intelligent handling of abnormal data
- **调试友好 | Debug-Friendly**: 详细的执行日志 | Detailed execution logs

## 📋 使用示例 | Usage Example

### 工作流配置 | Workflow Configuration
```
MyPet Stocks API → MyPet Analytics → Email/Database
```

### 输出示例 | Output Sample
```json
{
  "analysis": {
    "summary": {
      "totalTrades": 150,
      "netProfit": 12500.50,
      "winRate": 65.5,
      "performanceScore": 78,
      "grade": "B"
    },
    "insights": [
      "High win rate indicates good trade selection",
      "Consider improving risk/reward ratio"
    ]
  },
  "htmlReport": "<!-- Professional HTML report -->"
}
```

## 🎨 报告样式 | Report Styling

### HTML 报告特性 | HTML Report Features
- **响应式设计 | Responsive**: 适配各种设备 | Compatible with all devices
- **专业样式 | Professional**: 现代化视觉设计 | Modern visual design
- **打印优化 | Print-Optimized**: 完美的打印效果 | Perfect printing results
- **邮件兼容 | Email-Compatible**: 支持主流邮件客户端 | Supports major email clients

## 🔧 安装使用 | Installation & Usage

### 安装步骤 | Installation Steps
1. 打开 n8n 设置 | Open n8n Settings
2. 进入社区节点 | Go to Community Nodes  
3. 搜索并安装 | Search and install: `n8n-nodes-mypet-analytics`
4. 重启 n8n | Restart n8n

### 配置选项 | Configuration Options
- **分析类型 | Analysis Type**: Basic/Profit/Risk/Performance
- **包含图表 | Include Charts**: 是否生成图表数据 | Whether to generate chart data
- **生成报告 | Generate Report**: 是否生成 HTML 报告 | Whether to generate HTML report

## 📈 适用场景 | Use Cases

### 个人交易者 | Individual Traders
分析个人交易绩效，识别交易模式，制定改进策略
Analyze personal trading performance, identify patterns, develop strategies

### 投资机构 | Investment Firms
评估交易员绩效，进行风险管理，生成合规报告  
Evaluate trader performance, manage risks, generate compliance reports

### 量化团队 | Quant Teams
策略回测分析，风险指标监控，绩效基准对比
Strategy backtesting, risk monitoring, performance benchmarking

## 🏷️ 标签 | Tags
`n8n` `trading` `analytics` `finance` `risk` `performance` `mypet` `stocks` `visualization` `reports`

## 📞 支持 | Support
- **GitHub**: https://github.com/yingcaihuang/n8n-nodes-mypet-analytics
- **Issues**: https://github.com/yingcaihuang/n8n-nodes-mypet-analytics/issues
- **Email**: analytics@mypet.run

---

**专业的交易数据分析，从 MyPet Analytics 开始 | Professional Trading Data Analysis Starts with MyPet Analytics** 🚀
