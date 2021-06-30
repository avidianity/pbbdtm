import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Contact } from '../../../contracts/Contact';
import { handleError } from '../../../helpers';
import { Table } from '../../Shared/Table';
import toastr from 'toastr';
import dayjs from 'dayjs';

export function List() {
	const [contacts, setContacts] = useState<Array<Contact>>([]);
	const [processing, setProcessing] = useState(false);
	const match = useRouteMatch();
	const history = useHistory();

	const path = (path: string) => `${match.path}${path}`;

	const fetchContacts = async () => {
		setProcessing(true);
		try {
			const { data } = await axios.get<Array<Contact>>('/contacts');
			setContacts(data);
		} catch (error) {
			console.log(error.toJSON());
			toastr.error('Unable to fetch contacts.');
		} finally {
			setProcessing(false);
		}
	};

	const deleteContact = async (id: any) => {
		setProcessing(true);
		try {
			await axios.delete(`/contacts?id=${id}`);
			toastr.success('Contact deleted successfully.');
			await fetchContacts();
		} catch (error) {
			console.log(error.toJSON());
			handleError(error);
			setProcessing(false);
		}
	};

	useEffect(() => {
		fetchContacts();
	}, []);

	return (
		<Table
			title='Contacts'
			data={contacts.map((contact) => ({
				...contact,
				created_at: dayjs(contact.created_at).fromNow(),
				updated_at: dayjs(contact.updated_at).fromNow(),
				message: <p className='text-muted m-0 p-0'>{contact.message.substr(0, 15)}...</p>,
			}))}
			processing={processing}
			onAddClick={() => history.push(path('add'))}
			onViewClick={({ id }) => {
				history.push(path(`${id}`));
			}}
			onEditClick={() => {
				//
			}}
			onDeleteConfirm={({ id }) => {
				deleteContact(id);
			}}
			onRefreshClick={fetchContacts}
			withAction={true}
			pagination={true}
			dontShowEdit={true}
			disableAddButton={true}
		/>
	);
}
