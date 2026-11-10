import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  UsersRound,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Mail,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { api } from "../services/api";

export default function Users() {
  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const successMessage = location.state?.successMessage;

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("User/Paginated", {
          params: {
            name: nameFilter,
            sortOrder,
            pageSize,
            pageIndex,
          },
          signal: controller.signal,
        });

        const result = response.data;
        const data = result.entity ?? result;

        if (
          result.statusCode !== undefined &&
          (result.statusCode < 200 || result.statusCode >= 300)
        ) {
          throw new Error(
            result.validationErrors?.join("\n") ||
            result.message ||
            "Erro ao buscar usuários."
          );
        }

        setUsers(data.itemsOnPage ?? []);
        setTotalItems(data.totalItems ?? 0);
      } catch (err) {
        if (
          err.code === "ERR_CANCELED" ||
          err.name === "CanceledError"
        ) {
          return;
        }

        setUsers([]);
        setTotalItems(0);

        setError(
          err.response?.data?.message ||
          err.message ||
          "Erro ao carregar usuários."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => controller.abort();
  }, [nameFilter, sortOrder, pageIndex, pageSize, refreshKey]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / pageSize)
  );

  function handleSearch(event) {
    event.preventDefault();
    setPageIndex(1);
    setNameFilter(search.trim());
  }

  function handleRefresh() {
    setPageIndex(1);
    setNameFilter("");
    setSearch("");
    setSortOrder("");
    setRefreshKey((value) => value + 1);
  }

  function isAdministrator(user) {
    return user.userRole?.trim().toLowerCase() === "administrador";
  }

  function handleEdit(user) {
    if (!isAdministrator(user)) return;

    navigate(`/usuarios/editar/${user.id}`, {
      state: { user },
    });
  }

  function handleDelete(user) {
    if (!isAdministrator(user)) return;

    // Aguardando confirmação do endpoint de exclusão.
    // Não enviar DELETE sem conhecer o contrato da API.
    setError(
      "Para excluir usuários, precisamos configurar o endpoint de exclusão da API."
    );
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Gerência de Usuários</h1>
          <p>
            Gerencie os usuários cadastrados na plataforma.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <div className="users-panel">
        <div className="users-panel-header">
          <div className="users-panel-title">
            <div className="users-icon">
              <UsersRound size={22} />
            </div>

            <div>
              <h2>Usuários cadastrados</h2>
              <p>{totalItems} usuários encontrados</p>
            </div>
          </div>

          <div className="users-header-actions">
            <button
              className="secondary-button"
              onClick={handleRefresh}
            >
              <RefreshCw size={17} />
              Atualizar
            </button>

            <button
              className="new-user-button"
              onClick={() => navigate("/usuarios/novo")}
            >
              <Plus size={18} />
              Novo usuário
            </button>
          </div>
        </div>

        <div className="table-toolbar">
          <form
            className="search-form"
            onSubmit={handleSearch}
          >
            <Search size={19} />

            <input
              type="text"
              placeholder="Pesquisar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button type="submit">Buscar</button>
          </form>

          <select
            className="toolbar-select"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPageIndex(1);
            }}
          >
            <option value="">Ordenação padrão</option>
            <option value="asc">Crescente</option>
            <option value="desc">Decrescente</option>
          </select>
        </div>

        {error && (
          <div className="error-message table-error">
            {error}
          </div>
        )}

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>USUÁRIO</th>
                <th>E-MAIL</th>
                <th>PERFIL</th>
                <th className="actions-column">AÇÕES</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    Carregando usuários...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.userName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <span>{user.userName}</span>
                      </div>
                    </td>

                    <td>
                      <div className="email-cell">
                        <Mail size={16} />
                        {user.userEmail}
                      </div>
                    </td>

                    <td>
                      <span className="role-badge">
                        {user.userRole || "Não definido"}
                      </span>
                    </td>

                    <td className="actions-column">
                      {isAdministrator(user) ? (
                        <div className="user-actions">
                          <button
                            className="action-button edit"
                            title="Editar usuário"
                            aria-label={`Editar ${user.userName}`}
                            onClick={() => handleEdit(user)}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            className="action-button delete"
                            title="Excluir usuário"
                            aria-label={`Excluir ${user.userName}`}
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      ) : (
                        <span className="no-actions">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <div className="pagination-info">
            <span>
              {totalItems === 0
                ? "0 resultados"
                : `${(pageIndex - 1) * pageSize + 1}–${Math.min(
                    pageIndex * pageSize,
                    totalItems
                  )} de ${totalItems}`}
            </span>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(1);
              }}
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>

          <div className="pagination-controls">
            <button
              disabled={pageIndex <= 1 || loading}
              onClick={() => setPageIndex((p) => p - 1)}
            >
              <ChevronLeft size={19} />
            </button>

            <span>
              Página {pageIndex} de {totalPages}
            </span>

            <button
              disabled={pageIndex >= totalPages || loading}
              onClick={() => setPageIndex((p) => p + 1)}
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
