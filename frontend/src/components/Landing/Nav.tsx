import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { routes } from '../../routes';
import state from '../../state';

export function Nav() {
	const history = useHistory();
	const url = new URLSearchParams(history.location.search);

	const logged = () => {
		return state.get('logged') && state.get('user');
	};

	const isPreview = url.get('preview') === 'true';

	return (
		<nav className='navbar navbar-expand-lg fixed-top navbar-transparent border-0' color-on-scroll='300'>
			<div className='container'>
				<div className='navbar-translate'>
					<Link className='navbar-brand' to='/' title='PBBDTM' data-placement='bottom'>
						PBBDMS
					</Link>
					<button
						className='navbar-toggler navbar-toggler'
						type='button'
						data-toggle='collapse'
						data-target='#navigation'
						aria-controls='navigation-index'
						aria-expanded='false'
						aria-label='Toggle navigation'>
						<span className='navbar-toggler-bar bar1'></span>
						<span className='navbar-toggler-bar bar2'></span>
						<span className='navbar-toggler-bar bar3'></span>
					</button>
				</div>
				{!isPreview ? (
					<div className='collapse navbar-collapse justify-content-end' id='navigation'>
						<ul className='navbar-nav'>
							<li className='nav-item'>
								<Link to={routes.TRACK_REQUEST} className='nav-link'>
									<i className='nc-icon nc-bag-16 mr-1'></i>
									Track Request
								</Link>
							</li>
							{!logged() ? (
								<>
									<li className='nav-item'>
										<Link to={routes.LOGIN} className='nav-link'>
											<i className='nc-icon nc-layout-11 mr-1'></i>
											Login
										</Link>
									</li>
									<li className='nav-item'>
										<Link to={routes.REGISTER} className='nav-link'>
											<i className='nc-icon nc-book-bookmark mr-1'></i>
											Register
										</Link>
									</li>
								</>
							) : (
								<li className='nav-item'>
									<Link to={routes.DASHBOARD} className='nav-link'>
										<i className='nc-icon nc-bank mr-1'></i>
										Dashboard
									</Link>
								</li>
							)}
						</ul>
					</div>
				) : (
					<div className='collapse navbar-collapse justify-content-end' id='navigation'>
						<ul className='navbar-nav'>
							<li className='nav-item'>
								<a href={routes.TRACK_REQUEST} className='nav-link' onClick={(e) => e.preventDefault()}>
									<i className='nc-icon nc-bag-16 mr-1'></i>
									Track Request
								</a>
							</li>
							{!logged() ? (
								<>
									<li className='nav-item'>
										<a href={routes.LOGIN} className='nav-link' onClick={(e) => e.preventDefault()}>
											<i className='nc-icon nc-layout-11 mr-1'></i>
											Login
										</a>
									</li>
									<li className='nav-item'>
										<a href={routes.REGISTER} className='nav-link' onClick={(e) => e.preventDefault()}>
											<i className='nc-icon nc-book-bookmark mr-1'></i>
											Register
										</a>
									</li>
								</>
							) : (
								<li className='nav-item'>
									<a href={routes.DASHBOARD} className='nav-link' onClick={(e) => e.preventDefault()}>
										<i className='nc-icon nc-bank mr-1'></i>
										Dashboard
									</a>
								</li>
							)}
						</ul>
					</div>
				)}
			</div>
		</nav>
	);
}
