import onHeaders from "on-headers";

// This middleware is called after the response headers are set
export const turnOnLogging = (endpoint) => (req, res, next) => {
	const debugChannel = req.header("Agnost-Session");
	// If we have a debug channel then turn on debug logging
	if (debugChannel)
		helper.turnOnLogging(debugChannel, endpoint._id, "endpoint");
	next();
};

// This middleware is called after the response headers are set
export const turnOffLogging = (req, res, next) => {
	try {
		onHeaders(res, function onHeaders() {
			const debugChannel = req.header("Agnost-Session");
			// If we have a debug channel then turn on debug logging
			if (debugChannel) helper.turnOffLogging();
		});

		next();
	} catch (err) {}
};
