"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import { createProduct, type ProductCreate } from "@/lib/api";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SaveIcon from "@mui/icons-material/Save";

const defaultForm: ProductCreate = {
  name: "",
  category: "",
  lead_time_days: 7,
  past_demand_week1: 0,
  past_demand_week2: 0,
  past_demand_week3: 0,
  past_demand_week4: 0,
  past_demand_week5: 0,
  past_demand_week6: 0,
  setup_cost: 0,
  holding_cost_per_unit: 0,
  unit_cost: 0,
  safety_stock: 0,
  initial_inventory: 0,
};

export default function DataCollectionPage() {
  const [form, setForm] = React.useState<ProductCreate>(defaultForm);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [snack, setSnack] = React.useState("");
  const [csvError, setCsvError] = React.useState<string | null>(null);
  const [csvResults, setCsvResults] = React.useState<string[]>([]);

  const numField = (key: keyof ProductCreate) => ({
    type: "number" as const,
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: parseFloat(e.target.value) || 0 })),
  });

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await createProduct(form);
      setSnack(`Product "${form.name}" created successfully`);
      setForm(defaultForm);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(null);
    setCsvResults([]);
    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) {
      setCsvError("CSV must have a header row and at least one data row");
      return;
    }
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const results: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = vals[idx] ?? "0";
      });
      const product: ProductCreate = {
        name: row["name"] ?? `Product ${i}`,
        category: row["category"] ?? "Uncategorized",
        lead_time_days: parseInt(row["lead_time_days"] ?? "7") || 7,
        past_demand_week1: parseFloat(row["past_demand_week1"] ?? "0") || 0,
        past_demand_week2: parseFloat(row["past_demand_week2"] ?? "0") || 0,
        past_demand_week3: parseFloat(row["past_demand_week3"] ?? "0") || 0,
        past_demand_week4: parseFloat(row["past_demand_week4"] ?? "0") || 0,
        past_demand_week5: parseFloat(row["past_demand_week5"] ?? "0") || 0,
        past_demand_week6: parseFloat(row["past_demand_week6"] ?? "0") || 0,
        setup_cost: parseFloat(row["setup_cost"] ?? "0") || 0,
        holding_cost_per_unit: parseFloat(row["holding_cost_per_unit"] ?? "0") || 0,
        unit_cost: parseFloat(row["unit_cost"] ?? "0") || 0,
        safety_stock: parseFloat(row["safety_stock"] ?? "0") || 0,
        initial_inventory: parseFloat(row["initial_inventory"] ?? "0") || 0,
      };
      try {
        await createProduct(product);
        results.push(`✓ Row ${i}: "${product.name}" imported`);
      } catch (err: unknown) {
        results.push(`✗ Row ${i}: "${product.name}" — ${(err as Error).message}`);
      }
    }
    setCsvResults(results);
    e.target.value = "";
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Data Collection
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manually enter a new product, or upload a CSV file to bulk-import products.
      </Typography>

      {/* Manual entry */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Manual Product Entry
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Product Name"
              fullWidth
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Category"
              fullWidth
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Lead Time (days)" fullWidth {...numField("lead_time_days")} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Unit Cost ($)" fullWidth {...numField("unit_cost")} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Setup Cost ($)" fullWidth {...numField("setup_cost")} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Holding Cost / Unit ($)" fullWidth {...numField("holding_cost_per_unit")} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Safety Stock" fullWidth {...numField("safety_stock")} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Initial Inventory" fullWidth {...numField("initial_inventory")} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Historical Demand (6 weeks)
            </Typography>
          </Grid>
          {([1, 2, 3, 4, 5, 6] as const).map((w) => (
            <Grid item xs={6} sm={2} key={w}>
              <TextField
                label={`Week ${w}`}
                fullWidth
                {...numField(`past_demand_week${w}` as keyof ProductCreate)}
              />
            </Grid>
          ))}
        </Grid>

        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          sx={{ mt: 3 }}
          onClick={handleSave}
          disabled={saving || !form.name || !form.category}
        >
          {saving ? "Saving…" : "Save Product"}
        </Button>
      </Paper>

      {/* CSV upload */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Bulk Import via CSV
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          CSV columns: <code>name, category, lead_time_days, past_demand_week1..6, setup_cost,
          holding_cost_per_unit, unit_cost, safety_stock, initial_inventory</code>
        </Typography>

        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFileIcon />}
        >
          Upload CSV
          <input type="file" accept=".csv" hidden onChange={handleCSV} />
        </Button>

        {csvError && <Alert severity="error" sx={{ mt: 2 }}>{csvError}</Alert>}

        {csvResults.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {csvResults.map((r, i) => (
              <Typography
                key={i}
                variant="body2"
                color={r.startsWith("✓") ? "success.main" : "error.main"}
              >
                {r}
              </Typography>
            ))}
          </Box>
        )}
      </Paper>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
}
