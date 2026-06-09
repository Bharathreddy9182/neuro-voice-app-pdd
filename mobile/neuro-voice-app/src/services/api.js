// import { create } from "axios";

// const API = create({
//   baseURL: "https://neurovoicecompanion-production.up.railway.app",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default API;



import axios from "axios";

const API = axios.create({
  baseURL: "https://neurovoicecompanion-production.up.railway.app",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default API;