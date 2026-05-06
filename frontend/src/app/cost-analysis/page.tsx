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
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getProducts, runCostAnalysis, type Product, type CostResponse } from "@/lib/api";

export default function CostAnalysisPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedId, setSelectedId] = React.useState<number | "">("");
  const [periods, setPeriods] = React.useState(6);
  const [capacity, setCapacity] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [productsLoading, setProductsLoading] = React.useState(true);
  const [result, setResult] = React.useState<CostResponse | null>(null);
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
      const cap = capacity !== "" ? parseFloat(capacity) : undefined;
      const r = await runCostAnalysis(selectedId as number, periods, cap);
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
        Cost Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Compare total costs (setup + holding + production) across all three planning methods to find
        the most cost-effective strategy.
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
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
              label="Periods"
              type="number"
              value={periods}
              onChange={(e) => setPeriods(Math.max(1, parseInt(e.target.value) || 1))}
              fullWidth
              inputProps={{ min: 1, max: 52 }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Capacity / Period (optional)"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              fullWidth
              placeholder="Unlimited"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleRun}
              disabled={!selectedId || loading}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Analyse"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {result && (
        <Box>
          {/* Recommendation */}
          <Card
            elevation={3}
            sx={{ mb: 3, border: "2px solid", borderColor: "success.main", bgcolor: "success.50" }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CheckCircleIcon color="success" fontSize="large" />
              <Box>
                <Typography variant="h6">Recommended: {result.recommended}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.product_name} — lowest total cost across {periods} periods
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Summary cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {result.methods.map((m) => {
              const isRecommended = m.method === result.recommended;
              return (
                <Grid item xs={12} sm={4} key={m.method}>
                  <Card
                    elevation={isRecommended ? 4 : 1}
                    sx={{
                      border: isRecommended ? "2px solid" : "1px solid",
                      borderColor: isRecommended ? "success.main" : "divider",
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Typography variant="h6">{m.method}</Typography>
                        {isRecommended && (
                          <Chip label="Best" color="success" size="small" />
                        )}
                      </Box>
                      <Typography variant="h5" fontWeight={700} color="primary.main">
                        ${m.total_cost.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {m.num_orders} order{m.num_orders !== 1 ? "s" : ""}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Detailed breakdown */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cost Breakdown
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Method</TableCell>
                    <TableCell align="right">Setup Cost</TableCell>
                    <TableCell align="right">Holding Cost</TableCell>
                    <TableCell align="right">Production Cost</TableCell>
                    <TableCell align="right">Total Cost</TableCell>
                    <TableCell align="right">Orders</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.methods.map((m) => (
                    <TableRow
                      key={m.method}
                      hover
                      sx={
                        m.method === result.recommended
                          ? { bgcolor: "success.light" }
                          : undefined
                      }
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {m.method}
                          {m.method === result.recommended && (
                            <Chip label="Best" color="success" size="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">${m.setup_cost.toLocaleString()}</TableCell>
                      <TableCell align="right">${m.holding_cost.toLocaleString()}</TableCell>
                      <TableCell align="right">${m.production_cost.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        ${m.total_cost.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">{m.num_orders}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
