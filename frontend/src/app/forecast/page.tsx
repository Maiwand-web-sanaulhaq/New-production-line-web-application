"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { getProducts, forecastDemand, type Product, type ForecastResponse } from "@/lib/api";

export default function ForecastPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedId, setSelectedId] = React.useState<number | "">("");
  const [periods, setPeriods] = React.useState(4);
  const [loading, setLoading] = React.useState(false);
  const [productsLoading, setProductsLoading] = React.useState(true);
  const [result, setResult] = React.useState<ForecastResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getProducts()
      .then((p) => {
        setProducts(p);
        if (p.length > 0) setSelectedId(p[0].id);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setProductsLoading(false));
  }, []);

  const handleRun = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await forecastDemand(selectedId as number, periods);
      setResult(r);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Demand Forecast
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Uses Weighted Moving Average (WMA) to forecast future demand based on 6 weeks of historical data.
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              select
              label="Select Product"
              value={selectedId}
              onChange={(e) => setSelectedId(parseInt(e.target.value))}
              fullWidth
              disabled={productsLoading}
            >
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Forecast Periods"
              type="number"
              value={periods}
              onChange={(e) => setPeriods(Math.max(1, parseInt(e.target.value) || 1))}
              fullWidth
              inputProps={{ min: 1, max: 26 }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleRun}
              disabled={!selectedId || loading}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Forecast"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {result && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {result.product_name} — {result.method}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Historical Demand
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {result.historical.map((_, i) => (
                        <TableCell key={i}>Week {i + 1}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {result.historical.map((v, i) => (
                        <TableCell key={i}>{v}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Forecasted Demand
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {result.forecast.map((_, i) => (
                        <TableCell key={i}>Period {i + 1}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {result.forecast.map((v, i) => (
                        <TableCell key={i} sx={{ fontWeight: 600, color: "primary.main" }}>
                          {v}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
