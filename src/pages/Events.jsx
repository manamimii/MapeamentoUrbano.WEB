import { useEffect, useState } from "react";
import {
  CalendarDays,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  MapPin,
  UserRound,
  Eye,
  X,
} from "lucide-react";
import { api } from "../services/api";

function getPhotoUrl(photo) {
  if (!photo) return null;

  if (photo.startsWith("data:image/")) {
    return photo;
  }

  // Base64 puro recebido da API.
  // Caso todas as fotos sejam JPEG, este prefixo é suficiente.
  return `data:image/jpeg;base64,${photo}`;
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [sortOrder, setSortOrder] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("Event/Paginated", {
          params: {
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
          (result.statusCode < 200 ||
            result.statusCode >= 300)
        ) {
          throw new Error(
            result.validationErrors?.join("\n") ||
            result.message ||
            "Erro ao carregar eventos."
          );
        }

        setEvents(data.itemsOnPage ?? []);
        setTotalItems(data.totalItems ?? 0);
      } catch (err) {
        if (
          err.code === "ERR_CANCELED" ||
          err.name === "CanceledError"
        ) {
          return;
        }

        setEvents([]);
        setTotalItems(0);

        setError(
          err.response?.data?.message ||
          err.message ||
          "Erro ao buscar eventos."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => controller.abort();
  }, [sortOrder, pageSize, pageIndex, refreshKey]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / pageSize)
  );

  function handleRefresh() {
    setRefreshKey((value) => value + 1);
  }

  return (
    <div>
      <div className="page-heading">
        <h1>Gerência de Eventos</h1>
        <p>
          Visualize os eventos registrados pelos usuários
          do Mapeamento Urbano.
        </p>
      </div>

      <div className="users-panel">
        <div className="users-panel-header">
          <div className="users-panel-title">
            <div className="users-icon">
              <CalendarDays size={22} />
            </div>

            <div>
              <h2>Eventos cadastrados</h2>
              <p>{totalItems} eventos encontrados</p>
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
          <table className="users-table events-table">
            <thead>
              <tr>
                <th>FOTO</th>
                <th>DESCRIÇÃO</th>
                <th>USUÁRIO</th>
                <th>PONTOS</th>
                <th className="actions-column">AÇÕES</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    Carregando eventos...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    Nenhum evento encontrado.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      {event.photo ? (
                        <img
                          src={getPhotoUrl(event.photo)}
                          alt="Foto do evento"
                          className="event-thumbnail"
                          loading="lazy"
                        />
                      ) : (
                        <div className="event-no-image">
                          <ImageOff size={22} />
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="event-description">
                        {event.description || "Sem descrição"}
                      </div>
                    </td>

                    <td>
                      <div className="email-cell">
                        <UserRound size={16} />
                        {event.user || "Não informado"}
                      </div>
                    </td>

                    <td>
                      <span className="event-points">
                        <MapPin size={15} />
                        {event.points ?? 0}
                      </span>
                    </td>

                    <td className="actions-column">
                      <div className="user-actions">
                        <button
                          className="action-button edit"
                          title="Visualizar evento"
                          aria-label="Visualizar evento"
                          onClick={() => setSelectedEvent(event)}
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
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>

          <div className="pagination-controls">
            <button
              disabled={pageIndex <= 1 || loading}
              onClick={() =>
                setPageIndex((previous) => previous - 1)
              }
            >
              <ChevronLeft size={19} />
            </button>

            <span>
              Página {pageIndex} de {totalPages}
            </span>

            <button
              disabled={pageIndex >= totalPages || loading}
              onClick={() =>
                setPageIndex((previous) => previous + 1)
              }
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE VISUALIZAÇÃO */}
      {selectedEvent && (
        <div
          className="event-modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="event-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Detalhes do evento"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="event-modal-header">
              <h2>Detalhes do Evento</h2>

              <button
                onClick={() => setSelectedEvent(null)}
                aria-label="Fechar"
              >
                <X size={22} />
              </button>
            </div>

            <div className="event-modal-body">
              {selectedEvent.photo ? (
                <img
                  src={getPhotoUrl(selectedEvent.photo)}
                  alt="Foto do evento"
                  className="event-modal-image"
                />
              ) : (
                <div className="event-modal-placeholder">
                  <ImageOff size={40} />
                  <span>Sem imagem</span>
                </div>
              )}

              <div className="event-detail">
                <strong>Descrição</strong>
                <p>
                  {selectedEvent.description ||
                    "Sem descrição"}
                </p>
              </div>

              <div className="event-detail">
                <strong>Usuário responsável</strong>
                <p>
                  {selectedEvent.user || "Não informado"}
                </p>
              </div>

              <div className="event-detail">
                <strong>Pontos</strong>
                <p>{selectedEvent.points ?? 0}</p>
              </div>

              <div className="event-detail">
                <strong>Identificador</strong>
                <p className="event-id">
                  {selectedEvent.id}
                </p>
              </div>
            </div>

            <div className="event-modal-footer">
              <button
                className="secondary-button"
                onClick={() => setSelectedEvent(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
