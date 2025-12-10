import React, { useEffect, useState } from "react";
import Layout from "./../../components/shared/Layout/Layout";
import moment from "moment";
import { useSelector } from "react-redux";
import API from "../../services/API";
import { 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl
} from "@mui/material";

const InterestedDonors = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getInterestedDonors = async () => {
    try {
      setLoading(true);
      const response = await API.get("/donor-interest/organisation/interested-donors");
      if (response.data?.success) {
        setData(response.data.interests);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (interestId, newStatus) => {
    try {
      const response = await API.put("/donor-interest/update-status", {
        interestId,
        status: newStatus,
      });
      
      if (response.data?.success) {
        alert("Status updated successfully");
        getInterestedDonors(); // Refresh the list
      }
    } catch (error) {
      console.log(error);
      alert("Error updating status");
    }
  };

  useEffect(() => {
    getInterestedDonors();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      contacted: "info",
      scheduled: "primary",
      completed: "success",
      cancelled: "error"
    };
    return colors[status] || "default";
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography>Loading...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
          Interested Donors
        </Typography>

        {data.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography>No interested donors yet.</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell><strong>Donor Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Phone</strong></TableCell>
                  <TableCell><strong>City</strong></TableCell>
                  <TableCell><strong>Address</strong></TableCell>
                  <TableCell><strong>Date of Birth</strong></TableCell>
                  <TableCell><strong>Gender</strong></TableCell>
                  <TableCell><strong>Blood Group</strong></TableCell>
                  <TableCell><strong>Available Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Registered On</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((record) => (
                  <TableRow key={record._id} hover>
                    <TableCell>{record.donor?.name || "N/A"}</TableCell>
                    <TableCell>{record.donor?.email || "N/A"}</TableCell>
                    <TableCell>{record.donor?.phone || "N/A"}</TableCell>
                    <TableCell>{record.donor?.preferredCity || "N/A"}</TableCell>
                    <TableCell>{record.donor?.address || "N/A"}</TableCell>
                    <TableCell>
                      {moment(record.dateOfBirth).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell>{record.gender}</TableCell>
                    <TableCell>
                      <Chip 
                        label={record.bloodGroup} 
                        color="error" 
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {moment(record.availability).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={record.status}
                          onChange={(e) => handleStatusUpdate(record._id, e.target.value)}
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="contacted">Contacted</MenuItem>
                          <MenuItem value="scheduled">Scheduled</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      {moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Layout>
  );
};

export default InterestedDonors;
