import api from "./api";

// fetch logged-in tenant complaints
export async function getMyComplaints() {
  const res = await api.get("/tenant/complaints");
  return res.data;
}

// add new complaint
export async function addComplaint(data) {
  const res = await api.post("/tenant/complaints/add", data);
  return res.data;
}
