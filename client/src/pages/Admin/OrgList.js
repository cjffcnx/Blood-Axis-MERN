import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import moment from "moment";
import API from "../../services/API";

import { useSelector } from "react-redux";

const OrgList = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  //find donar records
  const getDonars = async () => {
    try {
      if (user?.role === "admin") {
        const { data } = await API.get("/admin/org-list");
        if (data?.success) {
          setData(data?.orgData);
        }
      } else if (user?.role === "hospital") {
        const { data } = await API.get("/inventory/get-orgnaisation-for-hospital");
        if (data?.success) {
          setData(data?.organisations);
        }
      } else if (user?.role === "donar") {
        const { data } = await API.get("/inventory/get-orgnaisation");
        if (data?.success) {
          setData(data?.organisations);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDonars();
  }, [user]);

  //DELETE FUNCTION
  const handelDelete = async (id) => {
    try {
      let answer = window.prompt(
        "Are You SUre Want To Delete This Organisation",
        "Sure"
      );
      if (!answer) return;
      const { data } = await API.delete(`/admin/delete-donar/${id}`);
      alert(data?.message);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      <table className="table ">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Phone</th>
            <th scope="col">Date</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((record) => (
            <tr key={record._id}>
              <td>{record.organisationName}</td>
              <td>{record.email}</td>
              <td>{record.phone}</td>
              <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
              <td>
                {user?.role === "admin" && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handelDelete(record._id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default OrgList;
