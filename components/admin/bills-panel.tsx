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
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { format } from "date-fns"

// StyledTableCell and StyledTableRow components (optional, for styling)
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.MuiTableCell-head`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.MuiTableCell-body`]: {
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

interface Bill {
  id: string
  clientName: string
  amount: number
  dueDate: Date
  status: "pending" | "paid" | "overdue"
  invoiceNumber: string
}

const BillsPanel: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    // Mock data for bills (replace with API call later)
    const mockBills: Bill[] = [
      {
        id: "1",
        clientName: "Acme Corp",
        amount: 100,
        dueDate: new Date("2023-12-31"),
        status: "pending",
        invoiceNumber: "INV-001",
      },
      {
        id: "2",
        clientName: "Beta Inc",
        amount: 200,
        dueDate: new Date("2024-01-15"),
        status: "paid",
        invoiceNumber: "INV-002",
      },
      {
        id: "3",
        clientName: "Gamma Ltd",
        amount: 150,
        dueDate: new Date("2024-01-01"),
        status: "overdue",
        invoiceNumber: "INV-003",
      },
    ]
    setBills(mockBills)
  }, [])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleFilterStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(event.target.value)
  }

  const handleRowClick = (bill: Bill) => {
    setSelectedBill(bill)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const filteredBills = bills.filter((bill) => {
    const searchMatch =
      bill.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const statusMatch = filterStatus === "" || bill.status === filterStatus
    return searchMatch && statusMatch
  })

  return (
    <div>
      <TextField
        label="Search Clients or Invoice Number"
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ marginBottom: "16px", width: "300px" }}
      />
      <FormControl variant="outlined" size="small" style={{ marginLeft: "16px", marginBottom: "16px", width: "200px" }}>
        <InputLabel id="status-filter-label">Filter by Status</InputLabel>
        <Select
          labelId="status-filter-label"
          id="status-filter"
          value={filterStatus}
          onChange={handleFilterStatusChange}
          label="Filter by Status"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="overdue">Overdue</MenuItem>
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Client</StyledTableCell>
              <StyledTableCell align="right">Invoice Number</StyledTableCell>
              <StyledTableCell align="right">Amount</StyledTableCell>
              <StyledTableCell align="right">Due Date</StyledTableCell>
              <StyledTableCell align="right">Status</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBills.map((bill) => (
              <StyledTableRow
                key={bill.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                onClick={() => handleRowClick(bill)}
                style={{ cursor: "pointer" }}
              >
                <StyledTableCell component="th" scope="row">
                  {bill.clientName}
                </StyledTableCell>
                <StyledTableCell align="right">{bill.invoiceNumber}</StyledTableCell>
                <StyledTableCell align="right">{bill.amount}</StyledTableCell>
                <StyledTableCell align="right">{format(bill.dueDate, "yyyy-MM-dd")}</StyledTableCell>
                <StyledTableCell align="right">{bill.status}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Bill Details</DialogTitle>
        <DialogContent>
          {selectedBill && (
            <div>
              <p>Client: {selectedBill.clientName}</p>
              <p>Invoice Number: {selectedBill.invoiceNumber}</p>
              <p>Amount: {selectedBill.amount}</p>
              <p>Due Date: {format(selectedBill.dueDate, "yyyy-MM-dd")}</p>
              <p>Status: {selectedBill.status}</p>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default BillsPanel
