//Function to get response body, which is used while logging the actions
export const getResponseBody = (req, res, next) => {
	const oldWrite = res.write;
	const oldEnd = res.end;
	const chunks = [];

	res.write = (...restArgs) => {
		chunks.push(Buffer.from(restArgs[0]));
		oldWrite.apply(res, restArgs);
	};

	res.end = (...restArgs) => {
		if (restArgs[0]) {
			chunks.push(Buffer.from(restArgs[0]));
		}

		//Assign response to response body
		let body = Buffer.concat(chunks).toString("utf8");

		try {
			res.body = JSON.parse(body);
		} catch (error) {
			if (body === "") res.body = null;
			else res.body = body;
		}

		oldEnd.apply(res, restArgs);
	};

	next();
};
