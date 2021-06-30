import React, { FC, useEffect } from 'react';
import { TrackRequest } from '../TrackRequest';
import { Nav } from './Nav';

type Props = {};

const Track: FC<Props> = (props) => {
	useEffect(() => {
		$('body').css('background-color', '#fff');
		const link = $('#dashboard-styles').attr('href');
		$('#dashboard-styles').remove();
		$('head').append(
			`<link rel="stylesheet" href="https://demos.creative-tim.com/paper-kit-2/assets/css/paper-kit.min.css?v=2.2.0" id="landing-styles" />`
		);
		$('head').append(
			`<script src="https://demos.creative-tim.com/paper-kit-2/assets/js/paper-kit.min.js?v=2.2.0" id="landing-script"></script>`
		);

		return () => {
			$('body').css('background-color', '#f4f3ef');
			$('#landing-styles').remove();
			$('#landing-script').remove();
			$('head').append(`<link rel="stylesheet" href="${link}" />`);
		};

		// eslint-disable-next-line
	}, []);

	return (
		<div className='pb-5'>
			<Nav />
			<div
				className='page-header'
				style={{
					backgroundImage: 'url(/assets/img/pup.jpg)',
					backgroundPosition: '50%',
					backgroundSize: 'cover',
					minHeight: '100vh',
					maxHeight: '999px',
					overflow: 'hidden',
					position: 'relative',
					width: '100%',
					zIndex: 1,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}>
				<div className='filter'></div>
				<div className='container d-flex'>
					<TrackRequest className='d-inline mx-auto' />
				</div>
			</div>
		</div>
	);
};

export default Track;
