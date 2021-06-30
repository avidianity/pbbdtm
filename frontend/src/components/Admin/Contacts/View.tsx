import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Contact } from '../../../contracts/Contact';
import { handleError } from '../../../helpers';
import toastr from 'toastr';

export function View() {
	const [contact, setContact] = useState<Contact | null>(null);
	const history = useHistory();

	const fetchContact = async (contactID: string) => {
		try {
			const { data } = await axios.get<Contact>(`/contacts/show?id=${contactID}`);
			setContact(data);
		} catch (error) {
			handleError(error);
			history.goBack();
		}
	};

	let deleting = false;

	const deleteContact = async () => {
		if (deleting) {
			return;
		}
		deleting = true;
		try {
			await axios.delete(`/contacts?id=${contact?.id}`);
			toastr.success('Contact deleted successfully.');
			history.goBack();
		} catch (error) {
			handleError(error);
		} finally {
			deleting = false;
		}
	};

	const { params } = useRouteMatch<{ id: string }>();

	useEffect(() => {
		fetchContact(params.id);
		// eslint-disable-next-line
	}, []);

	return (
		<div className='container'>
			<div className='row'>
				<div className='col-12'>
					<h3 className='mb-0'>View Contact</h3>
				</div>
				<div className='col-12 d-flex'>
					<button
						className='btn btn-info btn-sm align-self-center'
						onClick={(e) => {
							e.preventDefault();
							history.goBack();
						}}>
						Back
					</button>
					<a
						href={`${window.location.pathname}/delete`}
						className='btn btn-danger btn-sm align-self-center ml-1'
						onClick={(e) => {
							e.preventDefault();
							$('#deleteContactModal').modal('show');
						}}>
						Delete
					</a>
				</div>
				<div className='col-12'>
					{contact ? (
						<div className='card shadow rounded'>
							<div className='card-body'>
								<h6>Name</h6>
								<p>{contact.name}</p>
								<h6>Email</h6>
								<p>{contact.email}</p>
								<h6>Message</h6>
								<p>{contact.message}</p>
							</div>
						</div>
					) : (
						<div className='d-flex h-100 w-100'>
							<div className='align-self-center mx-auto'>
								<i className='fas fa-circle-notch fa-spin fa-2x'></i>
							</div>
						</div>
					)}
				</div>
			</div>
			<div
				className='modal fade'
				id={`deleteContactModal`}
				tabIndex={-1}
				role='dialog'
				aria-labelledby={`deleteContactModalLabel`}
				aria-hidden='true'>
				<div className='modal-dialog modal-dialog-centered modal-lg' role='document'>
					<div className='modal-content'>
						<div className='modal-header'>
							<h5 className='modal-title' id={`deleteContactModalLabel`}>
								Delete Contact
							</h5>
							<button type='button' className='close' data-dismiss='modal' aria-label='Close'>
								<span aria-hidden='true'>&times;</span>
							</button>
						</div>
						<div className='modal-body'>Are you sure you want to delete {contact?.name || 'this contact'}?</div>
						<div className='modal-footer'>
							<button
								type='button'
								className='btn btn-danger btn-sm'
								onClick={(e) => {
									e.preventDefault();
									$('#deleteContactModal').modal('hide');
									deleteContact();
								}}>
								Confirm
							</button>
							<button type='button' className='btn btn-secondary btn-sm' data-dismiss='modal'>
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
