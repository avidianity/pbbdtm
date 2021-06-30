import axios from 'axios';
import React, { createRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Downloadable } from '../../../contracts/Downloadable';
import { handleError, outIf } from '../../../helpers';
import toastr from 'toastr';

export function Form() {
	const [processing, setProcessing] = useState(false);
	const [data, setData] = useState<any>({
		id: -1,
		name: '',
		file: null,
		category: '',
	});

	const history = useHistory();

	const reader = new FileReader();

	reader.onload = (event) => {
		if (event.target && event.target.result) {
			data.file = String(event.target.result) as any;
			setData({
				...data,
			});
		}
	};

	const ref = createRef<HTMLInputElement>();
	const form = createRef<HTMLFormElement>();

	const reset = () => setData({ name: '', file: null });

	const submit = async () => {
		if (processing) return;
		setProcessing(true);
		try {
			await axios.post<Downloadable>('/downloadables', data);
			toastr.success('Downloadable saved successfully.');
			reset();
			if (form.current) {
				form.current.reset();
			}
		} catch (error) {
			handleError(error);
		} finally {
			setProcessing(false);
		}
	};

	return (
		<form
			className='container'
			ref={form}
			onSubmit={async (e) => {
				e.preventDefault();
				await submit();
			}}>
			<div className='d-flex'>
				<h3 className='align-self-center mb-0'>Create Downloadable</h3>
				<button
					className='btn btn-info btn-sm align-self-center ml-auto'
					onClick={(e) => {
						e.preventDefault();
						history.goBack();
					}}>
					Back
				</button>
			</div>
			<div className='form-group'>
				<label htmlFor='category'>Category</label>
				<input
					type='text'
					name='category'
					id='category'
					placeholder='Category'
					className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
					disabled={processing}
					value={data.category}
					onChange={(e) => {
						data.category = e.target.value;
						setData({ ...data });
					}}
				/>
			</div>
			<div className='form-group'>
				<button
					className={`btn btn-info btn-sm ${outIf(processing || data.file !== null, 'disabled')}`}
					disabled={processing || data.file !== null}
					onClick={(e) => {
						e.preventDefault();
						if (data.file === null) {
							ref.current!.click();
						}
					}}>
					{data.file === null ? 'Upload File' : 'File Uploaded'}
				</button>
				<input
					type='file'
					ref={ref}
					className={`form-control form-control-sm ${outIf(processing, 'disabled')} d-none`}
					disabled={processing}
					onChange={(e) => {
						if (e.target.files && e.target.files.length > 0) {
							const file = e.target.files[0];

							reader.readAsDataURL(file);

							data.name = file.name;

							setData({
								...data,
							});
						}
					}}
				/>
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
