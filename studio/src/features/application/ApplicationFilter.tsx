import { Button, ButtonGroup } from '@/components/Button';
import { SearchInput } from '@/components/SearchInput';
import useApplicationStore from '@/store/app/applicationStore';
import { cn } from '@/utils';
import { List, SquaresFour } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import CreateApplicationButton from './CreateApplicationButton';

interface ApplicationFilterProps {
	isCard: boolean;
	setIsCard: (value: boolean) => void;
}
export default function ApplicationFilter({ isCard, setIsCard }: ApplicationFilterProps) {
	const { t } = useTranslation();
	const { applications } = useApplicationStore();
	const [searchParams] = useSearchParams();

	return (
		<div className='flex  items-center justify-between'>
			<h1 className='text-default text-2xl font-semibold text-center'>
				{applications.length} {t('application.apps')}
			</h1>
			<div className='flex items-center justify-center gap-6'>
				<SearchInput placeholder='Search apps' value={searchParams.get('q') as string} />
				<ButtonGroup>
					<Button
						variant='outline'
						iconOnly
						className={cn(isCard ? 'bg-lighter' : 'bg-base', 'transition-all')}
						onClick={() => setIsCard(true)}
					>
						<SquaresFour
							className={cn('w-5 h-5', isCard ? 'text-icon-secondary' : 'text-icon-base')}
						/>
					</Button>
					<Button
						variant='outline'
						iconOnly
						className={cn(!isCard ? 'bg-lighter' : 'bg-base', 'transition-all')}
						onClick={() => setIsCard(false)}
					>
						<List className={cn('w-5 h-5', !isCard ? 'text-icon-secondary' : 'text-icon-base')} />
					</Button>
				</ButtonGroup>
				<CreateApplicationButton />
			</div>
		</div>
	);
}