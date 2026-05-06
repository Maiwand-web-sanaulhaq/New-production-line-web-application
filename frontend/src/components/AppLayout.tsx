"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FactoryIcon from "@mui/icons-material/Factory";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InfoIcon from "@mui/icons-material/Info";

const DRAWER_WIDTH = 240;

const navItems = [
  { label: "About", href: "/about", icon: <InfoIcon /> },
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
  { label: "Products", href: "/products", icon: <InventoryIcon /> },
  { label: "Bill of Materials", href: "/bom", icon: <AccountTreeIcon /> },
  { label: "Data Collection", href: "/data-collection", icon: <UploadFileIcon /> },
  { label: "Demand Forecast", href: "/forecast", icon: <TrendingUpIcon /> },
  { label: "Production Planning", href: "/planning", icon: <FactoryIcon /> },
  { label: "MRP Explosion", href: "/mrp", icon: <BubbleChartIcon /> },
  { label: "Cost Analysis", href: "/cost-analysis", icon: <AttachMoneyIcon /> },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const drawer = (
    <Box>
      <Toolbar sx={{ bgcolor: "primary.main" }}>
        <HomeIcon sx={{ color: "white", mr: 1 }} />
        <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
          ProdLine
        </Typography>
      </Toolbar>
      <Divider />
      <List dense>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <ListItem key={item.href} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={active}
                onClick={() => setMobileOpen(false)}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "primary.light",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, display: { sm: "none" } }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Production Line
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: { xs: 8, sm: 0 },
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
