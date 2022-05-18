import { useEffect, useState } from 'react';

export interface Dimensions {
	width: number;
	height: number;
}

const useWindowDimensions = (): Dimensions => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [dimensions, setDimensions] = useState<Dimensions>({
		height: 0,
		width: 0,
	});
	useEffect(() => {
		window.addEventListener('resize', updateDimensions);
		updateDimensions();
		return () => {
			window.removeEventListener('resize', updateDimensions);
		};
	}, []);

	const updateDimensions = () => {
		setDimensions({
			width: window.innerWidth,
			height: window.innerHeight,
		});
	};

	return dimensions;
};

export default useWindowDimensions;
