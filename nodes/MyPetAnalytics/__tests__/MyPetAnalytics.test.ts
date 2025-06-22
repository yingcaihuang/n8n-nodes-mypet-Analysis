import { MyPetAnalytics } from '../MyPetAnalytics.node';
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

// Mock the analytics components
jest.mock('../analytics/DataProcessor');
jest.mock('../analytics/AnalyticsEngine');
jest.mock('../analytics/VisualizationGenerator');
jest.mock('../analytics/ReportGenerator');

describe('MyPetAnalytics', () => {
	let node: MyPetAnalytics;
	let mockExecuteFunctions: Partial<IExecuteFunctions>;

	beforeEach(() => {
		node = new MyPetAnalytics();
		
		mockExecuteFunctions = {
			getInputData: jest.fn(),
			getNodeParameter: jest.fn(),
			continueOnFail: jest.fn().mockReturnValue(false),
			getNode: jest.fn().mockReturnValue({ name: 'MyPetAnalytics' }),
		};
	});

	describe('Node Description', () => {
		it('should have correct node properties', () => {
			expect(node.description.displayName).toBe('MyPet Analytics');
			expect(node.description.name).toBe('myPetAnalytics');
			expect(node.description.group).toContain('transform');
			expect(node.description.version).toBe(1);
		});

		it('should have correct input/output configuration', () => {
			expect(node.description.inputs).toHaveLength(1);
			expect(node.description.outputs).toHaveLength(1);
		});

		it('should have all required resources', () => {
			const resourceProperty = node.description.properties.find(p => p.name === 'resource');
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty?.options).toHaveLength(6);
			
			const resourceValues = resourceProperty?.options?.map((opt: any) => opt.value);
			expect(resourceValues).toContain('tradingAnalysis');
			expect(resourceValues).toContain('riskAssessment');
			expect(resourceValues).toContain('performanceMetrics');
			expect(resourceValues).toContain('marketAnalysis');
			expect(resourceValues).toContain('predictiveModels');
			expect(resourceValues).toContain('portfolioOptimization');
		});
	});

	describe('Parameter Validation', () => {
		it('should have trading analysis operations', () => {
			const operationProperty = node.description.properties.find(
				p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('tradingAnalysis')
			);
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(4);
		});

		it('should have risk assessment operations', () => {
			const operationProperty = node.description.properties.find(
				p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('riskAssessment')
			);
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(4);
		});

		it('should have time period options', () => {
			const timePeriodProperty = node.description.properties.find(p => p.name === 'timePeriod');
			expect(timePeriodProperty).toBeDefined();
			expect(timePeriodProperty?.options).toHaveLength(6);
		});
	});

	describe('Execute Function', () => {
		beforeEach(() => {
			(mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue([
				{
					json: {
						orders: [
							{
								id: '1',
								symbol: 'EURUSD',
								volume: 0.1,
								openPrice: 1.1000,
								closePrice: 1.1050,
								profit: 50,
								openTime: '2025-01-01 10:00:00',
								closeTime: '2025-01-01 11:00:00',
							},
						],
					},
				},
			]);

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName: string, itemIndex: number) => {
					switch (paramName) {
						case 'resource':
							return 'tradingAnalysis';
						case 'operation':
							return 'profitLossAnalysis';
						case 'dataSource':
							return 'input';
						case 'timePeriod':
							return '30d';
						case 'includeVisualization':
							return true;
						case 'generateReport':
							return true;
						default:
							return undefined;
					}
				});
		});

		it('should execute successfully with valid input', async () => {
			const result = await node.execute.call(mockExecuteFunctions as IExecuteFunctions);
			
			expect(result).toBeDefined();
			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(1);
		});

		it('should handle errors gracefully when continueOnFail is true', async () => {
			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(true);
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation(() => {
					throw new Error('Test error');
				});

			const result = await node.execute.call(mockExecuteFunctions as IExecuteFunctions);
			
			expect(result).toBeDefined();
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toHaveProperty('error');
		});
	});

	describe('Analysis Methods', () => {
		beforeEach(() => {
			(mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue([
				{
					json: {
						orders: [
							{
								id: '1',
								symbol: 'EURUSD',
								volume: 0.1,
								openPrice: 1.1000,
								closePrice: 1.1050,
								profit: 50,
								openTime: '2025-01-01 10:00:00',
								closeTime: '2025-01-01 11:00:00',
							},
						],
					},
				},
			]);
		});

		it('should handle trading analysis operations', async () => {
			const operations = ['profitLossAnalysis', 'patternRecognition', 'positionAnalysis', 'tradeEfficiency'];
			
			for (const operation of operations) {
				(mockExecuteFunctions.getNodeParameter as jest.Mock)
					.mockImplementation((paramName: string) => {
						if (paramName === 'resource') return 'tradingAnalysis';
						if (paramName === 'operation') return operation;
						if (paramName === 'dataSource') return 'input';
						if (paramName === 'timePeriod') return '30d';
						if (paramName === 'includeVisualization') return false;
						if (paramName === 'generateReport') return false;
						return undefined;
					});

				const result = await node.execute.call(mockExecuteFunctions as IExecuteFunctions);
				expect(result).toBeDefined();
			}
		});

		it('should handle risk assessment operations', async () => {
			const operations = ['valueAtRisk', 'riskMetrics', 'stressTesting', 'riskAlerts'];
			
			for (const operation of operations) {
				(mockExecuteFunctions.getNodeParameter as jest.Mock)
					.mockImplementation((paramName: string) => {
						if (paramName === 'resource') return 'riskAssessment';
						if (paramName === 'operation') return operation;
						if (paramName === 'dataSource') return 'input';
						if (paramName === 'timePeriod') return '30d';
						if (paramName === 'confidenceLevel') return 95;
						if (paramName === 'includeVisualization') return false;
						if (paramName === 'generateReport') return false;
						return undefined;
					});

				const result = await node.execute.call(mockExecuteFunctions as IExecuteFunctions);
				expect(result).toBeDefined();
			}
		});
	});

	describe('Error Handling', () => {
		it('should throw error for unknown resource', async () => {
			(mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue([{ json: {} }]);
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName: string) => {
					if (paramName === 'resource') return 'unknownResource';
					return 'test';
				});

			await expect(
				node.execute.call(mockExecuteFunctions as IExecuteFunctions)
			).rejects.toThrow();
		});

		it('should throw error for unknown operation', async () => {
			(mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue([{ json: {} }]);
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((paramName: string) => {
					if (paramName === 'resource') return 'tradingAnalysis';
					if (paramName === 'operation') return 'unknownOperation';
					return 'test';
				});

			await expect(
				node.execute.call(mockExecuteFunctions as IExecuteFunctions)
			).rejects.toThrow();
		});
	});
});
