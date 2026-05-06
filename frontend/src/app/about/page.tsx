"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import FactoryIcon from "@mui/icons-material/Factory";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Chip from "@mui/material/Chip";

const features = [
  {
    icon: <TrendingUpIcon fontSize="large" color="primary" />,
    title: "Demand Forecasting",
    desc: "Generate future demand forecasts using Weighted Moving Average, Simple Moving Average, and Exponential Smoothing.",
  },
  {
    icon: <FactoryIcon fontSize="large" color="primary" />,
    title: "Production Planning",
    desc: "Run Lot-for-Lot (L4L), Economic Order Quantity (EOQ), or Fixed Period ordering strategies with capacity constraints.",
  },
  {
    icon: <BubbleChartIcon fontSize="large" color="primary" />,
    title: "MRP Explosion",
    desc: "Automatically explode parent production orders into component requirements using Bill of Materials.",
  },
  {
    icon: <AttachMoneyIcon fontSize="large" color="primary" />,
    title: "Cost Analysis",
    desc: "Compare total costs (setup + holding + production) across all planning methods to find the optimal strategy.",
  },
];

const techStack = ["Next.js 15", "TypeScript", "MUI v5", "FastAPI", "PostgreSQL", "SQLAlchemy"];

export default function AboutPage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Production Line Planning System
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700 }}>
          A professional web application for manufacturing production planning, demand forecasting,
          Material Requirements Planning (MRP), and cost optimisation. Built as a full-stack
          replacement for the original Streamlit capstone project.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {features.map((f) => (
          <Grid item xs={12} sm={6} key={f.title}>
            <Card elevation={2} sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
                  {f.icon}
                  <Typography variant="h6">{f.title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {f.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Technology Stack
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {techStack.map((t) => (
            <Chip key={t} label={t} color="primary" variant="outlined" />
          ))}
        </Box>
      </Card>
    </Box>
  );
}
