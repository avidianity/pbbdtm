import React, { useState } from 'react';
import toastr from 'toastr';

type Props = {
	faq: FAQ;
	onChange: (value: FAQ, success: () => void) => void;
	defaultMode?: 'View' | 'Edit';
};

export function FAQ({ faq, onChange, defaultMode }: Props) {
	const [mode, setMode] = useState(defaultMode || 'View');
	const [question, setQuestion] = useState(faq.question);
	const [answer, setAnswer] = useState(faq.answer);

	return (
		<div className='col-12'>
			{mode === 'View' ? (
				<div className='form-group'>
					<label htmlFor='question'>
						Question: <b>{faq.question}</b>
					</label>
					<p>
						Answer: <b>{faq.answer}</b>
					</p>
				</div>
			) : null}
			{mode === 'Edit' ? (
				<>
					<div className='form-group'>
						<input
							type='text'
							name='question'
							placeholder='Question'
							className='form-control form-control-sm'
							value={question}
							onChange={(e) => {
								setQuestion(e.target.value);
							}}
						/>
					</div>
					<div className='form-group'>
						<textarea
							name='answer'
							placeholder='Answer'
							className='form-control form-control-sm'
							value={answer}
							onChange={(e) => {
								setAnswer(e.target.value);
							}}
						/>
					</div>
				</>
			) : null}
			<div className='form-group'>
				<button
					className='btn btn-success btn-sm d-inline-block mx-1'
					onClick={(e) => {
						e.preventDefault();
						if (mode === 'Edit') {
							onChange({ question, answer }, () => {
								toastr.info('FAQs has been updated.', 'Notice');
							});
							setMode('View');
						} else {
							setMode('Edit');
						}
					}}>
					{mode === 'Edit' ? 'Save' : 'Edit'}
				</button>
				{mode === 'Edit' ? (
					<button
						className='btn btn-danger btn-sm d-inline-block mx-1'
						onClick={(e) => {
							e.preventDefault();
							setMode('View');
							setQuestion(faq.question);
							setAnswer(faq.answer);
						}}>
						Cancel
					</button>
				) : null}
			</div>
		</div>
	);
}
