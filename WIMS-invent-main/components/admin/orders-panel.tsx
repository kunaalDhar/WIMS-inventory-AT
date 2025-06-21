"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { tableCellClasses } from "@mui/material/TableCell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableHeader } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useOrders } from "@/contexts/order-context"
import type { Order } from "@/contexts/order-context"

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}))

interface Order {
  id: number
  orderDate: string
  client: string
  totalAmount: number
  status: string
}

const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState("")
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  })

  useEffect(() => {
    // Mock API call to fetch orders
    const mockOrders: Order[] = [
      { id: 1, orderDate: "2024-01-01", client: "Client A", totalAmount: 100, status: "Pending" },
      { id: 2, orderDate: "2024-01-05", client: "Client B", totalAmount: 200, status: "Shipped" },
      { id: 3, orderDate: "2024-01-10", client: "Client C", totalAmount: 150, status: "Delivered" },
    ]
    setOrders(mockOrders)
  }, [])

  const handleOpen = (order: Order) => {
    setSelectedOrder(order)
    setStatus(order.status)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleStatusChange = (event: any) => {
    setStatus(event.target.value)
  }

  const handleUpdateStatus = () => {
    if (selectedOrder) {
      // Mock API call to update order status
      const updatedOrders = orders.map((order) =>
        order.id === selectedOrder.id ? { ...order, status: status } : order,
      )
      setOrders(updatedOrders)
      setSelectedOrder({ ...selectedOrder, status: status })
      setAlert({
        open: true,
        message: `Order status updated successfully for client ${selectedOrder.client}`,
        severity: "success",
      })
      handleClose()
    }
  }

  const handleAlertClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return
    }
    setAlert({ ...alert, open: false })
  }

  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Order ID</StyledTableCell>
              <StyledTableCell align="right">Order Date</StyledTableCell>
              <StyledTableCell align="right">Client</StyledTableCell>
              <StyledTableCell align="right">Total Amount</StyledTableCell>
              <StyledTableCell align="right">Status</StyledTableCell>
              <StyledTableCell align="right">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <StyledTableRow key={order.id}>
                <StyledTableCell component="th" scope="row">
                  {order.id}
                </StyledTableCell>
                <StyledTableCell align="right">{order.orderDate}</StyledTableCell>
                <StyledTableCell align="right">{order.client}</StyledTableCell>
                <StyledTableCell align="right">{order.totalAmount}</StyledTableCell>
                <StyledTableCell align="right">{order.status}</StyledTableCell>
                <StyledTableCell align="right">
                  <Button variant="contained" color="primary" onClick={() => handleOpen(order)}>
                    View Details
                  </Button>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <div>
              <TextField
                margin="dense"
                id="orderId"
                label="Order ID"
                type="text"
                fullWidth
                variant="standard"
                value={selectedOrder.id}
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                margin="dense"
                id="orderDate"
                label="Order Date"
                type="text"
                fullWidth
                variant="standard"
                value={selectedOrder.orderDate}
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                margin="dense"
                id="client"
                label="Client:"
                type="text"
                fullWidth
                variant="standard"
                value={selectedOrder.client}
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                margin="dense"
                id="totalAmount"
                label="Total Amount"
                type="text"
                fullWidth
                variant="standard"
                value={selectedOrder.totalAmount}
                InputProps={{
                  readOnly: true,
                }}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel id="status-label">Status</InputLabel>
                <Select labelId="status-label" id="status" value={status} label="Status" onChange={handleStatusChange}>
                  <MenuItem value={"Pending"}>Pending</MenuItem>
                  <MenuItem value={"Shipped"}>Shipped</MenuItem>
                  <MenuItem value={"Delivered"}>Delivered</MenuItem>
                  <MenuItem value={"Cancelled"}>Cancelled</MenuItem>
                </Select>
              </FormControl>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleUpdateStatus}>Update Status</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose} severity={alert.severity} sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default OrdersPanel
