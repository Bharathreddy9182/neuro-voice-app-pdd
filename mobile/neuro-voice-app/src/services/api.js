import { create } from "axios";

const API = create({
  baseURL: "https://neurovoicecompanion-production.up.railway.app",
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
