type DailyProgress = {
  posts: number;
  replies: number;
};

import { normalizeTimeZone, zonedDateKey } from "@/lib/timezone";
import { XApiError, normalizeXApiError, xApiErrorFromStatus } from "@/lib/x/errors";
import { waitForXApiSlot } from "@/lib/x/rateLimit";

export async function getDailyProgress(
  username: string,
  timeZone = "UTC",
  targetDate?: string,
): Promise<DailyProgress> {
  const apiKey = process.env.TWITTER_API_IO_KEY;

  if (!apiKey) {
    throw new XApiError("configuration");
  }

  const normalizedTimeZone = normalizeTimeZone(timeZone);
  const today = targetDate ?? zonedDateKey(new Date(), normalizedTimeZone);

  let posts = 0;
  let replies = 0;
  let cursor: string | null = null;
  let shouldContinue = true;

  while (shouldContinue) {
    const url = new URL(
      "https://api.twitterapi.io/twitter/user/last_tweets"
    );

    url.searchParams.set("userName", username);
    url.searchParams.set("includeReplies", "true");

    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    let response: Response;
    try {
      await waitForXApiSlot();
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
    if (!result?.data || !Array.isArray(result.data.tweets)) {
      throw new XApiError("invalid_response");
    }

    const tweets = result.data.tweets;

    if (tweets.length === 0) {
      break;
    }

    let foundOlderTweet = false;

    for (const tweet of tweets) {
      const createdAt = new Date(tweet.createdAt);
      if (Number.isNaN(createdAt.getTime())) continue;
      const tweetDate = zonedDateKey(createdAt, normalizedTimeZone);

      if (tweetDate > today) continue;

      if (tweetDate < today) {
        foundOlderTweet = true;
        break;
      }

      if (tweet.retweeted_tweet) {
        continue;
      }

      if (tweet.isReply) {
        replies++;
      } else {
        posts++;
      }
    }

    if (
      foundOlderTweet ||
      !result.has_next_page ||
      !result.next_cursor
    ) {
      shouldContinue = false;
    } else {
      cursor = result.next_cursor;
    }
  }

  return {
    posts,
    replies,
  };
}
