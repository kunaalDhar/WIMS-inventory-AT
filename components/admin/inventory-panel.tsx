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

interface InventoryItem {
  id: number
  name: string
  description: string
  quantity: number
  unitPrice: number
  supplier: string
  category: string
  client: string
}

const InventoryPanel = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<InventoryItem>({
    id: 0,
    name: "",
    description: "",
    quantity: 0,
    unitPrice: 0,
    supplier: "",
    category: "",
    client: "",
  })
  const [editMode, setEditMode] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)

  useEffect(() => {
    // Mock data for demonstration
    const mockInventory: InventoryItem[] = [
      {
        id: 1,
        name: "Product A",
        description: "Description A",
        quantity: 100,
        unitPrice: 25,
        supplier: "Supplier X",
        category: "Electronics",
        client: "Client Alpha",
      },
      {
        id: 2,
        name: "Product B",
        description: "Description B",
        quantity: 50,
        unitPrice: 50,
        supplier: "Supplier Y",
        category: "Clothing",
        client: "Client Beta",
      },
      {
        id: 3,
        name: "Product C",
        description: "Description C",
        quantity: 75,
        unitPrice: 75,
        supplier: "Supplier Z",
        category: "Home Goods",
        client: "Client Gamma",
      },
    ]
    setInventory(mockInventory)
  }, [])

  const handleClickOpen = () => {
    setOpen(true)
    setFormData({
      id: 0,
      name: "",
      description: "",
      quantity: 0,
      unitPrice: 0,
      supplier: "",
      category: "",
      client: "",
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
    if (editMode && selectedItemId !== null) {
      // Update existing item
      const updatedInventory = inventory.map((item) =>
        item.id === selectedItemId ? { ...formData, id: selectedItemId } : item,
      )
      setInventory(updatedInventory)
    } else {
      // Add new item
      const newItem = { ...formData, id: inventory.length > 0 ? Math.max(...inventory.map((item) => item.id)) + 1 : 1 }
      setInventory([...inventory, newItem])
    }

    handleClose()
  }

  const handleEdit = (id: number) => {
    const itemToEdit = inventory.find((item) => item.id === id)
    if (itemToEdit) {
      setFormData(itemToEdit)
      setOpen(true)
      setEditMode(true)
      setSelectedItemId(id)
    }
  }

  const handleDelete = (id: number) => {
    const updatedInventory = inventory.filter((item) => item.id !== id)
    setInventory(updatedInventory)
  }

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "description", headerName: "Description", width: 200 },
    { field: "quantity", headerName: "Quantity", width: 100 },
    { field: "unitPrice", headerName: "Unit Price", width: 100 },
    { field: "supplier", headerName: "Supplier", width: 150 },
    { field: "category", headerName: "Category", width: 150 },
    { field: "client", headerName: "Client", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
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
                id="description"
                name="description"
                label="Description"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="quantity"
                name="quantity"
                label="Quantity (Units)"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.quantity}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="unitPrice"
                name="unitPrice"
                label="Unit Price"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.unitPrice}
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
                placeholder="Enter supplier name"
                value={formData.supplier}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleSelectChange(e, "category")}
                >
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Clothing">Clothing</MenuItem>
                  <MenuItem value="Home Goods">Home Goods</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="client"
                name="client"
                label="Client"
                type="text"
                fullWidth
                variant="outlined"
                placeholder="Enter client name"
                value={formData.client}
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
