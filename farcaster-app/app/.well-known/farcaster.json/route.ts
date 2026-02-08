import { NextResponse } from "next/server";
import { APP_URL } from "@/lib/constants";

export async function GET() {
  const farcasterConfig = {
    // TODO: Add your own account association when publishing
    // accountAssociation: {
    //   header: "",
    //   payload: "",
    //   signature: "",
    // },
    frame: {
      version: "1",
      name: "BlitzBoard",
      iconUrl: `${APP_URL}/images/icon.png`,
      homeUrl: `${APP_URL}`,
      imageUrl: `${APP_URL}/images/feed.png`,
      screenshotUrls: [],
      tags: ["monad", "voting", "hackathon", "quadratic", "blitzboard"],
      primaryCategory: "developer-tools",
      buttonTitle: "Launch BlitzBoard",
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: "#0f0f23",
      webhookUrl: `${APP_URL}/api/webhook`,
    },
  };

  return NextResponse.json(farcasterConfig);
}
