"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Table,
  TableCell,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { useInventory } from "@/contexts/inventory-context"
import type { InventoryItem } from "@/contexts/inventory-context"

// Styled Components for better UI
const StyledPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(2),
  overflowX: "auto",
}))

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 650,
}))

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
}))

const InventoryPanel = () => {
  const { inventory, isDataLoaded, refreshInventory } = useInventory();
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<InventoryItem>({
    id: '',
    name: '',
    category: '',
    volume: '',
    bottlesPerCase: 0,
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    status: 'in-stock',
    lastUpdated: '',
    location: '',
    supplier: '',
    unitCost: 0,
    totalValue: 0,
    reorderPoint: 0,
    minPrice: 0,
    maxPrice: 0,
  })
  const [editMode, setEditMode] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const handleClickOpen = () => {
    setOpen(true)
    setFormData({
      id: '',
      name: '',
      category: '',
      volume: '',
      bottlesPerCase: 0,
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      status: 'in-stock',
      lastUpdated: '',
      location: '',
      supplier: '',
      unitCost: 0,
      totalValue: 0,
      reorderPoint: 0,
      minPrice: 0,
      maxPrice: 0,
    })
    setEditMode(false)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (event: React.ChangeEvent<{ value: unknown }>, name: string) => {
    setFormData({ ...formData, [name]: event.target.value as string })
  }

  const handleSubmit = () => {
    const now = new Date().toISOString();
    if (editMode && selectedItemId) {
      // Edit existing item
      const updated = inventory.map((item) =>
        item.id === selectedItemId ? { ...formData, lastUpdated: now } : item
      )
      localStorage.setItem('wims-inventory-v2', JSON.stringify(updated))
    } else {
      // Add new item
      const newItem = {
        ...formData,
        id: `item-${Date.now()}`,
        lastUpdated: now,
      }
      localStorage.setItem('wims-inventory-v2', JSON.stringify([...inventory, newItem]))
    }
    setOpen(false)
    if (typeof refreshInventory === 'function') {
      refreshInventory();
    } else {
      // TODO: Implement refreshInventory in useInventory to update context after changes
    }
  }

  const handleEdit = (id: string) => {
    const itemToEdit = inventory.find((item) => item.id === id)
    if (itemToEdit) {
      setFormData(itemToEdit)
      setOpen(true)
      setEditMode(true)
      setSelectedItemId(id)
    }
  }

  const handleDelete = (id: string) => {
    const updated = inventory.filter((item) => item.id !== id)
    localStorage.setItem('wims-inventory-v2', JSON.stringify(updated))
    if (typeof refreshInventory === 'function') {
      refreshInventory();
    } else {
      // TODO: Implement refreshInventory in useInventory to update context after changes
    }
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 120 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'category', headerName: 'Category', width: 120 },
    { field: 'volume', headerName: 'Volume', width: 100 },
    { field: 'bottlesPerCase', headerName: 'Bottles/Case', width: 120 },
    { field: 'currentStock', headerName: 'Stock', width: 100 },
    { field: 'unitCost', headerName: 'Unit Cost', width: 100 },
    { field: 'totalValue', headerName: 'Total Value', width: 120 },
    { field: 'supplier', headerName: 'Supplier', width: 120 },
    { field: 'status', headerName: 'Status', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      renderCell: (params) => (
        <div>
          <Button size="small" color="primary" onClick={() => handleEdit(params.row.id)}>
            Edit
          </Button>
          <Button size="small" color="secondary" onClick={() => handleDelete(params.row.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Add Item
      </Button>

      <StyledPaper>
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={inventory}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            getRowId={(row) => row.id}
          />
        </div>
      </StyledPaper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? "Edit Item" : "Add New Item"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                name="name"
                label="Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="category"
                name="category"
                label="Category"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.category}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="volume"
                name="volume"
                label="Volume"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.volume}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="bottlesPerCase"
                name="bottlesPerCase"
                label="Bottles/Case"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.bottlesPerCase}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="currentStock"
                name="currentStock"
                label="Current Stock"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.currentStock}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="minStock"
                name="minStock"
                label="Min Stock"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.minStock}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="maxStock"
                name="maxStock"
                label="Max Stock"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.maxStock}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="status"
                name="status"
                label="Status"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.status}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="unitCost"
                name="unitCost"
                label="Unit Cost"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.unitCost}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="totalValue"
                name="totalValue"
                label="Total Value"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.totalValue}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="reorderPoint"
                name="reorderPoint"
                label="Reorder Point"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.reorderPoint}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="location"
                name="location"
                label="Location"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.location}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="supplier"
                name="supplier"
                label="Supplier"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.supplier}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="minPrice"
                name="minPrice"
                label="Min Price (optional)"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.minPrice ?? ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="maxPrice"
                name="maxPrice"
                label="Max Price (optional)"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.maxPrice ?? ''}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {editMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default InventoryPanel
