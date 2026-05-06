"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import InventoryIcon from "@mui/icons-material/Inventory";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { getProducts, getBOM, type Product, type BOMEntry } from "@/lib/api";

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card elevation={2}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ color: "primary.main" }}>{icon}</Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [bomEntries, setBomEntries] = React.useState<BOMEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    Promise.all([getProducts(), getBOM()])
      .then(([p, b]) => {
        setProducts(p);
        setBomEntries(b);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const avgLeadTime =
    products.length > 0
      ? (products.reduce((s, p) => s + p.lead_time_days, 0) / products.length).toFixed(1)
      : "—";

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Could not connect to backend: {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<InventoryIcon fontSize="large" />}
            label="Total Products"
            value={products.length}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AccountTreeIcon fontSize="large" />}
            label="BOM Entries"
            value={bomEntries.length}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<InventoryIcon fontSize="large" />} label="Categories" value={categories.length} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<InventoryIcon fontSize="large" />}
            label="Avg Lead Time (days)"
            value={avgLeadTime}
          />
        </Grid>
      </Grid>

      {products.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Products Overview
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {products.map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {p.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Category: {p.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lead time: {p.lead_time_days} days
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Unit cost: ${p.unit_cost.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Initial inventory: {p.initial_inventory}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {products.length === 0 && !error && (
        <Alert severity="info">
          No products yet. Go to <strong>Data Collection</strong> to add your first product.
        </Alert>
      )}
    </Box>
  );
}
