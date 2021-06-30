import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useEffect, useState } from 'react';
import { Log } from '../contracts/Log';
import { handleError } from '../helpers';

dayjs.extend(relativeTime);

export function Logs() {
	const [logs, setLogs] = useState<Array<Log>>([]);

	const fetchLogs = async () => {
		try {
			const { data } = await axios.get('/logs');
			setLogs([...data]);
		} catch (error) {
			console.log(error.toJSON());
			handleError(error);
		}
	};

	useEffect(() => {
		fetchLogs();
		// eslint-disable-next-line
	}, []);

	return (
		<div className='card w-100'>
			<div className='card-header'>
				<h3 className='card-title'>History Logs</h3>
				{logs.length === 0 ? <p className='card-text'>No Data</p> : null}
			</div>
			<div className='card-body table-responsive' style={{ overflowY: 'hidden' }}>
				<table className='table table-sm text-center'>
					<thead>
						<tr>
							<th>User</th>
							<th>Action</th>
							<th>Request Type</th>
							<th>Requester's Name</th>
							<th>Date</th>
						</tr>
					</thead>
					<tbody>
						{[...logs].reverse().map((log, index) => (
							<tr key={index}>
								<td>{log.user?.name}</td>
								<td>{log.action}</td>
								<td>{log.loggable?.documentType?.name}</td>
								<td>{log.loggable?.user?.name}</td>
								<td>{dayjs(log.updated_at).format('MMMM DD, YYYY hh:mm A')}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
