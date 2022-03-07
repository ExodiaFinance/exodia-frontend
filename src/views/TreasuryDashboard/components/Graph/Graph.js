import { useState, useEffect } from "react";
import styled from "styled-components";
import {
  ExodiaLineChart,
  ExodiaStackedLineChart,
  ExodiaMultiLineChart,
  ExodiaPieChart,
  ExodiaComposedineChart,
  ExodiaStackedBarChart,
  trimNumber,
} from "src/components/Chart/ExodiaChart.jsx";
import { Trans } from "@lingui/macro";
import { useSelector } from "react-redux";
import {
  FormControl,
  Select,
  MenuItem,
  SvgIcon,
  Grid,
  Container,
  Typography,
  useMediaQuery,
  Box,
} from "@material-ui/core";
import gOhmData from "./gohmHistory";
import { useTheme } from "@material-ui/core/styles";
import { trim, formatCurrency } from "../../../../helpers";
import { useTreasuryMetrics } from "../../hooks/useTreasuryMetrics";
import { bulletpoints, tooltipItems, tooltipInfoMessages, itemType } from "../../treasuryData";
import { EPOCH_INTERVAL, OHM_TICKER } from "../../../../constants";
import { parse } from "date-fns";
import { TrendingDown, TrendingUp, TrendingFlat, AccountBalance } from "@material-ui/icons";
import { getBondDebtRatios, getBondValuesPerDay, getMintedPerDay, getBondDiscounts } from "./bondGraphHelpers";
import { getTokenBalances, getAssetTypeWeight } from "./treasuryGraphHelpers";

export const Graph = ({ children }) => <>{children}</>;

export const TotalValueDepositedGraph = () => {
  const theme = useTheme();
  const { protocolMetrics } = useTreasuryMetrics();

  return (
    <ExodiaLineChart
      data={protocolMetrics && protocolMetrics}
      dataKey={["tvl"]}
      dataFormat="$"
      itemType={itemType.dollar}
      itemNames={tooltipItems.tvl}
      headerText="Total Value Deposited"
      color={theme.palette.chartColors[0]}
      stroke={theme.palette.chartColors[0]}
      bulletpoints={bulletpoints.tvl}
      infoTooltipMessage={tooltipInfoMessages.tvl}
      headerSubText={`${protocolMetrics && formatCurrency(protocolMetrics[0].tvl)}`}
      todayMessage=""
    />
  );
};

export const MarketValueGraph = ({ isDashboard = false }) => {
  const theme = useTheme();
  const { treasuries, auxes } = useTreasuryMetrics();
  const { tokenValues, dataKeys, value, lastValue, colors, formattedValue } = getTokenBalances(
    treasuries,
    auxes,
    theme,
  );

  return (
    <ExodiaStackedLineChart
      data={tokenValues.length ? tokenValues : null}
      dataKey={dataKeys}
      colors={colors}
      dataFormat="$"
      headerText={
        isDashboard ? (
          <>Treasury {<Trend formattedValue={formatCurrency(value)} value={value} lastValue={lastValue} />}</>
        ) : (
          "Market Value of Treasury Assets"
        )
      }
      headerSubText={isDashboard ? "" : formattedValue}
      todayMessage={isDashboard ? "" : undefined}
      bulletpoints={bulletpoints.coin}
      itemNames={dataKeys}
      itemType={itemType.dollar}
      infoTooltipMessage={tooltipInfoMessages.mvt}
      todayMessage=""
      showTotal
    />
  );
};

export const RiskFreeValueGraph = () => {
  const theme = useTheme();
  const { treasuries, auxes } = useTreasuryMetrics();
  const { tokenValues, dataKeys, value, lastValue, colors, formattedValue } = getTokenBalances(
    treasuries,
    auxes,
    theme,
    {
      isRiskFree: true,
    },
  );

  return (
    <ExodiaStackedLineChart
      data={tokenValues.length ? tokenValues : null}
      format="currency"
      dataKey={dataKeys}
      colors={colors}
      dataFormat="$"
      headerText="Risk Free Value of Treasury Assets"
      headerSubText={formattedValue}
      bulletpoints={bulletpoints.rfv}
      itemNames={dataKeys}
      itemType={itemType.dollar}
      infoTooltipMessage={tooltipInfoMessages.rfv}
      todayMessage=""
      showTotal
    />
  );
};

export const TokenQuantities = () => {
  const theme = useTheme();
  const { treasuries, auxes } = useTreasuryMetrics();
  const [selectedData, setSelectedData] = useState();
  const { tokenValues, dataKeys, value, lastValue, colors, formattedValue } = getTokenBalances(
    treasuries,
    auxes,
    theme,
    {
      type: "balance",
    },
  );

  useEffect(() => {
    if (dataKeys.length) setSelectedData(dataKeys.find(token => token === "WFTM"));
  }, [dataKeys.length]);

  const SelectDataType = () => (
    <FormControl
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        margin: "0 10px",
        height: "33px",
        minWidth: "69px",
      }}
    >
      <Select
        id="time-select"
        value={selectedData}
        label="Timeframe"
        onChange={e => setSelectedData(e.target.value)}
        disableUnderline
      >
        {dataKeys.map(key => (
          <MenuItem value={key}>{key}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const color = colors && colors[dataKeys.findIndex(key => key === selectedData)];

  return (
    <ExodiaLineChart
      underglow
      data={tokenValues.length ? tokenValues : null}
      dataKey={[selectedData]}
      color={color}
      stroke={color}
      SelectOptions={SelectDataType}
      dataFormat="OHM"
      headerText={selectedData && `${selectedData} token balance`}
      headerSubText={
        selectedData &&
        tokenValues &&
        `${formatCurrency(tokenValues[0][selectedData], 1).replace("$", "")} ${selectedData}`
      }
      bulletpoints={bulletpoints.coin}
      itemNames={[selectedData]}
      itemType={selectedData}
      todayMessage=""
      infoTooltipMessage={tooltipInfoMessages.tokenBalance}
      showTotal
    />
  );
};

export const Holders = () => {
  const theme = useTheme();
  const { protocolMetrics } = useTreasuryMetrics();

  return (
    <ExodiaLineChart
      data={protocolMetrics && protocolMetrics}
      dataKey={["holders"]}
      color={theme.palette.chartColors[0]}
      stroke={theme.palette.chartColors[0]}
      dataFormat="OHM"
      headerText="Total holders"
      headerSubText={protocolMetrics && `${protocolMetrics[0].holders} Exodians`}
      bulletpoints={bulletpoints.coin}
      itemNames={["Exodians"]}
      itemType="Exodians"
      todayMessage=""
      isDashboard
      showTotal
    />
  );
};

export const ProtocolOwnedLiquidityGraph = () => {
  const theme = useTheme();
  const { treasuries } = useTreasuryMetrics();

  // Remove 0's
  const formattedData =
    treasuries &&
    treasuries.reduce((formatting, dataEntry) => {
      const monolithEntry = dataEntry.liquidities.find(liquidity => liquidity.token.ticker === "BPT-MNLT");
      if (monolithEntry) formatting.push(monolithEntry);
      return formatting;
    }, []);

  return (
    <ExodiaLineChart
      isPOL
      underglow
      data={formattedData}
      dataFormat="percent"
      itemNames={tooltipItems.pol}
      itemType={itemType.percentage}
      dataKey={["pol"]}
      bulletpoints={bulletpoints.pol}
      infoTooltipMessage={tooltipInfoMessages.pol}
      headerText="Protocol Owned Liquidity The Monolith LP"
      headerSubText={`${formattedData && trim(formattedData[0].pol, 2)}% `}
      color={theme.palette.chartColors[0]}
      stroke={theme.palette.chartColors[0]}
      todayMessage=""
    />
  );
};

export const AssetTypeBreakdown = () => {
  const theme = useTheme();
  const { treasuries } = useTreasuryMetrics();
  const assetTypeBreakDown = getAssetTypeWeight(treasuries);

  return (
    <ExodiaStackedLineChart
      data={assetTypeBreakDown.length ? assetTypeBreakDown : null}
      dataKey={["liquidity", "riskFree", "reserves"]}
      colors={[theme.palette.chartColors[0], theme.palette.chartColors[1], theme.palette.chartColors[4]]}
      dataFormat="%"
      headerText="Treasury Breakdown by Asset Type"
      headerSubText={`${assetTypeBreakDown.length && trim(assetTypeBreakDown[0].liquidity, 2)}% Liquidity`}
      todayMessage=""
      bulletpoints={bulletpoints.coin}
      itemNames={["Liquidity", "Risk Free Reserves", "Risky Reserves"]}
      itemType={itemType.percentage}
      todayMessage=""
      infoTooltipMessage={tooltipInfoMessages.treasuryBreakdown}
      isPOL
      showTotal
    />
  );
};

export const BackingPerExod = () => {
  const theme = useTheme();
  const { protocolMetrics } = useTreasuryMetrics();

  return (
    <ExodiaLineChart
      underglow
      data={protocolMetrics}
      dataKey={["backingPerExod"]}
      dataFormat="$"
      itemNames={["Backing per EXOD"]}
      itemType={itemType.dollar}
      headerText="Backing per EXOD"
      color={theme.palette.chartColors[4]}
      stroke={theme.palette.chartColors[4]}
      bulletpoints={bulletpoints.apy}
      infoTooltipMessage={tooltipInfoMessages.backing}
      headerSubText={`Current Backing: ${protocolMetrics && formatCurrency(protocolMetrics[0].backingPerExod, 2)} `}
      todayMessage=""
    />
  );
};

export const Premium = ({ isBondPage }) => {
  const theme = useTheme();
  const { protocolMetrics } = useTreasuryMetrics();
  const metrics =
    protocolMetrics &&
    protocolMetrics.map(entry => ({
      timestamp: entry.timestamp,
      premium: (entry.exodPrice / entry.backingPerExod - 1) * 100,
    }));

  return (
    <ExodiaLineChart
      underglow
      data={metrics}
      dataKey={["premium"]}
      dataFormat="percent"
      itemNames={["Premium"]}
      itemType={itemType.percentage}
      headerText="Premium"
      color={theme.palette.chartColors[0]}
      stroke={theme.palette.chartColors[0]}
      bulletpoints={bulletpoints.apy}
      infoTooltipMessage={tooltipInfoMessages.premium}
      headerSubText={`${metrics && trim(metrics[0].premium, 2)}%`}
      initialTimeSelected="3 month"
      redNegative
      todayMessage="Current premium"
    />
  );
};

export const OHMStakedGraph = () => {
  const theme = useTheme();
  const { simpleStakings } = useTreasuryMetrics();

  return (
    <ExodiaLineChart
      isStaked
      underglow
      data={simpleStakings && simpleStakings}
      dataKey={["stakedPercentage"]}
      dataFormat="percent"
      itemNames={tooltipItems.staked}
      itemType={itemType.percentage}
      headerText="Staked Supply"
      color={theme.palette.chartColors[4]}
      stroke={theme.palette.chartColors[4]}
      bulletpoints={bulletpoints.staked}
      infoTooltipMessage={tooltipInfoMessages.staked}
      headerSubText={`${simpleStakings && trim(simpleStakings[0].stakedPercentage, 2)}% `}
      todayMessage=""
    />
  );
};

export const APYOverTimeGraph = () => {
  const theme = useTheme();
  const { simpleStakings } = useTreasuryMetrics();
  const blockRateSeconds = useSelector(state => {
    return state.app.blockRateSeconds;
  });

  const apy =
    simpleStakings &&
    blockRateSeconds &&
    simpleStakings.map(entry => ({
      timestamp: entry.id,
      apy: Math.floor(
        Math.pow(parseFloat(entry.rebaseRate / 100 + 1), (86400 * 365) / (blockRateSeconds * EPOCH_INTERVAL)) * 100,
      ),
    }));

  return (
    <ExodiaLineChart
      data={apy}
      dataKey={["apy"]}
      dataFormat="percent"
      headerText="APY over time"
      itemNames={tooltipItems.apy}
      itemType={itemType.percentage}
      color={theme.palette.chartColors[3]}
      stroke={theme.palette.chartColors[3]}
      bulletpoints={bulletpoints.apy}
      infoTooltipMessage={tooltipInfoMessages.apy}
      headerSubText={`${apy && apy[0].apy.toLocaleString("en-us")}%`}
      initialTimeSelected="3 month"
      todayMessage=""
    />
  );
};

export const RunwayAvailableGraph = () => {
  const theme = useTheme();
  const { protocolMetrics } = useTreasuryMetrics();

  const [current, ...others] = bulletpoints.runway;

  return (
    <ExodiaMultiLineChart
      data={protocolMetrics}
      dataKey={["runway"]}
      colors={[theme.palette.chartColors[0]]}
      headerText="Runway Available"
      headerSubText={`${protocolMetrics && trim(protocolMetrics[0].runway, 1)} Days`}
      dataFormat={["days"]}
      bulletpoints={[current]}
      itemNames={tooltipItems.runway}
      itemType={""}
      infoTooltipMessage={tooltipInfoMessages.runway}
      todayMessage=""
    />
  );
};

export const DilutionGraph = () => {
  const theme = useTheme();
  const { protocolMetrics, simpleStakings } = useTreasuryMetrics();

  const dilution =
    simpleStakings &&
    protocolMetrics &&
    simpleStakings.map((entry, index) => ({
      timestamp: entry.timestamp,
      percentage: (entry.index / (protocolMetrics[index].circulatingSupply / 2000)) * 100, //initial total supply of 2000
      index: entry.index,
    }));

  return (
    <ExodiaMultiLineChart
      data={dilution && dilution}
      dataKey={["percentage", "index"]}
      dataAxis={["left", "right"]}
      colors={[theme.palette.chartColors[0], theme.palette.chartColors[3]]}
      headerText="Dilution Over Time"
      dataFormat={["percent", "number"]}
      headerSubText={`${dilution && trim(dilution[0].percentage, 2)}%`}
      bulletpoints={bulletpoints.dilution}
      itemNames={tooltipItems.dilution}
      itemType={[itemType.percentage, "sEXOD"]}
      infoTooltipMessage={tooltipInfoMessages.dilution}
      todayMessage=""
      isDilution
    />
  );
};

export const OhmMintedGraph = () => {
  const theme = useTheme();
  const { dailyBondRevenues, protocolMetrics } = useTreasuryMetrics();
  const { mintedPerDay } = getMintedPerDay(dailyBondRevenues, protocolMetrics);

  return (
    <ExodiaMultiLineChart
      dataFormat={["OHM", "OHM"]}
      data={mintedPerDay.length ? mintedPerDay : null}
      dataKey={["minted", "fiveDayAverage"]}
      itemNames={tooltipItems.minted}
      itemType={itemType.OHM}
      headerText={`${OHM_TICKER} minted`}
      colors={[theme.palette.chartColors[4], theme.palette.chartColors[0]]}
      stroke={[theme.palette.chartColors[4], theme.palette.chartColors[0]]}
      bulletpoints={bulletpoints.staked}
      infoTooltipMessage={tooltipInfoMessages.minted}
      headerSubText={`${mintedPerDay.length && mintedPerDay[0].fiveDayAverage.toFixed(2)} EXOD`}
      todayMessage="5-day Average"
      glowDeviation="4"
      showNulls
    />
  );
};

export const OhmMintedPerTotalSupplyGraph = () => {
  const theme = useTheme();
  const { dailyBondRevenues, protocolMetrics } = useTreasuryMetrics();
  const { mintedPerDay } = getMintedPerDay(dailyBondRevenues, protocolMetrics);

  return (
    <ExodiaMultiLineChart
      glowDeviation="4"
      dataFormat={["percent", "percent"]}
      data={mintedPerDay.length ? mintedPerDay : null}
      dataKey={["mintedPercent", "fiveDayAveragePercent"]}
      itemNames={tooltipItems.mcs}
      itemType={itemType.percentage}
      headerText={`${OHM_TICKER} Minted/Total Supply`}
      colors={[theme.palette.chartColors[3], theme.palette.chartColors[0]]}
      stroke={[theme.palette.chartColors[3], theme.palette.chartColors[0]]}
      bulletpoints={bulletpoints.tvl}
      infoTooltipMessage={tooltipInfoMessages.mcs}
      headerSubText={`${mintedPerDay.length && mintedPerDay[0].fiveDayAveragePercent.toFixed(2)}%`}
      todayMessage="5-day Average"
      showNulls
    />
  );
};

export const BondDiscounts = () => {
  const theme = useTheme();
  const { bondDeposits } = useTreasuryMetrics();
  const { bondDiscounts } = getBondDiscounts(bondDeposits);

  return (
    <ExodiaMultiLineChart
      glowDeviation="2"
      type="line"
      data={bondDiscounts.length ? bondDiscounts : null}
      dataKey={["discount", "last50Ma"]}
      dataFormat="percent"
      headerText="Bond Discounts (at time of bonding)"
      headerSubText={bondDiscounts.length && `${trim(bondDiscounts[0].last50Ma, 2)}%`}
      itemNames={["Discount", "Last 50 Average"]}
      itemType={itemType.percentage}
      colors={[theme.palette.chartColors[4], theme.palette.chartColors[0]]}
      stroke={[theme.palette.chartColors[4], theme.palette.chartColors[0]]}
      bulletpoints={bulletpoints.apy}
      strokeWidth={1}
      infoTooltipMessage={tooltipInfoMessages.bondDiscounts}
      isDiscount
      todayMessage="Last 50 MA"
    />
  );
};

export const DebtRatioGraph = () => {
  const theme = useTheme();
  const { dailyBondRevenues } = useTreasuryMetrics();
  const { dataKeys, colors, currentDebtRatio, debtRatios } = getBondDebtRatios(dailyBondRevenues, theme, true);

  return (
    <ExodiaMultiLineChart
      deviation="2"
      data={debtRatios.length ? debtRatios : null}
      dataKey={dataKeys}
      colors={colors}
      stroke={colors}
      headerText="Debt Ratios"
      headerSubText={`Total ${debtRatios && trim(currentDebtRatio, 2)}%`}
      dataFormat={["percent"]}
      bulletpoints={bulletpoints.runway}
      itemNames={dataKeys}
      itemType={itemType.percentage}
      infoTooltipMessage={tooltipInfoMessages.debtratio}
      isDebt={true}
      todayMessage=""
      showTotal
      showNulls
    />
  );
};

export const BondRevenue = () => {
  const theme = useTheme();
  const { dailyBondRevenues } = useTreasuryMetrics();
  const { dataKeys, colors, bondValues, bondedToday } = getBondValuesPerDay(dailyBondRevenues, theme, true);

  return (
    <ExodiaStackedBarChart
      data={bondValues.length ? bondValues : null}
      dataKey={dataKeys}
      colors={colors}
      headerText="Bond Revenue"
      headerSubText={`${bondValues.length && formatCurrency(bondedToday, 2)}`}
      dataFormat="$"
      bulletpoints={bulletpoints.runway}
      itemNames={dataKeys}
      itemType={itemType.dollar}
      todayMessage="Bonded today"
      infoTooltipMessage={tooltipInfoMessages.bondRevenue}
      showTotal
    />
  );
};

export const IndexAdjustedPrice = () => {
  const theme = useTheme();
  const { protocolMetrics } = useTreasuryMetrics();

  return (
    <ExodiaMultiLineChart
      data={protocolMetrics && protocolMetrics}
      dataKey={["exodPrice", "wsExodPrice"]}
      colors={[theme.palette.chartColors[0], theme.palette.chartColors[4]]}
      stroke={[theme.palette.chartColors[0], theme.palette.chartColors[4]]}
      headerText="Index Adjusted Price"
      headerSubText={`$${protocolMetrics && trim(protocolMetrics[0].wsExodPrice, 2)}`}
      dataFormat={["$"]}
      bulletpoints={bulletpoints.indexAdjustedPrice}
      itemNames={tooltipItems.indexAdjustedPrice}
      itemType={itemType.dollar}
      infoTooltipMessage={tooltipInfoMessages.indexAdjustedPrice}
      todayMessage=""
    />
  );
};

export const GrowthOfSupply = () => {
  const theme = useTheme();
  const { protocolMetrics, simpleStakings } = useTreasuryMetrics();

  const formattedData =
    simpleStakings &&
    protocolMetrics &&
    protocolMetrics.map((entry, index) => ({
      timestamp: entry.timestamp,
      circSupply: entry.circulatingSupply,
      indexCircSupply: simpleStakings[index].index * 2000,
    }));

  return (
    <ExodiaMultiLineChart
      data={formattedData}
      dataKey={["indexCircSupply", "circSupply"]}
      colors={[theme.palette.chartColors[4], theme.palette.chartColors[0]]}
      stroke={[theme.palette.chartColors[4], theme.palette.chartColors[0]]}
      headerText="Growth of Supply"
      headerSubText={`${
        formattedData && trim(Math.abs(1 - formattedData[0].indexCircSupply / formattedData[0].circSupply) * 100, 2)
      }%`}
      dataFormat={["number"]}
      bulletpoints={bulletpoints.growthOfSupply}
      itemNames={tooltipItems.growthOfSupply}
      itemType={itemType.OHM}
      infoTooltipMessage={tooltipInfoMessages.growthOfSupply}
      todayMessage=""
      isGrowthOfSupply
    />
  );
};

export const DashboardPriceGraph = ({ isDashboard = false }) => {
  const theme = useTheme();
  const { protocolMetrics } = useTreasuryMetrics();
  const [selectedData, setSelectedData] = useState("marketCap");


  const entries = { exodPrice: 0, wsExodPrice: 1, marketCap: 2 };

  const value =
    protocolMetrics &&
    (selectedData == "exodPrice"
      ? protocolMetrics[0].exodPrice
      : selectedData == "wsExodPrice"
      ? protocolMetrics[0].wsExodPrice
      : protocolMetrics[0].marketCap);

  const lastValue =
    protocolMetrics &&
    (selectedData == "exodPrice"
      ? protocolMetrics[1].exodPrice
      : selectedData == "wsExodPrice"
      ? protocolMetrics[1].wsExodPrice
      : protocolMetrics[1].marketCap);

  const SelectDataType = () => (
    <FormControl
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        margin: "0 10px",
        height: "33px",
        minWidth: "69px",
      }}
    >
      <Select
        id="time-select"
        value={selectedData}
        label="Timeframe"
        onChange={e => setSelectedData(e.target.value)}
        disableUnderline
      >
        <MenuItem value={"exodPrice"}>EXOD</MenuItem>
        <MenuItem value={"wsExodPrice"}>wsEXOD</MenuItem>
        <MenuItem value={"marketCap"}>Market Cap</MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <ExodiaLineChart
      data={protocolMetrics && protocolMetrics}
      dataKey={[selectedData]}
      SelectOptions={SelectDataType}
      color={theme.palette.chartColors[0]}
      stroke={theme.palette.chartColors[0]}
      initialTimeSelected="3 month"
      headerText={
        <>
          {selectedData == "exodPrice" ? "EXOD Price" : selectedData == "wsEXOD" ? "wsEXOD Price" : "Market Cap"}{" "}
          {<Trend formattedValue={formatCurrency(value)} value={value} lastValue={lastValue} />}
        </>
      }
      headerSubText=""
      todayMessage=""
      dataFormat="$"
      bulletpoints={bulletpoints.indexAdjustedPrice}
      itemNames={[tooltipItems.dashboardPrice[entries[selectedData]]]}
      itemType={itemType.dollar}
      infoTooltipMessage=""
      isDashboard={isDashboard}
    />
  );
};

export const TreasuryBreakdownPie = () => {
  const theme = useTheme();
  const { treasuries, auxes } = useTreasuryMetrics();
  const isVerySmallScreen = useMediaQuery("(max-width: 450px)");
  const { tokenValues, dataKeys, value: totalValue, lastValue, colors } = getTokenBalances(treasuries, auxes, theme);

  const currentValues = tokenValues && dataKeys.map(key => tokenValues[0][key]);
  const previousValues = tokenValues && dataKeys.map(key => tokenValues[1][key]);

  const formattedValue = formatCurrency(totalValue);

  const pieData =
    currentValues &&
    dataKeys.map((key, index) => {
      return { value: Number(trim((tokenValues[0][key] / totalValue) * 100, 2)), name: key };
    });

  return (
    <Grid container>
      <Box display="flex" justifyContent="space-between" style={{ width: "100%" }}>
        <Typography
          variant="h6"
          color="textPrimary"
          style={{
            marginBottom: "6px",
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <SvgIcon
            color="textPrimary"
            component={AccountBalance}
            style={{ marginRight: "10px", overflow: "visible" }}
          />
          Treasury Breakdown
        </Typography>
        <Typography variant="h6" style={{ textAlign: "right" }}>
          <Trend formattedValue={formattedValue} value={totalValue} lastValue={lastValue} />
        </Typography>
      </Box>

      <Grid
        xs={isVerySmallScreen ? 12 : 5}
        sm={5}
        md={5}
        lg={5}
        style={{ margin: "0", height: isVerySmallScreen ? "140px" : "auto" }}
      >
        <ExodiaPieChart
          data={pieData.length ? pieData : null}
          colors={colors}
          headerText=""
          todayMessage=""
          dataFormat="$"
          bulletpoints={bulletpoints.coin}
          itemNames={dataKeys}
          itemType={itemType.percentage}
          timeSelection={false}
          isDashboard
          fullScreenDisabled
        />
      </Grid>
      <Grid xs={isVerySmallScreen ? 12 : 7} sm={7} md={7} lg={7} style={{ height: "50%" }}>
        <TreasuryTable
          currentData={currentValues}
          previousData={previousValues}
          itemNames={dataKeys}
          colors={colors}
          totalValue={totalValue}
          lastValue={lastValue}
        />
      </Grid>
    </Grid>
  );
};

const TreasuryTable = ({ currentData, previousData, totalValue, lastValue, itemNames, colors }) => {
  const isSmallScreen = useMediaQuery("(max-width: 550px)");

  return (
    <div>
      <TableGrid header isSmallScreen={isSmallScreen}>
        <Cell>
          <Typography variant="body1" color="textSecondary">
            <Trans>Asset</Trans>
          </Typography>
        </Cell>
        <Cell center>
          <Typography variant="body1" color="textSecondary">
            <Trans>Value</Trans>
          </Typography>
        </Cell>
        <Cell center>
          <Typography variant="body1" color="textSecondary">
            <Trans>%</Trans>
          </Typography>
        </Cell>
        <Cell center>
          <Typography variant="body1" color="textSecondary">
            <Trans>Change</Trans>
          </Typography>
        </Cell>
      </TableGrid>
      <TableGrid isSmallScreen={isSmallScreen}>
        {itemNames.map((name, index) => {
          return (
            <>
              <Cell>
                <ColorMark color={colors[index]} />
                <Typography variant="body1">{name}</Typography>
              </Cell>
              <Cell center>
                <Typography variant="body1">
                  {isSmallScreen ? `$${trimNumber(currentData[index])}` : formatCurrency(currentData[index])}
                </Typography>
              </Cell>
              <Cell center>
                <Typography variant="body1">
                  {trim((currentData[index] / totalValue) * 100, isSmallScreen ? 0 : 1)}%
                </Typography>
              </Cell>
              <Cell center>
                <Typography variant="body1">
                  <Trend
                    value={currentData[index]}
                    lastValue={previousData[index]}
                    small
                    isSmallScreen={isSmallScreen}
                  />
                </Typography>
              </Cell>
            </>
          );
        })}
      </TableGrid>
    </div>
  );
};

const Trend = ({ value, lastValue, formattedValue, small, isSmallScreen = false }) => {
  const theme = useTheme();
  const pctChange = trim((value / lastValue - 1) * 100, small ? 1 : 2);

  if (value > lastValue) {
    return (
      <span style={{ color: theme.palette.trendUp }}>
        {formattedValue}{" "}
        <SvgIcon
          component={TrendingUp}
          color="green"
          style={{ fontSize: isSmallScreen ? "0.75rem" : "1rem", width: isSmallScreen ? "16px" : "24px" }}
        />{" "}
        {pctChange}%
      </span>
    );
  }
  if (value < lastValue) {
    return (
      <span style={{ color: theme.palette.trendDown }}>
        {formattedValue}
        <SvgIcon
          component={TrendingDown}
          color="green"
          style={{ fontSize: isSmallScreen ? "0.75rem" : "1rem", width: isSmallScreen ? "16px" : "24px" }}
        />{" "}
        {pctChange}%
      </span>
    );
  }
  return (
    <span>
      {formattedValue}
      <SvgIcon
        component={TrendingFlat}
        color="primary"
        style={{ fontSize: isSmallScreen ? "0.75rem" : "1rem", width: isSmallScreen ? "16px" : "24px" }}
      />
    </span>
  );
};

const TableGrid = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 25% 35% 15% 30%;
  ${({ isSmallScreen }) => isSmallScreen && "grid-template-columns: 30% 25% 15% 35%;"}
  padding-left: 12px;
  grid-row-gap: 12px;

  ${({ header }) => header && "padding-bottom: 12px;  margin-top: 32px;"}
  ${({ header, isSmallScreen }) => header && isSmallScreen && "margin-top: 42px;"}
`;

const ColorMark = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 12px;
  background: ${({ color }) => color};
  margin-right: 8px;
`;

const Cell = styled.div`
  display: flex;
  align-items: center;
  ${({ center }) => center && "justify-self: center;"}
`;
