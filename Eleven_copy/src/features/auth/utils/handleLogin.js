import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/apiService";
import { toast } from "sonner";

export const useBlockCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfBlocked = async () => {
      const token = localStorage.getItem("access");

      // No login → skip
      if (!token) return;

      try {
        const { data } = await api.get("auth/profile/");

        if (data.is_blocked) {
          // Clear storage
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");

          toast.error("🚫 Your account has been blocked by admin!", {
            position: "top-center",
            autoClose: 3000,
          });

          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (error) {
        console.error("Block check error:", error);
      }
    };

    checkIfBlocked();

    const interval = setInterval(checkIfBlocked, 60000); // every 60 sec

    return () => clearInterval(interval);
  }, [navigate]);
};