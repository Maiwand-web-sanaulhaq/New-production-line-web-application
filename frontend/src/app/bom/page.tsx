"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
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
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import {
  getProducts,
  getBOM,
  createBOMEntry,
  deleteBOMEntry,
  type Product,
  type BOMEntry,
  type BOMEntryCreate,
} from "@/lib/api";

const defaultForm: BOMEntryCreate = {
  parent_product_id: 0,
  component: "",
  quantity_per_unit: 1,
  component_lead_time_days: 0,
  component_unit_cost: 0,
};

export default function BOMPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [entries, setEntries] = React.useState<BOMEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [snack, setSnack] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<BOMEntryCreate>(defaultForm);
  const [saving, setSaving] = React.useState(false);
  const [filterProduct, setFilterProduct] = React.useState<number | "all">("all");

  const load = () => {
    setLoading(true);
    Promise.all([getProducts(), getBOM()])
      .then(([p, b]) => {
        setProducts(p);
        setEntries(b);
        if (p.length > 0 && form.parent_product_id === 0) {
          setForm((f) => ({ ...f, parent_product_id: p[0].id }));
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  React.useEffect(load, []);

  const handleDelete = async (id: number) => {
    await deleteBOMEntry(id);
    setSnack("BOM entry deleted");
    load();
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createBOMEntry(form);
      setSnack("BOM entry created");
      setDialogOpen(false);
      load();
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const productName = (id: number) => products.find((p) => p.id === id)?.name ?? `#${id}`;

  const displayed =
    filterProduct === "all"
      ? entries
      : entries.filter((e) => e.parent_product_id === filterProduct);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Bill of Materials</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add BOM Entry
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filter */}
      <TextField
        select
        label="Filter by Product"
        value={filterProduct}
        onChange={(e) =>
          setFilterProduct(e.target.value === "all" ? "all" : parseInt(e.target.value))
        }
        size="small"
        sx={{ mb: 2, minWidth: 200 }}
      >
        <MenuItem value="all">All Products</MenuItem>
        {products.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {p.name}
          </MenuItem>
        ))}
      </TextField>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Parent Product</TableCell>
                <TableCell>Component</TableCell>
                <TableCell>Qty / Unit</TableCell>
                <TableCell>Lead Time (d)</TableCell>
                <TableCell>Unit Cost ($)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No BOM entries found
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>{productName(e.parent_product_id)}</TableCell>
                    <TableCell>{e.component}</TableCell>
                    <TableCell>{e.quantity_per_unit}</TableCell>
                    <TableCell>{e.component_lead_time_days}</TableCell>
                    <TableCell>${e.component_unit_cost.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleDelete(e.id)}>
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

      {/* Add BOM entry dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add BOM Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                select
                label="Parent Product"
                fullWidth
                value={form.parent_product_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, parent_product_id: parseInt(e.target.value) }))
                }
              >
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Component Name"
                fullWidth
                value={form.component}
                onChange={(e) => setForm((f) => ({ ...f, component: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Qty / Unit"
                type="number"
                fullWidth
                value={form.quantity_per_unit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity_per_unit: parseFloat(e.target.value) || 0 }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Lead Time (days)"
                type="number"
                fullWidth
                value={form.component_lead_time_days}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    component_lead_time_days: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Unit Cost ($)"
                type="number"
                fullWidth
                value={form.component_unit_cost}
                onChange={(e) =>
                  setForm((f) => ({ ...f, component_unit_cost: parseFloat(e.target.value) || 0 }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={saving || !form.component || form.parent_product_id === 0}
          >
            {saving ? "Saving…" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
}
