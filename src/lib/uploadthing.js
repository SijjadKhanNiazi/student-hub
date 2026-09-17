import { createUploadthing } from "uploadthing/next";

if (process.env.UPLOADTHING_SECRET && process.env.UPLOADTHING_APP_ID) {
  process.env.UPLOADTHING_TOKEN = Buffer.from(
    JSON.stringify({
      apiKey: process.env.UPLOADTHING_SECRET,
      appId: process.env.UPLOADTHING_APP_ID,
      regions: ["sea1", "iad1", "fra1"],
    })
  ).toString("base64");
}

const f = createUploadthing();

export const ourFileRouter = {
  noteUploader: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 5 },
    image: { maxFileSize: "8MB", maxFileCount: 5 },
    blob: { maxFileSize: "8MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      return { userId: "student" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId, url: file.url, name: file.name, size: file.size, key: file.key };
    }),
};
