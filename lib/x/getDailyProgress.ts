

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

  const url = new URL(
    "https://api.twitterapi.io/twitter/user/last_tweets"
  );

  url.searchParams.set("userName", username);
  url.searchParams.set("includeReplies", "true");

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

  const now = new Date();

  const startOfToday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    )
  );

  let posts = 0;
  let replies = 0;

  for (const tweet of tweets) {
    const createdAt = new Date(tweet.createdAt);

    if (createdAt < startOfToday) {
      continue;
    }

    // Ignore retweets
    if (tweet.retweeted_tweet) {
      continue;
    }

    if (tweet.isReply) {
      replies++;
    } else {
      posts++;
    }
  }

  return {
    posts,
    replies,
  };
}