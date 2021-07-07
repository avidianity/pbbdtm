import React, { FC } from 'react';

type Props = {};

const Carousel: FC<Props> = (props) => {
	const id = Math.random().toString(36).substring(2, 15);

	return (
		<div className='container mb-4'>
			<div id={id} className='carousel slide' data-ride='carousel'>
				<div className='carousel-inner'>
					<div className='carousel-item active'>
						<img className='d-block w-100' src='https://via.placeholder.com/1200x600' alt='First slide' />
					</div>
					<div className='carousel-item'>
						<img className='d-block w-100' src='https://via.placeholder.com/1200x600' alt='Second slide' />
					</div>
					<div className='carousel-item'>
						<img className='d-block w-100' src='https://via.placeholder.com/1200x600' alt='Third slide' />
					</div>
				</div>
				<a className='carousel-control-prev' href={`#${id}`} role='button' data-slide='prev'>
					<span className='carousel-control-prev-icon' aria-hidden='true'></span>
					<span className='sr-only'>Previous</span>
				</a>
				<a className='carousel-control-next' href={`#${id}`} role='button' data-slide='next'>
					<span className='carousel-control-next-icon' aria-hidden='true'></span>
					<span className='sr-only'>Next</span>
				</a>
			</div>
		</div>
	);
};

export default Carousel;
