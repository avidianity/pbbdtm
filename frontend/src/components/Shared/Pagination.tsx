import React from 'react';

type Props = {
	url: string;
	current: number;
	total: number;
	limit: number;
	onChange: (page: number) => void;
};

export function Pagination({ url, current, total, limit, onChange }: Props) {
	const realTotal = Math.ceil(total / limit);
	const previousPage = current - 1;
	const nextPage = current + 1;
	const previousPageURL = `${url}?page=${previousPage}`;
	const nextPageURL = `${url}?page=${nextPage}`;
	const hasPreviousPage = previousPage >= 1;
	const hasNextPage = nextPage <= realTotal;

	const makeUrl = (page: number) => {
		return `${url}?page=${page}`;
	};

	const links = () => {
		const links: Array<JSX.Element> = [];
		for (let count = 1; count <= realTotal; count++) {
			links.push(
				<li key={count} className={`page-item ${count === current ? 'active' : ''}`}>
					<a
						className='page-link'
						href={makeUrl(count)}
						tabIndex={-1}
						onClick={(e) => {
							e.preventDefault();
							onChange(count);
						}}>
						{count} {count === current ? <span className='sr-only'>(current)</span> : null}
					</a>
				</li>
			);
		}
		return links;
	};

	return (
		<nav aria-label='...'>
			<ul className='pagination justify-content-end mb-0'>
				<li className={`page-item ${!hasPreviousPage ? 'disabled' : ''}`}>
					<a
						className='page-link'
						href={previousPageURL}
						tabIndex={-1}
						onClick={(e) => {
							e.preventDefault();
							// eslint-disable-next-line
							hasPreviousPage ? onChange(previousPage) : null;
						}}>
						<i className='fas fa-angle-left'></i>
						<span className='sr-only'>Previous</span>
					</a>
				</li>
				{links()}
				<li className={`page-item ${!hasNextPage ? 'disabled' : ''}`}>
					<a
						className='page-link'
						href={nextPageURL}
						tabIndex={-1}
						onClick={(e) => {
							e.preventDefault();
							// eslint-disable-next-line
							hasNextPage ? onChange(nextPage) : null;
						}}>
						<i className='fas fa-angle-right'></i>
						<span className='sr-only'>Next</span>
					</a>
				</li>
			</ul>
		</nav>
	);
}
