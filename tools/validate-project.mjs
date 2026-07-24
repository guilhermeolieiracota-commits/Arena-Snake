import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import {
  dirname,
  join,
  normalize,
  relative,
  resolve,
} from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(
  dirname(
    fileURLToPath(
      import.meta.url
    )
  ),
  ".."
);

const errors = [];

const requiredFiles = [
  "index.html",
  "manifest.webmanifest",
  "service-worker.js",
  ".nojekyll",
  "assets/icons/favicon-32.png",
  "assets/icons/apple-touch-icon.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png",
  "js/main.js",
  "js/pwa/pwa-manager.js",
  "js/achievements/achievement-system.js",
  "js/challenges/daily-challenge-system.js",
  "js/economy/economy-system.js",
  "js/progression/progression-system.js",
  "js/seasons/season-system.js",
  "js/events/weekly-event-system.js",
  "js/competitive/competitive-system.js",
  "js/history/match-history-system.js",
  "js/activity/streak-system.js",
  "js/backup/save-transfer-service.js",
  "js/config/cloud-config.js",
  "js/online/supabase-rest-client.js",
  "js/online/cloud-session-service.js",
  "js/online/cloud-sync-system.js",
  "js/online/cloud-community-system.js",
  "js/ui/online-view.js",
  "js/ui/community-view.js",
  "supabase/snake-arena-phase12.sql",
  "supabase/snake-arena-phase13-upgrade.sql",
  "CONFIGURAR-SUPABASE-FASE-12.md",
  "ATIVAR-FASE-13.md",
  "tools/test-phase9.mjs",
  "tools/test-phase10.mjs",
  "tools/test-phase11.mjs",
  "tools/test-phase12.mjs",
  "tools/test-phase13.mjs",
  "js/systems/predation-system.js",
  "tools/test-phase14.mjs",
  "ALTERACOES-FASE-14.md",
  "tests/fase-14-checklist.md",
  "tests/validation-report-fase-14.md",
];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    errors.push(
      `Arquivo obrigatório ausente: ${file}`
    );
  }
}

const walk = (directory) => {
  const results = [];

  for (
    const name of
    readdirSync(directory)
  ) {
    const path = join(
      directory,
      name
    );

    const stats =
      statSync(path);

    if (stats.isDirectory()) {
      results.push(...walk(path));
    } else {
      results.push(path);
    }
  }

  return results;
};

const jsFiles = walk(
  join(root, "js")
).filter(
  (file) =>
    file.endsWith(".js")
);

const importPattern =
  /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["'](\.[^"']+)["']/g;

for (const file of jsFiles) {
  const source =
    readFileSync(
      file,
      "utf8"
    );

  for (
    const match of
    source.matchAll(
      importPattern
    )
  ) {
    let target = resolve(
      dirname(file),
      match[1]
    );

    if (!target.endsWith(".js")) {
      target += ".js";
    }

    if (!existsSync(target)) {
      errors.push(
        `Import ausente: ${relative(
          root,
          file
        )} -> ${match[1]}`
      );
    }
  }
}

let manifest = null;

try {
  manifest = JSON.parse(
    readFileSync(
      join(
        root,
        "manifest.webmanifest"
      ),
      "utf8"
    )
  );
} catch (error) {
  errors.push(
    `Manifesto inválido: ${error.message}`
  );
}

if (manifest) {
  const requiredManifestFields = [
    "name",
    "short_name",
    "start_url",
    "scope",
    "display",
    "icons",
  ];

  for (
    const field of
    requiredManifestFields
  ) {
    if (!manifest[field]) {
      errors.push(
        `Campo ausente no manifesto: ${field}`
      );
    }
  }

  if (
    typeof manifest.start_url ===
      "string" &&
    manifest.start_url.startsWith("/")
  ) {
    errors.push(
      "start_url não pode começar com / porque o jogo também será publicado em subdiretório."
    );
  }

  for (
    const icon of
    manifest.icons ?? []
  ) {
    const cleanPath =
      icon.src.replace(
        /^\.\//,
        ""
      );

    if (
      !existsSync(
        join(root, cleanPath)
      )
    ) {
      errors.push(
        `Ícone do manifesto ausente: ${icon.src}`
      );
    }
  }
}

const readPngSize = (file) => {
  const buffer =
    readFileSync(file);

  if (
    buffer.length < 24 ||
    buffer.toString(
      "ascii",
      1,
      4
    ) !== "PNG"
  ) {
    return null;
  }

  return {
    width:
      buffer.readUInt32BE(16),
    height:
      buffer.readUInt32BE(20),
  };
};

const iconDimensions = [
  [
    "assets/icons/favicon-32.png",
    32,
  ],
  [
    "assets/icons/apple-touch-icon.png",
    180,
  ],
  [
    "assets/icons/icon-192.png",
    192,
  ],
  [
    "assets/icons/icon-512.png",
    512,
  ],
  [
    "assets/icons/icon-maskable-512.png",
    512,
  ],
];

for (
  const [file, expected]
  of iconDimensions
) {
  const fullPath =
    join(root, file);

  if (!existsSync(fullPath)) {
    continue;
  }

  const size =
    readPngSize(fullPath);

  if (
    !size ||
    size.width !== expected ||
    size.height !== expected
  ) {
    errors.push(
      `Tamanho incorreto: ${file}`
    );
  }
}

const indexHtml =
  readFileSync(
    join(root, "index.html"),
    "utf8"
  );

if (
  !indexHtml.includes(
    'rel="manifest"'
  )
) {
  errors.push(
    "index.html não referencia o manifesto."
  );
}

const htmlIds = new Set(
  Array.from(
    indexHtml.matchAll(
      /id="([^"]+)"/g
    ),
    (match) => match[1]
  )
);

const mainSource =
  readFileSync(
    join(root, "js/main.js"),
    "utf8"
  );

const selectorIds = new Set(
  Array.from(
    mainSource.matchAll(
      /querySelector\(\s*"#([^"]+)"\s*\)/g
    ),
    (match) => match[1]
  )
);

for (const id of selectorIds) {
  if (!htmlIds.has(id)) {
    errors.push(
      `Elemento HTML ausente para #${id}`
    );
  }
}

const workerSource =
  readFileSync(
    join(
      root,
      "service-worker.js"
    ),
    "utf8"
  );

const cacheMatch =
  workerSource.match(
    /const APP_SHELL = (\[[\s\S]*?\]);/
  );

if (!cacheMatch) {
  errors.push(
    "Lista APP_SHELL não encontrada no Service Worker."
  );
} else {
  try {
    const cachedFiles =
      JSON.parse(
        cacheMatch[1]
      );

    const cachedSet = new Set(
      cachedFiles.map((asset) =>
        asset.replace(/^\.\//, "")
      )
    );

    const runtimeFolders = [
      "js",
      "css",
      "assets/icons",
    ];

    for (const folder of runtimeFolders) {
      const folderPath = join(root, folder);

      for (const runtimeFile of walk(folderPath)) {
        const relativePath = relative(
          root,
          runtimeFile
        ).replaceAll("\\", "/");

        if (!cachedSet.has(relativePath)) {
          errors.push(
            `Arquivo de execução fora do cache: ${relativePath}`
          );
        }
      }
    }

    for (const asset of cachedFiles) {
      if (asset === "./") {
        continue;
      }

      const cleanPath =
        normalize(
          asset.replace(
            /^\.\//,
            ""
          )
        );

      if (
        cleanPath.startsWith("..")
      ) {
        errors.push(
          `Caminho inseguro no cache: ${asset}`
        );
        continue;
      }

      if (
        !existsSync(
          join(root, cleanPath)
        )
      ) {
        errors.push(
          `Arquivo do cache ausente: ${asset}`
        );
      }
    }
  } catch (error) {
    errors.push(
      `APP_SHELL inválido: ${error.message}`
    );
  }
}

const cloudConfigSource =
  readFileSync(
    join(
      root,
      "js/config/cloud-config.js"
    ),
    "utf8"
  );

if (
  /service[_-]?role/i.test(
    cloudConfigSource
  )
) {
  errors.push(
    "cloud-config.js não pode conter service_role."
  );
}

const phase12Sql =
  readFileSync(
    join(
      root,
      "supabase/snake-arena-phase12.sql"
    ),
    "utf8"
  );

for (const requiredSql of [
  "enable row level security",
  "auth.uid()",
  "snake_arena_cloud_saves",
  "snake_arena_leaderboard",
]) {
  if (
    !phase12Sql
      .toLowerCase()
      .includes(
        requiredSql.toLowerCase()
      )
  ) {
    errors.push(
      `SQL da Fase 12 não contém: ${requiredSql}`
    );
  }
}

const phase13Sql =
  readFileSync(
    join(
      root,
      "supabase/snake-arena-phase13-upgrade.sql"
    ),
    "utf8"
  );

for (const requiredSql of [
  "snake_arena_public_profiles",
  "snake_arena_public_matches",
  "enable row level security",
  "auth.uid()",
  "public_profile",
]) {
  if (
    !phase13Sql
      .toLowerCase()
      .includes(
        requiredSql.toLowerCase()
      )
  ) {
    errors.push(
      `SQL da Fase 13 não contém: ${requiredSql}`
    );
  }
}

if (errors.length > 0) {
  console.error(
    "\nValidação reprovada:\n"
  );

  for (const error of errors) {
    console.error(
      `- ${error}`
    );
  }

  process.exit(1);
}

console.log(
  "Snake Arena validado com sucesso."
);

console.log(
  `JavaScript: ${jsFiles.length} arquivos`
);

console.log(
  `Interface: ${selectorIds.size} seletores conferidos`
);

console.log(
  "Manifesto, ícones e cache offline aprovados."
);
