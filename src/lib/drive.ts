import type { Buffer } from "node:buffer";
import fs from "node:fs";
import { Readable } from "node:stream";
import { google } from "googleapis";
//import { contentType } from "https://deno.land/std@0.224.0/media_types/mod.ts";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const CREDENTIALS_PATH = "./regenscore-459818-feae1a7b7bb2.json";

interface UploadInput {
  filename: string;
  mimeType?: string;
  content: string | Buffer | Readable; // string = filepath
  parentFolderId?: string;
}

const auth = new google.auth.GoogleAuth({
  keyFile: CREDENTIALS_PATH,
  scopes: SCOPES,
});

export async function uploadFile({
  filename,
  content,
  mimeType,
  parentFolderId,
}: UploadInput) {
  const drive = google.drive({ version: "v3", auth });

  const resolvedMime = mimeType || /*contentType(filename) || */
    "application/octet-stream";

  const bodyStream = typeof content === "string"
    ? fs.createReadStream(content)
    : content instanceof Readable
    ? content
    : Readable.from(content); // turn Buffer into Readable

  const fileMetadata: Record<string, unknown> = { name: filename };
  if (parentFolderId) {
    fileMetadata.parents = [parentFolderId];
  }

  const media = {
    mimeType: resolvedMime as string,
    body: bodyStream,
  };

  const res = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id",
  });

  console.log(`Uploaded ${filename} to Drive. File ID: ${res.data.id}`);
}
