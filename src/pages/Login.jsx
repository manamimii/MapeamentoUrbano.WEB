import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { LockKeyhole, UserRound, MapPinned } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.successMessage;
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.validationErrors?.join("\n") ||
        err.response?.data?.message ||
        err.message ||
        "Erro ao realizar login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-icon">
            <MapPinned size={30} />
          </div>

          <h1>Mapeamento Urbano</h1>
          <p>Painel Administrativo</p>
        </div>

        {successMessage && (
        <div className="success-message">
            {successMessage}
        </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Usuário</label>

          <div className="input-wrapper">
            <UserRound size={19} />
            <input
              id="email"
              type="text"
              placeholder="Digite seu usuário"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label htmlFor="password">Senha</label>

          <div className="input-wrapper">
            <LockKeyhole size={19} />
            <input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        
        <div className="login-footer">
          Mapeamento Urbano © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
