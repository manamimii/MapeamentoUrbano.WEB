import { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Eye,
} from "lucide-react";
import { api } from "../services/api";
import AwardPodium from "../components/AwardPodium";

export default function Awards() {
  const [awards, setAwards] = useState([]);
  const [sortOrder, setSortOrder] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedAward, setSelectedAward] = useState(null);

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
        const data = result.entity ?? result;

        if (
          result.statusCode !== undefined &&
          (result.statusCode < 200 ||
            result.statusCode >= 300)
        ) {
          throw new Error(
            result.validationErrors?.join("\n") ||
            result.message ||
            "Erro ao carregar premiações."
          );
        }

        setAwards(data.itemsOnPage ?? []);
        setTotalItems(data.totalItems ?? 0);
      } catch (err) {
        if (
          err.code === "ERR_CANCELED" ||
          err.name === "CanceledError"
        ) {
          return;
        }

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

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / pageSize)
  );

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

  function handleRefresh() {
    setRefreshKey((previous) => previous + 1);
  }

  return (
    <div>
      <div className="page-heading">
        <h1>Gerência de Premiações</h1>
        <p>
          Consulte o histórico de premiações realizadas
          com base nos pontos dos eventos.
        </p>
      </div>

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

          <button
            className="secondary-button"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Atualizar
          </button>
        </div>

        <div className="table-toolbar">
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
          <table className="users-table awards-table">
            <thead>
              <tr>
                <th>DATA DA PREMIAÇÃO</th>
                <th>PRIMEIRO COLOCADO</th>
                <th className="actions-column">AÇÕES</th>
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

                    <td className="actions-column">
                        <div className="user-actions">
                            <button
                            type="button"
                            className="action-button edit"
                            title="Visualizar premiação"
                            aria-label="Visualizar premiação"
                            onClick={() => setSelectedAward(award)}
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
              disabled={pageIndex <= 1 || loading}
              onClick={() =>
                setPageIndex((previous) => previous - 1)
              }
              aria-label="Página anterior"
            >
              <ChevronLeft size={19} />
            </button>

            <span>
              Página {pageIndex} de {totalPages}
            </span>

            <button
              disabled={
                pageIndex >= totalPages || loading
              }
              onClick={() =>
                setPageIndex((previous) => previous + 1)
              }
              aria-label="Próxima página"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>

        {selectedAward && (
            <AwardPodium
                award={selectedAward}
                onClose={() => setSelectedAward(null)}
            />
        )}
      </div>
    </div>
  );
}
