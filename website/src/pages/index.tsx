import type { NextPage } from 'next';
import MyvmEditor from '../components/MyvmEditor';
import AssembleInput from '../components/Assemble';
import { useState } from 'react';
import HelloWorld from '../../myvm_examples/hello_world';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Run from '../components/Run';
import UseWasm from '../util/UseWasm';
import Docs from '../components/Docs';

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
						<Tab>Docs</Tab>
					</TabList>

					<TabPanel>
						<UseWasm input={contents} component={AssembleInput} />
					</TabPanel>
					<TabPanel>
						<UseWasm input={contents} component={Run} />
					</TabPanel>
					<TabPanel>
						<Docs />
					</TabPanel>
				</Tabs>
			</div>
		</div>
	);
};

export default Home;
