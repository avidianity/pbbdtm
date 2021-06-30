import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { CMS as CMSContract } from '../../../contracts/CMS';
import toastr from 'toastr';
import { useHistory } from 'react-router-dom';
import { Entry } from './Entry';
import { FAQ } from './FAQ';
import dayjs from 'dayjs';

export function CMS() {
	const [cms, setCMS] = useState<Array<CMSContract>>([]);
	const [mode, setMode] = useState<'Manage' | 'Preview'>('Manage');
	const history = useHistory();
	const find = (key: string, defaultValue: string) => {
		const c = cms.find((cms) => cms.key === key);
		if (c) {
			return c.value;
		}
		return defaultValue;
	};
	const faqs = JSON.parse(find('faqs', JSON.stringify([]))) as Array<FAQ>;

	const fetchCMS = async () => {
		try {
			const { data } = await axios.get<Array<CMSContract>>('/cms');
			setCMS([...data]);
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to fetch CMS entities.', 'Oops!');
			history.goBack();
		}
	};

	const saveCMS = async (cms: CMSContract) => {
		if (cms.id) {
			await axios.put('/cms', cms);
		} else {
			await axios.post('/cms', cms);
		}
	};

	const saveFAQ = async (faq: FAQ, index: number) => {
		faqs.splice(index, 1, faq);

		const entity = cms.find((cms) => cms.key === 'faqs');

		const data = JSON.stringify(faqs);

		if (entity) {
			entity.value = data;
			cms.splice(
				cms.findIndex((cms) => cms.key === 'faqs'),
				1,
				entity
			);
			setCMS([...cms]);
			await saveCMS(entity);
		} else {
			cms.push({ key: 'faqs', value: data });
			setCMS([...cms]);
			await saveCMS({
				key: 'faqs',
				value: data,
			});
		}
	};

	useEffect(() => {
		fetchCMS();
		// eslint-disable-next-line
	}, []);

	return (
		<div className={`${mode === 'Preview' ? 'container-fluid' : 'container'}`}>
			<div className='row'>
				<div className='col-12'>
					<button
						className='btn btn-info btn-sm'
						onClick={(e) => {
							e.preventDefault();
							setMode(mode === 'Preview' ? 'Manage' : 'Preview');
						}}>
						{mode === 'Preview' ? 'Manage' : 'Preview'}
					</button>
				</div>
				{mode === 'Manage' ? (
					<>
						{cms
							.filter((cms) => cms.key !== 'faqs')
							.map((cms, index) => (
								<Entry
									cms={cms}
									key={index}
									onChange={async (value, success) => {
										try {
											cms.value = value;
											await saveCMS(cms);
											success();
											fetchCMS();
										} catch (error) {
											console.log(error.toJSON());
											toastr.error('Unable to update CMS entity.', 'Oops!');
										}
									}}
								/>
							))}
						<div className='col-12'>
							<h3 className='mb-0'>FAQs</h3>
							{cms.find((cms) => cms.key === 'faqs') && cms.find((cms) => cms.key === 'faqs')!.updated_at ? (
								<small className='text-muted mt-0 form-text mb-3'>
									Last Updated: {dayjs(cms.find((cms) => cms.key === 'faqs')?.updated_at).fromNow()}
								</small>
							) : null}
							<button
								className='btn btn-success btn-sm'
								onClick={(e) => {
									e.preventDefault();

									const entity = cms.find((cms) => cms.key === 'faqs');

									if (entity) {
										const value = JSON.parse(entity.value) as Array<FAQ>;

										value.push({ question: '', answer: '', new: true });

										entity.value = JSON.stringify(value);

										const index = cms.findIndex((cms) => cms.key === 'faqs');

										cms.splice(index, 1, entity);
										setCMS([...cms]);
									} else {
										const value = [{ question: '', answer: '', new: true }] as Array<FAQ>;

										cms.push({ key: 'faqs', value: JSON.stringify(value) });

										setCMS([...cms]);
									}
								}}>
								Add FAQ
							</button>
							<hr />
						</div>
						{faqs.map((faq, index) => (
							<FAQ
								faq={faq}
								key={index}
								onChange={async (faq, success) => {
									try {
										await saveFAQ(faq, index);
										success();
										fetchCMS();
									} catch (error) {
										console.log(error.toJSON());
										toastr.error('Unable to update FAQs.', 'Oops!');
									}
								}}
								defaultMode={faq.new ? 'Edit' : 'View'}
							/>
						))}
					</>
				) : (
					<div className='col-12'>
						<div style={{ position: 'relative', overflow: 'hidden', width: '100%', paddingTop: '56.25%' }}>
							<iframe
								title='CMS Preview'
								src={`${window.location.origin}?preview=true`}
								style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}></iframe>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
