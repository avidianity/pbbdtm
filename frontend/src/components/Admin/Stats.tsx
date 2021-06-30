import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useEffect, useState } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { routes } from '../../routes';
import { Logs } from '../Logs';

dayjs.extend(relativeTime);

export function Stats() {
	const [stats, setStats] = useState({
		users: 0,
		logs: 0,
		approved_requests: 0,
		pending_requests: 0,
		last_log: null as any,
	});
	const match = useRouteMatch();

	const url = (path: string) => {
		const fragments = match.path.split('');
		if (fragments[fragments.length - 1] === '/') {
			fragments.splice(fragments.length - 1, 1);
		}
		return `${fragments.join('')}${path}`;
	};

	const fetchStats = async () => {
		try {
			const { data } = await axios.get('/statistics');
			setStats(data);
		} catch (error) {
			console.log(error.toJSON());
		}
	};

	useEffect(() => {
		fetchStats();
		// eslinst-disable-next-line
	}, []);

	return (
		<div>
			<div className='row'>
				<div className='col-lg-3 col-md-6 col-sm-6'>
					<div className='card card-stats'>
						<div className='card-body '>
							<div className='row'>
								<div className='col-5 col-md-4'>
									<div className='icon-big text-center icon-warning'>
										<i className='nc-icon nc-globe text-warning'></i>
									</div>
								</div>
								<div className='col-7 col-md-8'>
									<div className='numbers'>
										<p className='card-category'>Pending Requests</p>
										<p className='card-title'>{stats.pending_requests}</p>
										<p></p>
									</div>
								</div>
							</div>
						</div>
						<div className='card-footer'>
							<hr />
							<Link to={url(routes.REQUESTS.ROOT)} className='stats'>
								<i className='fa fa-edit'></i>
								View
							</Link>
						</div>
					</div>
				</div>
				<div className='col-lg-3 col-md-6 col-sm-6'>
					<div className='card card-stats'>
						<div className='card-body '>
							<div className='row'>
								<div className='col-5 col-md-4'>
									<div className='icon-big text-center icon-warning'>
										<i className='nc-icon nc-money-coins text-success'></i>
									</div>
								</div>
								<div className='col-7 col-md-8'>
									<div className='numbers'>
										<p className='card-category'>Completed Requests</p>
										<p className='card-title'>{stats.approved_requests}</p>
										<p></p>
									</div>
								</div>
							</div>
						</div>
						<div className='card-footer '>
							<hr />
							<Link to={url(routes.REQUESTS.ROOT)} className='stats'>
								<i className='fa fa-calendar-o'></i>
								View
							</Link>
						</div>
					</div>
				</div>
				<div className='col-lg-3 col-md-6 col-sm-6'>
					<div className='card card-stats'>
						<div className='card-body '>
							<div className='row'>
								<div className='col-5 col-md-4'>
									<div className='icon-big text-center icon-warning'>
										<i className='nc-icon nc-vector text-danger'></i>
									</div>
								</div>
								<div className='col-7 col-md-8'>
									<div className='numbers'>
										<p className='card-category'>Total Logs</p>
										<p className='card-title'>{stats.logs}</p>
										<p></p>
									</div>
								</div>
							</div>
						</div>
						<div className='card-footer '>
							<hr />
							<div className='stats'>
								<i className='fa fa-clock-o'></i>
								{dayjs(stats.last_log ? stats.last_log.updated_at : new Date()).fromNow()}
							</div>
						</div>
					</div>
				</div>
				<div className='col-lg-3 col-md-6 col-sm-6'>
					<div className='card card-stats'>
						<div className='card-body '>
							<div className='row'>
								<div className='col-5 col-md-4'>
									<div className='icon-big text-center icon-warning'>
										<i className='nc-icon nc-favourite-28 text-primary'></i>
									</div>
								</div>
								<div className='col-7 col-md-8'>
									<div className='numbers'>
										<p className='card-category'>Users</p>
										<p className='card-title'>{stats.users}</p>
										<p></p>
									</div>
								</div>
							</div>
						</div>
						<div className='card-footer '>
							<hr />
							<Link to={url(routes.USERS)} className='stats'>
								<i className='fa fa-refresh'></i>
								View
							</Link>
						</div>
					</div>
				</div>
			</div>
			<Logs />
		</div>
	);
}
