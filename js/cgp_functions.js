
var cgpFunc = function(idx, params) {
	var numFunctions = 10;
	switch (idx%numFunctions) {
		case 0: return params[0]; //first param function
		case 1: return params[1]; //second param function
		case 2: return params[0]+params[1]; //addition
		case 3: return params[0]-params[1]; //subtraction
		case 4: return params[0]*params[1]; //multiplication
		case 5: return params[1] === 0 ? 0 : params[0]/params[1]; //safe division (/0 -> 0)
		case 6: return Math.pow(params[0], params[1]); //exponentiation
		case 7: return params[0]*Math.sin(params[1]); //sin
		case 8: return params[0]*Math.cos(params[1]); //cos
		case 9: return params[0]*Math.tan(params[1]); //tan
		default: return 0; //zero function
	}
};