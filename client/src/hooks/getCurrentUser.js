import axiosInstance from "../utils/axios.helper";
import { setUser } from "../store/authSlice";

export const getCurrentUser = async (dispatch) => {
    try {
        const response = await axiosInstance.get("/users/current-user",{
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          });
        if (response?.data?.data) {
            dispatch(setUser(response.data.data));
            return response.data;
        }
    } catch (error) {
        console.log(error);
    }
};