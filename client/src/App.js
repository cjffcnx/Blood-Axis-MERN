import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import OrgHospitalRequest from "./pages/auth/OrgHospitalRequest";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import PublicRoute from "./components/Routes/PublicRoute";
import Donar from "./pages/Dashboard/Donar";
import Hospitals from "./pages/Dashboard/Hospitals";
import OrganisationPage from "./pages/Dashboard/OrganisationPage";
import Donation from "./pages/Donation";
import Analytics from "./pages/Dashboard/Analytics";
import DonarList from "./pages/Admin/DonarList";
import HospitalList from "./pages/Admin/HospitalList";
import OrgList from "./pages/Admin/OrgList";
import AdminHome from "./pages/Admin/AdminHome";
import RequestList from "./pages/Admin/RequestList";
import AccountRequests from "./pages/Admin/AccountRequests";
import WelcomePage from "./pages/WelcomePage";
import BloodRequests from "./pages/Dashboard/BloodRequests";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

// Refactored Dashboard
import DonorDashboard from "./pages/Dashboard/DonorDashboard";
import RequestSupply from "./pages/Dashboard/RequestSupply";
import BloodReceive from "./pages/Dashboard/BloodReceive";
import InterestedDonors from "./pages/Dashboard/InterestedDonors";
import SearchHospitals from "./pages/Dashboard/SearchHospitals";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <>
        <ToastContainer />
        <Routes>
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <PublicRoute>
                <WelcomePage />
              </PublicRoute>
            }
          />
          <Route
            path="/donor-dashboard"
            element={
              <ProtectedRoute>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donar"
            element={
              <ProtectedRoute>
                <Donar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital"
            element={
              <ProtectedRoute>
                <Hospitals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donation"
            element={
              <ProtectedRoute>
                <Donation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orgnaisation"
            element={
              <ProtectedRoute>
                <OrganisationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interested-donors"
            element={
              <ProtectedRoute>
                <InterestedDonors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search-hospitals"
            element={
              <ProtectedRoute>
                <SearchHospitals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/request-supply"
            element={
              <ProtectedRoute>
                <RequestSupply />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blood-receive"
            element={
              <ProtectedRoute>
                <BloodReceive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donar-list"
            element={
              <ProtectedRoute>
                <DonarList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital-list"
            element={
              <ProtectedRoute>
                <HospitalList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/org-list"
            element={
              <ProtectedRoute>
                <OrgList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/request-account"
            element={
              <PublicRoute>
                <OrgHospitalRequest />
              </PublicRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <RequestList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/org-requests"
            element={
              <ProtectedRoute>
                <BloodRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/account-requests"
            element={
              <ProtectedRoute>
                <AccountRequests />
              </ProtectedRoute>
            }
          />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </>
    </QueryClientProvider >
  );
}

export default App;
