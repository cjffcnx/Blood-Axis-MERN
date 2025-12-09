import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/shared/Layout/DashboardLayout';
import API from '../../services/API';
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
    List,
    Divider
} from '@mui/material';
import {
    Opacity,
    Event,
    Favorite,
    Schedule,
    LocationOn
} from '@mui/icons-material';
import moment from 'moment';

// --- Components ---

const StatCard = ({ title, value, subtext, icon, color }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderLeft: `5px solid ${color}` }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                        {title}
                    </Typography>
                    <Typography variant="h4" component="div">
                        {value}
                    </Typography>
                </Box>
                <Box sx={{ p: 1, borderRadius: 1, bgcolor: `${color}20`, color: color }}>
                    {icon}
                </Box>
            </Box>
            {subtext && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {subtext}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const DonorDashboard = () => {
    const { user } = useSelector((state) => state.auth);

    // Fetch Analytics
    const { data: analytics, isLoading, error } = useQuery({
        queryKey: ['donorStats'],
        queryFn: async () => {
            const res = await API.get('/analytics/donor-stats');
            return res.data;
        }
    });

    // Calculate Next Eligible Date (Approx 90 days from last donation)
    const lastDonationDate = analytics?.lastDonation;
    const nextEligibleDate = lastDonationDate
        ? moment(lastDonationDate).add(90, 'days').format('MMMM Do, YYYY')
        : 'Available Now';

    if (isLoading) return <DashboardLayout><CircularProgress /></DashboardLayout>;
    if (error) return <DashboardLayout><Alert severity="error">Failed to load dashboard data</Alert></DashboardLayout>;

    return (
        <DashboardLayout>
            {/* Top Section: Greeting + Stats */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Namaste, {user?.name} 👋
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
                    Here's a summary of your impact.
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Donations"
                            value={analytics?.totalDonations || 0}
                            icon={<Favorite />}
                            color="#d32f2f"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Units Donated"
                            value={`${analytics?.totalUnits || 0} ML`}
                            icon={<Opacity />}
                            color="#0288d1"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Last Donation"
                            value={lastDonationDate ? moment(lastDonationDate).format('MMM Do') : 'N/A'}
                            subtext={lastDonationDate ? moment(lastDonationDate).fromNow() : 'Make your first!'}
                            icon={<Event />}
                            color="#ed6c02"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Next Eligible"
                            value={nextEligibleDate === 'Available Now' ? 'Now' : moment(nextEligibleDate).format('MMM Do')}
                            subtext={nextEligibleDate === 'Available Now' ? 'You can donate today!' : ` Wait until ${nextEligibleDate}`}
                            icon={<Schedule />}
                            color="#2e7d32"
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Middle Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Recent Donations Table */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Recent Donations
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Organisation</TableCell>
                                        <TableCell>Quantity</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {analytics?.topOrgs?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">No donations found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button color="primary" sx={{ mt: 2, alignSelf: 'flex-start' }} onClick={() => { }}>
                            View All History
                        </Button>
                    </Paper>
                </Grid>

                {/* Where You Usually Donate */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Top Organisations
                        </Typography>
                        <List>
                            {analytics?.topOrgs?.map((org, index) => (
                                <React.Fragment key={index}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {org.organisationName}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {org.email} | {org.phone}
                                        </Typography>
                                        <Typography variant="body2" color="secondary" fontWeight="bold">
                                            {org.totalUnits} ML donated
                                        </Typography>
                                    </Box>
                                    {index < analytics.topOrgs.length - 1 && <Divider sx={{ my: 1 }} />}
                                </React.Fragment>
                            ))}
                            {(!analytics?.topOrgs || analytics.topOrgs.length === 0) && (
                                <Typography variant="body2">No data yet.</Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* Bottom Section */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography component="h2" variant="h6" gutterBottom color="primary">
                            Find Nearby Blood Banks
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                            Allow location access to find blood banks and hospitals near you immediately.
                        </Typography>

                        <Button
                            variant="contained"
                            color="error"
                            fullWidth
                            size="large"
                            startIcon={<LocationOn />}
                            onClick={() => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition((position) => {
                                        const { latitude, longitude } = position.coords;
                                        window.open(`https://www.google.com/maps/search/Blood+Bank+Hospital/@${latitude},${longitude},15z`, '_blank');
                                    }, (error) => {
                                        alert("Location access denied. Please enable location services.");
                                    });
                                } else {
                                    alert("Geolocation is not supported by this browser.");
                                }
                            }}
                        >
                            Search Nearby Blood Banks
                        </Button>
                        <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                            * This will open Google Maps with search results for "Blood Bank" and "Hospital" in your area.
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, bgcolor: '#e3f2fd' }}>
                        <Typography component="h2" variant="h6" gutterBottom color="#0d47a1">
                            good to know
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Why wait 3 months?
                        </Typography>
                        <Typography variant="body2" paragraph>
                            Red blood cells take about 6-8 weeks to replenish. Waiting 3 months (90 days) ensures your iron levels are back to normal and keeps you healthy!
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Before your next donation:
                        </Typography>
                        <Typography variant="body2">
                            • Drink plenty of water<br />
                            • Eat an iron-rich meal<br />
                            • Avoid alcohol 24 hours prior
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </DashboardLayout>
    );
};

export default DonorDashboard;
