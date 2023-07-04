import onHeaders from "on-headers";

// This middleware is called after the response headers are set
export const clearTimeout = (req, res, next) => {
	try {
		onHeaders(res, function onHeaders() {
			// Clear the timeout if there is one
			if (req.clearTimeout) req.clearTimeout();
		});

		next();
	} catch (err) {}
};
