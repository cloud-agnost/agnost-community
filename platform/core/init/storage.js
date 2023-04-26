import path from "path";
import { Storage } from "@google-cloud/storage";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceKey = path.join(__dirname, "../config/gcp_storage_key.json");

// Create the GCP storage instance
export const storage = new Storage({
	keyFilename: serviceKey,
	projectId: "altogic",
});
