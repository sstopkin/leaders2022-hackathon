import axios, {AxiosRequestConfig} from "axios";
import * as constants from "./constants";

const axiosInstance: any = axios.create();

axiosInstance.interceptors.request.use(
    // Here we can perform any function we'd like on the request
    (request: AxiosRequestConfig) => {
        // Retrieve the token from local storage
        const token = localStorage.getItem(constants.ACCESS_TOKEN_KEY);
        // Check if the header property exists
        if (request.headers) {
            // Set the Authorization header if it exists
            request.headers["Authorization"] = `Bearer ${token}`;
        } else {
            // Create the headers property if it does not exist
            request.headers = {
                Authorization: `Bearer ${token}`,
            };
        }

        return request;
    }
);

export default axiosInstance