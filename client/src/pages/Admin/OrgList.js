import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import moment from "moment";
import { toast } from "react-toastify";
import API from "../../services/API";

import { useSelector } from "react-redux";

const OrgList = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [editForm, setEditForm] = useState({
    organisationName: "",
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

  const getOrgs = async (searchValue = "") => {
    try {
      setLoading(true);
      if (isAdmin) {
        const params = {};
        if (searchValue.trim()) {
          params.search = searchValue.trim();
        }
        const { data } = await API.get("/admin/org-list", { params });
        if (data?.success) {
          setData(data?.orgData || []);
        } else {
          toast.error(data?.message || "Failed to load organisations");
        }
      } else if (user?.role === "hospital") {
        const { data } = await API.get("/inventory/get-orgnaisation-for-hospital");
        if (data?.success) {
          setData(data?.organisations || []);
        }
      } else if (user?.role === "donar" || user?.role === "organisation") {
        const { data } = await API.get("/inventory/get-orgnaisation");
        if (data?.success) {
          setData(data?.organisations || []);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Error loading organisations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (!isAdmin) {
      getOrgs();
      return;
    }
    const debounce = setTimeout(() => {
      getOrgs(searchTerm);
    }, 300);
    return () => clearTimeout(debounce);
  }, [user, isAdmin, searchTerm]);

  const filteredData = useMemo(() => {
    if (isAdmin || !searchTerm.trim()) return data;
    const searchLower = searchTerm.toLowerCase();
    return data.filter((record) =>
      [
        record.organisationName,
        record.email,
        record.phone,
        record.address,
        record.latitude?.toString(),
        record.longitude?.toString(),
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchLower))
    );
  }, [data, isAdmin, searchTerm]);

  const openEditModal = (org) => {
    setSelectedOrg(org);
    setEditForm({
      organisationName: org.organisationName || "",
      email: org.email || "",
      phone: org.phone || "",
      address: org.address || "",
      website: org.website || "",
      latitude: org.latitude ?? "",
      longitude: org.longitude ?? "",
      isAvailable: org.isAvailable !== false,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedOrg(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateOrg = async () => {
    if (!selectedOrg) return;
    if (!editForm.organisationName.trim()) {
      toast.error("Organisation name is required");
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
      const response = await API.put(`/admin/update-org/${selectedOrg._id}`, editForm);
      if (response.data?.success) {
        const updated = response.data.organisation;
        setData((prev) =>
          prev.map((item) => (item._id === updated._id ? updated : item))
        );
        toast.success("Organisation updated successfully");
        closeEditModal();
      } else {
        toast.error(response.data?.message || "Failed to update organisation");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error updating organisation");
    }
  };

  const openEmailModal = (org) => {
    setEmailRecipient(org);
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
        <h3 className="mb-3">Organisation List</h3>
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
      ) : filteredData.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No organisations found.
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
              {filteredData.map((record) => (
                <tr key={record._id}>
                  <td>{record.organisationName || "N/A"}</td>
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

      {showEditModal && selectedOrg && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Organisation Details</h5>
                <button type="button" className="btn-close" onClick={closeEditModal}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Organisation Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="organisationName"
                      value={editForm.organisationName}
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
                        id="orgIsAvailable"
                        name="isAvailable"
                        checked={editForm.isAvailable}
                        onChange={handleEditChange}
                      />
                      <label className="form-check-label" htmlFor="orgIsAvailable">
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
                <button type="button" className="btn btn-primary" onClick={updateOrg}>
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
                <h5 className="modal-title">Send Email to {emailRecipient.organisationName}</h5>
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

export default OrgList;
