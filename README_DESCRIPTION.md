# MyPet Analytics - 专业交易数据分析节点

## 🎯 简介 | Overview

**中文**: MyPet Analytics 是专为 MyPet Stocks 交易数据设计的高级分析节点，提供专业的交易绩效分析、风险评估和可视化报告功能。

**English**: MyPet Analytics is an advanced analysis node specifically designed for MyPet Stocks trading data, providing professional trading performance analysis, risk assessment, and visualization reporting capabilities.

## ✨ 核心功能 | Key Features

### 📊 四种分析模式 | Four Analysis Modes

#### 1. 基础统计 | Basic Statistics
- **中文**: 交易概览、盈亏汇总、品种分布、数据验证
- **English**: Trading overview, P&L summary, symbol distribution, data validation

#### 2. 盈利分析 | Profit Analysis  
- **中文**: 胜率计算、盈亏比、盈利因子、盈利分布分析
- **English**: Win rate calculation, profit/loss ratio, profit factor, profit distribution

#### 3. 风险评估 | Risk Assessment
- **中文**: 波动率、最大回撤、VaR、夏普比率、风险等级
- **English**: Volatility, maximum drawdown, VaR, Sharpe ratio, risk level

#### 4. 绩效分析 | Performance Summary
- **中文**: 综合评分 (0-100)、等级评定 (A+ 到 F)、改进建议
- **English**: Composite score (0-100), grade rating (A+ to F), improvement suggestions

### 📈 可视化功能 | Visualization Features

#### 图表生成 | Chart Generation
- **中文**: 饼图、柱状图数据生成，支持多种图表库
- **English**: Pie chart and bar chart data generation, supports multiple chart libraries

#### HTML 报告 | HTML Reports
- **中文**: 专业 HTML 报告，内嵌图表，邮件友好格式
- **English**: Professional HTML reports with embedded charts, email-friendly format

## 🔧 技术特性 | Technical Features

### 数据兼容性 | Data Compatibility
- **多格式支持 | Multi-format Support**: orders, trades, data, result.results.data
- **智能识别 | Smart Recognition**: 自动识别数据结构 | Automatic data structure recognition
- **容错处理 | Fault Tolerance**: 处理缺失字段和异常数据 | Handle missing fields and abnormal data

### 性能优化 | Performance Optimization
- **高效算法 | Efficient Algorithms**: 优化的数据处理 | Optimized data processing
- **错误处理 | Error Handling**: 完善的异常捕获 | Comprehensive exception handling
- **调试友好 | Debug-Friendly**: 详细的执行日志 | Detailed execution logs

## 💼 使用场景 | Use Cases

### 个人交易者 | Individual Traders
- **中文**: 分析交易绩效，识别问题，制定改进策略
- **English**: Analyze trading performance, identify issues, develop improvement strategies

### 投资机构 | Investment Institutions  
- **中文**: 评估交易员绩效，风险管理，合规报告
- **English**: Evaluate trader performance, risk management, compliance reporting

### 量化团队 | Quantitative Teams
- **中文**: 策略回测，风险监控，绩效基准对比
- **English**: Strategy backtesting, risk monitoring, performance benchmarking

## 🚀 快速开始 | Quick Start

### 安装 | Installation
```bash
# 在 n8n 社区节点设置中安装
# Install in n8n Community Nodes settings
npm install n8n-nodes-mypet-analytics
```

### 基本用法 | Basic Usage
1. **连接数据源 | Connect Data Source**: MyPet Stocks API → MyPet Analytics
2. **选择分析类型 | Select Analysis Type**: 基础/盈利/风险/绩效 | Basic/Profit/Risk/Performance  
3. **配置选项 | Configure Options**: 图表和报告设置 | Chart and report settings
4. **执行分析 | Execute Analysis**: 获取专业分析结果 | Get professional analysis results

### 输出示例 | Output Example
```json
{
  "analysis": {
    "summary": {
      "totalTrades": 150,
      "netProfit": 12500.50,
      "winRate": 65.5,
      "performanceScore": 78
    },
    "insights": [
      "High win rate indicates good trade selection",
      "Consider improving risk/reward ratio"
    ]
  },
  "metadata": {
    "version": "1.0.13",
    "analysisType": "performance",
    "dataPoints": 150
  }
}
```

## 📋 输出字段说明 | Output Fields

### 基础统计 | Basic Statistics
- `totalTrades`: 总交易数 | Total number of trades
- `netProfit`: 净盈利 | Net profit amount
- `symbolDistribution`: 品种分布 | Symbol distribution

### 盈利分析 | Profit Analysis  
- `winRate`: 胜率百分比 | Win rate percentage
- `profitFactor`: 盈利因子 | Profit factor ratio
- `averageWin/Loss`: 平均盈亏 | Average win/loss

### 风险评估 | Risk Assessment
- `volatility`: 波动率 | Volatility percentage
- `maxDrawdown`: 最大回撤 | Maximum drawdown
- `sharpeRatio`: 夏普比率 | Sharpe ratio

### 绩效分析 | Performance Summary
- `performanceScore`: 综合评分 (0-100) | Performance score (0-100)
- `grade`: 等级评定 | Grade rating (A+ to F)
- `breakdown`: 四维度分解 | Four-dimension breakdown

## 🎨 HTML 报告特性 | HTML Report Features

### 专业设计 | Professional Design
- **响应式布局 | Responsive Layout**: 适配桌面和移动设备 | Desktop and mobile compatible
- **现代样式 | Modern Styling**: 专业的视觉设计 | Professional visual design
- **内嵌图表 | Embedded Charts**: Base64 编码，无外部依赖 | Base64 encoded, no external dependencies

### 邮件友好 | Email-Friendly
- **自包含格式 | Self-contained Format**: 单文件包含所有内容 | Single file contains everything
- **兼容性强 | High Compatibility**: 支持主流邮件客户端 | Supports major email clients
- **打印友好 | Print-Friendly**: 优化的打印样式 | Optimized print styles

## 🔄 版本信息 | Version Info

- **当前版本 | Current Version**: v1.0.13
- **更新日期 | Last Updated**: 2025-06-22
- **兼容性 | Compatibility**: n8n v0.190.0+
- **Node.js**: v16.0.0+

## 📞 支持 | Support

- **GitHub**: [n8n-nodes-mypet-analytics](https://github.com/yingcaihuang/n8n-nodes-mypet-analytics)
- **Issues**: [报告问题 | Report Issues](https://github.com/yingcaihuang/n8n-nodes-mypet-analytics/issues)
- **Email**: analytics@mypet.run

---

**让数据驱动您的交易决策 | Let Data Drive Your Trading Decisions** 📈
