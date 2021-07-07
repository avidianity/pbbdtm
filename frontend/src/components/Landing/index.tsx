import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { CMS } from '../../contracts/CMS';
import { outIf } from '../../helpers';
import { Stats } from '../Admin/Stats';
import { AboutUs } from './AboutUs';
import Carousel from './Carousel';
import { ContactUs } from './ContactUs';
import { Description } from './Description';
import { FAQs } from './FAQs';
import { Header } from './Header';
import { Nav } from './Nav';

export function Landing() {
	const [loaded, setLoaded] = useState(false);
	const [cms, setCMS] = useState<Array<CMS>>([]);

	const fetchCMS = async () => {
		try {
			const { data } = await axios.get<Array<CMS>>('/cms');
			setCMS([...data]);
		} catch (error) {
			console.log(error.toJSON());
		} finally {
			setLoaded(true);
		}
	};

	useEffect(() => {
		fetchCMS();
		$('body').css('background-color', '#fff');
		const link = $('#dashboard-styles').attr('href');
		// $('#dashboard-styles').remove();
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
		<>
			<div className={`pb-5 ${outIf(!loaded, 'd-none')}`}>
				<Nav />
				<Header cms={cms} />
				<Description cms={cms} />
				<Carousel />
				<AboutUs cms={cms} />
				<ContactUs />
				<FAQs cms={cms} />
				<div className='container'>
					<h3 className='text-center mb-4'>Current Statistics</h3>
					<Stats />
				</div>
			</div>
			{!loaded ? (
				<div className='h-100vh d-flex align-items-center justify-content-center'>
					<div className='container-fluid text-center'>
						<img
							src='/assets/manifest-icon-512.png'
							alt='Logo'
							className='img-fluid rounded-circle'
							style={{ height: '200px', width: '200px' }}
						/>
					</div>
				</div>
			) : null}
		</>
	);
}
