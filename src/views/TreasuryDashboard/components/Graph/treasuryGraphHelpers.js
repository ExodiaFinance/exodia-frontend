import { formatCurrency } from "../../../../helpers";

// Smooth out bad data by putting the ticker name under the timestamp.
// The value corresponds to how many data points back or forwards to jump to.
const sneakyJoins = {
  1644969600: {
    BEETS: 1,
  },
};

export const getTokenBalances = (treasuries, auxes, theme, { isRiskFree = false, type = "value" } = {}) => {
  if (!treasuries || !auxes)
    return { tokenValues: [], dataKeys: [], colors: [], formattedValue: "-", lastValue: "-", value: "-" };
  const keys = {};

  const tokenValues = treasuries.map((entry, index) => {
    const values = { timestamp: entry.timestamp };
    entry.tokenBalances.forEach((tokenBalance, tickerIndex) => {
      if (!isRiskFree || (isRiskFree && tokenBalance.isRiskFree)) {
        const ticker = tokenBalance.token.ticker;
        keys[ticker] = ticker;

        if (sneakyJoins[entry.timestamp] && Object.keys(sneakyJoins[entry.timestamp]).includes(ticker)) {
          const nextIndex = sneakyJoins[entry.timestamp][ticker];
          addValues(treasuries[index - nextIndex].tokenBalances[tickerIndex], values, ticker, type);
        } else {
          addValues(tokenBalance, values, ticker, type);
        }
      }
    });
    const gOhmHistoricAux = auxes.find(
      aux => aux.timestamp === treasuries[index + 2]?.timestamp || aux.timestamp === entry.timestamp,
    );
    if (type === "balance" && gOhmHistoricAux) values.gOHM = 4.5;
    return values;
  });

  const dataKeys = filterSortDataKeys(keys, type);
  const colors = dataKeys.map(key => theme.palette.treasuryColors[key] || theme.palette.treasuryColors.DEFAULT);
  const value = isRiskFree ? treasuries[0].riskFreeValue : treasuries[0].marketValue;
  const lastValue = isRiskFree ? treasuries[1].riskFreeValue : treasuries[1].marketValue;
  const formattedValue = formatCurrency(value);

  return { tokenValues, dataKeys, colors, formattedValue, lastValue, value };
};

const addValues = (tokenBalance, values, ticker, type) => {
  const value = type === "value" ? tokenBalance.value : tokenBalance.balance;

  values[ticker] = (values[ticker] || 0) + value;
  if (ticker === "wsEXOD" && type === "value") {
    values.EXOD = (values.EXOD || 0) + value;
    values.wsEXOD = 0;
  }
};

const filterSortDataKeys = (keys, type) => {
  const keysToExclude = type === "value" ? ["fBEETS", "wsEXOD"] : ["fBEETS"];
  return Object.keys(keys)
    .filter(key => !keysToExclude.includes(key))
    .sort(sortTreasuryKeys);
};

const sortTreasuryKeys = (first, second) => {
  const getPriority = key => {
    switch (key) {
      case "EXOD":
        return 0;
      case "DAI":
        return 1;
      case "miMATIC":
        return 2;
      case "WFTM":
        return 3;
      case "gOHM":
        return 4;
      case "BEETS":
        return 5;
      default:
        return 6;
    }
  };

  if (getPriority(first) < getPriority(second)) {
    return -1;
  } else {
    return 1;
  }
};

export const getAssetTypeWeight = treasuries => {
  if (!treasuries) return [];

  return treasuries.map((entry, index) => {
    const values = {};
    let liquidity = 0;
    let reserves = 0;
    let riskFree = 0;
    entry.tokenBalances.forEach((tokenBalance, index) => {
      values.timestamp = entry.timestamp;

      if (tokenBalance.token.ticker !== "fBEETS") {
        if (tokenBalance.isLiquidity) {
          liquidity += tokenBalance.value;
        } else if (tokenBalance.isRiskFree) {
          riskFree += tokenBalance.value;
        } else {
          reserves += tokenBalance.value;
        }
      }
    });

    values.liquidity = (liquidity / (reserves + riskFree + liquidity)) * 100;
    values.reserves = (reserves / (reserves + riskFree + liquidity)) * 100;
    values.riskFree = (riskFree / (reserves + riskFree + liquidity)) * 100;
    return values;
  });
};
