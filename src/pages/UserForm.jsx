import { useState } from "react";
import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import {
  ArrowLeft,
  Save,
  UserRound,
  Mail,
} from "lucide-react";
import { api } from "../services/api";

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const isEditing = Boolean(id);
  const editingUser = location.state?.user;

  const [form, setForm] = useState({
    userName: editingUser?.userName ?? "",
    userEmail: editingUser?.userEmail ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isEditing) {
        // O endpoint User/Update precisa ter seu
        // método HTTP e DTO confirmados no Swagger.
        throw new Error(
          "Confirme o contrato do endpoint User/Update para habilitar a edição."
        );
      }

      const payload = {
        id: "00000000-0000-0000-0000-000000000000",
        userName: form.userName.trim(),
        userEmail: form.userEmail.trim(),
      };

      const response = await api.post("User/Create", payload);

      const result = response.data;

      if (
        result.statusCode !== undefined &&
        (result.statusCode < 200 || result.statusCode >= 300)
      ) {
        throw new Error(
          result.validationErrors?.join("\n") ||
          result.message ||
          "Não foi possível salvar o usuário."
        );
      }

      navigate("/usuarios", {
        replace: true,
        state: {
          successMessage: "Usuário cadastrado com sucesso!",
        },
      });
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.validationErrors?.join("\n") ||
        (data?.errors
          ? Object.values(data.errors).flat().join("\n")
          : null) ||
        data?.message ||
        err.message ||
        "Erro ao salvar usuário."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        className="back-button"
        onClick={() => navigate("/usuarios")}
      >
        <ArrowLeft size={18} />
        Voltar para usuários
      </button>

      <div className="page-heading">
        <h1>
          {isEditing ? "Editar usuário" : "Cadastrar usuário"}
        </h1>

        <p>
          {isEditing
            ? "Atualize os dados do administrador."
            : "Preencha os dados para cadastrar um novo usuário."}
        </p>
      </div>

      <div className="user-form-card">
        <div className="user-form-header">
          <h2>Informações do usuário</h2>
          <p>Preencha os campos abaixo.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="userName">Nome completo</label>

            <div className="input-wrapper">
              <UserRound size={19} />
              <input
                id="userName"
                type="text"
                placeholder="Nome do usuário"
                value={form.userName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    userName: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="userEmail">E-mail</label>

            <div className="input-wrapper">
              <Mail size={19} />
              <input
                id="userEmail"
                type="email"
                placeholder="email@exemplo.com"
                value={form.userEmail}
                onChange={(e) =>
                  setForm({
                    ...form,
                    userEmail: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/usuarios")}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="save-button"
              disabled={loading}
            >
              <Save size={18} />
              {loading
                ? "Salvando..."
                : isEditing
                ? "Salvar alterações"
                : "Cadastrar usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
