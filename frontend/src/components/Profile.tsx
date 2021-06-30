import axios from 'axios';
import React, { ChangeEvent, createRef, useEffect, useState } from 'react';
import { User } from '../contracts/User';
import { handleError, outIf } from '../helpers';
import state from '../state';
import toastr from 'toastr';
import { Link } from 'react-router-dom';

export function Profile() {
	const [processing, setProcessing] = useState(false);
	const [data, setData] = useState(state.get<User>('user'));
	const [profileURL, setProfileURL] = useState(data.profilePicture?.url || 'https://via.placeholder.com/200');
	const user = data;

	const fileRef = createRef<HTMLInputElement>();

	const reader = new FileReader();

	let changingProfile = false;

	reader.onload = async (e) => {
		if (e.target && e.target.result) {
			if (changingProfile) {
				return;
			}
			changingProfile = true;
			try {
				const { data } = await axios.put<User>('/self/profile', {
					file: String(e.target.result),
				});

				setProfileURL(data.profilePicture?.url || 'https://via.placeholder.com/200');

				state.set('user', data);

				toastr.info('Profile picture saved.', 'Info');
			} catch (error) {
				console.log(error);
				handleError(error);
			} finally {
				$<HTMLFormElement>('#file-upload')[0].reset();
				changingProfile = false;
			}
		}
	};

	const submit = async () => {
		setProcessing(true);
		try {
			const response = await axios.put<User>(`/self`, data);
			state.set('user', response.data);
			toastr.info('Profile updated successfully.', 'Info');
		} catch (error) {
			console.log(error);
			handleError(error);
		} finally {
			setProcessing(false);
		}
	};

	useEffect(() => {
		$('.main-panel').removeClass('h-100');
		const key = state.listen<User>('user', (user) => {
			setData({ ...data });
		});
		return () => {
			state.unlisten('user', key);
		};
		// eslint-disable-next-line
	}, []);

	const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { id, value } = e.target;
		setData({
			...data,
			[id]: value,
		});
	};

	return (
		<div className='row'>
			<div className='col-md-4'>
				<div className='card card-user w-100'>
					<div className='image'>
						<img src='/assets/img/damir-bosnjak.jpg' alt='...' />
					</div>
					<div className='card-body'>
						<div className='author'>
							<a
								href={window.location.pathname}
								title='Change Profile Picture'
								onClick={(e) => {
									e.preventDefault();
									fileRef.current?.click();
								}}>
								<img className='avatar border-gray shadow-sm' src={profileURL} alt='...' />
							</a>
							<Link to={window.location.pathname}>
								<h5 className='title'>{user.name}</h5>
							</Link>
							<p className='description'>@{user.name.split(' ').join('').toLowerCase()}</p>
						</div>
					</div>
					<div className='card-footer'>
						<hr />
						<div className='button-container'>
							<div className='row'>
								<div className='col-lg-3 col-md-6 col-6 ml-auto'>
									<h5>
										12
										<br />
										<small>Files</small>
									</h5>
								</div>
								<div className='col-lg-4 col-md-6 col-6 ml-auto mr-auto'>
									<h5>
										2
										<br />
										<small>Requests</small>
									</h5>
								</div>
								<div className='col-lg-3 mr-auto'>
									<h5>
										5
										<br />
										<small>Logins</small>
									</h5>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className='col-md-8'>
				<div className='card card-user'>
					<div className='card-header'>
						<h5 className='card-title'>Edit Profile</h5>
					</div>
					<div className='card-body'>
						<form id='file-upload' onSubmit={(e) => e.preventDefault()}>
							<input
								type='file'
								ref={fileRef}
								className='d-none'
								onChange={(e) => {
									if (e.target.files && e.target.files.length > 0) {
										reader.readAsDataURL(e.target.files[0]);
									}
								}}
								accept='image/*'
							/>
						</form>
						<form
							onSubmit={async (e) => {
								e.preventDefault();
								await submit();
							}}>
							<div className='row'>
								<div className='col-12'>
									<div className='form-group'>
										<label htmlFor='name'>Name</label>
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
										<label htmlFor='email'>Email</label>
										<input
											type='email'
											name='email'
											id='email'
											placeholder='Email'
											className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
											disabled={processing}
											value={data.email}
											onChange={handleChange}
										/>
									</div>
									<div className='form-group'>
										<label htmlFor='phone'>Phone</label>
										<input
											type='text'
											name='phone'
											id='phone'
											placeholder='Phone'
											className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
											disabled={processing}
											value={data.phone}
											onChange={handleChange}
										/>
									</div>
									<div className='form-group'>
										<label htmlFor='password'>Password</label>
										<input
											type='password'
											name='password'
											id='password'
											placeholder='Password'
											className={`form-control form-control-sm ${outIf(processing, 'disabled')}`}
											disabled={processing}
											value={data.password}
											onChange={handleChange}
										/>
									</div>
								</div>
							</div>
							<div className='row'>
								<div className='update ml-auto mr-auto'>
									<button
										type='submit'
										className={`btn btn-primary btn-round text-center ${outIf(processing, 'disabled')}`}
										style={{ width: '160px' }}
										disabled={processing}>
										{processing ? (
											<div className='spin'>
												<i className='bi bi-arrow-clockwise'></i>
											</div>
										) : (
											'Update Profile'
										)}
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
