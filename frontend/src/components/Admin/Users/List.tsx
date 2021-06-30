import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import { User } from '../../../contracts/User';
import { createTableColumns, exceptMany, handleError, ucwords } from '../../../helpers';
import { Table } from '../../Shared/Table';
import toastr from 'toastr';
import dayjs from 'dayjs';

export function List() {
	const [users, setUsers] = useState<Array<User>>([]);
	const [processing, setProcessing] = useState(false);
	const match = useRouteMatch();
	const history = useHistory();

	const path = (path: string) => `${match.path}${path}`;

	const fetchUsers = async () => {
		setProcessing(true);
		try {
			const { data } = await axios.get<Array<User>>('/users');
			setUsers(exceptMany(data, ['profile_picture_id']));
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to fetch users.');
		} finally {
			setProcessing(false);
		}
	};

	const deleteUser = async (id: any) => {
		setProcessing(true);
		try {
			await axios.delete(`/users?id=${id}`);
			toastr.success('User deleted successfully.');
			await fetchUsers();
		} catch (error) {
			console.log(error.toJSON());
			handleError(error);
			setProcessing(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const getBadge = (role: Roles) => {
		if (role === 'Admin') {
			return 'red';
		} else if (role === 'Applicant') {
			return 'warning';
		} else {
			return 'green';
		}
	};

	return (
		<Table
			title='Users'
			columns={createTableColumns(users).map((column) => {
				if (['updated at', 'created at'].includes(column.toLowerCase())) {
					return ucwords(column.split(' ')[0]);
				}
				if (column.toLowerCase() === 'profile picture') {
					return '';
				}
				return column;
			})}
			data={users.map((user) => ({
				...user,
				created_at: dayjs(user.created_at).fromNow(),
				updated_at: dayjs(user.updated_at).fromNow(),
				role: <span className={`badge badge-${getBadge(user.role)}`}>{user.role}</span>,
				profilePicture: (
					<Link to={path(`${user.id}`)}>
						<img
							src={user.profilePicture?.url || 'https://via.placeholder.com/40'}
							className='rounded-circle shadow-sm border img-fluid d-none d-xl-block'
							style={{ height: '40px', width: '40px' }}
							alt='Profile'
						/>
					</Link>
				),
			}))}
			processing={processing}
			onAddClick={() => history.push(path('add'))}
			onViewClick={({ id }) => {
				history.push(path(`${id}`));
			}}
			onEditClick={({ id }) => {
				history.push(path(`${id}/edit`));
			}}
			onDeleteConfirm={({ id }) => {
				deleteUser(id);
			}}
			onRefreshClick={fetchUsers}
			withAction={true}
			pagination={true}
		/>
	);
}
