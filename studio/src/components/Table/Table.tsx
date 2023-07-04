import { cn } from '@/utils';
import * as React from 'react';
import './table.scss';
import { Copy } from '@phosphor-icons/react';
import { Button } from 'components/Button';
import { useToast } from '@/hooks';
import { useTranslation } from 'react-i18next';

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
	({ className, ...props }, ref) => (
		<div className='table-container'>
			<table ref={ref} className={cn('table', className)} {...props} />
		</div>
	),
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<thead ref={ref} className={cn('table-header', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tbody ref={ref} className={cn('table-body', className)} {...props} />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tfoot ref={ref} className={cn('table-footer', className)} {...props} />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
	({ className, ...props }, ref) => (
		<tr ref={ref} className={cn('table-row', className)} {...props} />
	),
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
	HTMLTableCellElement,
	React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
	<th ref={ref} className={cn('table-head', className)} {...props} />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
	HTMLTableCellElement,
	React.TdHTMLAttributes<HTMLTableCellElement> & {
		copyable?: boolean;
		copyableText?: string;
	}
>(({ className, children, copyable, copyableText, ...props }, ref) => {
	const { notify } = useToast();
	const { t } = useTranslation();

	async function copy() {
		if (!copyableText)
			return notify({ title: 'Error', description: 'No text to copy', type: 'error' });
		try {
			await navigator.clipboard.writeText(copyableText);
			notify({
				title: t('general.success'),
				description: t('general.copied'),
				type: 'success',
			});
		} catch (e) {
			notify({
				title: t('general.error'),
				description: t('general.copied_error'),
				type: 'error',
			});
		}
	}
	return (
		<td ref={ref} className={cn('table-cell', className)} {...props}>
			{!copyable ? (
				children
			) : (
				<div className='flex justify-between gap-1 items-center'>
					{children}
					{copyable && (
						<Button
							onClick={copy}
							variant='blank'
							rounded
							className='text-base hover:bg-subtle aspect-square'
							type='button'
							iconOnly
						>
							<Copy />
						</Button>
					)}
				</div>
			)}
		</td>
	);
});
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
	HTMLTableCaptionElement,
	React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
	<caption ref={ref} className={cn('table-caption', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
