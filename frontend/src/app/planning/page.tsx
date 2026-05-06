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
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { getProducts, runPlanning, type Product, type PlanningResponse } from "@/lib/api";

const METHODS = ["L4L", "EOQ", "FixedPeriod"];

export default function PlanningPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedId, setSelectedId] = React.useState<number | "">("");
  const [method, setMethod] = React.useState("L4L");
  const [periods, setPeriods] = React.useState(6);
  const [capacity, setCapacity] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [productsLoading, setProductsLoading] = React.useState(true);
  const [result, setResult] = React.useState<PlanningResponse | null>(null);
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
      const r = await runPlanning(selectedId as number, method, periods, cap);
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
        Production Planning
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Run Lot-for-Lot (L4L), EOQ, or Fixed Period ordering methods with optional capacity constraints.
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
        </Grid>

        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            Method:
          </Typography>
          <ToggleButtonGroup
            value={method}
            exclusive
            onChange={(_, v) => v && setMethod(v)}
            size="small"
          >
            {METHODS.map((m) => (
              <ToggleButton key={m} value={m}>
                {m}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Button
            variant="contained"
            onClick={handleRun}
            disabled={!selectedId || loading}
            sx={{ ml: "auto" }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Run Plan"}
          </Button>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {result && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Typography variant="h6">
              {result.product_name}
            </Typography>
            <Chip label={result.method} color="primary" />
            <Chip
              label={`Total Cost: $${result.total_cost.toLocaleString()}`}
              color="secondary"
              variant="outlined"
            />
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell>Gross Req.</TableCell>
                  <TableCell>Sched. Receipts</TableCell>
                  <TableCell>Projected Inv.</TableCell>
                  <TableCell>Net Req.</TableCell>
                  <TableCell>Planned Order</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.plan.map((row) => (
                  <TableRow key={row.period} hover>
                    <TableCell>{row.period}</TableCell>
                    <TableCell>{row.gross_requirement}</TableCell>
                    <TableCell>{row.scheduled_receipts}</TableCell>
                    <TableCell>{row.projected_inventory}</TableCell>
                    <TableCell>{row.net_requirement}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: row.planned_order > 0 ? "primary.main" : undefined }}>
                      {row.planned_order}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
