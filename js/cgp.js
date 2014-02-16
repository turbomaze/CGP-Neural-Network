/*******************\
| Cartesian Genetic |
|    Programming    |
|   Neural Network  |
| @author Anthony   |
| @version 0.1      |
| @date 2014/02/14  |
| @edit 2014/02/15  |
\*******************/

/**********
 * config */

/*************
 * constants */

/*********************
 * working variables */

/******************
 * work functions */
function initCGPNeuralNet() {
	var handler = new Handler(1, 1+4); //1+4 strategy
	for (var ai = 0; ai < 10; ai++) {
		//handler.step();
	}
}

/********************
 * helper functions */
function getRandNum(lower, upper) { //returns number in [lower, upper)
	return Math.floor((Math.random()*(upper-lower))+lower);
}

/***********
 * objects */
function Handler(numIslands, popSize) {
	this.islands = [];
	this.popSize = popSize;
	for (var ai = 0; ai < numIslands; ai++) this.islands.push(new Island(popSize));

	this.step = function() {
		//////////////////////////
		//evolve all the islands//
		var currentBests = [];
		for (var ai = 0; ai < this.islands.length; ai++) {
			//evolve and get the current best solution and its score
			currentBests.push(this.islands[ai].evolve()); 
		}
		var currentBest = [Math.pow(2, 2000), ''];
		for (var ai = 0; ai < this.num_islands; ai++) {
			if (currentBests[ai][0] < currentBest[0]) {
				currentBest = currentBests[ai];
			}
		}

		/////////////
		//reporting//
		console.log('Generation #' + this.current_gen + '\n' + 
					'Score: ' + currentBest[0] + '\n' +
		/*			'Duration: ' + duration + 'ms, ' + 
						'Avg: ' + avgDuration + 'ms, ' + 
						'Total: ' + this.time_elapsed + 'ms\n' +
		*/			'Solution: ' + currentBest[1] + '\n'
		);
	};
}

function Island(popSize) {
	this.popSize = popSize;
	this.population = [new CGPBeing(2, 2, 2, 1)];

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
		return [selection.getFitness(), selection.squish()];
	};

	this.choose = function() {
		var scores = [this.population[0].getFitness()];
		var selection = this.population[0];
		for (var ai = 1; ai < this.population.length; ai++) {
			scores[ai] = this.population[ai].getFitness();
			if (scores[ai] >= scores[0]) { //the "or equals" in >= is very important!
				selection = this.population[ai];
			}
		}
		return selection;
	};
}

function CGPBeing(numInputs, cols, rows, numOutputs) {
	this.numInputs = numInputs;
	this.cols = cols;
	this.rows = rows;
	this.numOutputs = numOutputs;
	this.genes = getRandBeing(this.numInputs, this.cols, this.rows, this.numOutputs);

	this.getFitness = function() {

	};

	this.evaluate = function(inputs) {
		var values = [];
		for (var ai = 0; ai < this.numInputs; ai++) values.push(inputs[ai]);

		for (var ai = 0; ai < this.cols; ai++) { //for each column
			for (var bi = 0; bi < this.rows; bi++) { //each row in that column
				var idx = ai*this.rows + bi;
				values.push(
					cgpFunc(
						this.genes[idx][0], //function id
						[values[this.genes[idx][1]], values[this.genes[idx][2]]] //inputs
					)
				); //evaluate the node at (col, row)
			}
		}

		var ret = [];
		var numGenes = this.genes.length;
		for (var ai = numGenes-this.numOutputs; ai < numGenes; ai++) {
			ret.push(values[this.genes[ai]]); //gather up all the outputs
		}
		return ret;
	};

	this.mutate = function() {
		return new CGPBeing(this.numInputs, this.cols, this.rows, this.numOutputs);
	};

	this.squish = function() {
		//btoa([1,2,0.2145566]) = "MSwyLDAuMjE0NTU2Ng=="
		//atob("MSwyLDAuMjE0NTU2Ng==").split(",").map(parseFloat) = [1,2,0.2145566]
		return btoa(this.genes);
	};

	function getRandFunctionId() { 
		return getRandNum(0, 256); 
	}

	function getRandInputId(col, numInputs, rows) { 
		return getRandNum(0, col*rows+numInputs);
	}

	function getRandBeing(numInputs, cols, rows, numOutputs) {
		var ret = [];
		for (var ai = 0; ai < cols; ai++) { //for each column
			for (var bi = 0; bi < rows; bi++) { //each row in that column
				ret.push([getRandFunctionId(),
						  getRandInputId(ai, numInputs, rows), 
						  getRandInputId(ai, numInputs, rows)]); //add genes
			}
		}
		for (var ai = 0; ai < numOutputs; ai++) { //assign the output nodes
			ret.push(getRandInputId(cols, numInputs, rows));
		}
		return ret;
	}
}

window.addEventListener('load', function() {
	initCGPNeuralNet();
});