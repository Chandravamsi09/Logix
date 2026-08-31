/**
 * Multi-Currency Realtime FX Conversion & Exchange Spread Engine
 */

export class RealtimeFxCurrencyConverter {
  private readonly rates = new Map<string, number>([
    ['USD_EUR', 0.92],
    ['USD_GBP', 0.79],
    ['USD_CAD', 1.36],
    ['USD_JPY', 154.50],
    ['EUR_USD', 1.087],
    ['GBP_USD', 1.265]
  ]);

  public convert(amount: number, fromCurrency: string, toCurrency: string, spreadPct: number = 0.005): { convertedAmount: number; exchangeRate: number; feeAmount: number } {
    if (fromCurrency === toCurrency) {
      return { convertedAmount: amount, exchangeRate: 1.0, feeAmount: 0 };
    }

    const pair = `${fromCurrency}_${toCurrency}`;
    const rate = this.rates.get(pair) || 1.0;
    const rawConverted = amount * rate;
    const feeAmount = +(rawConverted * spreadPct).toFixed(2);
    const convertedAmount = +(rawConverted - feeAmount).toFixed(2);

    return {
      convertedAmount,
      exchangeRate: rate,
      feeAmount
    };
  }
}
