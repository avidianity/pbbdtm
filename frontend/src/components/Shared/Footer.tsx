import React from 'react';

export function Footer() {
	return (
		<footer className='footer d-none' style={{ position: 'absolute', bottom: 0, width: '-webkit-fill-available' }}>
			<div className='container-fluid'>
				<div className='row'>
					<nav className='footer-nav'>
						<ul>
							<li>
								<a
									href='/'
									target='_blank'
									onClick={(e) => {
										e.preventDefault();
									}}>
									Blog
								</a>
							</li>
							<li>
								<a
									href='/'
									target='_blank'
									onClick={(e) => {
										e.preventDefault();
									}}>
									Licenses
								</a>
							</li>
						</ul>
					</nav>
					<div className='credits ml-auto'>
						<span className='copyright'>
							© 2020, made with <i className='fa fa-heart heart'></i> by JMM
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
