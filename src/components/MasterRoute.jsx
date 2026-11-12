import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function MasterRoute() {
  const { user } = useAuth();

  const isMaster =
    String(user?.role ?? "")
      .trim()
      .toLowerCase() === "master";

  if (!isMaster) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
