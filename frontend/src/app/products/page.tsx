"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Snackbar from "@mui/material/Snackbar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import { getProducts, deleteProduct, createProduct, type Product, type ProductCreate } from "@/lib/api";

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

export default function ProductsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [snack, setSnack] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<ProductCreate>(defaultForm);
  const [saving, setSaving] = React.useState(false);

  const load = () => {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  React.useEffect(load, []);

  const handleDelete = async (id: number) => {
    await deleteProduct(id);
    setSnack("Product deleted");
    load();
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createProduct(form);
      setSnack("Product created");
      setDialogOpen(false);
      setForm(defaultForm);
      load();
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const numField = (key: keyof ProductCreate) => ({
    type: "number",
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: parseFloat(e.target.value) || 0 })),
  });

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add Product
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Lead Time (d)</TableCell>
                <TableCell>Unit Cost</TableCell>
                <TableCell>Setup Cost</TableCell>
                <TableCell>Safety Stock</TableCell>
                <TableCell>Init. Inv.</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{p.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={p.category} size="small" />
                    </TableCell>
                    <TableCell>{p.lead_time_days}</TableCell>
                    <TableCell>${p.unit_cost.toFixed(2)}</TableCell>
                    <TableCell>${p.setup_cost.toFixed(2)}</TableCell>
                    <TableCell>{p.safety_stock}</TableCell>
                    <TableCell>{p.initial_inventory}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add product dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
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
            <Grid item xs={12} sm={6}>
              <TextField label="Lead Time (days)" fullWidth {...numField("lead_time_days")} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Unit Cost ($)" fullWidth {...numField("unit_cost")} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Setup Cost ($)" fullWidth {...numField("setup_cost")} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Holding Cost / Unit ($)" fullWidth {...numField("holding_cost_per_unit")} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Safety Stock" fullWidth {...numField("safety_stock")} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Initial Inventory" fullWidth {...numField("initial_inventory")} />
            </Grid>
            {([1, 2, 3, 4, 5, 6] as const).map((w) => (
              <Grid item xs={12} sm={4} key={w}>
                <TextField
                  label={`Demand Week ${w}`}
                  fullWidth
                  {...numField(`past_demand_week${w}` as keyof ProductCreate)}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.name}>
            {saving ? "Saving…" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack("")}
        message={snack}
      />
    </Box>
  );
}
