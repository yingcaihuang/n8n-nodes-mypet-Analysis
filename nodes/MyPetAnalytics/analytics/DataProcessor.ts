import { IDataObject } from 'n8n-workflow';
import * as moment from 'moment';
import * as _ from 'lodash';

export interface TradeData {
	id: string;
	symbol: string;
	type: 'buy' | 'sell';
	volume: number;
	openPrice: number;
	closePrice?: number;
	openTime: Date;
	closeTime?: Date;
	profit?: number;
	commission?: number;
	swap?: number;
	accountId: string;
	ticket: string;
	magic?: string;
	comment?: string;
}

export interface AccountData {
	id: string;
	accountId: string;
	name: string;
	balance: number;
	equity: number;
	margin: number;
	freeMargin: number;
	marginLevel?: number;
	isReal: boolean;
	currency: string;
}

export interface ProcessedData {
	trades: TradeData[];
	accounts: AccountData[];
	timeRange: {
		start: Date;
		end: Date;
	};
	summary: {
		totalTrades: number;
		totalVolume: number;
		totalProfit: number;
		totalCommission: number;
		uniqueSymbols: string[];
		uniqueAccounts: string[];
	};
}

export class DataProcessor {
	/**
	 * Process input data from MyPet Stocks node
	 */
	async processInputData(inputData: IDataObject): Promise<ProcessedData> {
		// Handle different input formats from MyPet Stocks node
		let trades: TradeData[] = [];
		let accounts: AccountData[] = [];

		// Check if input contains orders (from queryTradeOrders operation)
		if (inputData.orders && Array.isArray(inputData.orders)) {
			trades = this.processTradeOrders(inputData.orders as any[]);
		}

		// Check if input contains accounts (from listAccounts operation)
		if (inputData.accounts && Array.isArray(inputData.accounts)) {
			accounts = this.processAccountData(inputData.accounts as any[]);
		}

		// Check if input contains account trading status
		if (inputData.accounts && Array.isArray(inputData.accounts) && inputData.accounts[0]?.tradingStats) {
			accounts = this.processAccountTradingStatus(inputData.accounts as any[]);
		}

		// Check if input contains commission statistics
		if (inputData.commissionDetail && Array.isArray(inputData.commissionDetail)) {
			const commissionTrades = this.processCommissionData(inputData.commissionDetail as any[]);
			trades = [...trades, ...commissionTrades];
		}

		// Calculate time range
		const timeRange = this.calculateTimeRange(trades);

		// Generate summary statistics
		const summary = this.generateSummary(trades, accounts);

		return {
			trades,
			accounts,
			timeRange,
			summary,
		};
	}

	/**
	 * Process trade orders from MyPet Stocks API
	 */
	private processTradeOrders(orders: any[]): TradeData[] {
		return orders.map((order) => ({
			id: order.id?.toString() || order.ticket,
			symbol: order.symbol || '',
			type: this.normalizeTradeType(order.tradeType || order.type),
			volume: parseFloat(order.volume || order.lots || '0'),
			openPrice: parseFloat(order.openPrice || order.price || '0'),
			closePrice: order.closePrice ? parseFloat(order.closePrice) : undefined,
			openTime: this.parseDateTime(order.openTime || order.opentime),
			closeTime: order.closeTime ? this.parseDateTime(order.closeTime || order.closetime) : undefined,
			profit: order.profit ? parseFloat(order.profit) : undefined,
			commission: order.commission ? parseFloat(order.commission) : undefined,
			swap: order.swap ? parseFloat(order.swap) : undefined,
			accountId: order.accountId?.toString() || order.account_id?.toString() || '',
			ticket: order.ticket?.toString() || order.id?.toString() || '',
			magic: order.magic?.toString(),
			comment: order.comment || '',
		}));
	}

	/**
	 * Process account data from MyPet Stocks API
	 */
	private processAccountData(accounts: any[]): AccountData[] {
		return accounts.map((account) => ({
			id: account.id?.toString() || '',
			accountId: account.accountId || account.account_id || '',
			name: account.name || '',
			balance: parseFloat(account.balance || '0'),
			equity: parseFloat(account.equity || '0'),
			margin: parseFloat(account.margin || '0'),
			freeMargin: parseFloat(account.freeMargin || account.free_margin || '0'),
			marginLevel: account.marginLevel ? parseFloat(account.marginLevel) : undefined,
			isReal: Boolean(account.isReal || account.is_real),
			currency: account.currency || account.capital_type || 'USD',
		}));
	}

	/**
	 * Process account trading status data
	 */
	private processAccountTradingStatus(accounts: any[]): AccountData[] {
		return accounts.map((account) => {
			const stats = account.tradingStats || {};
			return {
				id: account.id?.toString() || '',
				accountId: account.accountId || '',
				name: account.name || '',
				balance: parseFloat(stats.accountBalance || '0'),
				equity: parseFloat(stats.accountEquity || '0'),
				margin: parseFloat(stats.accountMargin || '0'),
				freeMargin: parseFloat(stats.accountFreeMargin || '0'),
				marginLevel: stats.marginLevel ? parseFloat(stats.marginLevel) : undefined,
				isReal: Boolean(account.isReal),
				currency: account.capitalType || 'USD',
			};
		});
	}

	/**
	 * Process commission statistics data
	 */
	private processCommissionData(commissionData: any[]): TradeData[] {
		return commissionData.map((item, index) => ({
			id: `commission_${index}`,
			symbol: item.symbol || 'UNKNOWN',
			type: this.normalizeTradeType(item.type || 'buy'),
			volume: parseFloat(item.volume || item.lots || '0'),
			openPrice: parseFloat(item.price || '0'),
			closePrice: parseFloat(item.close_price || '0'),
			openTime: this.parseDateTime(item.open_time || item.date),
			closeTime: item.close_time ? this.parseDateTime(item.close_time) : undefined,
			profit: parseFloat(item.profit || '0'),
			commission: parseFloat(item.commission || '0'),
			swap: parseFloat(item.swap || '0'),
			accountId: item.account_id?.toString() || '',
			ticket: item.ticket?.toString() || `commission_${index}`,
			magic: item.magic?.toString(),
			comment: item.comment || 'Commission Data',
		}));
	}

	/**
	 * Filter data by time period
	 */
	filterByTimePeriod(
		data: ProcessedData,
		timePeriod: string,
		customRange?: { startDate: string; endDate: string }
	): ProcessedData {
		let startDate: Date;
		let endDate: Date = new Date();

		switch (timePeriod) {
			case '7d':
				startDate = moment().subtract(7, 'days').toDate();
				break;
			case '30d':
				startDate = moment().subtract(30, 'days').toDate();
				break;
			case '90d':
				startDate = moment().subtract(90, 'days').toDate();
				break;
			case '1y':
				startDate = moment().subtract(1, 'year').toDate();
				break;
			case 'custom':
				if (!customRange?.startDate || !customRange?.endDate) {
					throw new Error('Custom date range requires both start and end dates');
				}
				startDate = moment(customRange.startDate).toDate();
				endDate = moment(customRange.endDate).toDate();
				break;
			case 'all':
			default:
				return data; // Return all data
		}

		// Filter trades by time period
		const filteredTrades = data.trades.filter((trade) => {
			const tradeDate = trade.openTime;
			return tradeDate >= startDate && tradeDate <= endDate;
		});

		// Recalculate summary for filtered data
		const summary = this.generateSummary(filteredTrades, data.accounts);

		return {
			...data,
			trades: filteredTrades,
			timeRange: {
				start: startDate,
				end: endDate,
			},
			summary,
		};
	}

	/**
	 * Normalize trade type to standard format
	 */
	private normalizeTradeType(type: string): 'buy' | 'sell' {
		const normalizedType = type.toLowerCase();
		if (normalizedType.includes('buy') || normalizedType.includes('long')) {
			return 'buy';
		}
		return 'sell';
	}

	/**
	 * Parse datetime string to Date object
	 */
	private parseDateTime(dateStr: string | Date): Date {
		if (dateStr instanceof Date) {
			return dateStr;
		}
		
		// Try different date formats
		const formats = [
			'YYYY-MM-DD HH:mm:ss',
			'YYYY-MM-DD HH:mm',
			'YYYY-MM-DD',
			'MM/DD/YYYY HH:mm:ss',
			'MM/DD/YYYY',
		];

		for (const format of formats) {
			const parsed = moment(dateStr, format);
			if (parsed.isValid()) {
				return parsed.toDate();
			}
		}

		// Fallback to default parsing
		const fallback = new Date(dateStr);
		if (!isNaN(fallback.getTime())) {
			return fallback;
		}

		// If all else fails, return current date
		console.warn(`Unable to parse date: ${dateStr}, using current date`);
		return new Date();
	}

	/**
	 * Calculate time range from trades
	 */
	private calculateTimeRange(trades: TradeData[]): { start: Date; end: Date } {
		if (trades.length === 0) {
			const now = new Date();
			return {
				start: moment(now).subtract(30, 'days').toDate(),
				end: now,
			};
		}

		const dates = trades.map((trade) => trade.openTime);
		return {
			start: new Date(Math.min(...dates.map((d) => d.getTime()))),
			end: new Date(Math.max(...dates.map((d) => d.getTime()))),
		};
	}

	/**
	 * Generate summary statistics
	 */
	private generateSummary(trades: TradeData[], accounts: AccountData[]) {
		const totalTrades = trades.length;
		const totalVolume = _.sumBy(trades, 'volume');
		const totalProfit = _.sumBy(trades, (trade) => trade.profit || 0);
		const totalCommission = _.sumBy(trades, (trade) => trade.commission || 0);
		const uniqueSymbols = _.uniq(trades.map((trade) => trade.symbol)).filter(Boolean);
		const uniqueAccounts = _.uniq(trades.map((trade) => trade.accountId)).filter(Boolean);

		return {
			totalTrades,
			totalVolume,
			totalProfit,
			totalCommission,
			uniqueSymbols,
			uniqueAccounts,
		};
	}

	/**
	 * Group trades by symbol
	 */
	groupTradesBySymbol(trades: TradeData[]): Record<string, TradeData[]> {
		return _.groupBy(trades, 'symbol');
	}

	/**
	 * Group trades by account
	 */
	groupTradesByAccount(trades: TradeData[]): Record<string, TradeData[]> {
		return _.groupBy(trades, 'accountId');
	}

	/**
	 * Group trades by time period (daily, weekly, monthly)
	 */
	groupTradesByTimePeriod(trades: TradeData[], period: 'day' | 'week' | 'month'): Record<string, TradeData[]> {
		return _.groupBy(trades, (trade) => {
			return moment(trade.openTime).startOf(period).format('YYYY-MM-DD');
		});
	}

	/**
	 * Calculate daily returns from trades
	 */
	calculateDailyReturns(trades: TradeData[]): Array<{ date: string; return: number; cumulative: number }> {
		const dailyTrades = this.groupTradesByTimePeriod(trades, 'day');
		const sortedDates = Object.keys(dailyTrades).sort();
		
		let cumulativeReturn = 0;
		return sortedDates.map((date) => {
			const dayTrades = dailyTrades[date];
			const dailyProfit = _.sumBy(dayTrades, (trade) => trade.profit || 0);
			const dailyCommission = _.sumBy(dayTrades, (trade) => trade.commission || 0);
			const netReturn = dailyProfit - dailyCommission;
			
			cumulativeReturn += netReturn;
			
			return {
				date,
				return: netReturn,
				cumulative: cumulativeReturn,
			};
		});
	}
}
