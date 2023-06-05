import { RouterProvider } from "react-router-dom";
import router from "./router";
import { useTranslation } from "react-i18next";

function App() {
	const { t } = useTranslation();
	return (
		<>
			<RouterProvider router={router}></RouterProvider>
			<h1>{t("title")}</h1>
			<h4>{t("description")}</h4>
		</>
	);
}

export default App;
