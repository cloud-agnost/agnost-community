async function loader() {
	return null;
}

export default function CreateApp() {
	return <h1>CreateApp</h1>;
}

CreateApp.loader = loader;
