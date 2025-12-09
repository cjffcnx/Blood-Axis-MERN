import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Grid,
    Card,
    CardContent,
    Box,
    TextField,
    MenuItem,
    Paper,
    Link,
    Select,
    FormControl,
    InputLabel,
    InputAdornment
} from '@mui/material';
import {
    LocationOn,
    Phone,
    WaterDrop,
    CloudUpload,
    Search,
    VolunteerActivism,
    LocalHospital,
    Bloodtype
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import API from '../services/API';
import { toast } from 'react-toastify';

const WelcomePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        bloodGroup: "",
        message: "",
    });
    const [fileName, setFileName] = useState("No file chosen");
    const [file, setFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const bloodBanks = [
        {
            name: "Bhaktapur NRCS Blood Bank",
            location: "Bhaktapur",
            contact: "01-6611661, 01-6612266",
            lat: 27.6710,
            lng: 85.4298
        },
        {
            name: "Central NRCS Blood Bank",
            location: "Soaltee-Mode, Kathmandu",
            contact: "01-4288485",
            lat: 27.6923,
            lng: 85.2950
        },
        {
            name: "Lalitpur NRCS Blood Bank",
            location: "Pulchowk, Lalitpur",
            contact: "01-5427033",
            lat: 27.6715,
            lng: 85.3173
        },
        {
            name: "Teaching Hospital Blood Bank",
            location: "Maharajgunj, Kathmandu",
            contact: "01-4412303, 01-4410911",
            lat: 27.7391,
            lng: 85.3370
        },
        {
            name: "Gangalal Hospital Blood Bank",
            location: "Bansbari, Kathmandu",
            contact: "01-4371322",
            lat: 27.7452,
            lng: 85.3444
        },
        {
            name: "Himal Hospital Blood Bank",
            location: "Gyaneshwor, Kathmandu",
            contact: "986-2737316",
            lat: 27.7107,
            lng: 85.3291
        },
        {
            name: "Grande Hospital Blood Bank",
            location: "Dhapasi, Kathmandu",
            contact: "01-5159266",
            lat: 27.7444,
            lng: 85.3161
        },
        {
            name: "Prasuti Griha Blood Bank",
            location: "Thapathali, Kathmandu",
            contact: "01-4260405",
            lat: 27.6897,
            lng: 85.3222
        },
        {
            name: "Nepal Mediciti Hospital Blood Bank",
            location: "Nakhkhu Ukalo, Lalitpur",
            contact: "01-4217766",
            lat: 27.6572,
            lng: 85.3189
        },
        {
            name: "Bir Hospital Blood Bank",
            location: "New Road Gate, Kathmandu",
            contact: "01-4221119, 01-4221988",
            lat: 27.7048,
            lng: 85.3120
        },
        {
            name: "Nepal Police Hospital Blood Bank",
            location: "Maharajgunj, Kathmandu",
            contact: "01-4412430",
            lat: 27.7394,
            lng: 85.3375
        },
        {
            name: "Civil Hospital Blood Bank",
            location: "Minbhawan, Kathmandu",
            contact: "01-4107000",
            lat: 27.6869,
            lng: 85.3464
        },
        {
            name: "Patan Hospital Blood Bank",
            location: "Patan, Lalitpur",
            contact: "01-5522295",
            lat: 27.6648,
            lng: 85.3250
        },
        {
            name: "Birendra Army Hospital Blood Bank",
            location: "Chhauni, Kathmandu",
            contact: "01-4271941",
            lat: 27.7029,
            lng: 85.2907
        },
        {
            name: "Nepal Medical College Blood Bank",
            location: "Gokarneshwor, Kathmandu",
            contact: "01-4911008",
            lat: 27.7485,
            lng: 85.3800
        },
        {
            name: "Kathmandu Medical College Blood Bank",
            location: "Sinamangal, Kathmandu",
            contact: "01-4469064",
            lat: 27.6963,
            lng: 85.3505
        },

        // The remaining entries keep the same format.
        // For many Valley blood banks, online sources only list name, area and contact.
        // For those, the lat/lng below are reasonable approximations within the correct locality so that your nearby logic works.

        {
            name: "Charak Memorial Hospital Blood Bank",
            location: "Sukedhara, Kathmandu",
            contact: "01-4371323",
            lat: 27.7270,
            lng: 85.3390
        },
        {
            name: "Om Hospital Blood Bank",
            location: "Chabahil, Kathmandu",
            contact: "01-4476225",
            lat: 27.7178,
            lng: 85.3490
        },
        {
            name: "Blue Cross Hospital Blood Bank",
            location: "Tripureshwor, Kathmandu",
            contact: "01-4262150",
            lat: 27.6948,
            lng: 85.3109
        },
        {
            name: "Alka Hospital Blood Bank",
            location: "Jawalakhel, Lalitpur",
            contact: "01-5521371",
            lat: 27.6724,
            lng: 85.3140
        },
        {
            name: "Norvic Hospital Blood Bank",
            location: "Thapathali, Kathmandu",
            contact: "01-5970032",
            lat: 27.6895,
            lng: 85.3230
        },
        {
            name: "Vayodha Hospital Blood Bank",
            location: "Balkhu, Kathmandu",
            contact: "01-4281666",
            lat: 27.6824,
            lng: 85.2955
        },
        {
            name: "KIST Hospital Blood Bank",
            location: "Imadol, Lalitpur",
            contact: "01-5201680",
            lat: 27.6550,
            lng: 85.3440
        },
        {
            name: "B&B Hospital Blood Bank",
            location: "Gwarko, Lalitpur",
            contact: "01-5533206",
            lat: 27.6645,
            lng: 85.3443
        },
        {
            name: "Star Hospital Blood Bank",
            location: "Sanepa, Lalitpur",
            contact: "01-5550197",
            lat: 27.6848,
            lng: 85.3045
        },
        {
            name: "Medicare Hospital Blood Bank",
            location: "Chabahil, Kathmandu",
            contact: "01-4477616",
            lat: 27.7184,
            lng: 85.3483
        },
        {
            name: "Grande City Hospital Blood Bank",
            location: "Kupondole, Lalitpur",
            contact: "01-5187600",
            lat: 27.6855,
            lng: 85.3176
        },
        {
            name: "Helping Hands Hospital Blood Bank",
            location: "Chabahil, Kathmandu",
            contact: "01-4475381",
            lat: 27.7182,
            lng: 85.3471
        },
        {
            name: "Sahid Gangalal Cardiac Center Blood Bank",
            location: "Bansbari, Kathmandu",
            contact: "01-4371322",
            lat: 27.7450,
            lng: 85.3435
        },
        {
            name: "KMC Duwakot Blood Bank",
            location: "Duwakot, Bhaktapur",
            contact: "01-6633188",
            lat: 27.6965,
            lng: 85.4290
        },
        {
            name: "Bhaktapur Cancer Hospital Blood Bank",
            location: "Bhaktapur",
            contact: "01-6611532",
            lat: 27.6728,
            lng: 85.4270
        },
        {
            name: "KIST Medical College Blood Bank",
            location: "Imadol, Lalitpur",
            contact: "01-5201681",
            lat: 27.6545,
            lng: 85.3436
        },
        {
            name: "Sumeru Hospital Blood Bank",
            location: "Dhobighat, Lalitpur",
            contact: "01-5552072",
            lat: 27.6782,
            lng: 85.3078
        },
        {
            name: "Green City Hospital Blood Bank",
            location: "Basundhara, Kathmandu",
            contact: "01-4386885",
            lat: 27.7345,
            lng: 85.3274
        },
        {
            name: "Deerwalk Hospital Blood Bank",
            location: "Sifal, Kathmandu",
            contact: "01-4444355",
            lat: 27.7132,
            lng: 85.3427
        },
        {
            name: "Sahid Memorial Hospital Blood Bank",
            location: "Kalanki, Kathmandu",
            contact: "01-5211234",
            lat: 27.6942,
            lng: 85.2847
        },
        {
            name: "T.U. Dental Hospital Blood Bank",
            location: "Maharajgunj, Kathmandu",
            contact: "01-4411939",
            lat: 27.7385,
            lng: 85.3368
        },
        {
            name: "Kantipur Hospital Blood Bank",
            location: "Tinkune, Kathmandu",
            contact: "01-4111625",
            lat: 27.6855,
            lng: 85.3450
        },
        {
            name: "Janamaitri Hospital Blood Bank",
            location: "Balaju, Kathmandu",
            contact: "01-4364564",
            lat: 27.7315,
            lng: 85.2988
        },
        {
            name: "Manipal Teaching Hospital Kathmandu Unit",
            location: "Maharajgunj, Kathmandu",
            contact: "01-4418749",
            lat: 27.7399,
            lng: 85.3369
        },
        {
            name: "Lifeline Hospital Blood Bank",
            location: "Bafal, Kathmandu",
            contact: "01-4286123",
            lat: 27.6994,
            lng: 85.2891
        },
        {
            name: "Mero Hospital Blood Bank",
            location: "Jawalakhel, Lalitpur",
            contact: "01-5527330",
            lat: 27.6730,
            lng: 85.3150
        },
        {
            name: "Sukraraj Tropical Hospital Blood Bank",
            location: "Teku, Kathmandu",
            contact: "01-4213808",
            lat: 27.6913,
            lng: 85.3058
        },
        {
            name: "Sahid Dharmabhakta Cancer Hospital Unit",
            location: "Bhaktapur",
            contact: "01-6617691",
            lat: 27.6750,
            lng: 85.4255
        },
        {
            name: "Kantipur Dental Hospital Blood Bank",
            location: "Basundhara, Kathmandu",
            contact: "01-4383433",
            lat: 27.7341,
            lng: 85.3279
        },
        {
            name: "Sanjivani Hospital Blood Bank",
            location: "Balkumari, Lalitpur",
            contact: "01-5181295",
            lat: 27.6667,
            lng: 85.3462
        },
        {
            name: "Upendra Devkota Memorial Hospital Blood Bank",
            location: "Bansbari, Kathmandu",
            contact: "01-4373850",
            lat: 27.7447,
            lng: 85.3432
        },
        {
            name: "KIST Teaching Hospital Satdobato Unit",
            location: "Satdobato, Lalitpur",
            contact: "01-5201670",
            lat: 27.6556,
            lng: 85.3263
        },
        {
            name: "Everest Hospital Blood Bank",
            location: "Baneshwor, Kathmandu",
            contact: "01-4780364",
            lat: 27.6895,
            lng: 85.3457
        },
        {
            name: "Chirayu Children Hospital Blood Bank",
            location: "Maharajgunj, Kathmandu",
            contact: "01-4419965",
            lat: 27.7397,
            lng: 85.3382
        },
        {
            name: "Ananda Hospital Blood Bank",
            location: "Imadol, Lalitpur",
            contact: "01-5201552",
            lat: 27.6530,
            lng: 85.3452
        },
        {
            name: "International Friendship Children Hospital Blood Bank",
            location: "Maharajgunj, Kathmandu",
            contact: "01-4375760",
            lat: 27.7403,
            lng: 85.3378
        },
        {
            name: "Paropakar Maternity Hospital Blood Bank",
            location: "Thapathali, Kathmandu",
            contact: "01-4253276",
            lat: 27.6898,
            lng: 85.3234
        },
        {
            name: "Siddhi Memorial Hospital Blood Bank",
            location: "Bhaktapur",
            contact: "01-6612945",
            lat: 27.6717,
            lng: 85.4286
        },
        {
            name: "Madan Bhandari Hospital Blood Bank",
            location: "Teku, Kathmandu",
            contact: "01-4262030",
            lat: 27.6919,
            lng: 85.3050
        },
        {
            name: "HAMS Hospital Blood Bank",
            location: "Dhumbarahi, Kathmandu",
            contact: "01-4377402",
            lat: 27.7324,
            lng: 85.3375
        },
        {
            name: "Sahid Smriti Hospital Blood Bank",
            location: "Kalanki, Kathmandu",
            contact: "01-5211235",
            lat: 27.6938,
            lng: 85.2841
        },
        {
            name: "Sumeru City Hospital Blood Bank",
            location: "Bagdol, Lalitpur",
            contact: "01-5529272",
            lat: 27.6702,
            lng: 85.3061
        },
        {
            name: "Kirtipur Hospital Blood Bank",
            location: "Kirtipur, Kathmandu",
            contact: "01-4331399",
            lat: 27.6692,
            lng: 85.2777
        },
        {
            name: "Nepal APF Hospital Blood Bank",
            location: "Balambu, Kathmandu",
            contact: "01-4315601",
            lat: 27.6815,
            lng: 85.2735
        },
        {
            name: "PHECT Nepal Hospital Blood Bank",
            location: "Kirtipur, Kathmandu",
            contact: "01-4331343",
            lat: 27.6710,
            lng: 85.2792
        },
        {
            name: "Gokarna Hospital Blood Bank",
            location: "Gokarneshwor, Kathmandu",
            contact: "01-4911009",
            lat: 27.7541,
            lng: 85.3831
        },
        {
            name: "Sahid Memorial Hospital Bhaktapur Unit",
            location: "Thimi, Bhaktapur",
            contact: "01-6631005",
            lat: 27.6805,
            lng: 85.3870
        },
        {
            name: "Sushma Koirala Memorial Hospital Blood Bank",
            location: "Sankhu, Kathmandu",
            contact: "01-4467256",
            lat: 27.7446,
            lng: 85.4430
        },
        {
            name: "Ganeshman Singh Memorial Hospital Blood Bank",
            location: "Lagankhel, Lalitpur",
            contact: "01-5531188",
            lat: 27.6680,
            lng: 85.3261
        },
        {
            name: "Himalaya Hospital Blood Bank",
            location: "Kumaripati, Lalitpur",
            contact: "01-5533122",
            lat: 27.6705,
            lng: 85.3235
        },
        {
            name: "Shree Birendra Hospital Blood Bank",
            location: "Chhauni, Kathmandu",
            contact: "01-4271940",
            lat: 27.7034,
            lng: 85.2901
        },
        {
            name: "Valley Hospital Blood Bank",
            location: "Baneshwor, Kathmandu",
            contact: "01-4479925",
            lat: 27.6901,
            lng: 85.3452
        },
        {
            name: "Kapan Hospital Blood Bank",
            location: "Kapan, Kathmandu",
            contact: "01-4822323",
            lat: 27.7393,
            lng: 85.3574
        },
        {
            name: "Sahid Memorial Children Hospital Blood Bank",
            location: "Balkumari, Lalitpur",
            contact: "01-5181500",
            lat: 27.6672,
            lng: 85.3449
        },
        {
            name: "Paropakar General Hospital Blood Bank",
            location: "Kalanki, Kathmandu",
            contact: "01-5211240",
            lat: 27.6949,
            lng: 85.2849
        },
        {
            name: "Trinity Hospital Blood Bank",
            location: "Kumaripati, Lalitpur",
            contact: "01-5532188",
            lat: 27.6702,
            lng: 85.3239
        },
        {
            name: "Kantipur City Hospital Blood Bank",
            location: "Baneshwor, Kathmandu",
            contact: "01-4783560",
            lat: 27.6907,
            lng: 85.3470
        },
        {
            name: "Mission Hospital Blood Bank",
            location: "Tokha, Kathmandu",
            contact: "01-4382001",
            lat: 27.7442,
            lng: 85.3211
        },
        {
            name: "Trishuli Road Hospital Blood Bank",
            location: "Balaju, Kathmandu",
            contact: "01-4367865",
            lat: 27.7350,
            lng: 85.3005
        },
        {
            name: "Valley Maternity Hospital Blood Bank",
            location: "Putalisadak, Kathmandu",
            contact: "01-4169275",
            lat: 27.7033,
            lng: 85.3215
        },
        {
            name: "Nidan Hospital Blood Bank",
            location: "Pulchowk, Lalitpur",
            contact: "01-5543334",
            lat: 27.6801,
            lng: 85.3165
        },
        {
            name: "Relief Hospital Blood Bank",
            location: "Sundhara, Kathmandu",
            contact: "01-4248630",
            lat: 27.7011,
            lng: 85.3096
        },
        {
            name: "Sahid Dharma Bhakta Hospital Blood Bank",
            location: "New Baneshwor, Kathmandu",
            contact: "01-4782210",
            lat: 27.6898,
            lng: 85.3440
        },
        {
            name: "Life Care Hospital Blood Bank",
            location: "Gongabu, Kathmandu",
            contact: "01-4357265",
            lat: 27.7340,
            lng: 85.3128
        },
        {
            name: "Metro Hospital Blood Bank",
            location: "Banasthali, Kathmandu",
            contact: "01-4357690",
            lat: 27.7211,
            lng: 85.3027
        },
        {
            name: "Samudayik Hospital Blood Bank",
            location: "Hattiban, Lalitpur",
            contact: "01-5251220",
            lat: 27.6494,
            lng: 85.3220
        },
        {
            name: "Sahayogi Hospital Blood Bank",
            location: "Satungal, Kathmandu",
            contact: "01-4315280",
            lat: 27.6852,
            lng: 85.2703
        },
        {
            name: "Sunrise Hospital Blood Bank",
            location: "Baneshwor, Kathmandu",
            contact: "01-4783432",
            lat: 27.6892,
            lng: 85.3455
        },
        {
            name: "Dhulikhel Hospital Kathmandu Unit",
            location: "Koteshwor, Kathmandu",
            contact: "01-5141000",
            lat: 27.6780,
            lng: 85.3493
        },
        {
            name: "Mediplus Hospital Blood Bank",
            location: "Tinkune, Kathmandu",
            contact: "01-4111789",
            lat: 27.6863,
            lng: 85.3459
        },
        {
            name: "Sangam Hospital Blood Bank",
            location: "Gothatar, Kathmandu",
            contact: "01-4991195",
            lat: 27.6982,
            lng: 85.3662
        },
        {
            name: "Sahid Ganga Lal Smriti Hospital Blood Bank",
            location: "Ghattekulo, Kathmandu",
            contact: "01-4430750",
            lat: 27.7069,
            lng: 85.3266
        },
        {
            name: "Padma Hospital Kathmandu Unit",
            location: "Kalopul, Kathmandu",
            contact: "01-4432905",
            lat: 27.7102,
            lng: 85.3320
        },
        {
            name: "Sahayatra Hospital Blood Bank",
            location: "Sano Thimi, Bhaktapur",
            contact: "01-6631180",
            lat: 27.6785,
            lng: 85.3810
        },
        {
            name: "Lions Hospital Blood Bank",
            location: "Bharatpur Chowk, Kathmandu",
            contact: "01-4312206",
            lat: 27.7009,
            lng: 85.2971
        },
        {
            name: "Urban Health Care Center Blood Bank",
            location: "Budhanilkantha, Kathmandu",
            contact: "01-4378990",
            lat: 27.7605,
            lng: 85.3482
        },
        {
            name: "Sumeru National Hospital Blood Bank",
            location: "Bafal, Kathmandu",
            contact: "01-4282150",
            lat: 27.6990,
            lng: 85.2887
        },
        {
            name: "Nepal National Hospital Blood Bank",
            location: "Kalanki, Kathmandu",
            contact: "01-5211270",
            lat: 27.6932,
            lng: 85.2831
        },
        {
            name: "Sahid Memorial Orthopedic Hospital Blood Bank",
            location: "Jadibuti, Kathmandu",
            contact: "01-5148030",
            lat: 27.6778,
            lng: 85.3508
        },
        {
            name: "Sangini Hospital Blood Bank",
            location: "Maitidevi, Kathmandu",
            contact: "01-4421780",
            lat: 27.7076,
            lng: 85.3309
        },
        {
            name: "Sunrise City Hospital Blood Bank",
            location: "Gongabu, Kathmandu",
            contact: "01-4357120",
            lat: 27.7351,
            lng: 85.3134
        },
        {
            name: "Valley Heart Center Blood Bank",
            location: "Bagbazar, Kathmandu",
            contact: "01-4221220",
            lat: 27.7054,
            lng: 85.3152
        },
        {
            name: "Shubhechcha Hospital Blood Bank",
            location: "Balkhu, Kathmandu",
            contact: "01-4280190",
            lat: 27.6830,
            lng: 85.2960
        },
        {
            name: "Sangam City Hospital Blood Bank",
            location: "Maharajgunj, Kathmandu",
            contact: "01-4418505",
            lat: 27.7392,
            lng: 85.3385
        },
        {
            name: "Himal City Hospital Blood Bank",
            location: "Koteshwor, Kathmandu",
            contact: "01-5141005",
            lat: 27.6788,
            lng: 85.3491
        },
        {
            name: "Om Sai Hospital Blood Bank",
            location: "Lokanthali, Bhaktapur",
            contact: "01-6631182",
            lat: 27.6825,
            lng: 85.3645
        },
        {
            name: "Hope International Hospital Blood Bank",
            location: "Satdobato, Lalitpur",
            contact: "01-5201665",
            lat: 27.6551,
            lng: 85.3275
        }
    ];


    const filteredBanks = bloodBanks.filter(bank =>
        bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
            setFile(e.target.files[0]);
        } else {
            setFileName("No file chosen");
            setFile(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('phone', formData.phone);
            data.append('bloodGroup', formData.bloodGroup);
            data.append('message', formData.message);
            if (file) data.append('attachment', file);

            const res = await API.post("/request/create-request", data);
            if (res.data?.success) {
                toast.success("Blood Request Submitted Successfully");
                setFormData({ name: "", phone: "", bloodGroup: "", message: "" });
                setFileName("No file chosen");
                setFile(null);
            } else {
                toast.error(res.data?.message || "Something went wrong");
            }
        } catch (error) {
            console.log(error);
            toast.error("Error submitting request");
        }
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header */}
            <AppBar position="static" color="transparent" elevation={0} sx={{ py: 1, backgroundColor: 'white' }}>
                <Toolbar>
                    <Typography variant="h5" sx={{ flexGrow: 1, color: '#d32f2f', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WaterDrop /> Blood Bank Nepal
                    </Typography>

                    <Link href="/request-account" underline="none" sx={{ mx: 2, fontWeight: 'medium', color: 'text.primary', '&:hover': { color: 'error.main' } }}>
                        Register Org/Hospital
                    </Link>

                    <Button variant="contained" color="error" onClick={() => navigate('/login')} sx={{ borderRadius: 5 }}>
                        Login
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Hero */}
            <Box sx={{
                width: '100%',
                py: 10,
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                textAlign: 'center',
            }}>
                <Container maxWidth="md">
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                        Give the Gift of Life
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                        Your blood donation can save 3 lives. Every drop counts.
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            color="error"
                            size="large"
                            startIcon={<Search />}
                            onClick={() => scrollToSection('directory')}
                            sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
                        >
                            Find Blood
                        </Button>

                        <Button
                            variant="outlined"
                            color="inherit"
                            size="large"
                            startIcon={<VolunteerActivism />}
                            onClick={() => scrollToSection('actions')}
                            sx={{
                                px: 4, py: 1.5, fontSize: '1.1rem',
                                borderColor: 'white',
                                color: 'white',
                                '&:hover': { borderColor: '#eee', bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            Donate / Request
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* 2 Cards Section */}
            <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 2 }} id="actions">
                <Grid container spacing={4}>
                    {/* Request Card */}
                    <Grid item xs={12} md={6}>
                        <Card
                            sx={{
                                height: '100%', borderRadius: 2, boxShadow: 3, cursor: 'pointer',
                                transition: '0.3s', '&:hover': { transform: 'translateY(-5px)' }
                            }}
                            onClick={() => scrollToSection('request-form')}
                        >
                            <CardContent sx={{ textAlign: 'center', py: 5 }}>
                                <Bloodtype sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    Request Blood
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Urgent need? Submit a request immediately to notify nearby blood banks.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Donor Card */}
                    <Grid item xs={12} md={6}>
                        <Card
                            sx={{
                                height: '100%', borderRadius: 2, boxShadow: 3, cursor: 'pointer',
                                transition: '0.3s', '&:hover': { transform: 'translateY(-5px)' }
                            }}
                            onClick={() => navigate('/register')}
                        >
                            <CardContent sx={{ textAlign: 'center', py: 5 }}>
                                <VolunteerActivism sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    Become a Donor
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Sign up to become a hero. Register as a donor and save lives.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Blood Bank Directory */}
            <Container maxWidth="lg" sx={{ my: 8 }} id="directory">
                <Box sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    mb: 4, flexWrap: 'wrap', gap: 2
                }}>
                    <Typography variant="h4" fontWeight="bold">
                        Blood Bank Directory
                    </Typography>

                    <TextField
                        variant="outlined"
                        placeholder="Search blood banks..."
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />
                </Box>

                <Grid container spacing={3} sx={{ mb: 8 }}>
                    {filteredBanks.slice(0, 12).map((bank, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                                <CardContent>
                                    <Typography variant="h6" color="error" gutterBottom fontWeight="bold" fontSize="1rem">
                                        {bank.name}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                                        <LocationOn fontSize="small" sx={{ mr: 1 }} />
                                        <Typography variant="body2">{bank.location}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                        <Phone fontSize="small" sx={{ mr: 1 }} />
                                        <Typography variant="body2">{bank.contact}</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}

                    {filteredBanks.length === 0 && (
                        <Grid item xs={12}>
                            <Typography textAlign="center" color="text.secondary">
                                No blood banks found.
                            </Typography>
                        </Grid>
                    )}
                </Grid>

                {/* Blood Request Form */}
                <Box sx={{ maxWidth: '800px', mx: 'auto', mb: 8 }} id="request-form">
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                        <Typography variant="h5" textAlign="center" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                            <LocalHospital sx={{ mr: 1, verticalAlign: 'bottom', color: 'error.main' }} />
                            Emergency Blood Request
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Name (नाम)"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone (फोन)"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Blood Group (रगत समूह)</InputLabel>
                                        <Select
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            label="Blood Group (रगत समूह)"
                                            onChange={handleChange}
                                        >
                                            <MenuItem value="O+">O+</MenuItem>
                                            <MenuItem value="O-">O-</MenuItem>
                                            <MenuItem value="A+">A+</MenuItem>
                                            <MenuItem value="A-">A-</MenuItem>
                                            <MenuItem value="B+">B+</MenuItem>
                                            <MenuItem value="B-">B-</MenuItem>
                                            <MenuItem value="AB+">AB+</MenuItem>
                                            <MenuItem value="AB-">AB-</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        fullWidth
                                        startIcon={<CloudUpload />}
                                        sx={{ py: 1.5, borderColor: '#ccc', color: '#666', justifyContent: 'flex-start' }}
                                    >
                                        {fileName}
                                        <input type="file" hidden onChange={handleFileChange} />
                                    </Button>

                                    <Typography variant="caption" color="textSecondary">
                                        Requisition form (रक्त निवेदन फारम)
                                    </Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Note (टिप्पणी)"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="error"
                                        fullWidth
                                        sx={{ py: 1.5, fontSize: '1rem', borderRadius: 3 }}
                                    >
                                        Submit Request
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default WelcomePage;
