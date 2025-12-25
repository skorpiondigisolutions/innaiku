import { logEvent } from "firebase/analytics";
import { getAnalyticsInstance } from "./config";

export const trackEvent = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  const analytics = getAnalyticsInstance();
  if (!analytics) return;

  logEvent(analytics, eventName, {
    app_name: "innaiku", // ✅ global app name
    ...params,
  });
};
