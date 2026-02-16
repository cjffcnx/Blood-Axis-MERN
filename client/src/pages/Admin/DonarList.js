import React, { useEffect, useState } from "react";
import Layout from "./../../components/shared/Layout/Layout";
import moment from "moment";
import { toast } from "react-toastify";
import API from "../../services/API";

const DonarList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    preferredCity: "",
    website: "",
    isAvailable: true,
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState(null);
  const [emailForm, setEmailForm] = useState({ subject: "", message: "" });
  const [sendingEmail, setSendingEmail] = useState(false);

  //find donar records
  const getDonars = async (searchValue = "") => {
    try {
      setLoading(true);
      const params = {};
      if (searchValue.trim()) {
        params.search = searchValue.trim();
      }
      const { data } = await API.get("/admin/donar-list", { params });
      if (data?.success) {
        setData(data?.donarData || []);
      } else {
        toast.error(data?.message || "Failed to load donors");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error loading donors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      getDonars(searchTerm);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const openEditModal = (donor) => {
    setSelectedDonor(donor);
    setEditForm({
      name: donor.name || "",
      email: donor.email || "",
      phone: donor.phone || "",
      address: donor.address || "",
      preferredCity: donor.preferredCity || "",
      website: donor.website || "",
      isAvailable: donor.isAvailable !== false,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedDonor(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateDonor = async () => {
    if (!selectedDonor) return;
    if (!editForm.name.trim()) {
      toast.error("Name is required");
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
        `/admin/update-donar/${selectedDonor._id}`,
        editForm
      );
      if (response.data?.success) {
        const updated = response.data.donor;
        setData((prev) =>
          prev.map((item) => (item._id === updated._id ? updated : item))
        );
        toast.success("Donor updated successfully");
        closeEditModal();
      } else {
        toast.error(response.data?.message || "Failed to update donor");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error updating donor");
    }
  };

  const openEmailModal = (donor) => {
    setEmailRecipient(donor);
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
        <h3 className="mb-3">Donor List</h3>
        <div className="input-group">
          <span className="input-group-text">
            <i className="fa-solid fa-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search name, email, phone, address, or city"
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
          No donors found.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Available</th>
                <th scope="col">Date</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((record) => (
                <tr key={record._id}>
                  <td>{record.name || "N/A"}</td>
                  <td>{record.email}</td>
                  <td>{record.phone}</td>
                  <td>{record.isAvailable ? "Yes" : "No"}</td>
                  <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showEditModal && selectedDonor && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Donor Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeEditModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={editForm.name}
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
                    <label className="form-label">Preferred City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="preferredCity"
                      value={editForm.preferredCity}
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
                  <div className="col-md-12">
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
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isAvailable"
                        name="isAvailable"
                        checked={editForm.isAvailable}
                        onChange={handleEditChange}
                      />
                      <label className="form-check-label" htmlFor="isAvailable">
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
                <button type="button" className="btn btn-primary" onClick={updateDonor}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEmailModal && emailRecipient && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Email to {emailRecipient.name}</h5>
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

export default DonarList;
