import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { grey } from "@mui/material/colors";
import {
  Alert,
  AlertTitle,
  Avatar,
  Backdrop,
  CircularProgress,
  Container,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  Tooltip,
} from "@mui/material";
import { useAppContext } from "../context/app.context";
import { firebaseAuth } from "../firebase/auth";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

export default function AppLayout() {
  const { appAlert, setAppAlert, isLoading, setIsLoading } = useAppContext();
  // const { removeToken } = useToken()
  const navigate = useNavigate();

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <Box
      sx={{ display: "flex", bgcolor: grey[50], minHeight: window.innerHeight }}
    >
      <CssBaseline />
      <AppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <SpaceDashboardIcon
              sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
            />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              DASBOARD
            </Typography>
            <SpaceDashboardIcon
              sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
            />
            {/* <ArticleIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} /> */}
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              DASBOARD
            </Typography>
            <Box
              sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}
            ></Box>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem
                  onClick={() => {
                    handleCloseUserMenu();
                    navigate("/");
                    firebaseAuth.signOut();
                    window.location.reload();
                  }}
                >
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, margin: 0 }}>
        {isLoading ? (
          <Backdrop
            sx={{
              color: "#fff",
              zIndex: (theme) => theme.zIndex.drawer + 1,
              backgroundColor: "rgba(0, 0, 0, 0.2)",
            }}
            open={isLoading}
            onClick={() => setIsLoading(false)}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        ) : (
          <Outlet />
        )}
        <Stack direction="row" justifyContent="flex-end" zIndex={10}>
          <Snackbar
            open={appAlert.isDisplayAlert}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            autoHideDuration={5000}
            onClose={() => {
              setAppAlert({
                isDisplayAlert: false,
                message: "",
                alertType: undefined,
              });
            }}
          >
            <Alert severity={appAlert.alertType}>
              <AlertTitle>{appAlert?.alertType?.toUpperCase()}</AlertTitle>
              {appAlert.message}
            </Alert>
          </Snackbar>
        </Stack>
      </Box>
    </Box>
  );
}
