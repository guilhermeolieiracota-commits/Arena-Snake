import {
  normalizeProjectUrl,
} from "../config/cloud-config.js";

const JSON_HEADERS = Object.freeze({
  "Content-Type": "application/json",
});

export class SupabaseRequestError extends Error {
  constructor(
    message,
    {
      status = 0,
      code = "",
      details = null,
    } = {}
  ) {
    super(message);
    this.name = "SupabaseRequestError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class SupabaseRestClient {
  constructor({
    projectUrl,
    publishableKey,
    fetchImpl = globalThis.fetch,
  }) {
    this.projectUrl =
      normalizeProjectUrl(projectUrl);
    this.publishableKey = String(
      publishableKey ?? ""
    ).trim();
    this.fetchImpl = fetchImpl;
    this.pendingControllers = new Set();
  }

  get configured() {
    return Boolean(
      this.projectUrl &&
        this.publishableKey &&
        this.fetchImpl
    );
  }

  async signUp({
    email,
    password,
    nickname,
    redirectTo,
  }) {
    const query = redirectTo
      ? `?redirect_to=${encodeURIComponent(redirectTo)}`
      : "";

    return this.requestAuth(
      `/auth/v1/signup${query}`,
      {
        method: "POST",
        body: {
          email,
          password,
          data: {
            nickname,
          },
        },
      }
    );
  }

  async signInWithPassword({
    email,
    password,
  }) {
    return this.requestAuth(
      "/auth/v1/token?grant_type=password",
      {
        method: "POST",
        body: {
          email,
          password,
        },
      }
    );
  }

  async requestPasswordRecovery({
    email,
    redirectTo,
  }) {
    const query = redirectTo
      ? `?redirect_to=${encodeURIComponent(redirectTo)}`
      : "";

    return this.requestAuth(
      `/auth/v1/recover${query}`,
      {
        method: "POST",
        body: {
          email,
        },
      }
    );
  }

  async resendSignupConfirmation({
    email,
    redirectTo,
  }) {
    return this.requestAuth(
      "/auth/v1/resend",
      {
        method: "POST",
        body: {
          type: "signup",
          email,
          options: redirectTo
            ? {
                email_redirect_to:
                  redirectTo,
              }
            : undefined,
        },
      }
    );
  }

  async updateUser(
    accessToken,
    attributes
  ) {
    return this.requestAuth(
      "/auth/v1/user",
      {
        method: "PUT",
        accessToken,
        body: attributes,
      }
    );
  }

  async refreshSession(
    refreshToken
  ) {
    return this.requestAuth(
      "/auth/v1/token?grant_type=refresh_token",
      {
        method: "POST",
        body: {
          refresh_token:
            refreshToken,
        },
      }
    );
  }

  async getUser(accessToken) {
    return this.requestAuth(
      "/auth/v1/user",
      {
        method: "GET",
        accessToken,
      }
    );
  }

  async signOut(accessToken) {
    return this.requestAuth(
      "/auth/v1/logout?scope=local",
      {
        method: "POST",
        accessToken,
      }
    );
  }

  async requestAuth(
    path,
    {
      method = "GET",
      body,
      accessToken,
    } = {}
  ) {
    return this.request(
      `${this.projectUrl}${path}`,
      {
        method,
        body,
        headers: {
          ...JSON_HEADERS,
          apikey:
            this.publishableKey,
          Authorization:
            `Bearer ${
              accessToken ??
              this.publishableKey
            }`,
        },
      }
    );
  }

  async dataRequest(
    resource,
    {
      method = "GET",
      query = "",
      body,
      accessToken,
      prefer,
    } = {}
  ) {
    const safeResource = String(
      resource
    ).replace(/^\/+/, "");

    const suffix = query
      ? `?${query}`
      : "";

    return this.request(
      `${this.projectUrl}/rest/v1/${safeResource}${suffix}`,
      {
        method,
        body,
        headers: {
          ...JSON_HEADERS,
          apikey:
            this.publishableKey,
          Authorization:
            `Bearer ${
              accessToken ??
              this.publishableKey
            }`,
          ...(prefer
            ? { Prefer: prefer }
            : {}),
        },
      }
    );
  }

  translateAuthError(message, status = 0, code = "") {
    const normalized = String(message || "").toLowerCase();
    const normalizedCode = String(code || "").toLowerCase();

    if (
      normalized.includes("user already registered") ||
      normalizedCode.includes("user_already_exists")
    ) {
      return "Este e-mail já está cadastrado. Use Entrar ou recuperar a senha.";
    }

    if (
      normalized.includes("email not confirmed") ||
      normalizedCode.includes("email_not_confirmed")
    ) {
      return "Confirme seu e-mail antes de entrar. Verifique também a pasta de spam.";
    }

    if (
      normalized.includes("signup is disabled") ||
      normalized.includes("signups not allowed")
    ) {
      return "A criação de contas está desativada no Supabase. Ative o provedor de e-mail em Authentication.";
    }

    if (
      normalized.includes("rate limit") ||
      status === 429
    ) {
      return "Muitas tentativas foram feitas. Aguarde alguns minutos e tente novamente.";
    }

    if (
      normalized.includes("password") &&
      normalized.includes("6")
    ) {
      return "A senha precisa ter pelo menos 6 caracteres.";
    }

    if (
      normalized.includes("invalid email") ||
      normalized.includes("validate email")
    ) {
      return "Digite um endereço de e-mail válido.";
    }

    if (
      normalized.includes("invalid login credentials")
    ) {
      return "E-mail ou senha incorretos.";
    }

    return String(message || "Não foi possível concluir a operação.");
  }

  abortPendingRequests() {
    for (const controller of this.pendingControllers) {
      try {
        controller.abort();
      } catch {
        // Sem ação necessária.
      }
    }

    this.pendingControllers.clear();
  }

  async request(
    url,
    {
      method,
      body,
      headers,
    }
  ) {
    if (!this.configured) {
      throw new SupabaseRequestError(
        "A conexão Supabase ainda não foi configurada."
      );
    }

    const controller = new AbortController();
    this.pendingControllers.add(controller);

    const timeoutId = globalThis.setTimeout(
      () => controller.abort(),
      15000
    );

    let response;

    try {
      response = await this.fetchImpl(
        url,
        {
          method,
          headers,
          signal: controller.signal,
          body:
            body === undefined
              ? undefined
              : JSON.stringify(body),
        }
      );
    } catch (error) {
      const aborted =
        error?.name === "AbortError";

      throw new SupabaseRequestError(
        aborted
          ? "A conexão demorou demais ou foi interrompida. Tente novamente."
          : "Não foi possível conectar ao servidor.",
        {
          details: error,
        }
      );
    } finally {
      globalThis.clearTimeout(timeoutId);
      this.pendingControllers.delete(controller);
    }

    const raw = await response.text();

    let payload = null;

    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = raw;
      }
    }

    if (!response.ok) {
      const sourceMessage =
        payload?.msg ??
        payload?.message ??
        payload?.error_description ??
        payload?.error ??
        `Erro HTTP ${response.status}`;

      const code =
        payload?.code ??
        payload?.error_code ??
        "";

      throw new SupabaseRequestError(
        this.translateAuthError(
          sourceMessage,
          response.status,
          code
        ),
        {
          status: response.status,
          code,
          details: payload,
        }
      );
    }

    return payload;
  }
}
