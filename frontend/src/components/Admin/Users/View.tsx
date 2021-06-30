import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import { User } from '../../../contracts/User';
import { handleError } from '../../../helpers';
import toastr from 'toastr';

export function View() {
	const [user, setUser] = useState<User | null>(null);
	const history = useHistory();

	const fetchUser = async (userID: string) => {
		try {
			const { data } = await axios.get<User>(`/users/show?id=${userID}`);
			setUser(data);
		} catch (error) {
			handleError(error);
			history.goBack();
		}
	};

	let deleting = false;

	const deleteUser = async () => {
		if (deleting) {
			return;
		}
		deleting = true;
		try {
			await axios.delete(`/users?id=${user?.id}`);
			toastr.success('User deleted successfully.');
			history.goBack();
		} catch (error) {
			handleError(error);
		} finally {
			deleting = false;
		}
	};

	const { params } = useRouteMatch<{ id: string }>();

	useEffect(() => {
		fetchUser(params.id);
		// eslint-disable-next-line
	}, []);

	const profileURL = user?.profilePicture?.url || 'https://via.placeholder.com/200';

	return (
		<div className='container'>
			<div className='row'>
				<div className='col-12'>
					<h3 className='mb-0'>View User</h3>
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
					<Link to={`${window.location.pathname}/edit`} className='btn btn-warning btn-sm align-self-center ml-auto'>
						Edit
					</Link>
					<a
						href={`${window.location.pathname}/delete`}
						className='btn btn-danger btn-sm align-self-center ml-1'
						onClick={(e) => {
							e.preventDefault();
							$('#deleteUserModal').modal('show');
						}}>
						Delete
					</a>
				</div>
				<div className='col-12'>
					{user ? (
						<div className='card shadow rounded'>
							<div className='card-body'>
								<img
									src={profileURL}
									alt='Profile'
									className='img-fluid rounded-circle mb-3'
									style={{ height: '50px', width: '50px' }}
								/>
								<h6>Name</h6>
								<p>{user.name}</p>
								<h6>Email</h6>
								<p>{user.email}</p>
								<h6>Phone</h6>
								<p>{user.phone}</p>
								<h6>Role</h6>
								<p>{user.role}</p>
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
				id={`deleteUserModal`}
				tabIndex={-1}
				role='dialog'
				aria-labelledby={`deleteUserModalLabel`}
				aria-hidden='true'>
				<div className='modal-dialog modal-dialog-centered modal-lg' role='document'>
					<div className='modal-content'>
						<div className='modal-header'>
							<h5 className='modal-title' id={`deleteUserModalLabel`}>
								Delete User
							</h5>
							<button type='button' className='close' data-dismiss='modal' aria-label='Close'>
								<span aria-hidden='true'>&times;</span>
							</button>
						</div>
						<div className='modal-body'>Are you sure you want to delete {user?.name || 'this user'}?</div>
						<div className='modal-footer'>
							<button
								type='button'
								className='btn btn-danger btn-sm'
								onClick={(e) => {
									e.preventDefault();
									$('#deleteUserModal').modal('hide');
									deleteUser();
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
