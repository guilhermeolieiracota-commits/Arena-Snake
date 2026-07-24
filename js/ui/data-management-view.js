function formatBytes(
  bytes
) {
  const safe =
    Math.max(
      0,
      Number(bytes) || 0
    );

  if (safe < 1024) {
    return `${safe} B`;
  }

  if (
    safe <
    1024 * 1024
  ) {
    return `${(
      safe / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    safe /
    1024 /
    1024
  ).toFixed(2)} MB`;
}

export function renderDataManagement({
  elements,
  save,
}) {
  const serialized =
    JSON.stringify(save);

  elements.dataSaveVersionValue.textContent =
    String(save.version);

  elements.dataBackupSizeValue.textContent =
    formatBytes(
      new Blob(
        [serialized]
      ).size
    );

  elements.dataPlayerIdValue.textContent =
    save.playerMeta.playerId;

  elements.dataMatchesValue.textContent =
    String(
      save.matchHistory.length
    );

  elements.dataLastBackupValue.textContent =
    save.playerMeta.lastBackupAt
      ? new Date(
          save.playerMeta.lastBackupAt
        ).toLocaleString(
          "pt-BR"
        )
      : "Nunca";
}
