import { useEffect } from "react";
import { Crown, Trophy, Medal, X } from "lucide-react";

export default function AwardPodium({ award, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!award) return null;

  function formatDate(dateString) {
    if (!dateString) return "Data não informada";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Data inválida";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "America/Campo_Grande",
    }).format(date);
  }


const positions = [
  {
    place: 2,
    name: award.userSilver,
    points: award.userSilverPoints,
    label: "PRATA",
    className: "silver",
    Icon: Medal,
  },
  {
    place: 1,
    name: award.userGold,
    points: award.userGoldPoints,
    label: "OURO",
    className: "gold",
    Icon: Trophy,
  },
  {
    place: 3,
    name: award.userBronze,
    points: award.userBronzePoints,
    label: "BRONZE",
    className: "bronze",
    Icon: Medal,
  },
];


  return (
    <div
      className="award-modal-overlay"
      onClick={onClose}
    >
      <div
        className="award-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="award-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="award-modal-header">
          <div>
            <h2 id="award-modal-title">
              Detalhes da Premiação
            </h2>

            <p>{formatDate(award.awardDate)}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
        </div>

        <div className="award-modal-body">
          <div className="podium-heading">
            <Trophy size={26} />
            <h3>Pódio de Premiação</h3>
          </div>

          <div className="podium">
            {positions.map((position) => {
              const Icon = position.Icon;
              const hasWinner = Boolean(
                position.name?.trim()
              );

              return (
                <div
                  key={position.place}
                  className={`podium-position ${position.className}`}
                >
                  <div className="podium-person">
                    {position.place === 1 && (
                      <Crown
                        className="podium-crown"
                        size={25}
                      />
                    )}

                    <div
                      className={`podium-medal ${position.className}`}
                    >
                      <Icon size={30} />
                    </div>

                    
                    <strong
                    className={hasWinner ? "" : "podium-empty"}
                    >
                    {hasWinner ? position.name : "Sem colocado"}
                    </strong>

                    <div className={`podium-points ${position.className}`}>
                    {hasWinner
                        ? `${Number(position.points ?? 0).toLocaleString("pt-BR")} pts`
                        : "—"}
                    </div>

                    <span>{position.place}º lugar</span>

                  </div>

                  <div
                    className={`podium-step ${position.className}`}
                  >
                    <strong>{position.place}</strong>
                    <span>{position.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="award-modal-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
