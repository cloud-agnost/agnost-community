import { HTTP_METHOD_BADGE_MAP } from '@/constants';
import { HttpMethod } from '@/types';
import { Badge } from '../Badge';

export default function MethodBadge({ method }: { method: HttpMethod }) {
	return <Badge variant={HTTP_METHOD_BADGE_MAP[method]} text={method} className='min-w-[52px]' />;
}
