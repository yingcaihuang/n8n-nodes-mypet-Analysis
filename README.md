# MyPet Analytics - Advanced n8n Node for Trading Data Analysis

![MyPet Analytics](https://img.shields.io/badge/n8n-community--node-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🚀 Overview

MyPet Analytics is a powerful n8n community node that provides advanced analytics and AI-powered insights for MyPet Stocks trading data. This node extends the capabilities of the original [MyPet Stocks node](https://github.com/yingcaihuang/n8n-nodes-mypet-stocks) by adding sophisticated analysis features including risk assessment, performance metrics, market analysis, and predictive modeling.

## ✨ Features

### 📊 Trading Analysis
- **Profit & Loss Analysis**: Comprehensive P&L breakdown with win rates, profit factors, and risk metrics
- **Pattern Recognition**: Identify trading patterns and behavioral insights
- **Position Analysis**: Analyze position sizing, holding periods, and exposure
- **Trade Efficiency**: Evaluate execution efficiency and timing

### ⚠️ Risk Assessment
- **Value at Risk (VaR)**: Calculate historical and parametric VaR with multiple confidence levels
- **Risk Metrics**: Sharpe ratio, Sortino ratio, Calmar ratio, and more
- **Stress Testing**: Portfolio stress testing with scenario analysis
- **Risk Alerts**: Real-time risk monitoring and alerting

### 📈 Performance Metrics
- **Return Analysis**: Statistical analysis of returns with distribution insights
- **Sharpe Ratio**: Risk-adjusted return calculations with rolling analysis
- **Maximum Drawdown**: Drawdown analysis with recovery metrics
- **Benchmarking**: Performance comparison against benchmarks

### 🌍 Market Analysis
- **Correlation Analysis**: Inter-symbol correlation analysis with heatmaps
- **Volatility Analysis**: Historical and rolling volatility with clustering detection
- **Trend Analysis**: Trend identification using linear regression
- **Regime Detection**: Market regime identification and analysis

### 🤖 Predictive Models
- **Price Prediction**: Simple linear regression-based price forecasting
- **Risk Prediction**: Future risk level forecasting
- **Signal Generation**: Multi-factor trading signal generation
- **Anomaly Detection**: Identify unusual trading patterns

### 💼 Portfolio Optimization
- **Portfolio Allocation**: Equal-weight, risk-parity, and mean-variance optimization
- **Risk Budgeting**: Optimal risk budget allocation across symbols
- **Rebalancing Strategy**: Automated rebalancing recommendations

## 🛠️ Installation

### Prerequisites
- n8n version 0.190.0 or higher
- Node.js 16.x or higher

### Install via npm
```bash
npm install n8n-nodes-mypet-analytics
```

### Install via n8n Community Nodes
1. Go to **Settings** > **Community Nodes**
2. Click **Install a community node**
3. Enter: `n8n-nodes-mypet-analytics`
4. Click **Install**

## 🔧 Configuration

### Credentials (Optional)
The MyPet Analytics node can work with input data only, but you can optionally configure API credentials for enhanced features:

1. Create new credentials of type "MyPet Analytics API"
2. Configure the following (all optional):
   - **Enable API Features**: Toggle for additional API-based analytics
   - **API Key**: Your analytics API key
   - **API Base URL**: Analytics service endpoint
   - **Analytics Settings**: Various performance and precision settings

## 📋 Usage

### Basic Workflow
1. **Connect Data Source**: Connect the output from a MyPet Stocks node or any compatible trading data
2. **Select Analysis Type**: Choose from Trading Analysis, Risk Assessment, Performance Metrics, etc.
3. **Configure Parameters**: Set time periods, confidence levels, and other analysis parameters
4. **Enable Visualizations**: Optionally generate charts and visual reports
5. **Execute**: Run the analysis and review results

### Example Workflow
```
MyPet Stocks Node → MyPet Analytics Node → Output/Visualization
```

### Input Data Format
The node accepts data from MyPet Stocks nodes including:
- Trade orders and execution data
- Account information and balances
- Commission and fee data
- Historical trading statistics

## 📊 Output Format

### Analysis Results
```json
{
  "resource": "tradingAnalysis",
  "operation": "profitLossAnalysis",
  "analysis": {
    "summary": {
      "totalTrades": 150,
      "winRate": 65.5,
      "profitFactor": 1.85,
      "totalProfit": 12500.50
    },
    "symbolBreakdown": { ... },
    "riskMetrics": { ... }
  },
  "visualizations": {
    "charts": [ ... ],
    "summary": { ... }
  },
  "report": {
    "executiveSummary": { ... },
    "detailedAnalysis": { ... }
  }
}
```

### Visualization Output
- **Charts**: Base64-encoded chart images
- **Chart Configurations**: Chart.js configuration objects
- **Interactive Data**: Data formatted for external visualization tools

## 🎯 Use Cases

### Risk Management
- Monitor portfolio risk in real-time
- Set up automated risk alerts
- Perform stress testing scenarios
- Calculate regulatory risk metrics

### Performance Analysis
- Track trading performance over time
- Compare against benchmarks
- Identify performance drivers
- Generate performance reports

### Strategy Development
- Analyze trading patterns
- Generate trading signals
- Optimize portfolio allocation
- Backtest strategy performance

### Compliance & Reporting
- Generate regulatory reports
- Document risk management procedures
- Create audit trails
- Produce client reports

## 🔍 Analysis Methods

### Statistical Methods
- Linear regression for trend analysis
- Monte Carlo simulation for stress testing
- Rolling window calculations for time series analysis
- Correlation analysis for diversification insights

### Risk Metrics
- Value at Risk (VaR) - Historical and Parametric
- Expected Shortfall (Conditional VaR)
- Maximum Drawdown
- Sharpe, Sortino, and Calmar ratios

### Machine Learning
- Anomaly detection using statistical methods
- Pattern recognition in trading behavior
- Predictive modeling for price and risk forecasting
- Signal generation using multiple factors

## ⚙️ Advanced Configuration

### Time Period Options
- Last 7, 30, 90 days, or 1 year
- Custom date ranges
- All available data

### Analysis Parameters
- Confidence levels for risk calculations (90%, 95%, 99%)
- Prediction horizons (1-365 days)
- Rolling window sizes
- Visualization preferences

### Performance Settings
- High precision mode for accurate calculations
- Caching for improved performance
- Debug mode for troubleshooting
- Maximum data point limits

## 🤝 Integration

### Compatible Nodes
- **MyPet Stocks**: Primary data source
- **HTTP Request**: For external data feeds
- **Spreadsheet File**: For historical data import
- **Database**: For data persistence
- **Email**: For report distribution

### Output Destinations
- **Webhook**: Real-time alerts and notifications
- **File System**: Save reports and charts
- **Database**: Store analysis results
- **API Endpoints**: Integration with external systems

## 📚 Examples

### Risk Monitoring Workflow
```
Schedule Trigger → MyPet Stocks → MyPet Analytics (Risk Assessment) → IF (High Risk) → Send Alert Email
```

### Performance Reporting
```
MyPet Stocks → MyPet Analytics (Performance Metrics) → Generate PDF Report → Save to Cloud Storage
```

### Trading Signal Generation
```
MyPet Stocks → MyPet Analytics (Predictive Models) → Filter Signals → Execute Trades via API
```

## 🐛 Troubleshooting

### Common Issues
1. **Insufficient Data**: Ensure minimum data requirements are met (varies by analysis type)
2. **Memory Issues**: Reduce data size or enable data sampling for large datasets
3. **Timeout Errors**: Increase timeout settings for complex calculations
4. **Chart Generation**: Ensure sufficient memory for visualization generation

### Debug Mode
Enable debug mode in credentials to get detailed execution information and error diagnostics.

## 🔄 Updates & Changelog

### Version 1.0.0
- Initial release with comprehensive analytics suite
- Support for all major analysis types
- Visualization and reporting capabilities
- Integration with MyPet Stocks ecosystem

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/yingcaihuang/n8n-nodes-mypet-analytics.git
cd n8n-nodes-mypet-analytics
npm install
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of the excellent [MyPet Stocks](https://github.com/yingcaihuang/n8n-nodes-mypet-stocks) foundation
- Powered by the [n8n](https://n8n.io) automation platform
- Uses [Chart.js](https://www.chartjs.org/) for visualization
- Statistical calculations powered by [Simple Statistics](https://simplestatistics.org/)

## 📞 Support

- **Documentation**: [Full Documentation](https://github.com/yingcaihuang/n8n-nodes-mypet-analytics/wiki)
- **Issues**: [GitHub Issues](https://github.com/yingcaihuang/n8n-nodes-mypet-analytics/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yingcaihuang/n8n-nodes-mypet-analytics/discussions)
- **Email**: analytics@mypet.run

---

**Disclaimer**: This tool is for analysis purposes only. Trading involves risk, and past performance does not guarantee future results. Always conduct your own research and consider consulting with financial professionals before making trading decisions.
