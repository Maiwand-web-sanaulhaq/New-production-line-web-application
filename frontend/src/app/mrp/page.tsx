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
import { getProducts, runMRP, type Product, type MRPResponse } from "@/lib/api";

export default function MRPPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedId, setSelectedId] = React.useState<number | "">("");
  const [periods, setPeriods] = React.useState(6);
  const [loading, setLoading] = React.useState(false);
  const [productsLoading, setProductsLoading] = React.useState(true);
  const [result, setResult] = React.useState<MRPResponse | null>(null);
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
      const r = await runMRP(selectedId as number, periods);
      setResult(r);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const periodLabels = result
    ? Array.from({ length: result.parent_plan.length }, (_, i) => `P${i + 1}`)
    : [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        MRP Explosion
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Explodes parent production orders into component requirements using the Bill of Materials.
        Component orders are offset by their lead times.
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
              label="Periods"
              type="number"
              value={periods}
              onChange={(e) => setPeriods(Math.max(1, parseInt(e.target.value) || 1))}
              fullWidth
              inputProps={{ min: 1, max: 52 }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleRun}
              disabled={!selectedId || loading}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Explode"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {result && (
        <Box>
          {/* Parent plan */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Parent: {result.product_name}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {periodLabels.map((l) => (
                      <TableCell key={l}>{l}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {result.parent_plan.map((v, i) => (
                      <TableCell key={i} sx={{ fontWeight: 600 }}>
                        {v}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Component plans */}
          {result.components.length === 0 ? (
            <Alert severity="info">
              No BOM components found for this product. Add entries on the Bill of Materials page.
            </Alert>
          ) : (
            result.components.map((comp) => (
              <Paper key={comp.component} elevation={2} sx={{ p: 3, mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Typography variant="h6">{comp.component}</Typography>
                  <Chip
                    label={`${comp.quantity_per_unit} per unit`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`Lead time: ${comp.component_lead_time_days}d`}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {periodLabels.map((l) => (
                          <TableCell key={l}>{l}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        {comp.orders.map((v, i) => (
                          <TableCell
                            key={i}
                            sx={{ fontWeight: v > 0 ? 600 : 400, color: v > 0 ? "primary.main" : undefined }}
                          >
                            {v}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ))
          )}
        </Box>
      )}
    </Box>
  );
}
