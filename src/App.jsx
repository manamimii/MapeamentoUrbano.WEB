import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Users from "./pages/Users";
import UserForm from "./pages/UserForm";
import Events from "./pages/Events";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />

          {/* Rotas privadas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/usuarios" element={<Users />} />
              <Route path="/usuarios/novo" element={<UserForm />} />
              <Route path="/usuarios/editar/:id" element={<UserForm />} />
             <Route path="/eventos" element={<Events />} />
            </Route>
          </Route>

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
