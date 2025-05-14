export const computeScore = (_data: FormData) => {
	return {
		regenscore: {
			name: 'Total REGENScore',
			score: 80,
		},
		air: {
			name: 'Air Quality Score',
			score: 90,
		},
		water: {
			name: 'Water Quality Score',
			score: 70,
		},
		soil: {
			name: 'Soil Quality Score',
			score: 80,
		},
		equity: {
			name: 'Equity Score',
			score: 80,
		}
	};
}