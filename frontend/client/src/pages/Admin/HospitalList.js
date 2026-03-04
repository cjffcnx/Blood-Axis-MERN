import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import moment from "moment";
import { toast } from "react-toastify";
import API from "../../services/API";
import { useSelector } from "react-redux";

const HospitalList = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [editForm, setEditForm] = useState({
    hospitalName: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    latitude: "",
    longitude: "",
    isAvailable: true,
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState(null);
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" });
  const [sendingEmail, setSendingEmail] = useState(false);
  const isAdmin = user?.role === "admin";

  //find hospital records
  const getHospitals = async (searchValue = "") => {
    try {
      setLoading(true);
      if (isAdmin) {
        const params = {};
        if (searchValue.trim()) {
          params.search = searchValue.trim();
        }
        const { data } = await API.get("/admin/hospital-list", { params });
        if (data?.success) {
          setData(data?.hospitalData || []);
        } else {
          toast.error(data?.message || "Failed to load hospitals");
        }
      } else {
        const { data } = await API.get("/inventory/get-hospitals");
        if (data?.success) {
          const hospitals = data?.hospitals || [];
          const query = searchValue.trim().toLowerCase();
          if (!query) {
            setData(hospitals);
          } else {
            setData(
              hospitals.filter((record) =>
                [
                  record.hospitalName,
                  record.email,
                  record.phone,
                  record.address,
                  record.latitude?.toString(),
                  record.longitude?.toString(),
                ]
                  .filter(Boolean)
                  .some((value) => value.toLowerCase().includes(query))
              )
            );
          }
        } else {
          toast.error(data?.message || "Failed to load hospitals");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Error loading hospitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      getHospitals(searchTerm);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, isAdmin]);

  const openEditModal = (hospital) => {
    setSelectedHospital(hospital);
    setEditForm({
      hospitalName: hospital.hospitalName || "",
      email: hospital.email || "",
      phone: hospital.phone || "",
      address: hospital.address || "",
      website: hospital.website || "",
      latitude: hospital.latitude ?? "",
      longitude: hospital.longitude ?? "",
      isAvailable: hospital.isAvailable !== false,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedHospital(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateHospital = async () => {
    if (!selectedHospital) return;
    if (!editForm.hospitalName.trim()) {
      toast.error("Hospital name is required");
      return;
    }
    if (!editForm.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!editForm.phone.trim()) {
      toast.error("Phone is required");
      return;
    }
    if (!editForm.address.trim()) {
      toast.error("Address is required");
      return;
    }

    try {
      const response = await API.put(
        `/admin/update-hospital/${selectedHospital._id}`,
        editForm
      );
      if (response.data?.success) {
        const updated = response.data.hospital;
        setData((prev) =>
          prev.map((item) => (item._id === updated._id ? updated : item))
        );
        toast.success("Hospital updated successfully");
        closeEditModal();
      } else {
        toast.error(response.data?.message || "Failed to update hospital");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error updating hospital");
    }
  };

  const openEmailModal = (hospital) => {
    setEmailRecipient(hospital);
    setEmailForm({ subject: "", message: "" });
    setShowEmailModal(true);
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setEmailRecipient(null);
    setEmailForm({ subject: "", message: "" });
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const sendEmail = async () => {
    if (!emailForm.subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!emailForm.message.trim()) {
      toast.error("Message is required");
      return;
    }

    try {
      setSendingEmail(true);
      const response = await API.post("/auth/send-email", {
        to: emailRecipient.email,
        subject: emailForm.subject,
        html: `<p>${emailForm.message.replace(/\n/g, "<br>")}</p>`,
        text: emailForm.message,
      });
      if (response.data?.success) {
        toast.success("Email sent successfully!");
        closeEmailModal();
      } else {
        toast.error(response.data?.message || "Failed to send email");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error sending email");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <Layout>
      <div className="mb-4">
        <h3 className="mb-3">Hospital List</h3>
        <div className="input-group">
          <span className="input-group-text">
            <i className="fa-solid fa-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search name, email, phone, or address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setSearchTerm("")}
              title="Clear search"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No hospitals found.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Latitude</th>
                <th scope="col">Longitude</th>
                <th scope="col">Available</th>
                <th scope="col">Date</th>
                {isAdmin && <th scope="col">Action</th>}
              </tr>
            </thead>
            <tbody>
              {data?.map((record) => (
                <tr key={record._id}>
                  <td>{record.hospitalName || "N/A"}</td>
                  <td>{record.email}</td>
                  <td>{record.phone}</td>
                  <td>{record.latitude ?? "N/A"}</td>
                  <td>{record.longitude ?? "N/A"}</td>
                  <td>{record.isAvailable ? "Yes" : "No"}</td>
                  <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                  {isAdmin && (
                    <td className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openEditModal(record)}
                      >
                        <i className="fa-solid fa-pen"></i> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => openEmailModal(record)}
                      >
                        <i className="fa-solid fa-envelope"></i> Email
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin && showEditModal && selectedHospital && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Hospital Details</h5>
                <button type="button" className="btn-close" onClick={closeEditModal}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Hospital Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="hospitalName"
                      value={editForm.hospitalName}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Website</label>
                    <input
                      type="text"
                      className="form-control"
                      name="website"
                      value={editForm.website}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={editForm.address}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      name="latitude"
                      value={editForm.latitude}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      name="longitude"
                      value={editForm.longitude}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="col-md-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="hospitalIsAvailable"
                        name="isAvailable"
                        checked={editForm.isAvailable}
                        onChange={handleEditChange}
                      />
                      <label className="form-check-label" htmlFor="hospitalIsAvailable">
                        Available for donation
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={updateHospital}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdmin && showEmailModal && emailRecipient && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Email to {emailRecipient.hospitalName}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeEmailModal}
                  disabled={sendingEmail}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="recipient-email" className="form-label">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="recipient-email"
                    value={emailRecipient.email}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="subject" className="form-label">
                    Subject <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="subject"
                    name="subject"
                    value={emailForm.subject}
                    onChange={handleEmailChange}
                    placeholder="Enter email subject"
                    disabled={sendingEmail}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">
                    Message <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="message"
                    name="message"
                    value={emailForm.message}
                    onChange={handleEmailChange}
                    placeholder="Enter your message"
                    rows="5"
                    disabled={sendingEmail}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeEmailModal}
                  disabled={sendingEmail}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={sendEmail}
                  disabled={sendingEmail}
                >
                  {sendingEmail ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i> Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HospitalList;
