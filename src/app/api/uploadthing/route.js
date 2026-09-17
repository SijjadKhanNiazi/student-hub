import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/lib/uploadthing";

if (process.env.UPLOADTHING_SECRET && process.env.UPLOADTHING_APP_ID) {
  process.env.UPLOADTHING_TOKEN = Buffer.from(
    JSON.stringify({
      apiKey: process.env.UPLOADTHING_SECRET,
      appId: process.env.UPLOADTHING_APP_ID,
      regions: ["sea1", "iad1", "fra1"],
    })
  ).toString("base64");
}

export const runtime = "nodejs";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
