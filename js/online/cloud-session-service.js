const SESSION_KEY =
  "snake_arena_cloud_session";

const clone = (value) =>
  value
    ? JSON.parse(
        JSON.stringify(value)
      )
    : null;

export class CloudSessionService {
  constructor({
    client,
    storage = window.localStorage,
    onChange,
  }) {
    this.client = client;
    this.storage = storage;
    this.onChange = onChange;
    this.session =
      this.loadStoredSession();
  }

  get isSignedIn() {
    return Boolean(
      this.session?.accessToken &&
        this.session?.refreshToken &&
        this.session?.user?.id
    );
  }

  getSnapshot() {
    return clone(this.session);
  }

  async signUp({
    email,
    password,
    nickname,
  }) {
    const response =
      await this.client.signUp({
        email,
        password,
        nickname,
      });

    if (
      response?.access_token
    ) {
      this.saveSession(
        this.normalizeSession(
          response
        )
      );
    }

    return {
      session:
        this.getSnapshot(),
      user:
        response?.user ??
        null,
      confirmationRequired:
        !response?.access_token,
    };
  }

  async requestPasswordRecovery({
    email,
    redirectTo,
  }) {
    await this.client
      .requestPasswordRecovery({
        email,
        redirectTo,
      });

    return {
      sent: true,
    };
  }

  async resendSignupConfirmation({
    email,
    redirectTo,
  }) {
    await this.client
      .resendSignupConfirmation({
        email,
        redirectTo,
      });

    return {
      sent: true,
    };
  }

  async consumeAuthRedirect(
    url = window.location.href
  ) {
    const parsed =
      new URL(url);

    const hash =
      new URLSearchParams(
        parsed.hash.replace(
          /^#/,
          ""
        )
      );

    const type =
      hash.get("type");

    const accessToken =
      hash.get("access_token");

    const refreshToken =
      hash.get("refresh_token");

    if (
      !accessToken ||
      !refreshToken
    ) {
      return {
        consumed: false,
        type: null,
      };
    }

    const user =
      await this.client.getUser(
        accessToken
      );

    const expiresIn =
      Math.max(
        60,
        Number(
          hash.get("expires_in")
        ) || 3600
      );

    this.saveSession({
      accessToken,
      refreshToken,
      expiresAt:
        Date.now() +
        expiresIn * 1000,
      tokenType:
        hash.get("token_type") ??
        "bearer",
      user,
    });

    parsed.hash = "";
    parsed.searchParams.delete(
      "type"
    );

    window.history.replaceState(
      {},
      document.title,
      `${parsed.pathname}${parsed.search}`
    );

    return {
      consumed: true,
      type,
    };
  }

  async updatePassword(
    newPassword
  ) {
    const token =
      await this.getAccessToken();

    if (!token) {
      throw new Error(
        "A sessão de recuperação não está ativa."
      );
    }

    const user =
      await this.client.updateUser(
        token,
        {
          password:
            newPassword,
        }
      );

    this.session = {
      ...this.session,
      user:
        user?.user ??
        user ??
        this.session.user,
    };

    this.persist();
    this.onChange?.(
      this.getSnapshot()
    );

    return this.getSnapshot();
  }

  async signIn({
    email,
    password,
  }) {
    const response =
      await this.client
        .signInWithPassword({
          email,
          password,
        });

    const session =
      this.normalizeSession(
        response
      );

    this.saveSession(session);
    return this.getSnapshot();
  }

  async getAccessToken() {
    if (!this.isSignedIn) {
      return null;
    }

    const expiresSoon =
      this.session.expiresAt -
        Date.now() <
      90_000;

    if (!expiresSoon) {
      return this.session.accessToken;
    }

    try {
      const response =
        await this.client
          .refreshSession(
            this.session
              .refreshToken
          );

      this.saveSession(
        this.normalizeSession(
          response
        )
      );

      return this.session.accessToken;
    } catch (error) {
      this.clearSession();
      throw error;
    }
  }

  async validateSession() {
    const accessToken =
      await this.getAccessToken();

    if (!accessToken) {
      return null;
    }

    const user =
      await this.client.getUser(
        accessToken
      );

    this.session = {
      ...this.session,
      user,
    };

    this.persist();
    this.onChange?.(
      this.getSnapshot()
    );

    return this.getSnapshot();
  }

  async signOut() {
    const accessToken =
      this.session?.accessToken;

    this.clearSession();

    if (!accessToken) {
      return;
    }

    try {
      await this.client.signOut(
        accessToken
      );
    } catch {
      // A sessão local já foi removida.
    }
  }

  normalizeSession(response) {
    const accessToken =
      response?.access_token;

    const refreshToken =
      response?.refresh_token;

    const user =
      response?.user;

    if (
      !accessToken ||
      !refreshToken ||
      !user?.id
    ) {
      throw new Error(
        "O servidor não retornou uma sessão válida."
      );
    }

    const expiresIn =
      Math.max(
        60,
        Number(
          response.expires_in
        ) || 3600
      );

    return {
      accessToken,
      refreshToken,
      expiresAt:
        Date.now() +
        expiresIn * 1000,
      tokenType:
        response.token_type ??
        "bearer",
      user,
    };
  }

  saveSession(session) {
    this.session = session;
    this.persist();
    this.onChange?.(
      this.getSnapshot()
    );
  }

  clearSession() {
    this.session = null;

    try {
      this.storage.removeItem(
        SESSION_KEY
      );
    } catch {
      // Sem armazenamento persistente.
    }

    this.onChange?.(null);
  }

  persist() {
    try {
      this.storage.setItem(
        SESSION_KEY,
        JSON.stringify(
          this.session
        )
      );
    } catch {
      // A sessão permanece em memória.
    }
  }

  loadStoredSession() {
    try {
      const raw =
        this.storage.getItem(
          SESSION_KEY
        );

      if (!raw) {
        return null;
      }

      const parsed =
        JSON.parse(raw);

      if (
        !parsed?.accessToken ||
        !parsed?.refreshToken ||
        !parsed?.user?.id
      ) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }
}
