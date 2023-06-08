import { Outlet } from 'react-router-dom';

async function loader() {
	return null;
}

export default function Organization() {
	return <Outlet />;
}

Organization.loader = loader;
