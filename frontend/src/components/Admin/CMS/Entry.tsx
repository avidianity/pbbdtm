import React, { createRef, useState } from 'react';
import { CMS } from '../../../contracts/CMS';
import toastr from 'toastr';
import { outIf } from '../../../helpers';
import dayjs from 'dayjs';

type Props = {
	cms: CMS;
	onChange: (value: string, success: () => void) => void;
};

export function Entry({ cms, onChange }: Props) {
	const [value, setValue] = useState(cms.value);
	const [mode, setMode] = useState<'Edit' | 'View'>('View');
	const [uploaded, setUploaded] = useState(false);

	const isFile = cms.key.includes('picture');

	const fileRef = createRef<HTMLInputElement>();

	const reader = new FileReader();

	reader.onload = (event) => {
		if (event.target && event.target.result) {
			setValue(String(event.target.result));
		}
	};

	return (
		<div className='col-12 col-md-4 col-lg-3 border-0 p-3 mb-4 d-flex'>
			<div className='card' style={{ flex: 1 }}>
				{isFile ? (
					<img
						className='card-img-top'
						src={value}
						alt={cms.key}
						style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
					/>
				) : null}
				<div className='card-body'>
					<div className='form-group'>
						<h6 className='card-title'>{cms.key}</h6>
						<small className='text-muted form-text mb-4 mt-0'>Last Updated: {dayjs(cms.updated_at).fromNow()}</small>
						{mode === 'View' ? <p>{isFile ? null : <b>{value}</b>}</p> : null}
						{mode === 'Edit' ? (
							isFile ? (
								<div>
									<button
										className={`btn btn-info btn-sm ${outIf(uploaded, 'disabled')}`}
										disabled={uploaded}
										onClick={(e) => {
											e.preventDefault();
											if (!uploaded && fileRef.current) {
												fileRef.current.click();
											}
										}}>
										{uploaded ? 'Uploaded' : 'Upload'}
									</button>
									<input
										type='file'
										ref={fileRef}
										className='d-none'
										onChange={(e) => {
											if (e.target.files && e.target.files.length > 0 && !uploaded) {
												reader.readAsDataURL(e.target.files[0]);
												setUploaded(true);
											}
										}}
									/>
								</div>
							) : (
								<input
									type='text'
									className='form-control form-control-sm'
									value={value}
									placeholder='Value'
									onChange={(e) => {
										setValue(e.target.value);
									}}
								/>
							)
						) : null}
					</div>
				</div>
				<div className='card-footer'>
					<div className='form-group'>
						<button
							className='btn btn-success btn-sm d-inline-block mx-1'
							onClick={(e) => {
								e.preventDefault();
								if (mode === 'Edit') {
									onChange(value, () => {
										toastr.info(`${cms.key} has been updated.`, 'Notice');
										setUploaded(false);
									});
									setMode('View');
								} else {
									setMode('Edit');
								}
							}}>
							{mode === 'Edit' ? 'Save' : 'Edit'}
						</button>
						{mode === 'Edit' ? (
							<button
								className='btn btn-danger btn-sm d-inline-block mx-1'
								onClick={(e) => {
									e.preventDefault();
									setMode('View');
								}}>
								Cancel
							</button>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
}
