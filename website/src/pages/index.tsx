import type { NextPage } from 'next';
import AssembleInput from '../components/Assemble';
import { useEffect, useState } from 'react';
import HelloWorld from '../../myvm_examples/HelloWorld';
import PrintNumbers from '../../myvm_examples/PrintNumbers';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Run from '../components/Run';
import UseWasm from '../util/UseWasm';
import Docs from '../components/Docs';
import Head from 'next/head';
import Select from 'react-select';
import MyvmEditor from '../components/MyvmEditor';
import { Button } from 'react-bootstrap';
import PrintEmoji from '../../myvm_examples/PrintEmoji';

const selectedProgramOptions = [
	{ label: 'Hello World', value: 'hello-world' },
	{ label: 'Print Numbers', value: 'print-numbers' },
	{ label: 'Print Emoji', value: 'print-emoji' },
	{ label: 'Custom', value: 'custom' },
] as const;

type SelectedProgramOption = typeof selectedProgramOptions[number];

const Home: NextPage = () => {
	const decoder = new TextDecoder();
	decoder.decode(new Uint8Array([1, 2, 3, 4, 5]));
	// @ts-ignore
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [contents, setContents] = useState(HelloWorld);
	const [selectedProgram, setSelectedProgram] = useState<SelectedProgramOption>(
		selectedProgramOptions[0],
	);
	const [menuIsOpen, setMenuIsOpen] = useState(false);
	const [menuInputValue, setMenuInputValue] = useState('');
	const [lastSaved, setLastSaved] = useState('');
	useEffect(() => {
		setLastSaved(localStorage.getItem('saved-program') ?? '');
	}, []);
	return (
		<div className='row row-cols-2'>
			<Head>
				<title>My VM</title>
				<meta charSet='utf-8' />
			</Head>
			{
				<div>
					<div className={'row row-cols-auto'}>
						<Select
							value={selectedProgram}
							onChange={(v) => {
								if (v === null) {
									return;
								}
								setSelectedProgram(v);
								if (v.value === 'hello-world') {
									setContents(HelloWorld);
								} else if (v.value === 'print-numbers') {
									setContents(PrintNumbers);
								} else if (v.value === 'print-emoji') {
									setContents(PrintEmoji);
								}
							}}
							onMenuClose={() => setMenuIsOpen(false)}
							onMenuOpen={() => setMenuIsOpen(true)}
							menuIsOpen={menuIsOpen}
							options={selectedProgramOptions}
							inputValue={menuInputValue}
							onInputChange={(s) => setMenuInputValue(s)}
							className={'w-50 text-center text-white'}
							theme={(theme) => ({
								...theme,
								colors: {
									danger: '#DE350B',
									dangerLight: '#FFBDAD',
									neutral90: 'hsl(0, 0%, 100%)',
									neutral80: 'hsl(0, 0%, 95%)',
									neutral70: 'hsl(0, 0%, 90%)',
									neutral60: 'hsl(0, 0%, 80%)',
									neutral50: 'hsl(0, 0%, 70%)',
									neutral40: 'hsl(0, 0%, 60%)',
									neutral30: 'hsl(0, 0%, 50%)',
									neutral20: 'hsl(0, 0%, 40%)',
									neutral10: 'hsl(0, 0%, 30%)',
									neutral5: 'hsl(0, 0%, 20%)',
									neutral0: 'hsl(0, 0%, 10%)',
									primary: '#2684FF',
									primary75: '#DEEBFF',
									primary50: '#B2D4FF',
									primary25: '#4C9AFF',
								},
							})}
						/>
						<Button
							onClick={() => {
								localStorage.setItem('saved-program', contents);
								setLastSaved(contents);
							}}
						>
							Save
						</Button>
						<Button
							onClick={() => {
								setContents(lastSaved);
								setSelectedProgram({ label: 'Custom', value: 'custom' });
							}}
						>
							Load
						</Button>
					</div>
					{
						<MyvmEditor
							className='w-100 h-100'
							onChange={(s) => {
								if (s !== undefined) {
									setContents(s);
									setSelectedProgram({ label: 'Custom', value: 'custom' });
								}
							}}
							initialValue={contents}
						/>
					}
				</div>
			}
			<div>
				<Tabs className='bg-dark text-white'>
					<TabList>
						<Tab> Assemble</Tab>
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
