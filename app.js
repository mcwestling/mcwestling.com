(() => {
  const allVariants = ["flop", "loaf", "face", "walk"];
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("gigi");
  const forcedVariant = allVariants.includes(forced) ? forced : null;
  const selectionSource = forcedVariant
    ? "query"
    : forced === "none"
      ? "query_none"
      : forced
        ? "invalid_query_random"
        : "random";
  const randomItem = (items) =>
    items[Math.floor(Math.random() * items.length)];
  const lerp = (start, end, amount) =>
    start + (end - start) * amount;
  const round = (value) => Math.round(value * 1000) / 1000;
  const type = forced === "none"
    ? "none"
    : forcedVariant || randomItem(allVariants);
  const state = {
    type,
    isVisible: type !== "none",
    selectionSource,
    queryValue: forced,
    x: Math.random(),
    depth: Math.random(),
    windowSlot: Math.floor(Math.random() * 6),
    walkDirection: Math.random() < 0.5 ? -1 : 1,
    walkLayer: Math.random() < 0.5 ? "back" : "front",
    walkDepth: Math.random(),
    walkProgress: 0,
  };
  const iterationId = state.type === "face"
    ? `face:slot-${state.windowSlot}`
    : state.type === "walk"
      ? [
          "walk",
          state.walkLayer,
          state.walkDirection > 0 ? "right" : "left",
          `depth-${round(state.walkDepth)}`,
          `progress-${round(state.walkProgress)}`,
        ].join(":")
      : state.isVisible
        ? [
            state.type,
            `x-${round(state.x)}`,
            `depth-${round(state.depth)}`,
          ].join(":")
        : "none";

  window.__gigiIteration = state;
  window.__gigiPostHogProperties = {
    gigi_iteration: state.type,
    gigi_iteration_id: iterationId,
    gigi_selection_source: selectionSource,
    gigi_query_value: forced,
    gigi_visible: state.isVisible,
    gigi_x: round(state.x),
    gigi_depth: round(state.depth),
    gigi_window_slot: state.windowSlot,
    gigi_walk_direction: state.walkDirection > 0 ? "right" : "left",
    gigi_walk_layer: state.walkLayer,
    gigi_walk_depth: round(state.walkDepth),
    gigi_walk_progress: round(state.walkProgress),
  };
})();

!function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="Rn Ln init Gn Jn Si Zn Yn Vn capture calculateEventProperties ns register register_once register_for_session unregister unregister_for_session ls getFeatureFlag getFeatureFlagPayload getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync us identify setPersonProperties unsetPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset setIdentity clearIdentity get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException addExceptionStep captureLog startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty ss ts createPersonProfile setInternalOrTestUser os Un ds opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Xn debug Ii mr getPageViewId captureTraceFeedback captureTraceMetric jn".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init('phc_qxQXK6XSDxqaFjsVHpA8CKUuHQbku69fwNsBMeLQ4xBH', {
  api_host: 'https://u.mcwestling.com',
  ui_host: 'https://us.posthog.com',
  defaults: '2026-05-30',
  capture_pageview: false,
  capture_pageleave: true,
  disable_session_recording: true,
  autocapture: {
    dom_event_allowlist: ['click'],
    element_allowlist: ['a'],
  },
});
posthog.register_for_session(window.__gigiPostHogProperties);
posthog.capture('$pageview', window.__gigiPostHogProperties);

(() => {
  const stage = document.querySelector(".gigi-stage");
  const logo = document.querySelector(".logo");
  const contact = document.querySelector(".contact");

  if (!stage || !logo || !contact) {
    return;
  }

  const assets = {
    flop: {
      src: "assets/gigi/gigi-flop.png",
      aspect: 383 / 652,
      minScale: 0.15,
      maxScale: 0.56,
      maxWidth: 300,
    },
    loaf: {
      src: "assets/gigi/gigi-loaf.png",
      aspect: 345 / 490,
      minScale: 0.14,
      maxScale: 0.48,
      maxWidth: 270,
    },
    face: {
      src: "assets/gigi/gigi-face.png",
    },
    walk: {
      src: "assets/gigi/gigi-walk.gif",
      aspect: 53 / 116,
    },
  };
  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);
  const lerp = (start, end, amount) =>
    start + (end - start) * amount;
  const px = (value) => `${Math.round(value)}px`;

  const windowSlots = [
    { left: 0.143, top: 0.404, width: 0.036, height: 0.09 },
    { left: 0.143, top: 0.657, width: 0.036, height: 0.08 },
    { left: 0.435, top: 0.429, width: 0.037, height: 0.078 },
    { left: 0.54, top: 0.429, width: 0.037, height: 0.078 },
    { left: 0.826, top: 0.404, width: 0.036, height: 0.09 },
    { left: 0.826, top: 0.657, width: 0.036, height: 0.08 },
  ];

  const state = window.__gigiIteration;

  if (!state?.isVisible) {
    return;
  }

  let cameo;

  const placeGroundGigi = () => {
    const asset = assets[state.type];
    const logoRect = logo.getBoundingClientRect();
    const contactRect = contact.getBoundingClientRect();
    const horizonY = window.innerHeight * 0.5;
    const groundStart = Math.max(
      logoRect.bottom - logoRect.height * 0.04,
      horizonY + 16
    );
    const groundEnd = Math.max(
      groundStart + 48,
      contactRect.top - 12
    );
    const depth = 0.08 + state.depth * 0.92;
    const anchorY = lerp(groundStart, groundEnd, depth);
    const perspective = clamp(
      (anchorY - horizonY) / Math.max(contactRect.top - horizonY, 1),
      0,
      1
    );
    const nearScale = perspective ** 1.15;
    const width = clamp(
      logoRect.width *
        lerp(asset.minScale, asset.maxScale, nearScale),
      48,
      Math.min(asset.maxWidth, window.innerWidth * 0.56)
    );
    const height = width * asset.aspect;
    const wideViewport = clamp(
      (window.innerWidth - logoRect.width) / logoRect.width,
      0,
      2
    );
    const horizontalSpan = Math.min(
      window.innerWidth - width - 16,
      logoRect.width * lerp(0.6, 2.15, wideViewport / 2)
    );
    const minX = window.innerWidth / 2 - horizontalSpan / 2;
    const maxX = window.innerWidth / 2 + horizontalSpan / 2;
    const centerX = lerp(minX, maxX, state.x);
    const left = clamp(
      centerX - width / 2,
      8,
      window.innerWidth - width - 8
    );
    const top = clamp(
      anchorY - height,
      horizonY + 4,
      contactRect.top - height - 10
    );

    cameo.style.setProperty("--gigi-width", px(width));
    cameo.style.left = px(left);
    cameo.style.top = px(top);
  };

  const placeWindowGigi = () => {
    const slot = windowSlots[state.windowSlot];
    const logoRect = logo.getBoundingClientRect();
    const left = logoRect.left + logoRect.width * slot.left;
    const top = logoRect.top + logoRect.height * slot.top;
    const width = logoRect.width * slot.width;
    const height = logoRect.height * slot.height;

    cameo.style.left = px(left);
    cameo.style.top = px(top);
    cameo.style.width = px(width);
    cameo.style.height = px(height);
  };

  const placeWalkingGigi = () => {
    const logoRect = logo.getBoundingClientRect();
    const contactRect = contact.getBoundingClientRect();
    const horizonY = window.innerHeight * 0.5;
    const castleDepthLine = logoRect.bottom - logoRect.height * 0.1;
    const backStart = Math.max(
      logoRect.bottom - logoRect.height * 0.32,
      horizonY + 16
    );
    const backEnd = castleDepthLine - 8;
    const frontStart = castleDepthLine + 8;
    const frontEnd = Math.max(
      frontStart + 48,
      contactRect.top - 14
    );
    const canWalkBehind = backEnd - backStart >= 24;
    const isInFront =
      state.walkLayer === "front" || !canWalkBehind;
    const anchorY = isInFront
      ? lerp(frontStart, frontEnd, state.walkDepth)
      : lerp(backStart, backEnd, state.walkDepth);
    const perspective = clamp(
      (anchorY - horizonY) / Math.max(contactRect.top - horizonY, 1),
      0,
      1
    );
    const width = clamp(
      logoRect.width * lerp(0.14, 0.28, perspective),
      64,
      Math.min(148, window.innerWidth * 0.34)
    );
    const height = width * assets.walk.aspect;
    const top = clamp(
      anchorY - height,
      horizonY + 6,
      contactRect.top - height - 10
    );
    const start = state.walkDirection > 0
      ? -width - 24
      : window.innerWidth + 24;
    const end = state.walkDirection > 0
      ? window.innerWidth + 24
      : -width - 24;

    cameo.style.setProperty("--gigi-width", px(width));
    cameo.style.setProperty("--gigi-start", px(start));
    cameo.style.setProperty("--gigi-end", px(end));
    cameo.style.setProperty(
      "--gigi-facing",
      String(state.walkDirection > 0 ? 1 : -1)
    );
    const duration = Math.round(34 + state.walkDepth * 12);

    cameo.style.setProperty("--gigi-duration", `${duration}s`);
    cameo.style.setProperty(
      "--gigi-delay",
      `${-(duration * state.walkProgress).toFixed(2)}s`
    );
    cameo.style.top = px(top);
    cameo.style.left = "0";
    const overlapsCastle =
      top < logoRect.bottom && top + height > logoRect.top;
    const walkBehindCastle = overlapsCastle && !isInFront;
    cameo.classList.toggle("gigi-walk-behind", walkBehindCastle);
  };

  const positionCameo = () => {
    if (!cameo) {
      return;
    }

    if (state.type === "face") {
      placeWindowGigi();
    } else if (state.type === "walk") {
      placeWalkingGigi();
    } else {
      placeGroundGigi();
    }
  };

  const schedulePosition = () => {
    window.requestAnimationFrame(positionCameo);
  };

  const renderCameo = () => {
    stage.replaceChildren();

    if (state.type === "face") {
      cameo = document.createElement("div");
      cameo.className = "gigi-cameo gigi-window";
      const image = document.createElement("img");
      image.src = assets.face.src;
      image.alt = "";
      image.decoding = "async";
      cameo.append(image);
    } else if (state.type === "walk") {
      cameo = document.createElement("div");
      cameo.className = "gigi-cameo gigi-walk-track";
      cameo.addEventListener("animationend", (event) => {
        if (event.target !== cameo || event.animationName !== "gigi-walk") {
          return;
        }

        cameo.remove();
        cameo = null;
      });
      const image = document.createElement("img");
      image.src = assets.walk.src;
      image.alt = "";
      image.decoding = "async";
      cameo.append(image);
    } else {
      cameo = document.createElement("img");
      cameo.className = "gigi-cameo gigi-ground";
      cameo.src = assets[state.type].src;
      cameo.alt = "";
      cameo.decoding = "async";
    }

    stage.append(cameo);
    positionCameo();
    window.addEventListener("resize", schedulePosition);
  };

  if (logo.complete) {
    renderCameo();
  } else {
    logo.addEventListener("load", renderCameo, { once: true });
  }
})();
