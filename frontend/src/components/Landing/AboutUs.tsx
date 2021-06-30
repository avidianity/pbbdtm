import React from 'react';
import { CMS } from '../../contracts/CMS';

type Props = {
	cms: Array<CMS>;
};

export function AboutUs(props: Props) {
	const find = (key: string, defaultValue: string) => {
		const cms = props.cms.find((cms) => cms.key === key);
		if (cms) {
			return cms.value;
		}
		return defaultValue;
	};

	return (
		<div className='section section-dark text-center'>
			<div className='container'>
				<h2 className='title'>{find('about-us-title', "Let's talk about us")}</h2>
				<div className='row'>
					<div className='col-md-4'>
						<div className={`card card-profile card-plain`}>
							<div className={`card-avatar`}>
								<a href='#avatar'>
									<img src={find('about-us-profile-1-picture', '/assets/img/prof.png')} alt='...' />
								</a>
							</div>
							<div className='card-body'>
								<a href='#paper-kit'>
									<div className='author'>
										<h4 className='card-title'>{find('about-us-profile-1-name', 'Staff')}</h4>
										<h6 className='card-category'>{find('about-us-profile-1-position', 'Staff Position')}</h6>
									</div>
								</a>
								<p className='card-description text-center'>
									{find(
										'about-us-profile-1-description',
										'Description'
									)}
								</p>
							</div>
						</div>
					</div>
					<div className='col-md-4'>
						<div className={`card card-profile card-plain`}>
							<div className={`card-avatar`}>
								<a href='#avatar'>
									<img src={find('about-us-profile-2-picture', '/assets/img/prof.png')} alt='...' />
								</a>
							</div>
							<div className='card-body'>
								<a href='#paper-kit'>
									<div className='author'>
										<h4 className='card-title'>{find('about-us-profile-2-name', 'Staff')}</h4>
										<h6 className='card-category'>{find('about-us-profile-2-position', 'Staff Position')}</h6>
									</div>
								</a>
								<p className='card-description text-center'>
									{find(
										'about-us-profile-2-description',
										'Description'
									)}
								</p>
							</div>
						</div>
					</div>
					<div className='col-md-4'>
						<div className={`card card-profile card-plain`}>
							<div className={`card-avatar`}>
								<a href='#avatar'>
									<img src={find('about-us-profile-3-picture', '/assets/img/prof.png')} alt='...' />
								</a>
							</div>
							<div className='card-body'>
								<a href='#paper-kit'>
									<div className='author'>
										<h4 className='card-title'>{find('about-us-profile-3-name', 'Staff')}</h4>
										<h6 className='card-category'>{find('about-us-profile-3-position', 'Staff Position')}</h6>
									</div>
								</a>
								<p className='card-description text-center'>
									{find(
										'about-us-profile-3-description',
										'Descrption'
									)}
								</p>
							</div>
						</div>
					</div>
					<div className='col-md-4'>
						<div className={`card card-profile card-plain`}>
							<div className={`card-avatar`}>
								<a href='#avatar'>
									<img src={find('about-us-profile-4-picture', '/assets/img/prof.png')} alt='...' />
								</a>
							</div>
							<div className='card-body'>
								<a href='#paper-kit'>
									<div className='author'>
										<h4 className='card-title'>{find('about-us-profile-4-name', 'Staff')}</h4>
										<h6 className='card-category'>{find('about-us-profile-4-position', 'Staff Position')}</h6>
									</div>
								</a>
								<p className='card-description text-center'>
									{find(
										'about-us-profile-4-description',
										'Description'
									)}
								</p>
							</div>
						</div>
					</div>
					<div className='col-md-4'>
						<div className={`card card-profile card-plain`}>
							<div className={`card-avatar`}>
								<a href='#avatar'>
									<img src={find('about-us-profile-5-picture', '/assets/img/prof.png')} alt='...' />
								</a>
							</div>
							<div className='card-body'>
								<a href='#paper-kit'>
									<div className='author'>
										<h4 className='card-title'>{find('about-us-profile-5-name', 'Staff')}</h4>
										<h6 className='card-category'>{find('about-us-profile-5-position', 'Staff Position')}</h6>
									</div>
								</a>
								<p className='card-description text-center'>
									{find(
										'about-us-profile-5-description',
										'Description'
									)}
								</p>
							</div>
						</div>
					</div>
					<div className='col-md-4'>
						<div className={`card card-profile card-plain`}>
							<div className={`card-avatar`}>
								<a href='#avatar'>
									<img src={find('about-us-profile-6-picture', '/assets/img/prof.png')} alt='...' />
								</a>
							</div>
							<div className='card-body'>
								<a href='#paper-kit'>
									<div className='author'>
										<h4 className='card-title'>{find('about-us-profile-6-name', 'Staff')}</h4>
										<h6 className='card-category'>{find('about-us-profile-6-position', 'Staff Position')}</h6>
									</div>
								</a>
								<p className='card-description text-center'>
									{find(
										'about-us-profile-6-description',
										'Description'
									)}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
