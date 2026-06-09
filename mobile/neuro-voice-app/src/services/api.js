import { create } from "axios";

const API = create({
  baseURL: "http://192.168.2.8:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
