import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UsersRound,
  LogOut,
  MapPinned,
  Menu,
  X,
  UserCircle,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="admin-layout">
      {menuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <MapPinned size={27} />
          </div>

          <div>
            <strong>Mapeamento Urbano</strong>
            <span>Administração</span>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section-title">
          MENU PRINCIPAL
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <LayoutDashboard size={20} />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/usuarios"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <UsersRound size={20} />
            <span>Gerência de Usuários</span>
          </NavLink>
        </nav>

        <NavLink
            to="/eventos"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
            }
            >
            <CalendarDays size={20} />
            <span>Gerência de Eventos</span>
        </NavLink>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <UserCircle size={34} />

            <div>
              <strong>{user?.name}</strong>
              <span>{user?.role || "Usuário"}</span>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={19} />
            Sair
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>

          <div className="topbar-title">
            Painel Administrativo
          </div>

          <div className="topbar-user">
            <UserCircle size={22} />
            <span>{user?.name}</span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
