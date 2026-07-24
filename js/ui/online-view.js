import {
  getLeagueByRating,
} from "../competitive/league-config.js";

function formatDate(value) {
  if (!value) {
    return "Nunca";
  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? "Nunca"
    : date.toLocaleString(
        "pt-BR"
      );
}

export function renderOnlineScreen({
  elements,
  configured,
  session,
  cloud,
  leaderboard,
  online,
  recoveryMode = false,
  currentPlayerId = "",
  onOpenProfile,
}) {
  elements.onlineConfigurationState.textContent =
    configured
      ? "Configurado"
      : "Não configurado";

  elements.onlineNetworkState.textContent =
    online
      ? "Conectado à internet"
      : "Sem internet";

  elements.onlineSetupPanel.hidden =
    configured;

  elements.onlineAuthPanel.hidden =
    !configured ||
    Boolean(session) ||
    recoveryMode;

  elements.onlineRecoveryPanel.hidden =
    !configured ||
    !recoveryMode;

  elements.onlineAccountPanel.hidden =
    !configured ||
    !session ||
    recoveryMode;

  elements.onlineLeaderboardPanel.hidden =
    !configured;

  elements.onlineAccountEmailValue.textContent =
    session?.user?.email ??
    "—";

  elements.onlineLastPushValue.textContent =
    formatDate(
      cloud.lastPushAt
    );

  elements.onlineLastPullValue.textContent =
    formatDate(
      cloud.lastPullAt
    );

  elements.onlineLastProfilePushValue.textContent =
    formatDate(
      cloud.lastProfilePushAt
    );

  elements.onlineLastMatchesPushValue.textContent =
    formatDate(
      cloud.lastMatchesPushAt
    );

  elements.onlineLeaderboardUpdatedValue.textContent =
    formatDate(
      cloud.leaderboardUpdatedAt
    );

  elements.onlineGlobalFeedUpdatedValue.textContent =
    formatDate(
      cloud.globalFeedUpdatedAt
    );

  elements.onlineDiagnosticsUpdatedValue.textContent =
    cloud.diagnostics?.checkedAt
      ? formatDate(
          cloud.diagnostics.checkedAt
        )
      : "Ainda não executado";

  elements.onlineAutoSyncInput.checked =
    cloud.autoSyncEnabled !==
    false;

  elements.onlinePublicProfileInput.checked =
    cloud.publicProfileEnabled !==
    false;

  if (
    document.activeElement !==
    elements.onlineTaglineInput
  ) {
    elements.onlineTaglineInput.value =
      cloud.publicTagline ?? "";
  }

  elements.onlineUploadButton.disabled =
    !online || !session;

  elements.onlineDownloadButton.disabled =
    !online || !session;

  elements.onlineChangePasswordButton.disabled =
    !online || !session;

  elements.onlineSavePublicProfileButton.disabled =
    !online || !session;

  elements.onlineSyncCommunityButton.disabled =
    !online || !session;

  elements.onlineRefreshLeaderboardButton.disabled =
    !online;

  elements.onlineRefreshCommunityButton.disabled =
    !online;

  elements.onlineRunDiagnosticsButton.disabled =
    !online || !configured;

  elements.onlineForgotPasswordButton.disabled =
    !online || !configured;

  elements.onlineResendConfirmationButton.disabled =
    !online || !configured;

  elements.onlineUpdatePasswordButton.disabled =
    !online || !session;

  renderGlobalLeaderboard(
    elements.globalLeaderboardList,
    leaderboard,
    {
      currentPlayerId,
      onOpenProfile,
    }
  );
}

export function renderGlobalLeaderboard(
  container,
  rows,
  {
    currentPlayerId = "",
    onOpenProfile,
  } = {}
) {
  container.replaceChildren();

  if (!rows?.length) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "global-leaderboard-empty";

    empty.textContent =
      "Nenhum jogador corresponde aos filtros atuais.";

    container.append(empty);
    return;
  }

  rows.forEach(
    (row, index) => {
      const item =
        document.createElement(
          "article"
        );

      item.className =
        "global-leaderboard-row";

      item.classList.toggle(
        "global-leaderboard-row--current",
        Boolean(
          currentPlayerId &&
          row.playerId ===
            currentPlayerId
        )
      );

      const position =
        document.createElement(
          "span"
        );

      position.className =
        "global-leaderboard-row__position";

      position.textContent =
        String(index + 1);

      const league =
        getLeagueByRating(
          row.rating
        );

      const identity =
        document.createElement(
          "button"
        );

      identity.type = "button";
      identity.className =
        "global-leaderboard-row__identity";

      const nickname =
        document.createElement(
          "strong"
        );

      nickname.textContent =
        row.nickname;

      const meta =
        document.createElement(
          "small"
        );

      meta.textContent =
        `${league.icon} ${league.name} • Nv. ${row.profileLevel} • ${row.wins} vitórias`;

      identity.append(
        nickname,
        meta
      );

      identity.addEventListener(
        "click",
        () =>
          onOpenProfile?.(
            row.playerId
          )
      );

      const rating =
        document.createElement(
          "strong"
        );

      rating.className =
        "global-leaderboard-row__rating";

      rating.textContent =
        `${Math.round(
          row.rating
        )} RP`;

      const score =
        document.createElement(
          "span"
        );

      score.className =
        "global-leaderboard-row__score";

      score.textContent =
        `${Math.round(
          row.bestScore
        )} pts`;

      item.append(
        position,
        identity,
        rating,
        score
      );

      container.append(item);
    }
  );
}
