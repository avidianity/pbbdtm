import React, { useState } from 'react';
import { outIf } from '../helpers';
import toastr from 'toastr';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { Request } from '../contracts/Request';
import state from '../state';
import { User } from '../contracts/User';
import { routes } from '../routes';

type Props = {
	className?: string;
};

export function TrackRequest(props: Props) {
	const [processing, setProcessing] = useState(false);
	const [id, setID] = useState('');
	const history = useHistory();

	const user = state.get<User>('user');

	const submit = async () => {
		setProcessing(true);
		try {
			const { data } = await axios.get<Array<Request>>('/requests');
			const request = data.find((request) => request.request_id.includes(id) || request.request_id === id);
			if (request && (!state.has('logged') || !state.get('logged') || state.get('user') === undefined)) {
				return history.push(`${routes.TRACK_REQUEST}/${request.id}`);
			}
			if (!request || (user.role === 'Applicant' && request.user_id !== user.id)) {
				return toastr.info('Request ID is invalid.', 'Notice');
			}
			history.push(`/dashboard/requests/${request.id}`);
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to verify request ID.', 'Oops!');
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div className={`card shadow ${props.className}`}>
			<div className='card-body'>
				<form
					className='form-inline'
					onSubmit={(e) => {
						e.preventDefault();
						submit();
					}}>
					<div className='form-group'>
						<input
							type='text'
							placeholder='Request ID'
							className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
							disabled={processing}
							value={id}
							onChange={(e) => {
								setID(e.target.value.trim());
							}}
						/>
					</div>
					<div className='form-group'>
						<button type='submit' className={`btn btn-warning ${outIf(processing, 'disabled')}`} disabled={processing}>
							{processing ? 'Processing' : 'Track Request'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
