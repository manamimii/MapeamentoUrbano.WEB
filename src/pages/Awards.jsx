import { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Eye,
  Plus,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";

import { api } from "../services/api";
import AwardPodium from "../components/AwardPodium";
import { useAuth } from "../contexts/AuthContext";

export default function Awards() {
  const { user } = useAuth();

  // Verifica se o usuário autenticado é Master
  const isMaster =
    String(user?.role ?? "").trim().toLowerCase() === "master";

  // Estados da listagem
  const [awards, setAwards] = useState([]);
  const [sortOrder, setSortOrder] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Estado do pódio
  const [selectedAward, setSelectedAward] = useState(null);

  // Estados da criação de premiações
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creatingAward, setCreatingAward] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // Busca as premiações
  useEffect(() => {
    const controller = new AbortController();

    async function loadAwards() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("Award/Paginated", {
          params: {
            ...(sortOrder ? { sortOrder } : {}),
            pageSize,
            pageIndex,
          },
          signal: controller.signal,
        });

        const result = response.data;
        const data = result?.entity ?? result;

        if (
          result?.statusCode !== undefined &&
          (result.statusCode < 200 ||
            result.statusCode >= 300)
        ) {
          throw new Error(
            result.validationErrors?.join("\n") ||
              result.message ||
              "Erro ao carregar premiações."
          );
        }

        setAwards(data?.itemsOnPage ?? []);
        setTotalItems(data?.totalItems ?? 0);
      } catch (err) {
        if (
          err.code === "ERR_CANCELED" ||
          err.name === "CanceledError"
        ) {
          return;
        }

        if (controller.signal.aborted) return;

        setAwards([]);
        setTotalItems(0);

        setError(
          err.response?.data?.validationErrors?.join("\n") ||
            err.response?.data?.message ||
            err.message ||
            "Erro ao buscar premiações."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadAwards();

    return () => controller.abort();
  }, [sortOrder, pageSize, pageIndex, refreshKey]);

  // Total de páginas
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / pageSize)
  );

  // Formatação da data
  function formatDate(dateString) {
    if (!dateString) return "Data não informada";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Data inválida";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Campo_Grande",
    }).format(date);
  }

  // Atualizar listagem
  function handleRefresh() {
    setRefreshKey((previous) => previous + 1);
  }

  // Abrir modal de criação
  function handleOpenCreateModal() {
    if (!isMaster) return;

    setCreateError("");
    setCreateSuccess("");
    setCreateModalOpen(true);
  }

  // Fechar modal de criação
  function handleCloseCreateModal() {
    if (creatingAward) return;

    setCreateModalOpen(false);
    setCreateError("");
  }

  // Criar nova premiação
  async function handleCreateAward() {
    if (!isMaster || creatingAward) return;

    setCreatingAward(true);
    setCreateError("");
    setCreateSuccess("");

    try {
      const response = await api.post(
        "Award/CreateAwards"
      );

      const result = response.data;

      if (
        result?.statusCode !== undefined &&
        (result.statusCode < 200 ||
          result.statusCode >= 300)
      ) {
        throw new Error(
          result.validationErrors?.join("\n") ||
            result.message ||
            "Não foi possível criar a premiação."
        );
      }

      setCreateModalOpen(false);

      setCreateSuccess(
        result?.message ||
          "Premiação criada com sucesso!"
      );

      // Retorna para a primeira página
      setPageIndex(1);

      // Atualiza os dados da listagem
      setRefreshKey((previous) => previous + 1);
    } catch (err) {
      setCreateError(
        err.response?.data?.validationErrors?.join("\n") ||
          err.response?.data?.message ||
          err.message ||
          "Erro ao criar premiação."
      );
    } finally {
      setCreatingAward(false);
    }
  }

  return (
    <div>
      {/* CABEÇALHO DA PÁGINA */}

      <div className="page-heading">
        <h1>Gerência de Premiações</h1>

        <p>
          Consulte o histórico de premiações realizadas
          com base nos pontos dos eventos.
        </p>
      </div>

      {/* PAINEL PRINCIPAL */}

      <div className="users-panel">
        <div className="users-panel-header">
          <div className="users-panel-title">
            <div className="users-icon award-header-icon">
              <Trophy size={22} />
            </div>

            <div>
              <h2>Premiações realizadas</h2>

              <p>
                {totalItems} premiações encontradas
              </p>
            </div>
          </div>

          {/* BOTÕES DO CABEÇALHO */}

          <div className="awards-header-actions">
            {isMaster && (
              <button
                type="button"
                className="award-create-button"
                onClick={handleOpenCreateModal}
              >
                <Plus size={18} />
                Nova Premiação
              </button>
            )}

            <button
              type="button"
              className="secondary-button"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Atualizar
            </button>
          </div>
        </div>

        {/* ORDENAÇÃO */}

        <div className="table-toolbar">
          <select
            className="toolbar-select"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPageIndex(1);
            }}
          >
            <option value="">
              Ordenação padrão
            </option>

            <option value="asc">
              Crescente
            </option>

            <option value="desc">
              Decrescente
            </option>
          </select>
        </div>

        {/* MENSAGEM DE ERRO */}

        {error && (
          <div className="error-message table-error">
            {error}
          </div>
        )}

        {/* TABELA */}

        <div className="table-container">
          <table className="users-table awards-table">
            <thead>
              <tr>
                <th>DATA DA PREMIAÇÃO</th>
                <th>PRIMEIRO COLOCADO</th>
                <th className="actions-column">
                  AÇÕES
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="empty-state"
                  >
                    Carregando premiações...
                  </td>
                </tr>
              ) : awards.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="empty-state"
                  >
                    Nenhuma premiação encontrada.
                  </td>
                </tr>
              ) : (
                awards.map((award, index) => (
                  <tr
                    key={`${award.awardDate}-${index}`}
                  >
                    {/* DATA */}

                    <td>
                      <div className="award-date-cell">
                        <div className="award-date-icon">
                          <CalendarDays size={19} />
                        </div>

                        <span>
                          {formatDate(award.awardDate)}
                        </span>
                      </div>
                    </td>

                    {/* PRIMEIRO COLOCADO */}

                    <td>
                      <div className="award-winner-cell">
                        <div className="award-gold-icon">
                          <Medal size={22} />
                        </div>

                        <div className="award-winner-info">
                          <strong>
                            {award.userGold ||
                              "Não definido"}
                          </strong>

                          <span>
                            <Trophy size={13} />
                            Medalha de Ouro
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* AÇÕES */}

                    <td className="actions-column">
                      <div className="user-actions">
                        <button
                          type="button"
                          className="action-button edit"
                          title="Visualizar premiação"
                          aria-label="Visualizar premiação"
                          onClick={() =>
                            setSelectedAward(award)
                          }
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINAÇÃO */}

        <div className="pagination">
          <div className="pagination-info">
            <span>
              {totalItems === 0
                ? "0 resultados"
                : `${
                    (pageIndex - 1) * pageSize + 1
                  }–${Math.min(
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
              <option value={10}>
                10 por página
              </option>

              <option value={20}>
                20 por página
              </option>

              <option value={50}>
                50 por página
              </option>
            </select>
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              disabled={pageIndex <= 1 || loading}
              onClick={() =>
                setPageIndex(
                  (previous) => previous - 1
                )
              }
              aria-label="Página anterior"
            >
              <ChevronLeft size={19} />
            </button>

            <span>
              Página {pageIndex} de {totalPages}
            </span>

            <button
              type="button"
              disabled={
                pageIndex >= totalPages || loading
              }
              onClick={() =>
                setPageIndex(
                  (previous) => previous + 1
                )
              }
              aria-label="Próxima página"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DO PÓDIO */}

      {selectedAward && (
        <AwardPodium
          award={selectedAward}
          onClose={() => setSelectedAward(null)}
        />
      )}

      {/* MENSAGEM DE SUCESSO */}

      {createSuccess && (
        <div
          className="award-create-success"
          role="status"
        >
          <CheckCircle2 size={20} />

          <span>{createSuccess}</span>

          <button
            type="button"
            onClick={() => setCreateSuccess("")}
            aria-label="Fechar mensagem"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO */}

      {isMaster && createModalOpen && (
        <div
          className="award-create-overlay"
          onClick={handleCloseCreateModal}
        >
          <div
            className="award-create-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-award-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="award-create-icon">
              <Trophy size={30} />
            </div>

            <h2 id="create-award-title">
              Criar nova premiação
            </h2>

            <p>
              Deseja criar uma nova premiação
              com base na pontuação dos usuários?
            </p>

            {/* ERRO DA CRIAÇÃO */}

            {createError && (
              <div className="error-message">
                {createError}
              </div>
            )}

            {/* AÇÕES DO MODAL */}

            <div className="award-create-modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCloseCreateModal}
                disabled={creatingAward}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="award-create-button"
                onClick={handleCreateAward}
                disabled={creatingAward}
              >
                {creatingAward ? (
                  <>
                    <RefreshCw
                      size={18}
                      className="award-spinning"
                    />
                    Criando...
                  </>
                ) : (
                  <>
                    <Trophy size={18} />
                    Confirmar criação
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
