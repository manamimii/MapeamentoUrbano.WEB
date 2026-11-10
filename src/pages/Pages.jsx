import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { LockKeyhole, UserRound, MapPinned } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [userName, setUserName] = useState("");
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
      await login(userName, password);
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

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Usuário</label>

          <div className="input-wrapper">
            <UserRound size={19} />
            <input
              id="username"
              type="text"
              placeholder="Digite seu usuário"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
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
