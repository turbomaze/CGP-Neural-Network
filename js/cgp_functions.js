
var NUM_FUNCS = 2;
var cgpFunc = function(idx, varArgs, constArgs) {
	function weightedSum(v, w) {
		var sum = 0;
		for (var ai = 0; ai < Math.min(v.length, w.length); ai++) {
			sum += v[ai]*w[ai];
		}
		return sum;
	}
	function sigmoid(n) {
		return 1/(1+Math.exp(-n));
	}
	function tanh(n) {
		var eto2n = Math.exp(2*n);
		return (eto2n-1)/(eto2n+1);
	}

	switch (idx) {
		case 0: //sigmoid
			return sigmoid(weightedSum(varArgs, constArgs));
		case 1: //tanh
			return tanh(weightedSum(varArgs, constArgs));
	}
	return 0;
};