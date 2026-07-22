import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const getApiBaseUrl = () => {
  if (Platform.OS === "web") {
    return "http://127.0.0.1:5000";
  }

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri ? hostUri.split(":")[0] : "10.234.50.175";

  return `http://${host}:5000`;
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default API;