import { useState } from "react";
import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ImageOff,
  UserRound,
  MapPin,
  Hash,
  AlertCircle,
} from "lucide-react";

import { api } from "../services/api";
import { getPhotoUrl } from "./Events";
import {
  EVENT_STATUS,
  getEventStatus,
  canEvaluateEvent,
} from "../utils/eventStatus";

export default function EventEvaluation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const event = location.state?.event;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [confirmation, setConfirmation] = useState(null);

  async function handleValidate(status) {
    if (!event || !canEvaluateEvent(event.status)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.put(
        "Event/ValidateEvent",
        null,
        {
          params: {
            eventId: id,
            status,
          },
        }
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
          "Não foi possível validar o evento."
        );
      }

      navigate("/eventos", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.validationErrors?.join("\n") ||
        err.response?.data?.message ||
        err.message ||
        "Erro ao validar evento."
      );
    } finally {
      setLoading(false);
      setConfirmation(null);
    }
  }

  if (!event || event.id !== id) {
    return (
      <div className="evaluation-empty">
        <AlertCircle size={42} />

        <h2>Evento não carregado</h2>

        <p>
          Acesse a Gerência de Eventos e selecione
          um evento para avaliação.
        </p>

        <button
          className="save-button"
          onClick={() => navigate("/eventos")}
        >
          Voltar para eventos
        </button>
      </div>
    );
  }

  const status = getEventStatus(event.status);
  const canEvaluate = canEvaluateEvent(event.status);

  return (
    <div className="event-evaluation-page">
      <button
        className="back-button"
        onClick={() => navigate("/eventos")}
      >
        <ArrowLeft size={18} />
        Voltar para eventos
      </button>

      <div className="page-heading">
        <h1>Avaliação de Evento</h1>

        <p>
          Analise as informações e defina
          se o evento será aprovado ou recusado.
        </p>
      </div>

      <div className="evaluation-card">
        <div className="evaluation-card-header">
          <div>
            <h2>Informações do Evento</h2>
            <p>Confira os dados enviados pelo usuário.</p>
          </div>

          <span
            className={`event-status ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <div className="evaluation-card-body">
          <div className="evaluation-image-section">
            {event.photo ? (
              <img
                src={getPhotoUrl(event.photo)}
                alt="Foto enviada pelo usuário"
                className="evaluation-image"
              />
            ) : (
              <div className="evaluation-no-image">
                <ImageOff size={48} />
                <span>Evento sem imagem</span>
              </div>
            )}
          </div>

          <div className="evaluation-info-grid">
            <div className="evaluation-info-item full-width">
              <label>Descrição do evento</label>
              <p>
                {event.description || "Sem descrição"}
              </p>
            </div>

            <div className="evaluation-info-item">
              <label>
                <UserRound size={16} />
                Usuário responsável
              </label>
              <p>{event.user || "Não informado"}</p>
            </div>

            <div className="evaluation-info-item">
              <label>
                <MapPin size={16} />
                Pontuação
              </label>
              <p>
                {Number(event.points ?? 0).toLocaleString(
                  "pt-BR"
                )}{" "}
                pontos
              </p>
            </div>

            <div className="evaluation-info-item full-width">
              <label>
                <Hash size={16} />
                Identificador do evento
              </label>
              <p className="event-id">{event.id}</p>
            </div>
          </div>
        </div>

        <div className="evaluation-card-footer">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {canEvaluate ? (
            <div className="evaluation-actions">
              <button
                type="button"
                className="evaluation-refuse-button"
                onClick={() =>
                  setConfirmation(EVENT_STATUS.REFUSED)
                }
                disabled={loading}
              >
                <XCircle size={20} />
                Recusar evento
              </button>

              <button
                type="button"
                className="evaluation-approve-button"
                onClick={() =>
                  setConfirmation(EVENT_STATUS.APPROVED)
                }
                disabled={loading}
              >
                <CheckCircle2 size={20} />
                Aprovar evento
              </button>
            </div>
          ) : (
            <div className="evaluation-closed">
              Este evento já foi avaliado e não pode
              ser alterado nesta tela.
            </div>
          )}
        </div>
      </div>

      {confirmation !== null && (
        <div
          className="evaluation-confirm-overlay"
          onClick={() => !loading && setConfirmation(null)}
        >
          <div
            className="evaluation-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar avaliação"
            onClick={(e) => e.stopPropagation()}
          >
            {confirmation === EVENT_STATUS.APPROVED ? (
              <CheckCircle2
                size={44}
                color="#16a34a"
              />
            ) : (
              <XCircle
                size={44}
                color="#dc2626"
              />
            )}

            <h2>Confirmar avaliação</h2>

            <p>
              Tem certeza de que deseja{" "}
              <strong>
                {confirmation === EVENT_STATUS.APPROVED
                  ? "aprovar"
                  : "recusar"}
              </strong>{" "}
              este evento?
            </p>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="evaluation-confirm-actions">
              <button
                className="secondary-button"
                onClick={() => setConfirmation(null)}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                className={
                  confirmation === EVENT_STATUS.APPROVED
                    ? "evaluation-approve-button"
                    : "evaluation-refuse-button"
                }
                onClick={() =>
                  handleValidate(confirmation)
                }
                disabled={loading}
              >
                {loading
                  ? "Salvando..."
                  : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
