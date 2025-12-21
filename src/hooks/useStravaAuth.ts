import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import {
  STRAVA_CLIENT_ID,
  STRAVA_SCOPE,
  REDIRECT_URI,
  STORAGE_KEY,
} from "../constants";
import type { Activity } from "../types";

type AuthStatus = "idle" | "exchanging" | "loading" | "ready" | "error";

export function useStravaAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error("Storage is not available", error);
      return null;
    }
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const processingCode = useRef(false);

  const authUrl = useMemo(
    () =>
      `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&response_type=code&scope=${encodeURIComponent(
        STRAVA_SCOPE
      )}&approval_prompt=auto`,
    []
  );

  const loadActivities = useCallback(async (token: string) => {
    try {
      setStatus("loading");
      setErrorMessage(null);

      const stravaModule = await import("strava-v3");
      const strava =
        (stravaModule as unknown as { default?: unknown }).default ??
        stravaModule;

      // @ts-expect-error strava-v3 does not ship perfect types for ESM
      strava.config({ access_token: token });

      const allActivities: Activity[] = [];
      let page = 1;
      const perPage = 50;

      while (true) {
        // @ts-expect-error promise signature is not typed in the package
        const list: Activity[] = await strava.athlete.listActivities({
          per_page: perPage,
          page: page,
        });

        if (!list || list.length === 0) {
          break;
        }

        allActivities.push(...list);

        if (list.length < perPage) {
          break;
        }

        page++;
      }

      setActivities(allActivities);
      setStatus("ready");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Failed to load activities. Check CORS and access credentials."
      );
      setStatus("error");
    }
  }, []);

  const exchangeCodeForToken = useCallback(
    async (code: string) => {
      try {
        setStatus("exchanging");
        setErrorMessage(null);

        const exchangeStravaToken = httpsCallable(
          functions,
          "exchangeStravaToken"
        );
        const result = await exchangeStravaToken({ code });

        // Data from backend is in .data property
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stravaData = result.data as any;
        console.log("Access Token:", stravaData.access_token);

        const token = stravaData.access_token as string | undefined;

        if (!token) {
          throw new Error("Missing access token in response");
        }

        setAccessToken(token);
        localStorage.setItem(STORAGE_KEY, token);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        await loadActivities(token);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "Failed to obtain access token. Check Firebase function logs."
        );
        setStatus("error");
      }
    },
    [loadActivities]
  );

  useEffect(() => {
    if (accessToken) {
      void loadActivities(accessToken);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code && !processingCode.current) {
      processingCode.current = true;
      void exchangeCodeForToken(code);
    }
  }, [accessToken, loadActivities, exchangeCodeForToken]);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAccessToken(null);
    setActivities([]);
    setStatus("idle");
    setErrorMessage(null);
  };

  return {
    accessToken,
    activities,
    status,
    errorMessage,
    authUrl,
    handleReset,
  };
}
