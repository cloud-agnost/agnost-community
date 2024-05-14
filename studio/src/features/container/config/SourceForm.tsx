import { Button } from '@/components/Button';
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/Form';
import { Input } from '@/components/Input';
import { Docker, Github } from '@/components/icons';
import { CreateContainerParams } from '@/types/container';
import { Folder, GitBranch, Path } from '@phosphor-icons/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ContainerFormTitle from './ContainerFormTitle';
export default function SourceForm() {
	const form = useFormContext<CreateContainerParams>();
	const { t } = useTranslation();
	return (
		<div className='space-y-6'>
			<ContainerFormTitle
				title={t('container.source.title')}
				description={t('container.source.description') ?? ''}
			>
				<GitBranch size={20} />
			</ContainerFormTitle>
			<div className='space-y-6 pl-12'>
				<Button variant='outline'>
					<Github className='size-5 mr-2' />
					{t('container.source.connect_github')}
				</Button>
				{/* <FormField
				control={form.control}
				name='source.repoType'
				render={({ field }) => (
					<FormItem className='flex-1'>
						<FormLabel>{t('container.source.repoType')}</FormLabel>
						<FormControl>
							<Select defaultValue={field.value} onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger
										className='w-full'
										error={Boolean(form.formState.errors.source?.repoType)}
									>
										<SelectValue placeholder={t('project.sourceOrRegistry')} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{['github', 'gitlab', 'bitbucket']?.map((type) => (
										<SelectItem key={type} value={type} className='max-w-full'>
											{startCase(type)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormControl>

						<FormMessage />
					</FormItem>
				)}
			/> */}
				<FormField
					control={form.control}
					name='source.repo'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('container.source.repo')}</FormLabel>
							<FormControl>
								<div className='relative'>
									<Input
										className='pr-4'
										error={Boolean(form.formState.errors.source?.repo)}
										placeholder={
											t('forms.placeholder', {
												label: t('container.source.repo'),
											}) ?? ''
										}
										{...field}
									/>
									<Button className='absolute top-0.5 right-0'>{t('container.disconnect')}</Button>
								</div>
							</FormControl>

							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='source.branch'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('container.source.branch')}</FormLabel>
							<FormControl>
								<div className='relative'>
									<Input
										error={Boolean(form.formState.errors.source?.branch)}
										placeholder={
											t('forms.placeholder', {
												label: t('container.source.branch'),
											}) ?? ''
										}
										{...field}
									/>
									<Button className='absolute top-0.5 right-0'>{t('container.disconnect')}</Button>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='source.rootDirectory'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('container.source.rootDirectory')}</FormLabel>
							<FormControl>
								<div className='relative'>
									<Folder className='size-6 mr-2 absolute left-2 top-1' />
									<Input
										className='pl-10'
										error={Boolean(form.formState.errors.source?.rootDirectory)}
										placeholder={
											t('forms.placeholder', {
												label: t('container.source.rootDirectory'),
											}) ?? ''
										}
										{...field}
									/>
								</div>
							</FormControl>
							<FormDescription>{t('container.source.rootDirectoryHelp')}</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='source.dockerFile'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('container.source.dockerFile')}</FormLabel>
							<FormControl>
								<div className='relative'>
									<Docker className='size-6 mr-2 absolute left-2 top-1' />
									<Input
										className='pl-10'
										error={Boolean(form.formState.errors.source?.dockerFile)}
										placeholder={
											t('forms.placeholder', {
												label: t('container.source.dockerFile'),
											}) ?? ''
										}
										{...field}
									/>
								</div>
							</FormControl>
							<FormDescription>{t('container.source.dockerFileHelp')}</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
}
