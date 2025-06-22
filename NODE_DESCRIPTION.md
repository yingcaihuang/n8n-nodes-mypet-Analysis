# MyPet Analytics Node - 功能描述

## 中文描述

### 🎯 节点概述
MyPet Analytics 是一个专为 MyPet Stocks 交易数据设计的高级分析节点，提供全面的交易绩效分析、风险评估和可视化报告功能。

### 📊 核心功能

#### 1. **基础统计分析 (Basic Statistics)**
- **交易概览**: 总交易数、已平仓交易、未平仓交易统计
- **盈亏汇总**: 总盈利、总佣金、净盈利计算
- **品种分布**: 按交易品种统计交易数量分布
- **数据对比**: 计算值与 API 提供数据的对比验证
- **智能洞察**: 基于数据自动生成交易建议

#### 2. **盈利分析 (Profit Analysis)**
- **胜率计算**: 盈利交易占比和胜率统计
- **盈亏比分析**: 平均盈利与平均亏损比较
- **盈利因子**: 总盈利与总亏损的比值计算
- **盈利分布**: 按盈利区间统计交易分布
- **最大盈亏**: 单笔最大盈利和最大亏损记录
- **交易洞察**: 针对盈利模式的专业建议

#### 3. **风险评估 (Risk Metrics)**
- **波动率分析**: 交易收益的标准差和波动性
- **最大回撤**: 从峰值到谷值的最大损失百分比
- **风险价值 (VaR)**: 95% 置信度下的潜在损失
- **夏普比率**: 风险调整后的收益率指标
- **风险等级**: 基于多项指标的综合风险评级
- **高级统计**: 偏度、峰度等高级风险指标

#### 4. **绩效分析 (Performance Summary)**
- **综合评分**: 基于多维度指标的交易绩效评分 (0-100)
- **等级评定**: A+, A, B, C, D, F 等级评定系统
- **绩效分解**: 盈利能力、一致性、风险管理、效率四个维度
- **对比基准**: 与行业标准的对比分析
- **改进建议**: 基于绩效分析的具体改进建议

### 📈 可视化功能

#### 1. **图表数据生成**
- **饼图**: 盈亏分布、品种分布可视化
- **柱状图**: 风险指标、绩效对比图表
- **数据格式**: 标准化的图表数据结构，支持多种图表库

#### 2. **HTML 报告生成**
- **完整报告**: 包含所有分析结果的专业 HTML 报告
- **内嵌图表**: Base64 编码的图表，无需外部依赖
- **邮件友好**: 适合邮件发送的自包含 HTML 格式
- **响应式设计**: 支持桌面和移动设备查看
- **专业样式**: 现代化的报告设计和布局

### 🔧 技术特性

#### 1. **数据兼容性**
- **多格式支持**: 支持 orders、trades、data 等多种数据格式
- **嵌套结构**: 自动识别 result.results.data 等复杂结构
- **容错处理**: 智能处理缺失字段和异常数据
- **字段映射**: 自动映射不同命名的相同字段

#### 2. **性能优化**
- **高效处理**: 优化的数据处理算法
- **内存管理**: 合理的内存使用和垃圾回收
- **错误处理**: 完善的异常捕获和错误恢复
- **调试友好**: 详细的执行日志和调试信息

#### 3. **扩展性**
- **模块化设计**: 清晰的功能模块分离
- **易于维护**: 结构化的代码组织
- **版本控制**: 完整的版本管理和更新机制

### 💼 使用场景

#### 1. **个人交易者**
- 分析个人交易绩效
- 识别交易模式和问题
- 制定改进策略

#### 2. **投资机构**
- 评估交易员绩效
- 风险管理和控制
- 合规报告生成

#### 3. **量化团队**
- 策略回测分析
- 风险指标监控
- 绩效基准对比

---

## English Description

### 🎯 Node Overview
MyPet Analytics is an advanced analysis node specifically designed for MyPet Stocks trading data, providing comprehensive trading performance analysis, risk assessment, and visualization reporting capabilities.

### 📊 Core Features

#### 1. **Basic Statistics Analysis**
- **Trading Overview**: Total trades, closed trades, and open trades statistics
- **P&L Summary**: Total profit, total commission, and net profit calculations
- **Symbol Distribution**: Trading volume distribution by trading instruments
- **Data Comparison**: Validation between calculated values and API-provided data
- **Smart Insights**: Automated trading recommendations based on data analysis

#### 2. **Profit Analysis**
- **Win Rate Calculation**: Percentage of profitable trades and win rate statistics
- **Profit/Loss Ratio**: Comparison between average wins and average losses
- **Profit Factor**: Ratio calculation of total profits to total losses
- **Profit Distribution**: Trading distribution by profit ranges
- **Extreme Values**: Largest single profit and loss records
- **Trading Insights**: Professional recommendations for profit patterns

#### 3. **Risk Assessment**
- **Volatility Analysis**: Standard deviation and volatility of trading returns
- **Maximum Drawdown**: Maximum loss percentage from peak to trough
- **Value at Risk (VaR)**: Potential loss at 95% confidence level
- **Sharpe Ratio**: Risk-adjusted return indicator
- **Risk Level**: Comprehensive risk rating based on multiple metrics
- **Advanced Statistics**: Skewness, kurtosis, and other advanced risk indicators

#### 4. **Performance Summary**
- **Composite Score**: Multi-dimensional trading performance score (0-100)
- **Grade Rating**: A+, A, B, C, D, F grading system
- **Performance Breakdown**: Four dimensions - profitability, consistency, risk management, efficiency
- **Benchmark Comparison**: Analysis against industry standards
- **Improvement Suggestions**: Specific recommendations based on performance analysis

### 📈 Visualization Features

#### 1. **Chart Data Generation**
- **Pie Charts**: Profit/loss distribution and symbol distribution visualization
- **Bar Charts**: Risk metrics and performance comparison charts
- **Data Format**: Standardized chart data structure supporting multiple chart libraries

#### 2. **HTML Report Generation**
- **Complete Reports**: Professional HTML reports containing all analysis results
- **Embedded Charts**: Base64-encoded charts with no external dependencies
- **Email-Friendly**: Self-contained HTML format suitable for email delivery
- **Responsive Design**: Support for desktop and mobile device viewing
- **Professional Styling**: Modern report design and layout

### 🔧 Technical Features

#### 1. **Data Compatibility**
- **Multi-Format Support**: Support for orders, trades, data, and other data formats
- **Nested Structures**: Automatic recognition of complex structures like result.results.data
- **Fault Tolerance**: Intelligent handling of missing fields and abnormal data
- **Field Mapping**: Automatic mapping of differently named identical fields

#### 2. **Performance Optimization**
- **Efficient Processing**: Optimized data processing algorithms
- **Memory Management**: Reasonable memory usage and garbage collection
- **Error Handling**: Comprehensive exception catching and error recovery
- **Debug-Friendly**: Detailed execution logs and debugging information

#### 3. **Extensibility**
- **Modular Design**: Clear functional module separation
- **Easy Maintenance**: Structured code organization
- **Version Control**: Complete version management and update mechanism

### 💼 Use Cases

#### 1. **Individual Traders**
- Analyze personal trading performance
- Identify trading patterns and issues
- Develop improvement strategies

#### 2. **Investment Institutions**
- Evaluate trader performance
- Risk management and control
- Compliance report generation

#### 3. **Quantitative Teams**
- Strategy backtesting analysis
- Risk metric monitoring
- Performance benchmark comparison

---

## 🚀 Quick Start

### Installation
```bash
# In n8n Community Nodes settings
npm install n8n-nodes-mypet-analytics
```

### Basic Usage
1. Connect MyPet Stocks API node output to MyPet Analytics input
2. Select analysis type (Basic/Profit/Risk/Performance)
3. Configure chart and report options
4. Execute workflow to get analysis results

### Output Format
```json
{
  "analysis": {
    "summary": { /* Analysis results */ },
    "insights": [ /* Recommendations */ ]
  },
  "metadata": {
    "version": "1.0.13",
    "timestamp": "2025-06-22T...",
    "dataPoints": 150
  },
  "charts": [ /* Chart data (if enabled) */ ],
  "htmlReport": "<!-- HTML report (if enabled) -->"
}
```
