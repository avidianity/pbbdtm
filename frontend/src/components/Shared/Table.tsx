import React, { useEffect, useState } from 'react';
import pluralize from 'pluralize';
import { useRouteMatch } from 'react-router-dom';
import { Pagination } from './Pagination';
import _ from 'lodash';
import { createTableColumns, outIf, parseDate, sentencify } from '../../helpers';
import { State } from '../../state';

type Props<T> = {
	title: string;
	theme?: 'light' | 'dark';
	columns?: Array<string>;
	data: Array<T>;
	onViewClick: (data: T) => void;
	onEditClick: (data: T) => void;
	onRefreshClick: () => void;
	onAddClick: () => void;
	onDeleteConfirm: (data: T) => void;
	processing: boolean;
	withAction: boolean;
	pagination: boolean;
	border?: boolean;
	dontShowDelete?: boolean;
	dontShowEdit?: boolean;
	dontShowView?: boolean;
	disableAddButton?: boolean;
};

export function Table<T>({
	title,
	theme,
	columns,
	data,
	onViewClick,
	onEditClick,
	onDeleteConfirm,
	onRefreshClick,
	processing,
	onAddClick,
	withAction,
	pagination,
	border,
	dontShowView,
	dontShowEdit,
	dontShowDelete,
	disableAddButton,
}: Props<T>) {
	const headColumns = columns || createTableColumns(data);
	const match = useRouteMatch();

	const state = new State(_.kebabCase(title.toLowerCase() + '-table'));

	const total = data.length;
	const page = state.has('page') ? state.get('page') : 1;

	const [interval, setInterval] = useState(state.has('perPage') ? state.get<number>('perPage') : 10);
	if (page > Math.ceil(total / interval) && state.has('page')) {
		state.set('page', 1);
	}
	const [current, setCurrent] = useState(page <= Math.ceil(total / interval) ? page : 1);
	const pageKey = state.listen<number>('page', (page) => setCurrent(page));
	const [formInterval, setFormInterval] = useState(interval);
	const [options, setOptions] = useState(false);

	const intervalKey = state.listen<number>('perPage', (perPage) => {
		if (current > Math.ceil(total / perPage)) {
			state.set('page', 1);
		}
		setInterval(perPage);
	});

	useEffect(
		() => () => {
			state.unlisten('page', pageKey);
			state.unlisten('perPage', intervalKey);
		},
		// eslint-disable-next-line
		[]
	);

	const offset = (current - 1) * interval;

	const paginatedData: Array<any> = [];

	for (let count = offset; count < offset + interval; count++) {
		if (typeof data[count] !== 'undefined') {
			paginatedData.push(data[count]);
		}
	}

	const displayData = pagination ? paginatedData : data;

	return (
		<div className='row'>
			<div className='col-12'>
				<div className={`card ${border ? 'border' : ''} w-100`}>
					<div className='card-header border-0'>
						<div className='d-flex'>
							<h3 className='mb-0 align-self-center'>{title}</h3>
							<div className='ml-auto align-self-center d-flex'>
								{withAction && (disableAddButton === undefined || disableAddButton === false) ? (
									<i
										className={`fas fa-plus clickable d-block align-self-center m-1 text-warning`}
										onClick={() => onAddClick()}></i>
								) : null}
								{withAction ? (
									<i
										className={`fas fa-redo-alt clickable d-block align-self-center m-1 text-info ${
											processing ? 'fa-spin' : ''
										}`}
										onClick={() => onRefreshClick()}></i>
								) : null}
							</div>
						</div>
						{pagination ? (
							<div className='mt-4'>
								<div className='py-2'>
									<button
										className={`btn btn-${!options ? 'primary' : 'danger'} btn-sm`}
										onClick={(e) => {
											e.preventDefault();
											setOptions(!options);
										}}>
										{!options ? 'Show' : 'Hide'} Options
									</button>
								</div>
								{options ? (
									<form
										className='form-inline'
										onSubmit={(e) => {
											e.preventDefault();
											state.set('perPage', formInterval >= 1 ? formInterval : 10);
										}}>
										<div className='form-group p-1'>
											<label htmlFor='perPage' className='mr-2'>
												Rows per Page:
											</label>
											<input
												type='number'
												name='perPage'
												id='perPage'
												placeholder='Per Page'
												value={formInterval}
												onChange={(e) => setFormInterval(Number(e.target.value))}
												className='form-control form-control-sm'
											/>
										</div>
										<div className='form-group p-1'>
											<button type='submit' className='btn btn-warning btn-sm'>
												Change
											</button>
										</div>
									</form>
								) : null}
							</div>
						) : null}
					</div>
					{processing ? (
						<div className='card-body'>
							<div className='text-center'>
								<i className='fas fa-circle-notch fa-spin fa-2x'></i>
							</div>
						</div>
					) : (
						<div className='card-body'>
							{displayData.length > 0 ? (
								<div className='table-responsive' style={{ overflowY: 'hidden' }}>
									<table className={`table table-sm`}>
										<thead className='text-primary'>
											<tr>
												{headColumns.map((column, index) => (
													<th
														className='sort text-center'
														data-sort={column.toLowerCase()}
														scope='col'
														key={index}>
														{column}
													</th>
												))}
												{withAction ? (
													<th scope='col' className='text-center'>
														Actions
													</th>
												) : null}
											</tr>
										</thead>
										<tbody>
											{displayData.map((item, index) => (
												<tr key={index}>
													{Object.entries(item).map(([key, entry], index) => (
														<td key={index} className='text-center'>
															{key === 'updatedAt' || key === 'createdAt'
																? parseDate(entry as string)
																: (entry as any)}
														</td>
													))}
													{withAction ? (
														<td className='text-center'>
															<div className='dropdown'>
																<button
																	className='btn btn-sm btn-icon-only text-light'
																	data-toggle='dropdown'
																	aria-haspopup='true'
																	aria-expanded='false'>
																	<i className='fas fa-ellipsis-v'></i>
																</button>
																<div className='dropdown-menu dropdown-menu-right dropdown-menu-arrow'>
																	{outIf(
																		dontShowView === undefined || dontShowView === false,
																		<button className='dropdown-item' onClick={() => onViewClick(item)}>
																			<i className='ni ni-active-40 text-info'></i>
																			View
																		</button>
																	)}
																	{outIf(
																		dontShowEdit === undefined || dontShowEdit === false,
																		<button className='dropdown-item' onClick={() => onEditClick(item)}>
																			<i className='ni ni-ruler-pencil text-warning'></i>
																			Edit
																		</button>
																	)}
																	{outIf(
																		dontShowDelete === undefined || dontShowDelete === false,
																		<button
																			type='button'
																			data-toggle='modal'
																			data-target={`#deleteModal${index}`}
																			className='dropdown-item'>
																			<i className='ni ni-fat-delete text-danger'></i>
																			Delete
																		</button>
																	)}
																</div>
															</div>
														</td>
													) : null}
												</tr>
											))}
										</tbody>
										{displayData.length >= 10 ? (
											<thead className='text-primary'>
												<tr>
													{headColumns.map((column, index) => (
														<th
															className='sort text-center'
															data-sort={column.toLowerCase()}
															scope='col'
															key={index}>
															{column}
														</th>
													))}
													{withAction ? (
														<th scope='col' className='text-center'>
															Actions
														</th>
													) : null}
												</tr>
											</thead>
										) : null}
									</table>
									{withAction
										? displayData.map((item, index) => (
												<div
													key={index}
													className='modal fade'
													id={`deleteModal${index}`}
													tabIndex={-1}
													role='dialog'
													aria-labelledby={`deleteModalLabel${index}`}
													aria-hidden='true'>
													<div className='modal-dialog modal-dialog-centered modal-lg' role='document'>
														<div className='modal-content'>
															<div className='modal-header'>
																<h5 className='modal-title' id={`deleteModalLabel${index}`}>
																	Delete {pluralize.singular(title)}
																</h5>
																<button
																	type='button'
																	className='close'
																	data-dismiss='modal'
																	aria-label='Close'>
																	<span aria-hidden='true'>&times;</span>
																</button>
															</div>
															<div className='modal-body'>
																Are you sure you want to delete this {pluralize.singular(sentencify(title))}
																?
															</div>
															<div className='modal-footer'>
																<button
																	type='button'
																	className='btn btn-danger btn-sm'
																	onClick={(e) => {
																		e.preventDefault();
																		const modal = $(`#deleteModal${index}`);
																		modal.on('hidden.bs.modal', () => onDeleteConfirm(item));
																		modal.modal('hide');
																	}}>
																	Confirm
																</button>
																<button
																	type='button'
																	className='btn btn-secondary btn-sm'
																	data-dismiss='modal'>
																	Cancel
																</button>
															</div>
														</div>
													</div>
												</div>
										  ))
										: null}
								</div>
							) : (
								<div className='card-body'>
									<h3 className='text-center'>No Data</h3>
								</div>
							)}
						</div>
					)}

					{pagination ? (
						<div className='card-footer py-4'>
							{displayData.length > 0 && Math.ceil(total / interval) > 1 ? (
								<Pagination
									url={match.path}
									current={current}
									total={total}
									limit={interval}
									onChange={(page) => {
										state.set('page', page);
									}}
								/>
							) : null}
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
