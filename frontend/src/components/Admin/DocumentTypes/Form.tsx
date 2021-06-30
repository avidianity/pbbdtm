import axios from 'axios';
import React, { ChangeEvent, createRef, RefObject, useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { DocumentType } from '../../../contracts/DocumentType';
import { handleError, outIf } from '../../../helpers';
import toastr from 'toastr';

export function Form() {
	const [processing, setProcessing] = useState(false);
	const [mode, setMode] = useState('Add');
	const [files, setFiles] = useState<Array<{ file: File | null; ref: RefObject<HTMLInputElement> }>>([]);
	const [data, setData] = useState<DocumentType>({
		id: -1,
		name: '',
		requirements: [],
		expiry_days: 15,
	});

	const history = useHistory();

	const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { id, value } = e.target;
		setData({
			...data,
			[id]: value,
		});
	};

	const reset = () => setData({ name: '', id: -1, requirements: [], expiry_days: 15 });

	const submit = async () => {
		if (processing) return;
		setProcessing(true);
		try {
			const payload = new FormData();
			delete data.files;
			Object.entries(data).forEach(([key, value]) => payload.append(key, value));

			payload.append('requirements', JSON.stringify(data.requirements));
			payload.append('_method', mode === 'Add' ? 'post' : 'put');

			files.forEach((file) => {
				if (file.file instanceof File) {
					payload.append('files[]', file.file);
				}
			});

			await axios.post<DocumentType>('/document-types', payload);
			toastr.success('Document Type saved successfully.');
			reset();
		} catch (error) {
			handleError(error);
		} finally {
			setProcessing(false);
		}
	};

	const fetchDocumentType = async (documentTypeID: string) => {
		setMode('Edit');
		try {
			const { data } = await axios.get<DocumentType>(`/document-types/show?id=${documentTypeID}`);
			setData(() => ({
				...data,
				requirements: ((requirements) => {
					if (!requirements) {
						return [];
					}
					try {
						const data = JSON.parse(requirements as any);
						if (!data) {
							return [];
						}
						return data;
					} catch (error) {
						console.log(error.toJSON());
						return [];
					}
				})(data.requirements),
			}));
		} catch (error) {
			handleError(error);
			history.goBack();
		}
	};

	const { params, path } = useRouteMatch<{ id: string }>();

	useEffect(() => {
		if (path.includes('edit')) {
			fetchDocumentType(params.id);
		}
		// eslint-disable-next-line
	}, []);

	return (
		<form
			className='container'
			onSubmit={async (e) => {
				e.preventDefault();
				await submit();
			}}>
			<div className='d-flex'>
				<h3 className='align-self-center mb-0'>{mode} Document</h3>
				<button
					className='btn btn-info btn-sm align-self-center ml-auto'
					onClick={(e) => {
						e.preventDefault();
						history.goBack();
					}}>
					Back
				</button>
			</div>
			<div className='form-group text-primary'>
				<label htmlFor='name'></label>
				<input
					type='text'
					name='name'
					id='name'
					placeholder='Name'
					className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
					disabled={processing}
					value={data.name}
					onChange={handleChange}
				/>
			</div>
			<div className='form-group'>
				<label htmlFor='expiry_days'>Expiry Days</label>
				<input
					type='number'
					name='expiry_days'
					id='expiry_days'
					placeholder='Expiry Days'
					className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
					disabled={processing}
					value={data.expiry_days}
					onChange={handleChange}
				/>
			</div>
			<div className='container-fluid'>
				<div className='row'>
					<div className='col-12'>
						<h4>Requirements</h4>
						<button
							className='btn btn-info btn-sm'
							onClick={(e) => {
								e.preventDefault();
								data.requirements.push('');
								setData({ ...data });
							}}>
							Add Requirement
						</button>
					</div>
					{data.requirements.map((requirement, index) => (
						<div className='col-12' key={index}>
							<button
								className='btn btn-danger btn-sm'
								onClick={(e) => {
									e.preventDefault();
									data.requirements.splice(index, 1);
									setData({ ...data });
								}}>
								Remove Requirement
							</button>
							<div className='form-group'>
								<label>Requirement {index + 1}</label>
								<input
									type='text'
									placeholder={`Requirement ${index + 1}`}
									className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
									disabled={processing}
									value={requirement}
									onChange={(e) => {
										data.requirements.splice(index, 1, e.target.value);
										setData({ ...data });
									}}
								/>
							</div>
						</div>
					))}
					<div className='col-12 mt-3'>
						<h4>Forms</h4>
						<button
							className='btn btn-info btn-sm'
							onClick={(e) => {
								e.preventDefault();
								files.push({ file: null, ref: createRef<HTMLInputElement>() });
								setFiles([...files]);
							}}>
							Add Form
						</button>
					</div>
					{files.map((file, index) => (
						<div className='col-12 col-md-6 col-lg-4 col-xl-3' key={index}>
							<button
								className='btn btn-danger btn-sm'
								onClick={(e) => {
									e.preventDefault();
									files.splice(index, 1);
									setFiles([...files]);
								}}>
								Remove Form
							</button>
							<div className='form-group'>
								<input
									type='file'
									ref={file.ref}
									className={`d-none ${outIf(processing || file !== null, 'disabled')}`}
									disabled={processing || file.file !== null}
									onChange={(e) => {
										if (e.target.files && e.target.files.length > 0) {
											files.splice(index, 1, { file: e.target.files[0], ref: file.ref });
											setFiles([...files]);
										}
									}}
								/>
								<button
									className='btn btn-secondary btn-sm'
									disabled={file.file !== null}
									onClick={(e) => {
										e.preventDefault();
										if (file.file === null && file.ref.current) {
											file.ref.current.click();
											console.log('yo');
										}
									}}>
									{file.file === null ? 'Upload' : 'Uploaded'}
								</button>
							</div>
						</div>
					))}
					{mode === 'Edit' && data.files && data.files.length > 0 ? (
						<>
							<div className='col-12 mt-3'>
								<h4>Existing Forms</h4>
							</div>
							{data.files?.map((file, index) => (
								<div className='col-12 col-md-6 col-lg-4' key={index}>
									<div className='card'>
										<div className='card-body d-flex align-items-center'>
											<a href={`${file.file?.url}&download=true`} target='_blank' rel='noreferrer'>
												{file.file?.name}
											</a>
											<button
												className='btn btn-danger btn-sm ml-auto'
												onClick={async (e) => {
													e.preventDefault();
													if (window.confirm('Delete file?')) {
														toastr.info('Deleting form file.', 'Notice');
														await axios.delete(`/document-types/files?id=${file.id}`);
														toastr.success('Form file deleted.');
														data.files?.splice(index, 1);
														setData({ ...data });
													}
												}}>
												Delete
											</button>
										</div>
									</div>
								</div>
							))}
						</>
					) : null}
				</div>
			</div>
			<div className='form-group'>
				<button type='submit' className={`btn btn-primary btn-sm ${outIf(processing, 'disabled')}`} disabled={processing}>
					{processing ? (
						<div className='spin'>
							<i className='bi bi-arrow-clockwise'></i>
						</div>
					) : (
						'Save'
					)}
				</button>
			</div>
		</form>
	);
}
