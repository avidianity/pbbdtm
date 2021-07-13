import React, { FC } from 'react';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';

type Props = {
	onChange?: (content: string) => void;
	value: string;
};

const Quill: FC<Props> = ({ onChange, value }) => {
	return <ReactQuill onChange={onChange} value={value} />;
};

export default Quill;
