# MyPet Analytics 调试指南

## 🚨 常见错误："This node is not finding anything to run on"

这个错误通常表示节点没有接收到有效的输入数据。以下是排查步骤：

### 1. 检查 MyPet Stocks 节点输出

**步骤 1**: 单独执行 MyPet Stocks 节点
- 点击 MyPet Stocks 节点
- 点击 "Execute Node" 按钮
- 查看是否有输出数据

**预期输出格式**:
```json
{
  "orders": [
    {
      "id": "12345",
      "symbol": "EURUSD",
      "volume": 0.1,
      "openPrice": 1.1000,
      "closePrice": 1.1050,
      "profit": 50,
      "openTime": "2025-01-01 10:00:00"
    }
  ]
}
```

### 2. 检查节点连接

**确认连接正确**:
- MyPet Stocks 节点的输出端口 → MyPet Analytics 节点的输入端口
- 连接线应该是实线，不是虚线

### 3. 检查 MyPet Stocks 配置

**常见配置问题**:
- 账户ID是否正确
- 时间范围是否有数据
- API凭据是否有效
- 网络连接是否正常

### 4. 数据格式兼容性检查

MyPet Analytics 支持以下数据格式：

**格式 1: orders 数组**
```json
{
  "orders": [...]
}
```

**格式 2: trades 数组**
```json
{
  "trades": [...]
}
```

**格式 3: 直接数组**
```json
[
  {
    "id": "...",
    "symbol": "...",
    ...
  }
]
```

**格式 4: data 包装**
```json
{
  "data": [...]
}
```

## 🛠️ 解决方案

### 方案 1: 检查 MyPet Stocks 输出

1. **执行 MyPet Stocks 节点**
   - 单击节点
   - 点击 "Execute Node"
   - 查看输出面板

2. **检查输出数据**
   - 确认有数据返回
   - 检查数据结构是否正确
   - 验证字段名称

### 方案 2: 添加调试节点

在 MyPet Stocks 和 MyPet Analytics 之间添加一个调试节点：

```
MyPet Stocks → Set (调试) → MyPet Analytics
```

**Set 节点配置**:
```javascript
// 在 Set 节点中添加以下表达式
return {
  debug: {
    inputData: $input.all(),
    dataType: typeof $input.first().json,
    hasOrders: !!$input.first().json.orders,
    hasTrades: !!$input.first().json.trades,
    isArray: Array.isArray($input.first().json)
  },
  originalData: $input.first().json
};
```

### 方案 3: 修复数据格式

如果数据格式不匹配，使用 Code 节点转换：

```javascript
// Code 节点示例
const inputData = $input.all();
const transformedData = [];

for (const item of inputData) {
  const data = item.json;
  
  // 转换为 MyPet Analytics 期望的格式
  const result = {
    orders: data.orders || data.trades || (Array.isArray(data) ? data : [data])
  };
  
  transformedData.push({ json: result });
}

return transformedData;
```

### 方案 4: 使用测试数据

如果 MyPet Stocks 没有数据，可以使用测试数据：

```json
{
  "orders": [
    {
      "id": "test001",
      "symbol": "EURUSD",
      "volume": 0.1,
      "openPrice": 1.1000,
      "closePrice": 1.1050,
      "profit": 50,
      "commission": 2,
      "openTime": "2025-01-01T10:00:00Z",
      "closeTime": "2025-01-01T11:00:00Z"
    },
    {
      "id": "test002",
      "symbol": "GBPUSD",
      "volume": 0.2,
      "openPrice": 1.2500,
      "closePrice": 1.2480,
      "profit": -40,
      "commission": 3,
      "openTime": "2025-01-01T14:00:00Z",
      "closeTime": "2025-01-01T15:30:00Z"
    }
  ]
}
```

## 🔧 具体排查步骤

### 步骤 1: 验证 MyPet Stocks 输出
1. 选中 MyPet Stocks 节点
2. 点击右侧面板的 "Execute Node"
3. 查看输出结果

### 步骤 2: 检查连接
1. 确认两个节点之间有连接线
2. 连接线应该是实线（表示有数据流）

### 步骤 3: 检查 MyPet Analytics 配置
1. 确认 "Analysis Type" 已选择
2. 确认 "Time Period" 设置合理

### 步骤 4: 测试简单数据
使用 Manual Trigger + Set 节点创建测试数据：

```
Manual Trigger → Set (测试数据) → MyPet Analytics
```

## 📋 常见问题 FAQ

### Q1: MyPet Stocks 返回空数据
**原因**: 
- 时间范围内没有交易
- 账户ID错误
- API权限问题

**解决**: 
- 扩大时间范围
- 验证账户ID
- 检查API凭据

### Q2: 数据格式不匹配
**原因**: 
- MyPet Stocks 输出格式变化
- 字段名称不匹配

**解决**: 
- 使用 Code 节点转换格式
- 检查字段映射

### Q3: 网络连接问题
**原因**: 
- API服务不可用
- 网络超时

**解决**: 
- 检查网络连接
- 重试执行
- 联系API服务商

## 🆘 如果问题仍然存在

1. **导出工作流**: 
   - 点击右上角菜单
   - 选择 "Export workflow"
   - 发送给技术支持

2. **提供错误信息**:
   - 完整的错误消息
   - MyPet Stocks 节点的输出
   - 节点配置截图

3. **联系支持**:
   - GitHub Issues: https://github.com/yingcaihuang/n8n-nodes-mypet-analytics/issues
   - 邮箱: analytics@mypet.run

## 🎯 快速测试方案

如果您想快速测试 MyPet Analytics 功能，可以使用以下简单工作流：

```
Manual Trigger → Set (测试数据) → MyPet Analytics → 查看结果
```

**Set 节点配置**:
```json
{
  "orders": [
    {
      "id": "1",
      "symbol": "EURUSD",
      "volume": 0.1,
      "openPrice": 1.1000,
      "closePrice": 1.1050,
      "profit": 50,
      "openTime": "2025-01-01T10:00:00Z",
      "closeTime": "2025-01-01T11:00:00Z"
    }
  ]
}
```

这样可以验证 MyPet Analytics 节点本身是否工作正常。
