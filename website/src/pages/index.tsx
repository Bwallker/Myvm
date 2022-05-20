import type { NextPage } from 'next';
import MyvmEditor from '../components/MyvmEditor';
import Assemble from '../components/Assemble';
import { useState } from 'react';
import Hello_world from '../../myvm_examples/hello_world';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Run from '../components/Run';

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
						<Assemble input={contents} />
					</TabPanel>
					<TabPanel>
						<Run input={contents} />
					</TabPanel>
				</Tabs>
			</div>
		</div>
	);
};

export default Home;
