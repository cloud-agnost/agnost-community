import { Accordion, AccordionItem } from '@/components/Accordion';
import useVersionStore from '@/store/version/versionStore';
import MessageTemplateForm from './MessageTemplateForm';

export default function MessageTemplates() {
	const { version } = useVersionStore();

	return (
		<Accordion
			type='single'
			defaultValue={version.authentication.messages[0].type}
			collapsible
			className='w-full space-y-8'
		>
			{version.authentication.messages.map((template) => (
				<AccordionItem
					key={template.type}
					value={template.type}
					className='border border-border rounded-lg bg-subtle'
				>
					<MessageTemplateForm template={template} />
				</AccordionItem>
			))}
		</Accordion>
	);
}
