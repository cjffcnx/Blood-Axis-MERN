import React, { useState, useMemo } from "react";
import Layout from "../../components/shared/Layout/Layout";
import {
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchHospitals = () => {
    const [searchTerm, setSearchTerm] = useState("");

    // Blood Banks List (from WelcomePage)
    const bloodBanks = [
        {
            name: "Bhaktapur NRCS Blood Bank",
            location: "Bhaktapur",
            contact: "01-6611661, 01-6612266",
            lat: 27.671,
            lng: 85.4298,
        },
        {
            name: "Central NRCS Blood Bank",
            location: "Soaltee-Mode, Kathmandu",
            contact: "01-4288485",
            lat: 27.6923,
            lng: 85.295,
        },
        {
            name: "Lalitpur NRCS Blood Bank",
            location: "Pulchowk, Lalitpur",
            contact: "01-5427033",
            lat: 27.6715,
            lng: 85.3173,
        },
        {
            name: "Teaching Hospital Blood Bank",
            location: "Maharajgunj, Kathmandu",
            contact: "01-4412303, 01-4410911",
            lat: 27.7391,
            lng: 85.337,
        },
        {
            name: "Gangalal Hospital Blood Bank",
            location: "Bansbari, Kathmandu",
            contact: "01-4371322",
            lat: 27.7452,
            lng: 85.3444,
        },
        {
            name: "Himal Hospital Blood Bank",
            location: "Gyaneshwor, Kathmandu",
            contact: "986-2737316",
            lat: 27.7107,
            lng: 85.3291,
        },
        {
            name: "Grande Hospital Blood Bank",
            location: "Dhapasi, Kathmandu",
            contact: "01-5159266",
            lat: 27.7444,
            lng: 85.3161,
        },
        {
            name: "Prasuti Griha Blood Bank",
            location: "Thapathali, Kathmandu",
            contact: "01-4260405",
            lat: 27.6897,
            lng: 85.3222,
        },
        {
            name: "Nepal Mediciti Hospital Blood Bank",
            location: "Nakhkhu Ukalo, Lalitpur",
            contact: "01-4217766",
            lat: 27.6572,
            lng: 85.3189,
        },
        {
            name: "Bir Hospital Blood Bank",
            location: "New Road Gate, Kathmandu",
            contact: "01-4221119, 01-4221988",
            lat: 27.7048,
            lng: 85.312,
        },
        {
            name: "Nepal Police Hospital Blood Bank",
            location: "Maharajgunj, Kathmandu",
            contact: "01-4412430",
            lat: 27.7394,
            lng: 85.3375,
        },
        {
            name: "Civil Hospital Blood Bank",
            location: "Minbhawan, Kathmandu",
            contact: "01-4107000",
            lat: 27.6869,
            lng: 85.3464,
        },
        {
            name: "Patan Hospital Blood Bank",
            location: "Patan, Lalitpur",
            contact: "01-5522295",
            lat: 27.6648,
            lng: 85.325,
        },
        {
            name: "Birendra Army Hospital Blood Bank",
            location: "Chhauni, Kathmandu",
            contact: "01-4271941",
            lat: 27.7029,
            lng: 85.2907,
        },
        {
            name: "Nepal Medical College Blood Bank",
            location: "Gokarneshwor, Kathmandu",
            contact: "01-4911008",
            lat: 27.7485,
            lng: 85.38,
        },
        {
            name: "Kathmandu Medical College Blood Bank",
            location: "Sinamangal, Kathmandu",
            contact: "01-4469064",
            lat: 27.6963,
            lng: 85.3505,
        },
        {
            name: "Charak Memorial Hospital Blood Bank",
            location: "Sukedhara, Kathmandu",
            contact: "01-4371323",
            lat: 27.727,
            lng: 85.339,
        },
        {
            name: "Om Hospital Blood Bank",
            location: "Chabahil, Kathmandu",
            contact: "01-4476225",
            lat: 27.7178,
            lng: 85.349,
        },
        {
            name: "Blue Cross Hospital Blood Bank",
            location: "Tripureshwor, Kathmandu",
            contact: "01-4262150",
            lat: 27.6948,
            lng: 85.3109,
        },
        {
            name: "Alka Hospital Blood Bank",
            location: "Jawalakhel, Lalitpur",
            contact: "01-5521371",
            lat: 27.6724,
            lng: 85.314,
        },
        {
            name: "Norvic Hospital Blood Bank",
            location: "Thapathali, Kathmandu",
            contact: "01-5970032",
            lat: 27.6895,
            lng: 85.323,
        },
        {
            name: "Vayodha Hospital Blood Bank",
            location: "Balkhu, Kathmandu",
            contact: "01-4281666",
            lat: 27.6824,
            lng: 85.2955,
        },
        {
            name: "KIST Hospital Blood Bank",
            location: "Imadol, Lalitpur",
            contact: "01-5201680",
            lat: 27.655,
            lng: 85.344,
        },
        {
            name: "B&B Hospital Blood Bank",
            location: "Gwarko, Lalitpur",
            contact: "01-5533206",
            lat: 27.6645,
            lng: 85.3443,
        },
        {
            name: "Star Hospital Blood Bank",
            location: "Sanepa, Lalitpur",
            contact: "01-5550197",
            lat: 27.6848,
            lng: 85.3045,
        },
        {
            name: "Medicare Hospital Blood Bank",
            location: "Chabahil, Kathmandu",
            contact: "01-4477616",
            lat: 27.7184,
            lng: 85.3483,
        },
        {
            name: "Grande City Hospital Blood Bank",
            location: "Kupondole, Lalitpur",
            contact: "01-5187600",
            lat: 27.6855,
            lng: 85.3176,
        },
        {
            name: "Helping Hands Hospital Blood Bank",
            location: "Chabahil, Kathmandu",
            contact: "01-4475381",
            lat: 27.7182,
            lng: 85.3471,
        },
        {
            name: "Sahid Gangalal Cardiac Center Blood Bank",
            location: "Bansbari, Kathmandu",
            contact: "01-4371322",
            lat: 27.745,
            lng: 85.3435,
        },
        {
            name: "KMC Duwakot Blood Bank",
            location: "Duwakot, Bhaktapur",
            contact: "01-6633188",
            lat: 27.6965,
            lng: 85.429,
        },
        {
            name: "Bhaktapur Cancer Hospital Blood Bank",
            location: "Bhaktapur",
            contact: "01-6611532",
            lat: 27.6728,
            lng: 85.427,
        },
        {
            name: "KIST Medical College Blood Bank",
            location: "Imadol, Lalitpur",
            contact: "01-5201681",
            lat: 27.6545,
            lng: 85.3436,
        },
        {
            name: "Sumeru Hospital Blood Bank",
            location: "Dhobighat, Lalitpur",
            contact: "01-5552072",
            lat: 27.6782,
            lng: 85.3078,
        },
        {
            name: "Green City Hospital Blood Bank",
            location: "Basundhara, Kathmandu",
            contact: "01-4386885",
            lat: 27.7345,
            lng: 85.3274,
        },
        {
            name: "Deerwalk Hospital Blood Bank",
            location: "Sifal, Kathmandu",
            contact: "01-4444355",
            lat: 27.7132,
            lng: 85.3427,
        },
        {
            name: "Sahid Memorial Hospital Blood Bank",
            location: "Kalanki, Kathmandu",
            contact: "01-5211234",
            lat: 27.6942,
            lng: 85.2847,
        },
        {
            name: "T.U. Dental Hospital Blood Bank",
            location: "Maharajgunj, Kathmandu",
            contact: "01-4411939",
            lat: 27.7385,
            lng: 85.3368,
        },
        {
            name: "Kantipur Hospital Blood Bank",
            location: "Tinkune, Kathmandu",
            contact: "01-4111625",
            lat: 27.6855,
            lng: 85.345,
        },
        {
            name: "Janamaitri Hospital Blood Bank",
            location: "Balaju, Kathmandu",
            contact: "01-4364564",
            lat: 27.7315,
            lng: 85.2988,
        },
        {
            name: "Manipal Teaching Hospital Kathmandu Unit",
            location: "Maharajgunj, Kathmandu",
            contact: "01-4418749",
            lat: 27.7399,
            lng: 85.3369,
        },
        {
            name: "Lifeline Hospital Blood Bank",
            location: "Bafal, Kathmandu",
            contact: "01-4286123",
            lat: 27.6994,
            lng: 85.2891,
        },
        {
            name: "Mero Hospital Blood Bank",
            location: "Jawalakhel, Lalitpur",
            contact: "01-5527330",
            lat: 27.673,
            lng: 85.315,
        },
        {
            name: "Sukraraj Tropical Hospital Blood Bank",
            location: "Teku, Kathmandu",
            contact: "01-4213808",
            lat: 27.6913,
            lng: 85.3058,
        },
        {
            name: "Sahid Dharmabhakta Cancer Hospital Unit",
            location: "Bhaktapur",
            contact: "01-6617691",
            lat: 27.675,
            lng: 85.4255,
        },
        {
            name: "Kantipur Dental Hospital Blood Bank",
            location: "Basundhara, Kathmandu",
            contact: "01-4383433",
            lat: 27.7341,
            lng: 85.3279,
        },
        {
            name: "Sanjivani Hospital Blood Bank",
            location: "Balkumari, Lalitpur",
            contact: "01-5181295",
            lat: 27.6667,
            lng: 85.3462,
        },
        {
            name: "Upendra Devkota Memorial Hospital Blood Bank",
            location: "Bansbari, Kathmandu",
            contact: "01-4373850",
            lat: 27.7447,
            lng: 85.3432,
        },
        {
            name: "KIST Teaching Hospital Satdobato Unit",
            location: "Satdobato, Lalitpur",
            contact: "01-5201670",
            lat: 27.6556,
            lng: 85.3263,
        },
        {
            name: "Everest Hospital Blood Bank",
            location: "Baneshwor, Kathmandu",
            contact: "01-4780364",
            lat: 27.6895,
            lng: 85.3457,
        },
        {
            name: "Chirayu Children Hospital Blood Bank",
            location: "Maharajgunj, Kathmandu",
            contact: "01-4419965",
            lat: 27.7397,
            lng: 85.3382,
        },
        {
            name: "Ananda Hospital Blood Bank",
            location: "Imadol, Lalitpur",
            contact: "01-5201552",
            lat: 27.653,
            lng: 85.3452,
        },
        {
            name: "International Friendship Children Hospital Blood Bank",
            location: "Maharajgunj, Kathmandu",
            contact: "01-4375760",
            lat: 27.7403,
            lng: 85.3378,
        },
        {
            name: "Paropakar Maternity Hospital Blood Bank",
            location: "Thapathali, Kathmandu",
            contact: "01-4253276",
            lat: 27.6898,
            lng: 85.3234,
        },
        {
            name: "Siddhi Memorial Hospital Blood Bank",
            location: "Bhaktapur",
            contact: "01-6612945",
            lat: 27.6717,
            lng: 85.4286,
        },
        {
            name: "Madan Bhandari Hospital Blood Bank",
            location: "Teku, Kathmandu",
            contact: "01-4262030",
            lat: 27.6919,
            lng: 85.305,
        },
        {
            name: "HAMS Hospital Blood Bank",
            location: "Dhumbarahi, Kathmandu",
            contact: "01-4377402",
            lat: 27.7324,
            lng: 85.3375,
        },
        {
            name: "Sahid Smriti Hospital Blood Bank",
            location: "Kalanki, Kathmandu",
            contact: "01-5211235",
            lat: 27.6938,
            lng: 85.2841,
        },
        {
            name: "Sumeru City Hospital Blood Bank",
            location: "Bagdol, Lalitpur",
            contact: "01-5529272",
            lat: 27.6702,
            lng: 85.3061,
        },
        {
            name: "Kirtipur Hospital Blood Bank",
            location: "Kirtipur, Kathmandu",
            contact: "01-4331399",
            lat: 27.6692,
            lng: 85.2777,
        },
        {
            name: "Nepal APF Hospital Blood Bank",
            location: "Balambu, Kathmandu",
            contact: "01-4315601",
            lat: 27.6815,
            lng: 85.2735,
        },
        {
            name: "PHECT Nepal Hospital Blood Bank",
            location: "Kirtipur, Kathmandu",
            contact: "01-4331343",
            lat: 27.671,
            lng: 85.2792,
        },
        {
            name: "Gokarna Hospital Blood Bank",
            location: "Gokarneshwor, Kathmandu",
            contact: "01-4911009",
            lat: 27.7541,
            lng: 85.3831,
        },
        {
            name: "Sahid Memorial Hospital Bhaktapur Unit",
            location: "Thimi, Bhaktapur",
            contact: "01-6631005",
            lat: 27.6805,
            lng: 85.387,
        },
        {
            name: "Sushma Koirala Memorial Hospital Blood Bank",
            location: "Sankhu, Kathmandu",
            contact: "01-4467256",
            lat: 27.7446,
            lng: 85.443,
        },
        {
            name: "Ganeshman Singh Memorial Hospital Blood Bank",
            location: "Lagankhel, Lalitpur",
            contact: "01-5531188",
            lat: 27.668,
            lng: 85.3261,
        },
        {
            name: "Himalaya Hospital Blood Bank",
            location: "Kumaripati, Lalitpur",
            contact: "01-5533122",
            lat: 27.6705,
            lng: 85.3235,
        },
        {
            name: "Shree Birendra Hospital Blood Bank",
            location: "Chhauni, Kathmandu",
            contact: "01-4271940",
            lat: 27.7034,
            lng: 85.2901,
        },
        {
            name: "Valley Hospital Blood Bank",
            location: "Baneshwor, Kathmandu",
            contact: "01-4479925",
            lat: 27.6901,
            lng: 85.3452,
        },
        {
            name: "Kapan Hospital Blood Bank",
            location: "Kapan, Kathmandu",
            contact: "01-4822323",
            lat: 27.7393,
            lng: 85.3574,
        },
        {
            name: "Sahid Memorial Children Hospital Blood Bank",
            location: "Balkumari, Lalitpur",
            contact: "01-5181500",
            lat: 27.6672,
            lng: 85.3449,
        },
        {
            name: "Paropakar General Hospital Blood Bank",
            location: "Kalanki, Kathmandu",
            contact: "01-5211240",
            lat: 27.6949,
            lng: 85.2849,
        },
        {
            name: "Trinity Hospital Blood Bank",
            location: "Kumaripati, Lalitpur",
            contact: "01-5532188",
            lat: 27.6702,
            lng: 85.3239,
        },
        {
            name: "Kantipur City Hospital Blood Bank",
            location: "Baneshwor, Kathmandu",
            contact: "01-4783560",
            lat: 27.6907,
            lng: 85.347,
        },
        {
            name: "Mission Hospital Blood Bank",
            location: "Tokha, Kathmandu",
            contact: "01-4382001",
            lat: 27.7442,
            lng: 85.3211,
        },
        {
            name: "Trishuli Road Hospital Blood Bank",
            location: "Balaju, Kathmandu",
            contact: "01-4367865",
            lat: 27.735,
            lng: 85.3005,
        },
        {
            name: "Valley Maternity Hospital Blood Bank",
            location: "Putalisadak, Kathmandu",
            contact: "01-4169275",
            lat: 27.7033,
            lng: 85.3215,
        },
        {
            name: "Nidan Hospital Blood Bank",
            location: "Pulchowk, Lalitpur",
            contact: "01-5543334",
            lat: 27.6801,
            lng: 85.3165,
        },
        {
            name: "Relief Hospital Blood Bank",
            location: "Sundhara, Kathmandu",
            contact: "01-4248630",
            lat: 27.7011,
            lng: 85.3096,
        },
        {
            name: "Sahid Dharma Bhakta Hospital Blood Bank",
            location: "New Baneshwor, Kathmandu",
            contact: "01-4782210",
            lat: 27.6898,
            lng: 85.344,
        },
        {
            name: "Life Care Hospital Blood Bank",
            location: "Gongabu, Kathmandu",
            contact: "01-4357265",
            lat: 27.734,
            lng: 85.3128,
        },
        {
            name: "Metro Hospital Blood Bank",
            location: "Banasthali, Kathmandu",
            contact: "01-4357690",
            lat: 27.7211,
            lng: 85.3027,
        },
        {
            name: "Samudayik Hospital Blood Bank",
            location: "Hattiban, Lalitpur",
            contact: "01-5251220",
            lat: 27.6494,
            lng: 85.322,
        },
        {
            name: "Sahayogi Hospital Blood Bank",
            location: "Satungal, Kathmandu",
            contact: "01-4315280",
            lat: 27.6852,
            lng: 85.2703,
        },
        {
            name: "Sunrise Hospital Blood Bank",
            location: "Baneshwor, Kathmandu",
            contact: "01-4783432",
            lat: 27.6892,
            lng: 85.3455,
        },
        {
            name: "Dhulikhel Hospital Kathmandu Unit",
            location: "Koteshwor, Kathmandu",
            contact: "01-5141000",
            lat: 27.678,
            lng: 85.3493,
        },
        {
            name: "Mediplus Hospital Blood Bank",
            location: "Tinkune, Kathmandu",
            contact: "01-4111789",
            lat: 27.6863,
            lng: 85.3459,
        },
        {
            name: "Sangam Hospital Blood Bank",
            location: "Gothatar, Kathmandu",
            contact: "01-4991195",
            lat: 27.6982,
            lng: 85.3662,
        },
        {
            name: "Sahid Ganga Lal Smriti Hospital Blood Bank",
            location: "Ghattekulo, Kathmandu",
            contact: "01-4430750",
            lat: 27.7069,
            lng: 85.3266,
        },
        {
            name: "Padma Hospital Kathmandu Unit",
            location: "Kalopul, Kathmandu",
            contact: "01-4432905",
            lat: 27.7102,
            lng: 85.332,
        },
        {
            name: "Sahayatra Hospital Blood Bank",
            location: "Sano Thimi, Bhaktapur",
            contact: "01-6631180",
            lat: 27.6785,
            lng: 85.381,
        },
        {
            name: "Lions Hospital Blood Bank",
            location: "Bharatpur Chowk, Kathmandu",
            contact: "01-4312206",
            lat: 27.7009,
            lng: 85.2971,
        },
        {
            name: "Urban Health Care Center Blood Bank",
            location: "Budhanilkantha, Kathmandu",
            contact: "01-4378990",
            lat: 27.7605,
            lng: 85.3482,
        },
        {
            name: "Sumeru National Hospital Blood Bank",
            location: "Bafal, Kathmandu",
            contact: "01-4282150",
            lat: 27.699,
            lng: 85.2887,
        },
        {
            name: "Nepal National Hospital Blood Bank",
            location: "Kalanki, Kathmandu",
            contact: "01-5211270",
            lat: 27.6932,
            lng: 85.2831,
        },
        {
            name: "Sahid Memorial Orthopedic Hospital Blood Bank",
            location: "Jadibuti, Kathmandu",
            contact: "01-5148030",
            lat: 27.6778,
            lng: 85.3508,
        },
        {
            name: "Sangini Hospital Blood Bank",
            location: "Maitidevi, Kathmandu",
            contact: "01-4421780",
            lat: 27.7076,
            lng: 85.3309,
        },
        {
            name: "Sunrise City Hospital Blood Bank",
            location: "Gongabu, Kathmandu",
            contact: "01-4357120",
            lat: 27.7351,
            lng: 85.3134,
        },
        {
            name: "Valley Heart Center Blood Bank",
            location: "Bagbazar, Kathmandu",
            contact: "01-4221220",
            lat: 27.7054,
            lng: 85.3152,
        },
        {
            name: "Shubhechcha Hospital Blood Bank",
            location: "Balkhu, Kathmandu",
            contact: "01-428019",
            lat: 27.683,
            lng: 85.296,
        },
        {
            name: "Sangam City Hospital Blood Bank",
            location: "Maharajgunj, Kathmandu",
            contact: "01-4418505",
            lat: 27.7392,
            lng: 85.3385,
        },
        {
            name: "Himal City Hospital Blood Bank",
            location: "Koteshwor, Kathmandu",
            contact: "01-5141005",
            lat: 27.6788,
            lng: 85.3491,
        },
        {
            name: "Om Sai Hospital Blood Bank",
            location: "Lokanthali, Bhaktapur",
            contact: "01-6631182",
            lat: 27.6825,
            lng: 85.3645,
        },
        {
            name: "Hope International Hospital Blood Bank",
            location: "Satdobato, Lalitpur",
            contact: "01-5201665",
            lat: 27.6551,
            lng: 85.3275,
        },
    ];

    // Filter hospitals based on search term
    const filteredHospitals = useMemo(() => {
        if (!searchTerm.trim()) return bloodBanks;

        const term = searchTerm.toLowerCase();
        return bloodBanks.filter(
            (hospital) =>
                hospital.name.toLowerCase().includes(term) ||
                hospital.location.toLowerCase().includes(term) ||
                hospital.contact.toLowerCase().includes(term)
        );
    }, [searchTerm]);

    return (
        <Layout>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
                    Search Blood Banks & Hospitals
                </Typography>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Search by hospital name, location, or contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
                        }}
                        variant="outlined"
                        size="small"
                    />
                    <Typography variant="caption" sx={{ mt: 1, display: "block", color: "gray" }}>
                        Found {filteredHospitals.length} result{filteredHospitals.length !== 1 ? "s" : ""}
                    </Typography>
                </Paper>

                {filteredHospitals.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: "center" }}>
                        <Typography color="textSecondary">
                            No hospitals found. Try a different search term.
                        </Typography>
                    </Paper>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: "bold" }}>Hospital Name</TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>Location</TableCell>
                                    <TableCell sx={{ fontWeight: "bold" }}>Contact</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHospitals.map((hospital, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: "500" }}>
                                                {hospital.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={hospital.location}
                                                variant="outlined"
                                                size="small"
                                                color="primary"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{hospital.contact}</Typography>
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

export default SearchHospitals;
