import type { NextPage } from 'next';
import MyvmEditor from '../components/MyvmEditor';
import Parse from '../util/Parse';
import { useState } from 'react';
import Hello_world from '../../myvm_examples/hello_world';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

const HelloWorld = Hello_world;
const Home: NextPage = () => {
	// @ts-ignore
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [contents, setContents] = useState(HelloWorld);
	return (
		<div className='row row-cols-2'>
			{
				<MyvmEditor
					className='w-100 h-100'
					onChange={(s) => {
						if (s !== undefined) {
							setContents(s);
						}
					}}
				/>
			}
			<div>
				<Tabs className='bg-dark text-white'>
					<TabList>
						<Tab>Assemble</Tab>
						<Tab>Run</Tab>
					</TabList>

					<TabPanel>
						<Parse input={contents} />
					</TabPanel>
					<TabPanel>
						<div>WIP</div>
					</TabPanel>
				</Tabs>
			</div>
		</div>
	);
};

export default Home;
