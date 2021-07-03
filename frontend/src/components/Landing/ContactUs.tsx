import axios from 'axios';
import React, { useState } from 'react';
import { outIf } from '../../helpers';
import toastr from 'toastr';

export function ContactUs() {
	const [data, setData] = useState({
		name: '',
		email: '',
		message: '',
	});
	const [processing, setProcessing] = useState(false);

	const submit = async () => {
		setProcessing(true);
		try {
			await axios.post('/contacts', data);
			setData({
				name: '',
				email: '',
				message: '',
			});
			toastr.info('Message has been sent.', 'Notice');
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to send message', 'Oops!');
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div className='section landing-section'>
			<div className='container'>
				<div className='row'>
					<div className='col-md-8 ml-auto mr-auto'>
						<h2 className='text-center'>Keep in touch?</h2>
						<form
							className='contact-form'
							onSubmit={(e) => {
								e.preventDefault();
								submit();
							}}>
							<div className='row'>
								<div className='col-md-6'>
									<label>Name</label>
									<div className='input-group'>
										<div className='input-group-prepend'>
											<span className='input-group-text'>
												<i className='nc-icon nc-single-02'></i>
											</span>
										</div>
										<input
											type='text'
											className={`form-control ${outIf(processing, 'disabled')}`}
											disabled={processing}
											onChange={(e) => {
												setData({
													...data,
													name: e.target.value,
												});
											}}
											placeholder='Name'
										/>
									</div>
								</div>
								<div className='col-md-6'>
									<label>Email</label>
									<div className='input-group'>
										<div className='input-group-prepend'>
											<span className='input-group-text'>
												<i className='nc-icon nc-email-85'></i>
											</span>
										</div>
										<input
											type='email'
											className={`form-control ${outIf(processing, 'disabled')}`}
											disabled={processing}
											onChange={(e) => {
												setData({
													...data,
													email: e.target.value,
												});
											}}
											placeholder='Email'
										/>
									</div>
								</div>
							</div>
							<label>Message</label>
							<textarea
								className={`form-control ${outIf(processing, 'disabled')}`}
								disabled={processing}
								onChange={(e) => {
									setData({
										...data,
										message: e.target.value,
									});
								}}
								rows={4}
								placeholder='Tell us your thoughts and feelings...'></textarea>
							<div className='row'>
								<div className='col-md-4 ml-auto mr-auto text-center'>
									<button
										type='submit'
										className={`btn btn-danger btn-lg btn-fill ${outIf(processing, 'disabled')}`}
										disabled={processing}>
										{processing ? 'Sending' : 'Send Message'}
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
				<div className='row'>
					<div className='col-12 col-md-6 offset-md-3 pt-5 text-center'>
						<a href='#'>
							<i className='fab fa-facebook fa-2x mx-2'></i>
						</a>
						<a href='#'>
							<i className='fab fa-twitter fa-2x mx-2'></i>
						</a>
						<a href='#'>
							<i className='fab fa-youtube fa-2x mx-2'></i>
						</a>
						<a href='#'>
							<i className='fab fa-linkedin fa-2x mx-2'></i>
						</a>
					</div>
					<div className='col-12 col-md-6 offset-md-3 pt-5'>
						<h6>Contact Us</h6>
						<div className='row'>
							<div className='col-3'>
								<b>PHONE</b>
							</div>
							<div className='col-9'>091234567890</div>
							<div className='col-3'>
								<b>EMAIL</b>
							</div>
							<div className='col-9'>email@pup.com</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
