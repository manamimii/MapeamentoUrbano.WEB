import { Link } from "react-router-dom";
import {
  UsersRound,
  ArrowRight,
  ShieldCheck,
  MapPinned,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Bem-vindo, {user?.name}!</h1>
          <p>
            Gerencie as informações do Mapeamento Urbano
            através do painel administrativo.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <Link to="/usuarios" className="dashboard-card">
          <div className="dashboard-card-icon blue">
            <UsersRound size={26} />
          </div>

          <h3>Gerência de Usuários</h3>

          <p>
            Visualize, pesquise e consulte os usuários
            cadastrados no sistema.
          </p>

          <span className="card-link">
            Acessar usuários <ArrowRight size={17} />
          </span>
        </Link>

        <div className="dashboard-card">
          <div className="dashboard-card-icon green">
            <ShieldCheck size={26} />
          </div>

          <h3>Sessão autenticada</h3>

          <p>
            Você está conectado com o perfil:
          </p>

          <span className="role-badge">
            {user?.role || "Usuário"}
          </span>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon purple">
            <MapPinned size={26} />
          </div>

          <h3>Mapeamento Urbano</h3>

          <p>
            Plataforma de administração e acompanhamento
            do sistema de mapeamento.
          </p>
        </div>
      </div>
    </div>
  );
}
