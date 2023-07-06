import express from "express";
import { storage } from "../init/storage.js";
import { handleError } from "../schemas/platformError.js";

const router = express.Router({ mergeParams: true });

/*
@route      /storage/avatars/:file
@method     GET
@desc       Returns the file stored in minio bucket
@access     public
*/
router.get("/avatars/:file", async (req, res) => {
	try {
		const { file } = req.params;
		const bucketName = config.get("general.storageBucket");
		const fileName = `storage/avatars/${file}`;

		const contentType = await storage.getFileContentType(bucketName, fileName);
		const dataStream = await storage.getFileStream(bucketName, fileName);

		res.set("Content-Type", contentType);
		dataStream.pipe(res);
	} catch (error) {
		handleError(req, res, error);
	}
});

export default router;
