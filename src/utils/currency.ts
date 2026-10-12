export type CurrencyMode = 'INR' | 'INR_FX' | 'USD';

export const USD_TO_INR_RATE = 83.5;

let activeCurrency: CurrencyMode = 'INR';

export function setAppCurrency(mode: CurrencyMode) {
  activeCurrency = mode;
}

export function getAppCurrency(): CurrencyMode {
  return activeCurrency;
}

export function formatRupees(
  amount: number,
  options: {
    showSign?: boolean;
    decimals?: number;
    mode?: CurrencyMode;
  } = {}
): string {
  const mode = options.mode || activeCurrency;
  const { showSign = false, decimals = 2 } = options;

  let val = amount;
  if (mode === 'INR_FX') {
    val = amount * USD_TO_INR_RATE;
  }

  const isNeg = val < 0;
  const absVal = Math.abs(val);

  const formattedNum = absVal.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const symbol = mode === 'USD' ? '$' : '₹';

  if (showSign) {
    const sign = isNeg ? '-' : '+';
    return `${sign}${symbol}${formattedNum}`;
  }

  return isNeg ? `-${symbol}${formattedNum}` : `${symbol}${formattedNum}`;
}
