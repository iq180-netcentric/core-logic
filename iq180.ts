// total numbers in the game
const NUMBER_LENGTH : number = 5; // # numbers in the game
// all valid operators in the game. you can also add '**' for exponents
const OPERATORS : string[] = ['+', '-', '*', '/', '**'];

let expression : object[] = null;
let numbers : number[] = null;
let operations : string[] = null;

// performs calculation over the array using the PEMDAS (without the E for now)
// this is done to avoid using eval() function as it is very dangerous and very not cool UwU
const calculate = (array) => {
	// loops over an array to calculate exponents
	const copyArray = [...array];
	for (let i = copyArray.length-2; i > 0; i -= 2) {
		if (copyArray[i] == '**') {
			copyArray[i] = copyArray[i-1] ** copyArray[i+1];
			copyArray.splice(i+1, 1);
			copyArray.splice(i-1, 1);
		}
	}
	// loops over an array to calculate multiply and divide
	for (let i = 1; i < copyArray.length; i += 2) {
		if (copyArray[i] == '*') { // if encountered an operation
			// perform that operation on the number before and after operator
			// and replace the results on the operator
			copyArray[i] = copyArray[i-1] * copyArray[i+1];
			// then remove the numbers on the left and right
			copyArray.splice(i+1, 1);
			copyArray.splice(i-1, 1);
			// and shift the iterator back by 2
			i -= 2;
		}
		if (copyArray[i] == '/') {
			copyArray[i] = copyArray[i-1] / copyArray[i+1];
			copyArray.splice(i+1, 1);
			copyArray.splice(i-1, 1);
			i -= 2;
		}
	}
	// loops over an array to calculate add and subtract
	for (let i = 1; i < copyArray.length; i += 2) {
		if (copyArray[i] == '+') {
			copyArray[i] = copyArray[i-1] + copyArray[i+1];
			copyArray.splice(i+1, 1);
			copyArray.splice(i-1, 1);
			i -= 2;
		}
		if (copyArray[i] == '-') {
			copyArray[i] = copyArray[i-1] - copyArray[i+1];
			copyArray.splice(i+1, 1);
			copyArray.splice(i-1, 1);
			i -= 2;
		}
	}
	// return the result of the final remaining number
	return copyArray[0];
}

// check if the expression is generated and finite (not Infinity or NaN)
while (!(expression !== null && isFinite(calculate(expression)))) {
	// generate random numbers from 1 to 9, into an array of NUMBER_LENGTH numbers
	// example: [4, 2, 6, 9, 2]
	numbers = Array.from({length: NUMBER_LENGTH}, () => Math.floor(Math.random() * 9 + 1));

	// generate random operations from OPERATORS, into an array of NUMBER_LENGTH-1 operators
	// example: ['+', '-', '/', '*']
	operations = Array.from({length: NUMBER_LENGTH-1}, () => OPERATORS[Math.floor(Math.random()*OPERATORS.length)]);

	// join numbers and operations into an array of numbers and operations
	// example: [4, '+', 2, '-', 6, '/', 9, '*', 2]
	expression = [].concat(...numbers.map((v, i) => [v, operations[i]])); // returns [4, '+', 2, '-', 6, '/', 9, '*', 2, undefined]
	expression.pop(); // remove undefined element
}

// show the final results of the expression

console.log(expression); // expects [4, '+', 2, '-', 6, '/', 9, '*', 2]
console.log(calculate(expression)); // expects 4.666666666666667