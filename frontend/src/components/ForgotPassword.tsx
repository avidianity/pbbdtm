import axios from 'axios';
import React, { FC, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { handleError, outIf } from '../helpers';
import { routes } from '../routes';
import state from '../state';
import styles from '../styles/Login.module.css';
import toastr from 'toastr';

type Props = {};

const ForgotPassword: FC<Props> = (props) => {
	const [data, setData] = useState({
		email: '',
	});
	const [processing, setProcessing] = useState(false);

	const history = useHistory();

	if (state.has('logged') && state.get<boolean>('logged') && state.get('user')) {
		history.push(routes.DASHBOARD);
	}

	const submit = async () => {
		if (data.email.length === 0) {
			return toastr.error('Please provide a email.');
		}
		setProcessing(true);
		try {
			await axios.post('/auth/forgot-password', data);
			toastr.success('Email sent successfully. Please check your inbox.');
			history.push(routes.ROOT);
		} catch (error) {
			handleError(error);
			console.log(error);
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div className={`w-100 h-100vh d-flex bg-vgrad ${styles.body}`}>
			<div className='align-self-center mx-auto'>
				<div className={`card shadow ${styles.card}`}>
					<div className='card-header text-center'>
						<img
							src='/assets/manifest-icon-512.png'
							alt='Logo'
							className='img-fluid hw-max-75 rounded-circle clickable'
							onClick={(e) => {
								e.preventDefault();
								history.push(routes.ROOT);
							}}
						/>
						<h2 className='card-title'>
							<Link to={routes.ROOT} style={{ textDecoration: 'none' }}>
								PUP Bansud Branch
							</Link>
						</h2>
						<p className='card-text'>Documents Monitoring System</p>
					</div>
					<div className='card-body'>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								submit();
							}}>
							<div className='form-group'>
								<label htmlFor='email'>Email</label>
								<input
									type='email'
									name='email'
									id='email'
									placeholder='email@dtms.com'
									className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
									disabled={processing}
									value={data.email}
									onChange={(e) => {
										data.email = e.target.value;
										setData({ ...data });
									}}
								/>
							</div>
							<div className='form-group'>
								<button
									type='submit'
									className={`btn btn-sm btn-secondary ${outIf(processing, 'disabled')}`}
									disabled={processing}>
									{processing ? (
										<div className='spin'>
											<i className='bi bi-arrow-clockwise'></i>
										</div>
									) : (
										'Submit'
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
