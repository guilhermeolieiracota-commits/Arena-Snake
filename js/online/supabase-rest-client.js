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
  }) {
    return this.requestAuth(
      "/auth/v1/signup",
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

    let response;

    try {
      response =
        await this.fetchImpl(
          url,
          {
            method,
            headers,
            body:
              body === undefined
                ? undefined
                : JSON.stringify(
                    body
                  ),
          }
        );
    } catch (error) {
      throw new SupabaseRequestError(
        "Não foi possível conectar ao servidor.",
        {
          details: error,
        }
      );
    }

    const raw =
      await response.text();

    let payload = null;

    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = raw;
      }
    }

    if (!response.ok) {
      const message =
        payload?.msg ??
        payload?.message ??
        payload?.error_description ??
        payload?.error ??
        `Erro HTTP ${response.status}`;

      throw new SupabaseRequestError(
        String(message),
        {
          status:
            response.status,
          code:
            payload?.code ??
            payload?.error_code ??
            "",
          details:
            payload,
        }
      );
    }

    return payload;
  }
}
