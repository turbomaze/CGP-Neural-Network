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
	
}

/********************
 * helper functions */
function getRandNum(lower, upper) { //returns number in [lower, upper)
	return Math.floor((Math.random()*(upper-lower))+lower);
}

/***********
 * objects */
function Handler(numIslands) {
	this.islands = [];
	for (var ai = 0; ai < numIslands; ai++) this.islands.push(new World());

	this.step = function() {
		for (var ai = 0; ai < this.islands.length; ai++) {
			this.islands[ai].evolve();
		}
	};
}

function Island(pop_size) {
	this.pop_size = pop_size;
	this.population = [new CGPBeing()];

	//////////////////
	//work functions//
	this.evolve = function() {
		this.assess();

		var newPopulation = [];
		newPopulation.push(this.population[0]); //elitism, idx=0 is the prev pop's best
		for (var ai = 1; ai < this.pop_size; ai++) {
			newPopulation.push(this.population[0].mutate());
		}

		this.population = newPopulation;
	};

	this.assess = function() {
		var scores = [];
		for (var ai = 0; ai < this.population.length; ai++) {
			scores[ai] = this.population[ai].getFitness();
		}
		this.correspQuickSort(scores, this.population, 0, this.population.length-1);
	};

	this.correspQuickSort = function(v, s, low, high) {
		var pivot;
		if (high > low) {
			pivot = this.correspPartition(v, s, low, high);
			this.correspQuickSort(v, s, low, pivot-1);
			this.correspQuickSort(v, s, pivot+1, high);
		}
	};
	
	this.correspPartition = function(v, s, low, high) {
		var pivotVal = v[low];
		var correspPivotVal = s[low];
		var pivotIndex = low;
		var left = low;			
		var right = high;
		//console.log('2bii1');
		while (left < right) {
			//console.log('l: ' + left + ', r: ' + right);
			while (v[left] <= pivotVal) {
				//console.log('in');
				if (left+1 < v.length) {
					left += 1;
				} else {
					break;
				}
			}
			while (v[right] > pivotVal) {
				if (right > 0) {
					right -= 1;
				} else {
					break;
				}
			}
			if (left < right) {
				////////////////////////
				//swaps left and right//
				var temp_d = v[left];
				var temp_B = s[left];
				v[left] = v[right];
				s[left] = s[right];
				v[right] = temp_d;		
				s[right] = temp_B;
			}
		}
		//console.log('2bii2');
		v[low] = v[right];
		s[low] = s[right];
		v[right] = pivotVal;
		s[right] = correspPivotVal;
		
		return right;
	};
}

function CGPBeing() {
	this.genes = [];
}

window.addEventListener('load', function() {
	initCGPNeuralNet();
});