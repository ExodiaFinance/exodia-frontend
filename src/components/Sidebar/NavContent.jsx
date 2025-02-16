import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import Social from "./Social";
import externalUrls from "./externalUrls";
import { ReactComponent as StakeIcon } from "../../assets/icons/stake.svg";
import { ReactComponent as BondIcon } from "../../assets/icons/bond.svg";
import { ReactComponent as DashboardIcon } from "../../assets/icons/dashboard.svg";
import { ReactComponent as WrapIcon } from "../../assets/icons/wrap.svg";
import { ReactComponent as OlympusIcon } from "../../assets/icons/olympus-nav-header.svg";
import ExodiaLogo from "../../assets/images/logo-wide.png";
import { ReactComponent as PoolTogetherIcon } from "../../assets/icons/33-together.svg";
import { Trans } from "@lingui/macro";
import Davatar from "@davatar/react";
import { trim, shorten } from "../../helpers";
import { useAddress, useWeb3Context } from "src/hooks/web3Context";
import useBonds from "../../hooks/Bonds";
import { useENS } from "src/hooks/useENS";
import { Paper, Link, Box, Typography, SvgIcon } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import ShowChartIcon from "@material-ui/icons/ShowChart";
import StarIcon from "@material-ui/icons/Stars";
import HomeIcon from "@material-ui/icons/Home";
import CallMerge from "@material-ui/icons/CallMerge";
import Tooltip from "@material-ui/core/Tooltip";
import "./sidebar.scss";

function NavContent() {
  const [isActive] = useState();
  const address = useAddress();
  const { chainID } = useWeb3Context();
  const { bonds, upcomingBonds } = useBonds(chainID);
  const { ensName } = useENS(address);

  const checkPage = useCallback((match, location, page) => {
    const currentPath = location.pathname.replace("/", "");
    if (currentPath.indexOf("dashboard") >= 0 && page === "dashboard") {
      return true;
    }
    if (currentPath.indexOf("stake") >= 0 && page === "stake") {
      return true;
    }
    if (currentPath.indexOf("wrap") >= 0 && page === "wrap") {
      return true;
    }
    if (currentPath.indexOf("obliterator") >= 0 && page === "obliterator") {
      return true;
    }
    if (currentPath.indexOf("analytics") >= 0 && page === "analytics") {
      return true;
    }
    if ((currentPath.indexOf("bonds") >= 0 || currentPath.indexOf("choose_bond") >= 0) && page === "bonds") {
      return true;
    }
    if (currentPath.indexOf("absorption") >= 0 && page === "absorption") {
      return true;
    }
    return false;
  }, []);

  return (
    <Paper className="dapp-sidebar">
      <Box className="dapp-sidebar-inner" display="flex" justifyContent="space-between" flexDirection="column">
        <div className="dapp-menu-top">
          <Box className="branding-header">
            <Link href="https://exodia.fi" target="_blank" rel="nofollow noopener noreferrer">
              <img src={ExodiaLogo} alt={"Exodia logo"} />
            </Link>

            {address && (
              <div className="wallet-link">
                <span className="davatar">
                  <Davatar size={20} address={address} />
                </span>
                <Link
                  href={`https://ftmscan.com/address/${address}`}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                >
                  {ensName || shorten(address)}
                </Link>
              </div>
            )}
          </Box>

          <div className="dapp-menu-links">
            <div className="dapp-nav" id="navbarNav">
              <Link href={`https://www.exodia.fi/`} target="_blank" rel="nofollow noopener noreferrer">
                <Typography variant="h6">
                  <SvgIcon color="primary" component={HomeIcon} />
                  <Trans>Landing Page</Trans>
                </Typography>
              </Link>
              <Link
                component={NavLink}
                id="dash-nav"
                to="/dashboard"
                isActive={(match, location) => {
                  return checkPage(match, location, "dashboard");
                }}
                className={`button-dapp-menu ${isActive ? "active" : ""}`}
              >
                <Typography variant="h6">
                  <SvgIcon color="primary" component={DashboardIcon} />
                  <Trans>Dashboard</Trans>
                </Typography>
              </Link>
              <Link
                component={NavLink}
                id="dash-nav"
                to="/analytics"
                isActive={(match, location) => {
                  return checkPage(match, location, "analytics");
                }}
                className={`button-dapp-menu ${isActive ? "active" : ""}`}
              >
                <Typography variant="h6">
                  <SvgIcon color="primary" component={ShowChartIcon} />
                  <Trans>Analytics</Trans>
                </Typography>
              </Link>

              <Link
                component={NavLink}
                id="stake-nav"
                to="/stake"
                isActive={(match, location) => {
                  return checkPage(match, location, "stake");
                }}
                className={`button-dapp-menu ${isActive ? "active" : ""}`}
              >
                <Typography variant="h6">
                  <SvgIcon color="primary" component={StakeIcon} />
                  <Trans>Stake</Trans>
                </Typography>
              </Link>

              <Link
                component={NavLink}
                id="wrap-nav"
                to="/wrap"
                isActive={(match, location) => {
                  return checkPage(match, location, "wrap");
                }}
                className={`button-dapp-menu ${isActive ? "active" : ""}`}
              >
                <Typography variant="h6">
                  <SvgIcon color="primary" component={WrapIcon} />
                  <Trans>Wrap</Trans>
                </Typography>
              </Link>

              <Link
                component={NavLink}
                id="bond-nav"
                to="/bonds"
                isActive={(match, location) => {
                  return checkPage(match, location, "bonds");
                }}
                className={`button-dapp-menu ${isActive ? "active" : ""}`}
              >
                <Typography variant="h6">
                  <SvgIcon color="primary" component={BondIcon} />
                  <Trans>Bond</Trans>
                </Typography>
              </Link>

              <div className="dapp-menu-data discounts">
                <div className="bond-discounts">
                  <Typography variant="body1">
                    <Trans>Bond ROI</Trans>
                  </Typography>
                  {bonds.map((bond, i) => (
                    <Link component={NavLink} to={`/bonds/${bond.name}`} key={i} className={"bond"}>
                      {!bond.bondDiscount ? (
                        <Skeleton variant="text" width={"150px"} />
                      ) : (
                        <Typography variant="body1">
                          {bond.displayName}

                          <span className="bond-pair-roi">
                            {!bond.isAvailable[chainID]
                              ? "Sold Out"
                              : `${bond.bondDiscount && trim(bond.bondDiscount * 100, 2)}%`}
                          </span>
                        </Typography>
                      )}
                    </Link>
                  ))}
                  {upcomingBonds.map((bond, i) => (
                    <div className="upcoming-bond">
                      <Typography variant="body1" color="textPrimary">
                        {bond.displayName}
                        <span className="bond-pair-roi">Coming Soon!</span>
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                component={NavLink}
                id="bond-nav"
                to="/absorption"
                isActive={(match, location) => {
                  return checkPage(match, location, "absorption");
                }}
                className={`button-dapp-menu ${isActive ? "active" : ""}`}
              >
                <Typography variant="h6">
                  <SvgIcon color="primary" component={CallMerge} />
                  <Trans>Absorption</Trans>
                </Typography>
              </Link>

              <Link
                component={NavLink}
                id="calc-nav"
                to="/obliterator"
                isActive={(match, location) => {
                  return checkPage(match, location, "obliterator");
                }}
                className={`button-dapp-menu ${isActive ? "active" : ""} obliterator`}
              >
                <Tooltip
                  title={<Trans>Estimate and visualize your potential returns over time by staking with Exodia</Trans>}
                >
                  <Typography variant="h6" className="obliterator">
                    <SvgIcon color="primary" component={StarIcon} />
                    <Trans>Obliterator</Trans>
                  </Typography>
                </Tooltip>
              </Link>
            </div>
          </div>
        </div>
        <Box className="dapp-menu-bottom" display="flex" justifyContent="space-between" flexDirection="column">
          <div className="dapp-menu-external-links">
            {Object.keys(externalUrls).map((link, i) => {
              return (
                <Link key={i} href={`${externalUrls[link].url}`} target="_blank" rel="nofollow noopener noreferrer">
                  <Typography variant="h6">{externalUrls[link].icon}</Typography>
                  <Typography variant="h6">{externalUrls[link].title}</Typography>
                </Link>
              );
            })}
          </div>
          <div className="dapp-menu-social">
            <Social />
          </div>
        </Box>
      </Box>
    </Paper>
  );
}

export default NavContent;
