import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.TWITTER_API_IO_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TWITTER_API_IO_KEY is missing" },
      { status: 500 }
    );
  }

  const username = "hadi_047";

  const url = new URL(
    "https://api.twitterapi.io/twitter/user/last_tweets"
  );

  url.searchParams.set("userName", username);
  url.searchParams.set("includeReplies", "true");

  try {
    const response = await fetch(url, {
      headers: {
        "X-API-Key": apiKey,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("TwitterAPI.io error:", data);


      return NextResponse.json(
        { error: "Failed to fetch X activity", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("X API request failed:", error);

    return NextResponse.json(
      { error: "Something went wrong while fetching X activity" },
      { status: 500 }
    );
  }
}