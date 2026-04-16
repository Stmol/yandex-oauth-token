const appStoreLinks = {
  yandex: {
    android: "https://play.google.com/store/apps/details?id=ru.yandex.searchplugin",
    ios: "https://apps.apple.com/us/app/%D1%8F%D0%BD%D0%B4%D0%B5%D0%BA%D1%81-%D1%81-%D0%B0%D0%BB%D0%B8%D1%81%D0%BE%D0%B9-ai/id1050704155",
  },
  yandexKey: {
    android: "https://play.google.com/store/apps/details?id=ru.yandex.key",
    ios: "https://apps.apple.com/us/app/%D1%8F%D0%BD%D0%B4%D0%B5%D0%BA%D1%81-id-%D0%BA%D0%BB%D1%8E%D1%87/id957324816",
  },
};

const appIcons = {
  yandex: "https://play-lh.googleusercontent.com/WFJgS6wkeaFCVFp3CH6mWOd2sRsWvOxILagnw33PFi4KFYnPsaeCGywSVwqJzwrHtJQ=w240-h480",
  yandexKey: "https://play-lh.googleusercontent.com/HXMHv8ALQLSKJMFvJkkniA73hMp9Y_mqwWwupSZrWu3wSicM-A8CqNzDB4db7BsF8T-JjSzV8P73WMnm0BWW=w240-h480",
};

const translations = {
  en: {
    pageTitle: "Safely get Yandex authorization tokens",
    languageSwitcherLabel: "Language switcher",
    hero: {
      eyebrow: "Authorization",
      title: "Safely get Yandex authorization tokens",
      descriptionHtml: `
        <p>Use this page to get a Yandex oauth token and then derive separate tokens for Yandex Music or Shedevrum only when you need them.</p>
        <p>Be careful with any token. It gives access to account data. Share tokens only with services and developers you fully trust.</p>
        <p>This page does not store your tokens. It keeps them only in this browser tab so you can copy them, and removes them after reload or close.</p>
      `,
    },
    controls: {
      start: "Generate QR code",
      pending: "Generating QR code...",
      copyPrimary: "Copy token",
      copyMusic: "Copy token",
      copyShedevrum: "Copy token",
      getMusic: "Get token",
      getShedevrum: "Get token",
      copied: "Copied",
      getting: "Getting token...",
      consent:
        "I understand all the risks and accept responsibility for violating Yandex service terms.",
    },
    features: [
      {
        title: "Get a QR code",
        description: "Accept the service terms and click the button to generate the QR code.",
      },
      {
        title: "Scan the code and confirm sign-in",
        descriptionHtml: `
        <p>Scan the QR code with one of the apps below and confirm sign-in on your device.</p>
          <ul class="feature-card__list">
            <li class="feature-card__item">
              <div class="feature-card__item-header">
                <img class="feature-card__item-icon" src="${appIcons.yandex}" alt="" width="32" height="32" loading="lazy" decoding="async">
                <span class="feature-card__item-label">Yandex app with Alice</span>
              </div>
              <span class="feature-card__apps">
                <a class="feature-card__app-link" href="${appStoreLinks.yandex.android}" target="_blank" rel="noreferrer noopener">Android</a>
                <a class="feature-card__app-link" href="${appStoreLinks.yandex.ios}" target="_blank" rel="noreferrer noopener">iOS</a>
              </span>
            </li>
            <li class="feature-card__item">
              <div class="feature-card__item-header">
                <img class="feature-card__item-icon" src="${appIcons.yandexKey}" alt="" width="32" height="32" loading="lazy" decoding="async">
                <span class="feature-card__item-label">Yandex Key app</span>
              </div>
              <span class="feature-card__apps">
                <a class="feature-card__app-link" href="${appStoreLinks.yandexKey.android}" target="_blank" rel="noreferrer noopener">Android</a>
                <a class="feature-card__app-link" href="${appStoreLinks.yandexKey.ios}" target="_blank" rel="noreferrer noopener">iOS</a>
              </span>
            </li>
          </ul>
        `,
      },
      {
        title: "Copy the required token",
        description:
          "After confirmation, the oauth token will appear first. Then you can request a separate Yandex Music Token or Shedevrum token and copy only the one you need.",
      },
    ],
    tokens: {
      primary: {
        eyebrow: "OAuth token",
        title: "Yandex oauth token",
        hint: "This base token is returned after QR confirmation. Keep it private and use it only to request service-specific tokens when required.",
      },
      music: {
        eyebrow: "Yandex Music",
        title: "Yandex Music Token",
        hint: "Request this token only if you need access for Yandex Music integrations.",
        placeholder: "No Yandex Music Token yet. Click the button to request it from the oauth token.",
      },
      shedevrum: {
        eyebrow: "Shedevrum",
        title: "Shedevrum token",
        hint: "Request this token only if you need access for Shedevrum integrations.",
        placeholder: "No Shedevrum token yet. Click the button to request it from the oauth token.",
      },
    },
    messages: {
      startHint: "A Yandex page has opened. Scan the QR code and confirm sign-in.",
      tokenReady:
        "The Yandex oauth token is ready. You can copy it now or request a separate Yandex Music Token or Shedevrum token.",
      primaryCopied: "The oauth token has been copied.",
      musicCopied: "The Yandex Music Token has been copied.",
      shedevrumCopied: "The Shedevrum token has been copied.",
      musicReady: "The Yandex Music Token is ready. Use Copy to place it into the clipboard.",
      shedevrumReady: "The Shedevrum token is ready. Use Copy to place it into the clipboard.",
    },
    errors: {
      start: "Failed to start Yandex authorization",
      poll: "Failed to check Yandex authorization",
      copy: "Failed to copy the token to the clipboard.",
      musicExchange: "Failed to get the Yandex Music token.",
      shedevrumExchange: "Failed to get the Shedevrum token.",
      primaryTokenAlreadyUsed:
        "This token has already been used for this service. Try again later, but not earlier than in 24 hours.",
      unknown: "Unknown error",
    },
    footer: {
      noteHtml: `
        <p>Yandex, Yandex ID, Yandex Music, Shedevrum and Yandex Key are trademarks and/or service marks of Yandex LLC and/or its affiliates. This site is provided for informational purposes only. The authors are not affiliated with Yandex and are not responsible for how this site is used.</p>
      `,
    },
  },
  ru: {
    pageTitle: "Безопасно получить токены авторизации Яндекса",
    languageSwitcherLabel: "Переключатель языка",
    hero: {
      eyebrow: "Авторизация",
      title: "Безопасно получить токены авторизации Яндекса",
      descriptionHtml: `
        <p>На этой странице можно получить oauth токен Яндекса, а затем при необходимости отдельно запросить токен для Яндекс Музыки или Шедеврума.</p>
        <p>Будьте внимательны при использовании любых токенов. Они дают доступ к данным аккаунта. Передавайте их только тем сервисам и разработчикам, которым полностью доверяете.</p>
        <p>Эта страница не хранит ваши токены. Они остаются только в текущей вкладке браузера для копирования и удаляются после перезагрузки или закрытия.</p>
      `,
    },
    controls: {
      start: "Сгенерировать QR-код",
      pending: "Генерирую QR-код...",
      copyPrimary: "Скопировать токен",
      copyMusic: "Скопировать токен",
      copyShedevrum: "Скопировать токен",
      getMusic: "Получить токен",
      getShedevrum: "Получить токен",
      copied: "Скопировано",
      getting: "Получаю токен...",
      consent:
        "Я понимаю все риски и несу ответственность за нарушение правил использования сервисов компании Яндекс",
    },
    features: [
      {
        title: "Получите QR-код",
        description: "Примите условия использования сервиса и нажмите кнопку, чтобы сгенерировать QR-код.",
      },
      {
        title: "Отсканируйте код и подтвердите вход",
        descriptionHtml: `
        <p>Откройте одно из приложений ниже, отсканируйте QR-код и подтвердите вход на своём устройстве.</p>
          <ul class="feature-card__list">
            <li class="feature-card__item">
              <div class="feature-card__item-header">
                <img class="feature-card__item-icon" src="${appIcons.yandex}" alt="" width="32" height="32" loading="lazy" decoding="async">
                <span class="feature-card__item-label">Яндекс с Алисой</span>
              </div>
              <span class="feature-card__apps">
                <a class="feature-card__app-link" href="${appStoreLinks.yandex.android}" target="_blank" rel="noreferrer noopener">Android</a>
                <a class="feature-card__app-link" href="${appStoreLinks.yandex.ios}" target="_blank" rel="noreferrer noopener">iOS</a>
              </span>
            </li>
            <li class="feature-card__item">
              <div class="feature-card__item-header">
                <img class="feature-card__item-icon" src="${appIcons.yandexKey}" alt="" width="32" height="32" loading="lazy" decoding="async">
                <span class="feature-card__item-label">Яндекс Ключ</span>
              </div>
              <span class="feature-card__apps">
                <a class="feature-card__app-link" href="${appStoreLinks.yandexKey.android}" target="_blank" rel="noreferrer noopener">Android</a>
                <a class="feature-card__app-link" href="${appStoreLinks.yandexKey.ios}" target="_blank" rel="noreferrer noopener">iOS</a>
              </span>
            </li>
          </ul>
        `,
      },
      {
        title: "Скопируйте нужный токен",
        description:
          "После подтверждения сначала появится oauth токен. Затем можно отдельно запросить токен Яндекс Музыки или токен Шедеврума и скопировать только нужный вариант.",
      },
    ],
    tokens: {
      primary: {
        eyebrow: "OAuth токен",
        title: "OAuth токен авторизации Яндекса",
        hint: "Это базовый токен, который возвращается после подтверждения QR-входа. Храните его приватно и используйте для запроса сервисных токенов только при необходимости.",
      },
      music: {
        eyebrow: "Яндекс Музыка",
        title: "Токен Яндекс Музыки",
        hint: "Запрашивайте этот токен только если нужен доступ для интеграций с Яндекс Музыкой.",
        placeholder: "Токен Яндекс Музыки ещё не получен. Нажмите кнопку, чтобы запросить его из oauth токена.",
      },
      shedevrum: {
        eyebrow: "Шедеврум",
        title: "Токен Шедеврума",
        hint: "Запрашивайте этот токен только если нужен доступ для интеграций с Шедеврумом.",
        placeholder: "Токен Шедеврума ещё не получен. Нажмите кнопку, чтобы запросить его из oauth токена.",
      },
    },
    messages: {
      startHint: "Открылась страница Яндекс. Отсканируйте QR-код и подтвердите вход.",
      tokenReady:
        "OAuth токен Яндекса готов. Теперь его можно скопировать или отдельно запросить токен Яндекс Музыки и токен Шедеврума.",
      primaryCopied: "OAuth токен скопирован.",
      musicCopied: "Токен Яндекс Музыки скопирован.",
      shedevrumCopied: "Токен Шедеврума скопирован.",
      musicReady: "Токен Яндекс Музыки готов. Нажмите кнопку копирования, чтобы поместить его в буфер обмена.",
      shedevrumReady: "Токен Шедеврума готов. Нажмите кнопку копирования, чтобы поместить его в буфер обмена.",
    },
    errors: {
      start: "Не удалось запустить авторизацию Яндекс",
      poll: "Не удалось проверить статус авторизации Яндекс",
      copy: "Не удалось скопировать токен в буфер обмена.",
      musicExchange: "Не удалось получить токен Яндекс Музыки.",
      shedevrumExchange: "Не удалось получить токен Шедеврума.",
      primaryTokenAlreadyUsed:
        "Этот токен уже использовался для этого сервиса. Попробуйте позже, но не раньше чем через сутки.",
      unknown: "Неизвестная ошибка",
    },
    footer: {
      noteHtml: `
        <p>Яндекс, Яндекс ID, Яндекс Музыка, Шедеврум и Яндекс Ключ являются товарными знаками и/или знаками обслуживания ООО «Яндекс» и/или его аффилированных лиц. Сайт создан исключительно в ознакомительных целях. Авторы не аффилированы с Яндексом и не несут ответственности за то, как этот ресурс используется.</p>
      `,
    },
  },
};

const elements = {
  startButton: document.querySelector("#start-button"),
  consentCheckbox: document.querySelector("#consent-checkbox"),
  consentToggle: document.querySelector("#consent-toggle"),
  heroActions: document.querySelector("#hero-actions"),
  message: document.querySelector("#message"),
  error: document.querySelector("#error"),
  features: document.querySelector(".features"),
  tokenSection: document.querySelector("#token-section"),
  primaryTokenCard: document.querySelector("#primary-token-card"),
  musicTokenCard: document.querySelector("#music-token-card"),
  shedevrumTokenCard: document.querySelector("#shedevrum-token-card"),
  primaryTokenOutput: document.querySelector("#primary-token-output"),
  musicTokenOutput: document.querySelector("#music-token-output"),
  shedevrumTokenOutput: document.querySelector("#shedevrum-token-output"),
  musicTokenPlaceholder: document.querySelector("#music-token-placeholder"),
  shedevrumTokenPlaceholder: document.querySelector("#shedevrum-token-placeholder"),
  primaryCopyButton: document.querySelector("#primary-copy-button"),
  musicActionButton: document.querySelector("#music-action-button"),
  shedevrumActionButton: document.querySelector("#shedevrum-action-button"),
  languageSwitch: document.querySelector("#language-switch"),
  langButtons: document.querySelectorAll("[data-lang]"),
  i18nNodes: document.querySelectorAll("[data-i18n], [data-i18n-html]"),
};

const AUTH_WINDOW_NAME = "yandex-auth-flow";

const state = {
  lang: getInitialLanguage(),
  primaryToken: "",
  musicToken: "",
  shedevrumToken: "",
  musicLoading: false,
  shedevrumLoading: false,
  polling: false,
  pollInFlight: false,
  pollTimer: null,
  pending: false,
  authSessionId: 0,
  primaryTokenVersion: 0,
  serviceRequestIds: {
    music: 0,
    shedevrum: 0,
  },
  messageKey: "",
  errorText: "",
  copyFlash: {
    primary: 0,
    music: 0,
    shedevrum: 0,
  },
  authWindow: null,
};

elements.startButton?.addEventListener("click", () => {
  void startAuth();
});

elements.consentCheckbox?.addEventListener("change", render);

elements.primaryCopyButton?.addEventListener("click", () => {
  void handlePrimaryCopy();
});

elements.musicActionButton?.addEventListener("click", () => {
  void handleServiceAction("music");
});

elements.shedevrumActionButton?.addEventListener("click", () => {
  void handleServiceAction("shedevrum");
});

for (const button of elements.langButtons) {
  button.addEventListener("click", () => {
    const { lang } = button.dataset;

    if (lang && lang !== state.lang && translations[lang]) {
      state.lang = lang;
      render();
    }
  });
}

window.addEventListener("beforeunload", () => {
  stopPolling();
  closeAuthWindow();
});

render();

async function startAuth() {
  const authSessionId = beginAuthSession();
  stopPolling();
  state.pending = true;
  resetCopyFlash();
  resetTokens();
  clearStatus();
  const authWindow = openAuthWindow();
  render();

  try {
    const response = await fetchJson("/api/yandex-token/session", {
      method: "POST",
    });

    if (!isCurrentAuthSession(authSessionId)) {
      if (authWindow && !authWindow.closed) {
        authWindow.close();
      }

      return;
    }

    navigateAuthWindow(response.authUrl);
    startPolling(authSessionId);
    setMessage("startHint");
  } catch (error) {
    if (!isCurrentAuthSession(authSessionId)) {
      return;
    }

    setError(getErrorMessage(error, "start"));

    if (authWindow && !authWindow.closed) {
      authWindow.close();
    }
  } finally {
    if (isCurrentAuthSession(authSessionId)) {
      state.pending = false;
      render();
    }
  }
}

function startPolling(authSessionId) {
  if (state.polling) {
    return;
  }

  state.polling = true;
  render();

  state.pollTimer = window.setInterval(() => {
    void pollAuth(authSessionId);
  }, 2000);

  void pollAuth(authSessionId);
}

function stopPolling() {
  state.polling = false;
  state.pollInFlight = false;

  if (state.pollTimer) {
    window.clearInterval(state.pollTimer);
    state.pollTimer = null;
  }

  render();
}

async function pollAuth(authSessionId) {
  if (!state.polling || state.pollInFlight || !isCurrentAuthSession(authSessionId)) {
    return;
  }

  state.pollInFlight = true;

  try {
    const response = await fetchJson("/api/yandex-token/poll", {
      method: "POST",
    });

    if (!isCurrentAuthSession(authSessionId)) {
      return;
    }

    if (response.status === "pending") {
      return;
    }

    const primaryToken = response.primaryToken || response.token || "";
    setPrimaryToken(primaryToken, authSessionId);
    clearServiceTokens();
    setMessage("tokenReady");
    stopPolling();
    finishAuthWindow();
  } catch (error) {
    if (!isCurrentAuthSession(authSessionId)) {
      return;
    }

    setError(getErrorMessage(error, "poll"));
    stopPolling();
  } finally {
    if (isCurrentAuthSession(authSessionId)) {
      state.pollInFlight = false;
      render();
    }
  }
}

async function handlePrimaryCopy() {
  await copyToken(state.primaryToken, "primary");
}

async function handleServiceAction(service) {
  const token = getServiceToken(service);

  if (token) {
    await copyToken(token, service);
    return;
  }

  await requestServiceToken(service);
}

async function requestServiceToken(service) {
  if (!state.primaryToken) {
    return;
  }

  const requestId = beginServiceRequest(service);
  const authSessionId = state.authSessionId;
  const primaryToken = state.primaryToken;
  const primaryTokenVersion = state.primaryTokenVersion;

  setServiceLoading(service, true);
  clearStatus();
  render();

  try {
    const response = await fetchJson(`/api/yandex-token/exchange/${service}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        primaryToken,
      }),
    });

    if (!isCurrentServiceRequest(service, requestId, authSessionId, primaryToken, primaryTokenVersion)) {
      return;
    }

    if (!response.token) {
      throw new Error(t("errors.unknown"));
    }

    setServiceToken(service, response.token);
    setMessage(service === "music" ? "musicReady" : "shedevrumReady");
  } catch (error) {
    if (!isCurrentServiceRequest(service, requestId, authSessionId, primaryToken, primaryTokenVersion)) {
      return;
    }

    setError(getErrorMessage(error, service === "music" ? "musicExchange" : "shedevrumExchange"));
  } finally {
    if (isCurrentServiceRequest(service, requestId, authSessionId, primaryToken, primaryTokenVersion)) {
      setServiceLoading(service, false);
      render();
    }
  }
}

async function copyToken(token, kind) {
  if (!token) {
    return;
  }

  try {
    await navigator.clipboard.writeText(token);
    setMessage(`${kind}Copied`);
    flashCopied(kind);
    render();
  } catch {
    setError(t("errors.copy"));
    render();
  }
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || t("errors.unknown"));
  }

  return data;
}

function resetTokens() {
  state.primaryToken = "";
  state.primaryTokenVersion += 1;
  clearServiceTokens();
}

function clearServiceTokens() {
  invalidateServiceRequests();
  state.musicToken = "";
  state.shedevrumToken = "";
  state.musicLoading = false;
  state.shedevrumLoading = false;
}

function setPrimaryToken(value, authSessionId = state.authSessionId) {
  if (!isCurrentAuthSession(authSessionId)) {
    return;
  }

  state.primaryToken = value;
  state.primaryTokenVersion += 1;
  invalidateServiceRequests();
}

function setServiceToken(service, value) {
  if (service === "music") {
    state.musicToken = value;
    return;
  }

  state.shedevrumToken = value;
}

function getServiceToken(service) {
  return service === "music" ? state.musicToken : state.shedevrumToken;
}

function setServiceLoading(service, loading) {
  if (service === "music") {
    state.musicLoading = loading;
    return;
  }

  state.shedevrumLoading = loading;
}

function flashCopied(kind) {
  state.copyFlash[kind] = Date.now() + 1500;

  window.setTimeout(() => {
    if (Date.now() >= state.copyFlash[kind]) {
      state.copyFlash[kind] = 0;
      render();
    }
  }, 1600);
}

function resetCopyFlash() {
  state.copyFlash.primary = 0;
  state.copyFlash.music = 0;
  state.copyFlash.shedevrum = 0;
}

function beginAuthSession() {
  state.authSessionId += 1;
  return state.authSessionId;
}

function isCurrentAuthSession(authSessionId) {
  return authSessionId === state.authSessionId;
}

function invalidateServiceRequests() {
  state.serviceRequestIds.music += 1;
  state.serviceRequestIds.shedevrum += 1;
}

function beginServiceRequest(service) {
  state.serviceRequestIds[service] += 1;
  return state.serviceRequestIds[service];
}

function isCurrentServiceRequest(service, requestId, authSessionId, primaryToken, primaryTokenVersion) {
  return (
    requestId === state.serviceRequestIds[service] &&
    authSessionId === state.authSessionId &&
    primaryToken === state.primaryToken &&
    primaryTokenVersion === state.primaryTokenVersion
  );
}

function clearStatus() {
  state.messageKey = "";
  state.errorText = "";
}

function setMessage(messageKey) {
  state.messageKey = messageKey;
  state.errorText = "";
}

function setError(errorText) {
  state.errorText = errorText;
  state.messageKey = "";
}

function render() {
  document.documentElement.lang = state.lang;
  document.title = t("pageTitle");
  elements.languageSwitch?.setAttribute("aria-label", t("languageSwitcherLabel"));

  for (const node of elements.i18nNodes) {
    const htmlKey = node.dataset.i18nHtml;

    if (htmlKey) {
      node.innerHTML = t(htmlKey);
      continue;
    }

    const key = node.dataset.i18n;

    if (!key) {
      continue;
    }

    node.textContent = t(key);
  }

  for (const button of elements.langButtons) {
    const active = button.dataset.lang === state.lang;
    button.setAttribute("aria-pressed", String(active));
  }

  const consentAccepted = Boolean(elements.consentCheckbox?.checked);
  const hasPrimaryToken = Boolean(state.primaryToken);
  const musicReady = Boolean(state.musicToken);
  const shedevrumReady = Boolean(state.shedevrumToken);

  elements.startButton.disabled = state.pending || state.polling || !consentAccepted;
  elements.startButton.textContent = state.pending ? t("controls.pending") : t("controls.start");

  elements.primaryCopyButton.disabled = !hasPrimaryToken;
  elements.primaryCopyButton.textContent =
    state.copyFlash.primary > Date.now() ? t("controls.copied") : t("controls.copyPrimary");

  elements.musicActionButton.disabled = !hasPrimaryToken || state.musicLoading;
  elements.musicActionButton.textContent = getServiceButtonLabel("music", musicReady, state.musicLoading);

  elements.shedevrumActionButton.disabled = !hasPrimaryToken || state.shedevrumLoading;
  elements.shedevrumActionButton.textContent = getServiceButtonLabel(
    "shedevrum",
    shedevrumReady,
    state.shedevrumLoading,
  );

  const message = state.messageKey ? t(`messages.${state.messageKey}`) : "";
  elements.message.textContent = message;
  elements.message.classList.toggle("is-hidden", !message);

  elements.error.textContent = state.errorText;
  elements.error.classList.toggle("is-hidden", !state.errorText);

  elements.primaryTokenOutput.textContent = hasPrimaryToken
    ? getMaskedTokenDisplay(state.primaryToken)
    : "";

  updateServiceCard({
    card: elements.musicTokenCard,
    output: elements.musicTokenOutput,
    placeholder: elements.musicTokenPlaceholder,
    token: state.musicToken,
    hasPrimaryToken,
    loading: state.musicLoading,
    placeholderKey: "tokens.music.placeholder",
  });

  updateServiceCard({
    card: elements.shedevrumTokenCard,
    output: elements.shedevrumTokenOutput,
    placeholder: elements.shedevrumTokenPlaceholder,
    token: state.shedevrumToken,
    hasPrimaryToken,
    loading: state.shedevrumLoading,
    placeholderKey: "tokens.shedevrum.placeholder",
  });

  elements.tokenSection?.classList.toggle("is-hidden", !hasPrimaryToken);
  elements.primaryTokenCard?.classList.toggle("is-hidden", !hasPrimaryToken);
  elements.features?.classList.toggle("is-hidden", hasPrimaryToken);
  elements.consentToggle?.classList.toggle("is-hidden", hasPrimaryToken);
  elements.heroActions?.classList.toggle("is-hidden", hasPrimaryToken);
}

function updateServiceCard({ card, output, placeholder, token, hasPrimaryToken, loading, placeholderKey }) {
  const hasToken = Boolean(token);
  card?.classList.toggle("is-hidden", !hasPrimaryToken);
  output.textContent = hasToken ? getMaskedTokenDisplay(token) : "";
  output.classList.toggle("is-hidden", !hasToken);
  placeholder.classList.toggle("is-hidden", hasToken);

  if (!hasToken) {
    placeholder.textContent = loading ? t("controls.getting") : t(placeholderKey);
  }
}

function getServiceButtonLabel(service, hasToken, loading) {
  if (loading) {
    return t("controls.getting");
  }

  if (state.copyFlash[service] > Date.now()) {
    return t("controls.copied");
  }

  if (hasToken) {
    return service === "music" ? t("controls.copyMusic") : t("controls.copyShedevrum");
  }

  return service === "music" ? t("controls.getMusic") : t("controls.getShedevrum");
}

function getMaskedTokenDisplay(token) {
  if (!token) {
    return "";
  }

  if (token.length <= 4) {
    return "*".repeat(token.length);
  }

  if (token.length <= 8) {
    return `${token.slice(0, 1)}${"*".repeat(token.length - 2)}${token.slice(-1)}`;
  }

  const visibleStart = Math.min(4, Math.max(2, Math.floor(token.length * 0.12)));
  const visibleEnd = Math.min(3, Math.max(1, Math.floor(token.length * 0.08)));
  const maskedLength = Math.max(6, token.length - visibleStart - visibleEnd);
  const hiddenEnd = token.length - visibleEnd;

  return `${token.slice(0, visibleStart)}${"*".repeat(maskedLength)}${token.slice(hiddenEnd)}`;
}

function t(path) {
  const value = path.split(".").reduce((accumulator, key) => accumulator?.[key], translations[state.lang]);

  return typeof value === "string" ? value : path;
}

function getErrorMessage(error, fallbackKey) {
  if (error instanceof Error && error.message) {
    if (error.message.startsWith("This primaryToken has already been used for ")) {
      return t("errors.primaryTokenAlreadyUsed");
    }

    return error.message;
  }

  return t(`errors.${fallbackKey}`);
}

function getInitialLanguage() {
  return navigator.language?.toLowerCase().startsWith("ru") ? "ru" : "en";
}

function openAuthWindow() {
  if (state.authWindow && !state.authWindow.closed) {
    state.authWindow.focus();
    return state.authWindow;
  }

  state.authWindow = window.open("", AUTH_WINDOW_NAME);
  return state.authWindow;
}

function navigateAuthWindow(url) {
  const authWindow = openAuthWindow();

  if (!authWindow) {
    window.open(url, AUTH_WINDOW_NAME);
    return;
  }

  authWindow.location.replace(url);
  authWindow.focus();
}

function finishAuthWindow() {
  const authWindow = state.authWindow;
  state.authWindow = null;

  if (!authWindow || authWindow.closed) {
    return;
  }

  authWindow.close();

  if (authWindow.closed) {
    return;
  }

  authWindow.location.replace(window.location.href);
  authWindow.focus();
}

function closeAuthWindow() {
  if (!state.authWindow || state.authWindow.closed) {
    state.authWindow = null;
    return;
  }

  state.authWindow.close();
  state.authWindow = null;
}
