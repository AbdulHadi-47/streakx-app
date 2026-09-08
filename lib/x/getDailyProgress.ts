type DailyProgress = {
  posts: number;
  replies: number;
};

export async function getDailyProgress(
  username: string
): Promise<DailyProgress> {
  const apiKey = process.env.TWITTER_API_IO_KEY;

  if (!apiKey) {
    throw new Error("Twitter API key is missing");
  }

  const today = new Date().toISOString().split("T")[0];

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

    const response = await fetch(url, {
      headers: {
        "X-API-Key": apiKey,
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch X activity:", result);
      throw new Error("Could not fetch X activity");
    }

    const tweets = result.data?.tweets ?? [];

    if (tweets.length === 0) {
      break;
    }

    let foundOlderTweet = false;

    for (const tweet of tweets) {
      const tweetDate = new Date(tweet.createdAt)
        .toISOString()
        .split("T")[0];

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