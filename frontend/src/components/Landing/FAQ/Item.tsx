import React, { FC, useState } from 'react';

type Props = {
	answer: string;
};

const Item: FC<Props> = ({ answer }) => {
	const [show, setShow] = useState(false);

	return (
		<div className='card-body'>
			{show ? <p className='card-text'>{answer}</p> : null}
			<a
				href='/'
				className='text-info font-weight-bold'
				onClick={(e) => {
					e.preventDefault();
					setShow(!show);
				}}>
				{show ? 'Hide' : 'Show'}
			</a>
		</div>
	);
};

export default Item;
