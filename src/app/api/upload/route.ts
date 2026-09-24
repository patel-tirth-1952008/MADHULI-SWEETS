import { NextRequest } from "next/server";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { isAdmin } from "@/lib/require-admin";

const MAX_BYTES = 5 * 1024 * 1024;

/** [ADMIN] Upload a product photo to Cloudinary. Returns { url }. */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!isCloudinaryConfigured) {
    return Response.json(
      {
        error:
          "Cloudinary is not configured — add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.local. The item will still save with a warm placeholder.",
      },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Expected a multipart file upload" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file received" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Only image files are allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

  try {
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "madhuli",
      transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
    });
    return Response.json({ url: result.secure_url }, { status: 201 });
  } catch (e) {
    console.error("Cloudinary upload failed:", e);
    return Response.json({ error: "Upload failed — please try again" }, { status: 502 });
  }
}
