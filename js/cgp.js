/*******************\
| Cartesian Genetic |
|    Programming    |
|   Neural Network  |
| @author Anthony   |
| @version 0.1      |
| @date 2014/02/14  |
| @edit 2014/02/17  |
\*******************/

/**********
 * config */
var humanFitness = true;
var numGens = 100*1000;
var popSize = 1+4;
var numIslands = 1;
var seedBeing = new CGPBeing(4, 40, 20, 4);

/*************
 * constants */

/*********************
 * working variables */
var trainingData;
var handler;

/******************
 * work functions */
function initCGPNeuralNet() {
	//////////////////////
	//load training data//
	trainingData = [
		[[0,0 , 0,0] , [0,0,0,0]],
		[[0,0 , 0,1] , [0,0,0,0]],
		[[0,0 , 1,0] , [0,0,0,0]],
		[[0,0 , 1,1] , [0,0,0,0]],
		[[0,1 , 0,0] , [0,0,0,0]],
		[[0,1 , 0,1] , [0,0,0,1]],
		[[0,1 , 1,0] , [0,0,1,0]],
		[[0,1 , 1,1] , [0,0,1,1]],
		[[1,0 , 0,0] , [0,0,0,0]],
		[[1,0 , 0,1] , [0,0,1,0]],
		[[1,0 , 1,0] , [0,1,0,0]],
		[[1,0 , 1,1] , [0,1,1,0]],
		[[1,1 , 0,0] , [0,0,0,0]],
		[[1,1 , 0,1] , [0,0,1,1]],
		[[1,1 , 1,0] , [0,1,1,0]],
		[[1,1 , 1,1] , [1,0,0,1]],
	]; //2 bit multiplication
	/*
	trainingData = []; //mod 2
	for (var ai = 0; ai < 15; ai++) {
		var num = getRandNum(0, 100000);
		trainingData.push([[num], [num%2]]);
	}*/

	////////////////////////////////
	//loop through the generations//
	handler = new Handler(numIslands, popSize, seedBeing, 50);
	var ai = 0;
	var asyncLoopGens = function(callback) {
		//inner loop work
		var currentBest = handler.step();
		if (handler.currentGen%50 === 0 || handler.finished) {
			$('#reporter').innerHTML = formatReport(currentBest);
		}
		ai += 1;
		setTimeout(function() { callback(!handler.finished); }, 6);
	};
	asyncLoop(numGens,
		function(loop) {
			asyncLoopGens(function(keepGoing) {
				if (keepGoing) loop.next();
				else loop.break();
			})
		}, 
		function() { /* inner loop finished */ }
	);
}

function formatReport(generator) {
	function binArrToDec(arr) {
		var sum = 0;
		for (var ai = 0; ai < arr.length; ai++) {
			sum += arr[ai]*Math.pow(2, (arr.length-1)-ai);
		}
		return sum;
	}
	function formatInput(inp) {
		var inp1 = binArrToDec(inp.slice(0, 2));
		var inp2 = binArrToDec(inp.slice(2));
		return inp1+'*'+inp2;
	}

	var ret = '';
	for (var ai = 0; ai < trainingData.length; ai++) {
		ret += formatInput(trainingData[ai][0]);
		//ret += trainingData[ai][0][0];
		ret += ' = ';
		ret += binArrToDec(generator.evaluate(trainingData[ai][0]));
		//ret += generator.evaluate(trainingData[ai][0])[0];
		ret += '<br>';
	}
	return ret;
}

/********************
 * helper functions */
function $(sel) {
	if (sel.charAt(0) === '#') return document.getElementById(sel.substring(1));
	else return false;
}

function currentTimeMillis() {
	return new Date().getTime();
}

//stolen from http://stackoverflow.com/questions/4288759/asynchronous-for-cycle-in-javascript
function asyncLoop(iterations, func, callback) {
	var index = 0;
	var done = false;
	var loop = {
		next: function() {
			if (done) return;
			if (index < iterations) {
				index += 1;
				func(loop);
			} else {
				done = true;
				if (callback) callback();
			}
		},
		iteration: function() {
			return index - 1;
		},
		break: function() {
			done = true;
			if (callback) callback();
		}
	};
	loop.next();
	return loop;
}

function closestTo(arr, num) {
	var best = [0, Math.pow(2, 1023)]; //[which, distance]
	for (var ai = 0; ai < arr.length; ai++) {
		var dist = Math.abs(arr[ai]-num);
		if (dist <= best[1]) {
			best = [arr[ai], dist];
		}
	}
	return best[0];
}

function getRandNum(lower, upper) { //returns number in [lower, upper)
	return Math.floor((Math.random()*(upper-lower))+lower);
}

/***********
 * objects */
function Handler(numIslands, popSize, seedIndividual, logEvery) {
	this.currentGen = 0;
	this.islands = [];
	this.popSize = popSize;
	for (var ai = 0; ai < numIslands; ai++) {
		this.islands.push(new Island(popSize, seedIndividual));
	}
	this.logEvery = logEvery || 50;
	this.timeElapsed = 0;
	this.finished = false;

	this.step = function() {
		if (this.finished) return false;

		this.currentGen += 1;
		var start = currentTimeMillis();

		//////////////////////////
		//evolve all the islands//
		var currentBests = [];
		for (var ai = 0; ai < this.islands.length; ai++) {
			//evolve and get the current best solution and its score
			currentBests.push(this.islands[ai].evolve()); 
		}
		var currentBest = currentBests[0];
		for (var ai = 0; ai < this.islands.length; ai++) {
			if (currentBests[ai][1] <= currentBest[1]) {
				currentBest = currentBests[ai];
			}
		}

		/////////////
		//reporting//
		var duration = currentTimeMillis() - start;
		this.timeElapsed += duration;
		if (this.currentGen%this.logEvery === 0 || currentBest[1] === 0) {
			var avgDuration = this.timeElapsed/this.currentGen;
			console.log('Generation #' + this.currentGen + '\n' + 
						'Score: ' + currentBest[1] + '\n' +
						'Duration: ' + duration + 'ms, ' + 
							'Avg: ' + avgDuration + 'ms, ' + 
							'Total: ' + this.timeElapsed + 'ms\n' +
						'Solution: ' + currentBest[2] + '\n'
			);
		}
		if (currentBest[1] === 0) this.finished = true;

		return currentBest[0];
	};
}

function Island(popSize, seedIndividual) {
	this.popSize = popSize;
	this.population = [seedIndividual];

	//////////////////
	//work functions//
	this.evolve = function() {
		var selection = this.choose();
		var newPopulation = [];
		newPopulation.push(selection);
		for (var ai = 1; ai < this.popSize; ai++) {
			newPopulation.push(selection.mutate());
		}

		this.population = newPopulation;
		return [selection, selection.getFitness(), selection.squish()];
	};

	this.choose = function() {
		var scores = [this.population[0].getFitness()];
		var selection = this.population[0];
		for (var ai = 1; ai < this.population.length; ai++) {
			scores[ai] = this.population[ai].getFitness(scores[0]);
			if (scores[ai] <= scores[0]) { //the "or equals" in <= is very important!
				selection = this.population[ai];
			}
		}
		return selection;
	};
}

function CGPBeing(numInputs, cols, rows, numOutputs, dna) {
	this.numInputs = numInputs || 2;
	this.cols = cols || 4;
	this.rows = rows || 3;
	this.numOutputs = numOutputs || 3;
	this.dna = arguments.length === 5 ? dna : getRandGenes(
		this.numInputs, this.cols, this.rows, this.numOutputs
	);

	this.GENE_SIZE = 5;
	this.MUT_RATE = 0.02;

	this.getFitness = function(toBeat) {
		toBeat = toBeat || Math.pow(2, 1023);
		var score = 0;
		var colorsSeen = [];
		for (var ai = 0; ai < trainingData.length; ai++) {
			//don't waste time if it's already sub-parent
			if (score > toBeat) break; //don't bother
			var guess = this.evaluate(trainingData[ai][0]);
			score += correspSumSqDiff(guess, trainingData[ai][1]);
		}

		if (isNaN(score) || Math.abs(score) >= Infinity) {
			score = Math.pow(2, 1023);
		}
		return score;
	};

	this.evaluate = function(inputs) {
		var active = []; //nodes that affect the output
		var numBPs = this.dna.length;
		for (var ai = numBPs-this.numOutputs; ai < numBPs; ai++) { //all the outputs
			active[this.dna[ai]] = true; //are necessarily active
			markReferenced(
				this.numInputs, this.GENE_SIZE, this.dna, this.dna[ai], active
			); //so are all the nodes they reference, recursively
		}

		var values = [];
		//inputs are easy so load all of them
		for (var ai = 0; ai < this.numInputs; ai++) values.push(inputs[ai]);
		//compute the node values, left to right
		for (var ai = 0; ai < this.cols; ai++) { //for each column
			for (var bi = 0; bi < this.rows; bi++) { //each row in that column
				//the gene id, not necessarily the location in the array
				var id = ai*this.rows + bi + this.numInputs; //input based id
				if (active[id] !== undefined) { //if this id is active
					//then compute its output, otherwise don't bother
					var idx = this.GENE_SIZE*(id-this.numInputs); //idx in the dna
					//the values it references will be in the values arr already
					values[id] = cgpFunc(
						this.dna[idx], //function id
						[values[this.dna[idx+1]], //inputs
						 values[this.dna[idx+2]]], 
						[this.dna[idx+3], //constant arguments
						 this.dna[idx+4]] 
					);
				}
			}
		}

		var ret = []; //the outputs
		var numBPs = this.dna.length;
		//gather up all the outputs
		for (var ai = numBPs-this.numOutputs; ai < numBPs; ai++) {
			//ret.push(closestTo([0, 1], values[this.dna[ai]])
			ret.push(values[this.dna[ai]]); 
		}
		return ret;
	};

	function markReferenced(numInputs, geneSize, dna, geneId, arr) {
		if (geneId < numInputs) return; //don't mark anything for inputs
		else {
			geneId -= numInputs; //convert to the node-nought indexed basis
			var idx = geneSize*geneId;
			arr[dna[idx+1]] = true;
			arr[dna[idx+2]] = true;
			markReferenced(numInputs, geneSize, dna, dna[idx+1], arr);
			markReferenced(numInputs, geneSize, dna, dna[idx+2], arr);
		}
	}

	this.mutate = function() {
		var mutatedBPs = this.dna.slice(0); //copy the original
		var numBPs = this.dna.length;
		var numToMutate = Math.max(this.MUT_RATE*numBPs, 1);

		for (var ai = 0; ai < numToMutate; ai++) {
			var idxToMutate = getRandNum(0, numBPs);
			var type = -1;
			if (idxToMutate >= numBPs-this.numOutputs) { //output gene
				type = 1; //same as connection genes
			} else {
				type = idxToMutate%this.GENE_SIZE;
			}
			switch (type) {
				case 0: //function
					mutatedBPs[idxToMutate] = getRandFunctionId();
					break;
				case 1: //connections
				case 2: 
					var col = (((idxToMutate/this.GENE_SIZE)|0)/this.rows)|0;
					mutatedBPs[idxToMutate] = getRandGeneId(
						col, this.numInputs, this.rows
					);
					break;
				case 3: //constant arguments
				case 4:
					var scaleFactor = -1.5+3*Math.random();
					mutatedBPs[idxToMutate] = scaleFactor*this.dna[idxToMutate];
					break;
				default:
					mutatedBPs[idxToMutate] = this.dna[idxToMutate];
					break;
			}
		}
	
		return new CGPBeing(
			this.numInputs, this.cols, this.rows, this.numOutputs, mutatedBPs
		);
	};

	this.squish = function() {
		//btoa([1,2,0.2145566]) = "MSwyLDAuMjE0NTU2Ng=="
		//atob("MSwyLDAuMjE0NTU2Ng==").split(",").map(parseFloat) = [1,2,0.2145566]
		var raw = btoa(this.dna);
		return raw.substring(0, 32)+raw.substring(raw.length-32);
	};

	function correspSumSqDiff(arr1, arr2) {
		var sum = 0;
		for (var ai = 0; ai < Math.min(arr1.length, arr2.length); ai++) {
			sum += Math.pow(arr1[ai] - arr2[ai], 2);
		}
		return sum;
	}

	function getRandFunctionId() {
		return getRandNum(0, NUM_FUNCS); 
	}

	function getRandGeneId(col, numInputs, rows) {
		return getRandNum(0, col*rows+numInputs);
	}

	function getRandGenes(numInputs, cols, rows, numOutputs) {
		var ret = [];
		for (var ai = 0; ai < cols; ai++) { //for each column
			for (var bi = 0; bi < rows; bi++) { //each row in that column
				ret.push(getRandFunctionId()); //func id
				ret.push(getRandGeneId(ai, numInputs, rows)); //inputs
				ret.push(getRandGeneId(ai, numInputs, rows));
				ret.push(-1+2*Math.random()); //const arguments
				ret.push(-1+2*Math.random());
			}
		}
		for (var ai = 0; ai < numOutputs; ai++) { //assign the output nodes
			ret.push(getRandGeneId(cols, numInputs, rows));
		}
		return ret;
	}
}


window.addEventListener('load', function() {
	initCGPNeuralNet();
});