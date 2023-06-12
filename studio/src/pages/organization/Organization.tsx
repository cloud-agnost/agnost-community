import { Outlet } from 'react-router-dom';

async function loader(params: any) {
	console.log(params);
	return null;
}

export default function Organization() {
	return <Outlet />;
}

Organization.loader = loader;
