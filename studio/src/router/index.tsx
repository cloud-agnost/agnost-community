import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<div className=" font-bold text-red-600 text-3xl">Hello Agnost</div>
		),
	},
]);

export default router;
