// Pace requests to about 14 QPS per server instance. This uses most of the
// provider's 20 QPS allowance while retaining room for timing jitter and
// user-triggered requests.
const REQUEST_INTERVAL_MS = 70;

let requestQueue = Promise.resolve();
let nextRequestAt = 0;

export function waitForXApiSlot() {
  const scheduled = requestQueue.then(async () => {
    const waitMs = Math.max(0, nextRequestAt - Date.now());
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    nextRequestAt = Date.now() + REQUEST_INTERVAL_MS;
  });

  requestQueue = scheduled.catch(() => undefined);
  return scheduled;
}
