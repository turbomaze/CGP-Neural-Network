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
var canvas;
var ctx;

/******************
 * work functions */
function initCGPNeuralNet() {
	var start = currentTimeMillis();
	/*
	var handler = new Handler(1, 1+4); //1+4 strategy
	for (var ai = 0; ai < 10; ai++) {
		handler.step();
	}
	*/

	canvas = $('#canvas');
	ctx = canvas.getContext('2d');
	
	////////////////////////////////////////////////////////////////////////////////////
	//grid of randomly generated images (2 variable input CGPs -> 3 RGB outputs % 256)//
	var border = 8;
	var numcellsy = 2;
	var numcellsx = 3;
	var yunit = Math.floor((canvas.height-(numcellsy-1)*border)/numcellsy); //300
	var xunit = Math.floor((canvas.width-(numcellsx-1)*border)/numcellsx); //400
	var originalGenerator = new CGPBeing(2, 4, 3, 3);
	var imageGenerator = originalGenerator;
	for (var ai = 0; ai < numcellsy; ai++) {
		for (var bi = 0; bi < numcellsx; bi++) {
			var currImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			for (var yi = ai*(yunit+border); yi < (ai)*(yunit+border)+yunit; yi++) {
				for (var xi = bi*(xunit+border); xi < (bi)*(xunit+border)+xunit; xi++) {
					var res = imageGenerator.evaluate(
						[xi-bi*(xunit+border), yi-ai*(yunit+border)]
					);
					var idx = 4*(yi*canvas.width + xi);
					currImageData.data[idx+0] = res[0]%256;
					currImageData.data[idx+1] = res[1]%256;
					currImageData.data[idx+2] = res[2]%256;
					currImageData.data[idx+3] = 255;
				}
			}
			ctx.putImageData(currImageData, 0, 0);
			imageGenerator = originalGenerator.mutate();
		}
	}

	console.log((currentTimeMillis() - start) + 'ms');
}

function drawPoint(pos, r, color) {
	ctx.fillStyle = color || 'rgba(255, 255, 255, 0.3)';
	ctx.beginPath();
	ctx.arc(pos.x, pos.y, r, 0, 2*Math.PI, true);
	ctx.closePath();
	ctx.fill();
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
		var ret = new CGPBeing(this.numInputs, this.cols, this.rows, this.numOutputs);
		var mutatedGenes = [];
		var numGenes = this.genes.length;
		var mutRate = 0.10;
		for (var ai = 0; ai < numGenes-this.numOutputs; ai++) {
			var currentGene = [];
			for (var bi = 0; bi < 3; bi++) {
				if (Math.random() < mutRate) {
					var col = ai/this.numRows;
					switch (bi) {
						case 0:
							currentGene.push(getRandFunctionId());
							break;
						default:
							currentGene.push(
								getRandInputId(col, this.numInputs, this.numRows)
							);
							break;
					}
				} else {
					currentGene.push(this.genes[ai][bi]);
				}
			}
			mutatedGenes.push(currentGene);
		}
		for (var ai = numGenes-this.numOutputs; ai < numGenes; ai++) {
			if (Math.random() < mutRate) {
				mutatedGenes.push(getRandInputId(this.cols, this.numInputs, this.rows));
			} else {
				mutatedGenes.push(this.genes[ai]);
			}
		}

		ret.genes = mutatedGenes;
		return ret;
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