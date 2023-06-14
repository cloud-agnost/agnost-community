import { useLocation } from 'react-router-dom';

export default function Profile() {
	console.log(useLocation());
	return <h1 className='text-default'>Profile</h1>;
}
