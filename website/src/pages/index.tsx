import type { NextPage } from 'next';
import MyvmEditor from './MyvmEditor';
import { useState } from 'react';
import Parse from '../util/parse';
import Hello_world from '../../myvm_examples/hello_world';

const HelloWorld = Hello_world;
const Home: NextPage = () => {
	const [contents, setContents] = useState(HelloWorld);
	return (
		<div className='row row-cols-2'>
			<MyvmEditor
				className='w-100 h-100'
				onChange={(s) => {
					if (s !== undefined) {
						setContents(s);
					}
				}}
			/>
			<div className='row row-cols-2'>
				<Parse input={contents} />
			</div>
		</div>
	);
};

export default Home;
