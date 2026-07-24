const BACKUP_TYPE =
  "snake-arena-backup";

function checksum(
  value
) {
  let hash = 2166136261;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash ^=
      value.charCodeAt(index);

    hash =
      Math.imul(
        hash,
        16777619
      );
  }

  return (
    hash >>> 0
  ).toString(16);
}

function safeFilenameDate() {
  return new Date()
    .toISOString()
    .replace(
      /[:.]/g,
      "-"
    );
}

export class SaveTransferService {
  constructor({
    storageService,
  }) {
    this.storageService =
      storageService;
  }

  createBackupObject() {
    const save =
      this.storageService.load();

    const payload =
      JSON.stringify(save);

    return {
      type: BACKUP_TYPE,
      formatVersion: 1,
      createdAt:
        new Date().toISOString(),
      checksum:
        checksum(payload),
      save,
    };
  }

  exportBackup() {
    const backup =
      this.createBackupObject();

    const content =
      JSON.stringify(
        backup,
        null,
        2
      );

    const blob =
      new Blob(
        [content],
        {
          type:
            "application/json;charset=utf-8",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const anchor =
      document.createElement(
        "a"
      );

    anchor.href = url;
    anchor.download =
      `snake-arena-backup-${safeFilenameDate()}.json`;

    document.body.append(
      anchor
    );

    anchor.click();
    anchor.remove();

    window.setTimeout(
      () =>
        URL.revokeObjectURL(
          url
        ),
      1000
    );

    return backup;
  }

  async importFile(file) {
    if (!file) {
      throw new Error(
        "Nenhum arquivo selecionado."
      );
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      throw new Error(
        "O backup ultrapassa 5 MB."
      );
    }

    const content =
      await file.text();

    return this.importText(
      content
    );
  }

  importText(content) {
    let parsed;

    try {
      parsed =
        JSON.parse(content);
    } catch {
      throw new Error(
        "O arquivo não contém JSON válido."
      );
    }

    if (
      parsed?.type !==
      BACKUP_TYPE
    ) {
      throw new Error(
        "Este arquivo não é um backup do Snake Arena."
      );
    }

    const payload =
      JSON.stringify(
        parsed.save
      );

    if (
      parsed.checksum !==
      checksum(payload)
    ) {
      throw new Error(
        "O backup está corrompido ou foi alterado."
      );
    }

    return this.storageService
      .replaceSave(
        parsed.save
      );
  }

  async shareText(text) {
    const shareData = {
      title: "Snake Arena",
      text,
    };

    if (
      navigator.share
    ) {
      try {
        await navigator.share(
          shareData
        );

        return {
          method: "share",
        };
      } catch (
        error
      ) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return {
            method:
              "cancelled",
          };
        }
      }
    }

    if (
      navigator.clipboard
        ?.writeText
    ) {
      await navigator.clipboard
        .writeText(text);

      return {
        method: "clipboard",
      };
    }

    const textarea =
      document.createElement(
        "textarea"
      );

    textarea.value = text;
    textarea.setAttribute(
      "readonly",
      ""
    );

    textarea.style.position =
      "fixed";
    textarea.style.opacity =
      "0";

    document.body.append(
      textarea
    );

    textarea.select();
    document.execCommand(
      "copy"
    );
    textarea.remove();

    return {
      method: "clipboard",
    };
  }
}
