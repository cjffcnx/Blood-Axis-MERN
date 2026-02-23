import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import DashboardLayout from "../../components/shared/Layout/DashboardLayout";
import API from "../../services/API";
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Modal,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@mui/material";
import moment from "moment";

// Stat Card
const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ borderLeft: `5px solid ${color}`, borderRadius: 2 }}>
        <CardContent>
            <Typography variant="overline" color="textSecondary">
                {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
            <Box sx={{ mt: 1, color: color }}>{icon}</Box>
        </CardContent>
    </Card>
);

export default function DonorDashboard() {
    const { user } = useSelector((state) => state.auth);
    const queryClient = useQueryClient();

    // -----------------------------
    // FETCH DONOR STATS
    // -----------------------------
    const donorStats = useQuery({
        queryKey: ["donorStats"],
        queryFn: async () => {
            const res = await API.get("/analytics/donor-stats");
            return res.data;
        }
    });

    // -----------------------------
    // FETCH ORGANISATIONS
    // -----------------------------
    const orgList = useQuery({
        queryKey: ["orgList"],
        queryFn: async () => {
            const res = await API.get("/inventory/get-orgnaisation");
            return res.data;
        }
    });

    // -----------------------------
    // FETCH DONATION HISTORY
    // -----------------------------
    const donationHistory = useQuery({
        queryKey: ["donationHistory"],
        queryFn: async () => {
            const res = await API.get("/analytics/donor-history");
            return res.data.history;
        }
    });

    // -----------------------------
    // PROFILE UPDATE
    // -----------------------------
    const profileMutation = useMutation({
        mutationFn: async (data) => {
            console.log("Updating profile with:", data);
            return await API.put("/auth/update-profile", data);
        },
        onSuccess: (response) => {
            console.log("Profile update success:", response);
            alert("Profile updated successfully!");
            queryClient.invalidateQueries(["donorStats"]);
            // Reload page to get updated user data
            window.location.reload();
        },
        onError: (error) => {
            console.error("Profile update error:", error);
            alert(error.response?.data?.message || "Error updating profile");
        }
    });

    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        preferredCity: user?.preferredCity || ""
    });

    // -----------------------------
    // DONATE MODAL
    // -----------------------------
    const [openDonate, setOpenDonate] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);

    const [formData, setFormData] = useState({
        dateOfBirth: "",
        gender: "",
        availability: "",
        bloodGroup: ""
    });

    const donateMutation = useMutation({
        mutationFn: async () => {
            console.log("Submitting interest with data:", {
                organisationId: selectedOrg,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                availability: formData.availability,
                bloodGroup: formData.bloodGroup
            });
            return await API.post("/donor-interest/create", {
                organisationId: selectedOrg,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                availability: formData.availability,
                bloodGroup: formData.bloodGroup
            });
        },
        onSuccess: (response) => {
            console.log("Success response:", response);
            alert("Your interest has been registered successfully!");
            setOpenDonate(false);
            setFormData({
                dateOfBirth: "",
                gender: "",
                availability: "",
                bloodGroup: ""
            });
        },
        onError: (error) => {
            console.error("Error submitting interest:", error);
            alert("Error: " + (error.response?.data?.message || error.message || "Failed to submit interest"));
        }
    });

    if (donorStats.isLoading || orgList.isLoading || donationHistory.isLoading) {
        return (
            <DashboardLayout>
                <CircularProgress />
            </DashboardLayout>
        );
    }

    if (donorStats.error || orgList.error) {
        return (
            <DashboardLayout>
                <Alert severity="error">Could not load dashboard data</Alert>
            </DashboardLayout>
        );
    }

    const stats = donorStats.data;

    return (
        <DashboardLayout>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Namaste, {user?.name}
            </Typography>

            {/* ----------- STATS SECTION ----------- */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={3}>
                    <StatCard title="Total Donations" value={stats.totalDonations} color="#d32f2f" />
                </Grid>

                <Grid item xs={12} sm={3}>
                    <StatCard title="Total ML" value={`${stats.totalUnits} ml`} color="#0288d1" />
                </Grid>

                <Grid item xs={12} sm={3}>
                    <StatCard
                        title="Last Donation"
                        value={stats.lastDonation ? moment(stats.lastDonation).format("MMM Do, YYYY") : "N/A"}
                        color="#ed6c02"
                    />
                </Grid>

                <Grid item xs={12} sm={3}>
                    <StatCard
                        title="Next Eligible"
                        value={stats.nextEligible !== "Now" ? moment(stats.nextEligible).format("MMM Do, YYYY") : "Now"}
                        color="#2e7d32"
                    />
                </Grid>
            </Grid>

            <Box sx={{ mt: 4 }} />

            {/* ----------- INFO CARDS ----------- */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Why Donation Matters
                        </Typography>
                        <Typography>
                            One donation can help three people. Blood is tested and stored for those in need.
                        </Typography>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Who Can Donate
                        </Typography>
                        <Typography>
                            Age 18 to 65. Weight 45 kg or more. Must be fit.
                        </Typography>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            When You Should Not Donate
                        </Typography>
                        <Typography>
                            People who use drugs through needles cannot donate.
                        </Typography>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            How To Prepare
                        </Typography>
                        <Typography>
                            Eat iron rich food and drink water before donating.
                        </Typography>
                    </Card>
                </Grid>
            </Grid>


            <Box sx={{ mt: 4 }} />
            <Grid item xs={12} sm={6}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Why Wait 56 Days?
                    </Typography>
                    <Typography>
                        Your body needs time to rebuild red blood cells, restore iron levels,
                        and safely recover blood volume after donation.
                    </Typography>
                </Card>
            </Grid>
            <Box sx={{ mt: 4 }} />

            <Grid item xs={12}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Blood Type Compatibility
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                        Blood type compatibility depends on antigens (A, B, Rh) on red blood cells. O-negative is the universal donor (donates to all), while AB-positive is the universal recipient (receives from all). For safety, type O can only receive O, while AB+ can accept any type.
                    </Typography>
                    <Typography sx={{ mb: 1 }}>Red Cross Blood Donation</Typography>
                    <Typography sx={{ mb: 1 }}>Red Cross Blood Donation</Typography>
                    <Typography sx={{ mb: 2 }}>+3</Typography>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Blood Type Compatibility Table
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        O- (Universal Donor): Can donate to: A+, A-, B+, B-, O+, O-, AB+, AB-. Can receive from: O- only.
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        O+: Can donate to: A+, B+, AB+, O+. Can receive from: O+, O-.
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        A-: Can donate to: A-, A+, AB-, AB+. Can receive from: A-, O-.
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        A+: Can donate to: A+, AB+. Can receive from: A+, A-, O+, O-.
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        B-: Can donate to: B-, B+, AB-, AB+. Can receive from: B-, O-.
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        B+: Can donate to: B+, AB+. Can receive from: B+, B-, O+, O-.
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        AB-: Can donate to: AB-, AB+. Can receive from: AB-, A-, B-, O-.
                    </Typography>
                    <Typography>
                        AB+ (Universal Recipient): Can donate to: AB+ only. Can receive from: All types.
                    </Typography>
                </Card>
            </Grid>
            <Box sx={{ mt: 4 }} />

            {/* ----------- ORGANISATION LIST ----------- */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Available Organisations
                </Typography>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {orgList.data.organisations?.map((org) => (
                                <TableRow key={org._id}>
                                    <TableCell>{org.organisationName}</TableCell>
                                    <TableCell>{org.email}</TableCell>
                                    <TableCell>{org.address}</TableCell>
                                    <TableCell>{org.phone}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                setSelectedOrg(org._id);
                                                setOpenDonate(true);
                                            }}
                                        >
                                            Donate
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>
                </TableContainer>
            </Paper>

            {/* ----------- DONATION HISTORY (FIXED) ----------- */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Donation History
                </Typography>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Organisation</TableCell>
                                <TableCell>ML</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {donationHistory.data?.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell>
                                        {moment(item.createdAt).format("MMM Do")}
                                    </TableCell>

                                    <TableCell>
                                        {item.organisation?.organisationName || "N/A"}
                                    </TableCell>

                                    <TableCell>{item.quantity} ml</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* ----------- PROFILE UPDATE ----------- */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Update Profile
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={profileForm.name}
                            onChange={(e) =>
                                setProfileForm({ ...profileForm, name: e.target.value })
                            }
                        />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="City"
                            value={profileForm.preferredCity}
                            onChange={(e) =>
                                setProfileForm({ ...profileForm, preferredCity: e.target.value })
                            }
                        />
                    </Grid>


                </Grid>

                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => {
                        console.log("Save button clicked");
                        console.log("Profile form data:", profileForm);
                        profileMutation.mutate(profileForm);
                    }}
                    disabled={profileMutation.isPending}
                >
                    {profileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
            </Paper>

            {/* ----------- CERTIFICATE SECTION ----------- */}
            <Paper sx={{ p: 3, mb: 4, backgroundColor: "#f5f5f5" }}>
                <Typography variant="h6" sx={{ mb: 3, color: "#d32f2f" }}>
                    🏅 Blood Donation Certificate Program
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Certificate Requirements:
                    </Typography>
                    <Box sx={{ backgroundColor: "#fff", p: 2, borderRadius: 1, mb: 2 }}>
                        <Typography sx={{ mb: 1 }}>
                            ✓ <strong>Complete at least 8 donations</strong> - You must have successfully donated blood 8 times
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
                            ✓ <strong>Upload proof of all 8 donations</strong> - Submit a PDF file containing photos or proof of all 8 donations
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Your Donation Count: <strong sx={{ color: "#d32f2f" }}>{stats.totalDonations} / 8</strong>
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    sx={{ backgroundColor: "#d32f2f" }}
                    onClick={() => window.open("https://forms.gle/4Sq6cfH9wZ8XpGor6", "_blank")}
                    disabled={stats.totalDonations < 8}
                >
                    🎖️ Request Certificate
                </Button>
                {stats.totalDonations < 8 && (
                    <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#d32f2f" }}>
                        You need to complete {8 - stats.totalDonations} more donations to request a certificate
                    </Typography>
                )}
            </Paper>

            {/* ----------- DONATE MODAL ----------- */}
            <Modal open={openDonate} onClose={() => setOpenDonate(false)}>
                <Box
                    sx={{
                        p: 4,
                        background: "#fff",
                        borderRadius: 2,
                        width: 500,
                        mx: "auto",
                        mt: "5%",
                        maxHeight: "90vh",
                        overflowY: "auto"
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 3 }}>
                        Register Your Interest to Donate
                    </Typography>

                    <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        sx={{ mb: 2 }}
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                            setFormData({ ...formData, dateOfBirth: e.target.value })
                        }
                        InputLabelProps={{
                            shrink: true,
                        }}
                        required
                    />

                    <FormControl fullWidth sx={{ mb: 2 }} required>
                        <InputLabel>Gender</InputLabel>
                        <Select
                            value={formData.gender}
                            label="Gender"
                            onChange={(e) =>
                                setFormData({ ...formData, gender: e.target.value })
                            }
                        >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Available Date"
                        type="date"
                        sx={{ mb: 2 }}
                        value={formData.availability}
                        onChange={(e) =>
                            setFormData({ ...formData, availability: e.target.value })
                        }
                        InputLabelProps={{
                            shrink: true,
                        }}
                        required
                        helperText="When are you available to donate?"
                    />

                    <FormControl fullWidth sx={{ mb: 2 }} required>
                        <InputLabel>Blood Group</InputLabel>
                        <Select
                            value={formData.bloodGroup}
                            label="Blood Group"
                            onChange={(e) =>
                                setFormData({ ...formData, bloodGroup: e.target.value })
                            }
                        >
                            <MenuItem value="A+">A+</MenuItem>
                            <MenuItem value="A-">A-</MenuItem>
                            <MenuItem value="B+">B+</MenuItem>
                            <MenuItem value="B-">B-</MenuItem>
                            <MenuItem value="O+">O+</MenuItem>
                            <MenuItem value="O-">O-</MenuItem>
                            <MenuItem value="AB+">AB+</MenuItem>
                            <MenuItem value="AB-">AB-</MenuItem>
                            <MenuItem value="Unknown">Unknown</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                            console.log("Button clicked!");
                            console.log("Form data:", formData);
                            console.log("Selected org:", selectedOrg);
                            donateMutation.mutate();
                        }}
                        disabled={donateMutation.isPending || !formData.dateOfBirth || !formData.gender || !formData.availability || !formData.bloodGroup}
                    >
                        {donateMutation.isPending ? "Submitting..." : "Submit Interest"}
                    </Button>

                </Box>
            </Modal>
        </DashboardLayout>
    );
}
