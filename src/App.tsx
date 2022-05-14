import { ThemeProvider } from "@material-ui/core/styles";
import { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Route, Redirect, Switch, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Backdrop, Card, CardContent, Link, Typography, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import styled from "styled-components";
import useTheme from "./hooks/useTheme";
import useBonds, { IAllBondData } from "./hooks/Bonds";
import { useAddress, useWeb3Context } from "./hooks/web3Context";
import useSegmentAnalytics from "./hooks/useSegmentAnalytics";
import { segmentUA } from "./helpers/userAnalyticHelpers";
import { shouldTriggerSafetyCheck } from "./helpers";

import { calcBondDetails, calcAbsorptionBondDetails } from "./slices/BondSlice";
import {
  loadAppDetails,
  loadGraphData,
  refreshRebaseTimer,
  loadAnalyticsData,
  loadTreasuryData,
} from "./slices/AppSlice";
import { loadAccountDetails, calculateUserBondDetails } from "./slices/AccountSlice";
import { info } from "./slices/MessagesSlice";

import {
  Stake,
  AbsorptionBonds,
  ChooseBond,
  Bond,
  Wrap,
  TreasuryDashboard,
  PoolTogether,
  Calc,
  Dashboard,
} from "./views";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import TopBar from "./components/TopBar/TopBar.jsx";
import NavDrawer from "./components/Sidebar/NavDrawer.jsx";
import Messages from "./components/Messages/Messages";
import NotFound from "./views/404/NotFound";

import { dark as darkTheme } from "./themes/dark.js";
import { light as lightTheme } from "./themes/light.js";
import { girth as gTheme } from "./themes/girth.js";
import "./style.scss";
import { Bond as IBond } from "./lib/Bond";
import { useGoogleAnalytics } from "./hooks/useGoogleAnalytics";

// 😬 Sorry for all the console logging
const DEBUG = false;

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// 🔭 block explorer URL
// const blockExplorer = targetNetwork.blockExplorer;

const drawerWidth = 280;
const transitionDuration = 969;

const useStyles = makeStyles(theme => ({
  drawer: {
    [theme.breakpoints.up("md")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(1),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: transitionDuration,
    }),
    height: "100%",
    overflow: "auto",
    marginLeft: drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: transitionDuration,
    }),
    marginLeft: 0,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  rootOverlay: {
    zIndex: 1000,
    position: "absolute",
  },
}));

function App() {
  //useSegmentAnalytics();
  useGoogleAnalytics();
  const location = useLocation();
  const dispatch = useDispatch();
  const [theme, toggleTheme, mounted] = useTheme();
  const currentPath = location.pathname + location.search + location.hash;
  const classes = useStyles();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSmallerScreen = useMediaQuery("(max-width: 980px)");
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  const { connect, hasCachedProvider, provider, chainID, connected, uri } = useWeb3Context();
  const address = useAddress();

  const [walletChecked, setWalletChecked] = useState(false);

  const { bonds, expiredBonds, absorptionBonds } = useBonds(chainID);

  async function loadDetails(whichDetails: string, isRefresh: boolean = false) {
    // NOTE (unbanksy): If you encounter the following error:
    // Unhandled Rejection (Error): call revert exception (method="balanceOf(address)", errorArgs=null, errorName=null, errorSignature=null, reason=null, code=CALL_EXCEPTION, version=abi/5.4.0)
    // it's because the initial provider loaded always starts with chainID=1. This causes
    // address lookup on the wrong chain which then throws the error. To properly resolve this,
    // we shouldn't be initializing to chainID=1 in web3Context without first listening for the
    // network. To actually test rinkeby, change setChainID equal to 4 before testing.
    let loadProvider = provider;

    if (whichDetails === "app") {
      loadApp(loadProvider, isRefresh);
    }

    // don't run unless provider is a Wallet...
    if (whichDetails === "account" && address && connected) {
      loadAccount(loadProvider, isRefresh);
    }
  }

  const loadApp = useCallback(
    (loadProvider, isRefresh) => {
      dispatch(loadAppDetails({ networkID: chainID, provider: loadProvider, attempts: isRefresh ? -1 : 0 }));
      bonds.forEach(bond => {
        dispatch(
          calcBondDetails({
            bond,
            value: "",
            provider: loadProvider,
            networkID: chainID,
            attempts: isRefresh ? -1 : 0,
          }),
        );
      });
      absorptionBonds.forEach(bond => {
        dispatch(
          calcAbsorptionBondDetails({
            bond,
            value: "",
            provider: loadProvider,
            networkID: chainID,
            attempts: isRefresh ? -1 : 0,
          }),
        );
      });
    },
    [connected],
  );

  const loadAccount = useCallback(
    (loadProvider, isRefresh) => {
      dispatch(
        loadAccountDetails({ networkID: chainID, address, provider: loadProvider, attempts: isRefresh ? -1 : 0 }),
      );
      bonds.forEach(bond => {
        dispatch(
          calculateUserBondDetails({
            address,
            bond,
            provider: loadProvider,
            networkID: chainID,
            attempts: isRefresh ? -1 : 0,
          }),
        );
      });
      expiredBonds.forEach(bond => {
        dispatch(
          calculateUserBondDetails({
            address,
            bond,
            provider: loadProvider,
            networkID: chainID,
            attempts: isRefresh ? -1 : 0,
          }),
        );
      });
      absorptionBonds.forEach(bond => {
        dispatch(
          calculateUserBondDetails({
            address,
            bond,
            provider: loadProvider,
            networkID: chainID,
            attempts: isRefresh ? -1 : 0,
          }),
        );
      });
    },
    [connected],
  );

  // The next 3 useEffects handle initializing API Loads AFTER wallet is checked
  //
  // this useEffect checks Wallet Connection & then sets State for reload...
  // ... we don't try to fire Api Calls on initial load because web3Context is not set yet
  // ... if we don't wait we'll ALWAYS fire API calls via JsonRpc because provider has not
  // ... been reloaded within App.
  useEffect(() => {
    let interval: any = null;
    loadMetrics();

    if (hasCachedProvider()) {
      // then user DOES have a wallet
      connect().then(() => {
        setWalletChecked(true);
        segmentUA({
          type: "connect",
          provider: provider,
          context: currentPath,
        });
      });
    } else {
      // then user DOES NOT have a wallet
      setWalletChecked(true);
    }
    if (shouldTriggerSafetyCheck()) {
      dispatch(info("Safety Check: Always verify you're on app.exodia.fi!"));
    }

    interval = setInterval(() => {
      loadMetrics(-1);
    }, 60000); // The subgraph updates it's latest value every minute

    return () => clearInterval(interval);
  }, []);

  const loadMetrics = (attempts = 0) => {
    dispatch(loadGraphData({ attempts }));
    dispatch(loadTreasuryData({ attempts }));
    dispatch(loadAnalyticsData({ attempts }));
  };

  // this useEffect fires on state change from above. It will ALWAYS fire AFTER
  useEffect(() => {
    let interval: any = null;
    // don't load ANY details until wallet is Checked
    if (walletChecked) loadDetails("app");

    interval = setInterval(() => {
      if (walletChecked) loadDetails("app", true);
    }, 60000);

    return () => clearInterval(interval);
  }, [walletChecked]);

  // this useEffect picks up any time a user Connects via the button
  useEffect(() => {
    let interval: any = null;
    // don't load ANY details until wallet is Connected
    if (connected) loadDetails("account");

    interval = setInterval(() => {
      if (connected) loadDetails("account", true);
    }, 60000);

    return () => clearInterval(interval);
  }, [connected]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarExpanded(false);
  };

  let themeMode = theme === "light" ? lightTheme : theme === "dark" ? darkTheme : gTheme;

  useEffect(() => {
    themeMode = theme === "light" ? lightTheme : darkTheme;
  }, [theme]);

  useEffect(() => {
    if (isSidebarExpanded) handleSidebarClose();
  }, [location]);

  useEffect(() => {
    let interval: any = null;
    dispatch(refreshRebaseTimer({ networkID: chainID, provider }));
    interval = setInterval(() => {
      dispatch(refreshRebaseTimer({ networkID: chainID, provider, attempts: -1 }));
    }, 60000);

    return () => clearInterval(interval);
  }, [chainID, provider]);

  return (
    <ThemeProvider theme={themeMode}>
      <Backdrop open={true} className={classes.rootOverlay}>
        <Card>
          <CardContent>
            <Typography variant={"h3"}>Exodia is closed</Typography>
            <Typography variant={"body1"}>
              The community decided to end the project with{" "}
              <Link
                href={
                  "https://snapshot.org/#/exodiadao.eth/proposal/0x175551e37ce0449cec533329c6ed65f29268b3c98af9e63b964d7393358faafb"
                }
                rel="noopener noreferrer"
                target={"_blank"}
                color={"primary"}
              >
                XIP-007
              </Link>
              and redistribute the treasury.
            </Typography>
            <Typography variant={"body1"}>
              All information regarding the redistribution can be found{" "}
              <Link
                href={
                  "https://docs.google.com/spreadsheets/d/1CKMRjn0J3xRSpmxgDJFTPMt9lETMCfIz6ow3LmFZQDQ/edit#gid=1376773481"
                }
                rel="noopener noreferrer"
                target={"_blank"}
                color={"secondary"}
              >
                here
              </Link>
              .
            </Typography>
          </CardContent>
        </Card>
      </Backdrop>
      <Router>
        <CssBaseline />
        {/* {isAppLoading && <LoadingSplash />} */}
        <AppContainer
          className={`app ${isSmallerScreen && "tablet"} ${isSmallScreen && "mobile"} ${theme}`}
          backgroundColor={themeMode.palette.background.mainBackground}
        >
          <Messages />
          <TopBar theme={theme} toggleTheme={toggleTheme} handleDrawerToggle={handleDrawerToggle} />
          <nav className={classes.drawer}>
            {isSmallerScreen ? (
              <NavDrawer mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
            ) : (
              <Sidebar />
            )}
          </nav>

          <div className={`${classes.content} ${isSmallerScreen && classes.contentShift}`}>
            <Switch>
              <Route exact path="/">
                <Redirect to="/dashboard" />
              </Route>

              <Route exact path="/dashboard">
                <Dashboard />
              </Route>

              <Route exact path="/analytics">
                <TreasuryDashboard />
              </Route>

              <Route path="/stake">
                <Stake />
              </Route>

              <Route path="/obliterator">
                <Calc />
              </Route>

              <Route path="/wrap">
                <Wrap />
              </Route>
              {/*

                <Route path="/33-together">
                  <PoolTogether />
                </Route>
   */}

              <Route path="/absorption">
                {(absorptionBonds as IAllBondData[]).map(bond => {
                  return (
                    <Route exact key={bond.name} path={`/absorption/${bond.name}`}>
                      <Bond bond={bond} />
                    </Route>
                  );
                })}
                <AbsorptionBonds />
              </Route>

              <Route path="/bonds">
                {(bonds as IAllBondData[]).map(bond => {
                  return (
                    <Route exact key={bond.name} path={`/bonds/${bond.name}`}>
                      <Bond bond={bond} />
                    </Route>
                  );
                })}
                <ChooseBond />
              </Route>

              <Route component={NotFound} />
            </Switch>
          </div>
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App;

const AppContainer = styled.div<{ backgroundColor: string }>`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-flow: column;
  flex-direction: column;
  z-index: 1;
  background-size: cover;
  font-family: "Square";
  overflow: hidden;
  transition: all ease 0.33ms;
  background: ${({ backgroundColor }) => backgroundColor};
`;
