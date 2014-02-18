
var NUM_FUNCS = 2;
var cgpFunc = function(idx, varArgs, constArgs) {
	function sigmoid(n) {
		return 1/(1+Math.exp(-n));
	}
	function tanh(n) {
		var eto2n = Math.exp(2*n);
		return (eto2n-1)/(eto2n+1);
	}
	
	switch (idx) {
		case 0: //sigmoid
			var sum = 0;
			for (var ai = 0; ai < varArgs.length; ai++) {
				sum += varArgs[ai]*constArgs[ai];
			}
			return sigmoid(sum);
		case 1: //tanh
			var sum = 0;
			for (var ai = 0; ai < varArgs.length; ai++) {
				sum += varArgs[ai]*constArgs[ai];
			}
			return tanh(sum);
	}
	return 0;
};