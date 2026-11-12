export const EVENT_STATUS = {
  NEW: 1,
  REFUSED: 2,
  REAVALUATE: 3,
  APPROVED: 4,
};

export const EVENT_STATUS_CONFIG = {
  1: {
    label: "Novo",
    className: "new",
  },
  2: {
    label: "Recusado",
    className: "refused",
  },
  3: {
    label: "Reavaliar",
    className: "reavaluate",
  },
  4: {
    label: "Aprovado",
    className: "approved",
  },
};

export function getEventStatus(status) {
  return (
    EVENT_STATUS_CONFIG[Number(status)] ?? {
      label: "Desconhecido",
      className: "unknown",
    }
  );
}

export function canEvaluateEvent(status) {
  return (
    Number(status) === EVENT_STATUS.NEW ||
    Number(status) === EVENT_STATUS.REAVALUATE
  );
}
