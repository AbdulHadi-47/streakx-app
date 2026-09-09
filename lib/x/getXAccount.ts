import { XApiError, normalizeXApiError, xApiErrorFromStatus } from "@/lib/x/errors";

export async function getXAccount(username: string) {
  const apiKey = process.env.TWITTER_API_IO_KEY;
  if (!apiKey) throw new XApiError("configuration");
  const url = new URL("https://api.twitterapi.io/twitter/user/info");
  url.searchParams.set("userName", username);
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "X-API-Key": apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch (error) {
    throw normalizeXApiError(error);
  }
  if (!response.ok) throw xApiErrorFromStatus(response.status);
  let result;
  try {
    result = await response.json();
  } catch {
    throw new XApiError("invalid_response");
  }
  const account = result.data ?? result;
  const id = String(account.id ?? account.userId ?? account.id_str ?? "");
  if (!id) throw new XApiError("not_found");
  return {
    id,
    username: String(account.userName ?? account.username ?? username),
  };
}
