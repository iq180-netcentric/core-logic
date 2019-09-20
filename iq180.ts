type NumOrStr = number | string;

/**
 * Function validateForDisplay
 * performs validation of the array given the conditions
 * for showing the results of the expressions only
 * @param array Array to validate
 * @param operators Array of string of operators
 */
export const validateForDisplay = ({array, operators}: {array: NumOrStr[]; operators: string[];}) => {
	return array.length === 0 || // if no input, pass
		// number of opening brackets == number of closing brackets
		array.filter(item => item === '(').length === array.filter(item => item === ')').length &&
		array.every((_, index, array) =>
			// '(' must be followed by '(' or number, and not follow ')'
			(array[index] === '(' &&
				(array[index+1] === '(' || typeof(array[index+1]) === 'number') &&
				(array[index-1] !== ')')) ||
			// ')' must follow ')' or number, and not be followed by '('
			(array[index] === ')' &&
				(array[index-1] === ')' || typeof(array[index-1]) === 'number') &&
				(array[index+1] !== '(')) ||
			// operators must follow ')' or number, and be followed by '(' or number
			(array[index] !== '(' && array[index] !== ')' && typeof(array[index]) === 'string' &&
				operators.includes(array[index].toString()) && 
				(array[index-1] === ')' || typeof(array[index-1]) === 'number') &&
				(array[index+1] === '(' || typeof(array[index+1]) === 'number')) ||
			// numbers must not be adjacent to another number,
			// and must not follow ')', and not be followed by '('
			(typeof(array[index]) === 'number' && (
				(index === 0 && typeof(array[index+1]) !== 'number') ||
				(index === array.length-1 && typeof(array[index-1]) !== 'number') ||
				(typeof(array[index+1]) !== 'number' && typeof(array[index-1]) !== 'number')) &&
				array[index+1] !== '(' && array[index-1] !== ')')
		);
}

/**
 * Function highlightWrongLocation
 * highlights the location where the expression is invalid
 * @param array Array to highlight 
 */
export const highlightWrongLocation = ({array}: {array: NumOrStr[]}) => {
	// highlights brackets when there are unequal amount of brackets
	// ex: (,(,(,),) should highlight (,(,*(*,),)
	let invalidBracketUnequal = [];
	const bracketsDifference = array.filter(item => item === '(').length - array.filter(item => item === ')').length;
	if (bracketsDifference) {
		if (bracketsDifference > 0) {
			invalidBracketUnequal = array.map((value, index) => {
				if (value === '(') {
					return index;
				}
			}).filter(value => value !== undefined).filter((_, index) => index > bracketsDifference)
		} else {
			invalidBracketUnequal = array.map((value, index) => {
				if (value === ')') {
					return index;
				}
			}).filter(value => value !== undefined).filter((_, index, indexArr) => index > indexArr.length + bracketsDifference - 1)
		}
	}

	// highlights brackets when each position has negative difference between brackets
	// ex: (,(,),),),( should highlight (,(,),),*)*,*(*
	let currentBracketDifference = 0;
	let invalidBracketNegDiff = []
	for (let i = 0; i < array.length; i++) {
		if ((array[i] === '(' || array[i] === ')') && currentBracketDifference < 0) {
			invalidBracketNegDiff.push(i);
		}
		if (array[i] === '(') {
			currentBracketDifference++;
		} else if (array[i] === ')') {
			currentBracketDifference--;
		}
	}

	const invalidBracket = [...invalidBracketUnequal, ...invalidBracketNegDiff];

	const invalidAdjacent = array.map((_, index, array) => {
		if ( ! (
			// same logic as validateForDisplay, except checking operators
			(array[index] === '(' &&
				(array[index+1] === '(' || typeof(array[index+1]) === 'number') &&
				(array[index-1] !== ')')) ||
			(array[index] === ')' &&
				(array[index-1] === ')' || typeof(array[index-1]) === 'number') &&
				(array[index+1] !== '(')) ||
			(array[index] !== '(' && array[index] !== ')' && typeof(array[index]) === 'string' &&
				(array[index-1] === ')' || typeof(array[index-1]) === 'number') &&
				(array[index+1] === '(' || typeof(array[index+1]) === 'number')) ||
			(typeof(array[index]) === 'number' && (
				(index === 0 && typeof(array[index+1]) !== 'number') ||
				(index === array.length-1 && typeof(array[index-1]) !== 'number') ||
				(typeof(array[index+1]) !== 'number' && typeof(array[index-1]) !== 'number')) &&
				array[index+1] !== '(' && array[index-1] !== ')')
			)
		) {
			return index;
		}
	}).filter(value => value !== undefined);
	return Array.from(new Set([...invalidBracket, ...invalidAdjacent]));
}

/**
 * Function calculate
 * performs calculation over the array using the PEMDAS
 * this is done to avoid using eval() function as it is very dangerous and very not cool UwU
 * this method assumes that the array is valid, verified by validateForDisplay
 * @param array Array of expressions that contain numbers and strings
 */

export const calculate = (array: NumOrStr[]) => {
	
	const copyArray = [...array];

	// calculates what is in the brackets first, using recursion
	for (let i = 0; i < copyArray.length; i++) {
		if (copyArray[i] === '(') {
			let openBracketCount = 0;
			for (let j = i+1; j < copyArray.length; j++) {
				if (copyArray[j] === '(') {
					openBracketCount++;
				} else if (copyArray[j] === ')') {
					if (openBracketCount === 0) { // content between i and j is valid expression
						const subArray = copyArray.slice(i+1, j);
						const subArrayResult = calculate(subArray); // calculate recursively
						if (!isFinite(subArrayResult)) {
							return Infinity; // early exit for Infinity or NaN
						}
						copyArray[i] = subArrayResult;
						copyArray.splice(i+1, j-i);
						break;						
					} else {
						openBracketCount--;
					}
				}
			}
		}
	}

	// loops over an array to calculate exponents
	for (let i = copyArray.length-2; i > 0; i -= 2) { // reverse lookup for only exponents
		if (copyArray[i] === '**') { // if encountered an operation
			// perform that operation on the number before and after operator
			// and replace the results on the operator
			copyArray[i] = (copyArray[i-1] as number) ** (copyArray[i+1] as number);
			// then remove the numbers on the left and right
			copyArray.splice(i+1, 1);
			copyArray.splice(i-1, 1);
		}
	}
	// loops over an array to calculate multiply and divide
	for (let i = 1; i < copyArray.length; i += 2) {
		if (copyArray[i] === '*') {
			copyArray[i] = (copyArray[i-1] as number) * (copyArray[i+1] as number);
			copyArray.splice(i+1, 1);
			copyArray.splice(i-1, 1);
			// shift the iterator back by 2
			i -= 2;
		}
		if (copyArray[i] === '/') {
			copyArray[i] = (copyArray[i-1] as number) / (copyArray[i+1] as number);
			copyArray.splice(i+1, 1);
			copyArray.splice(i-1, 1);
			i -= 2;
		}
	}
	// loops over an array to calculate add and subtract
	for (let i = 1; i < copyArray.length; i += 2) {
		if (copyArray[i] === '+') {
			copyArray[i] = (copyArray[i-1] as number) + (copyArray[i+1] as number);
			copyArray.splice(i+1, 1);
			copyArray.splice(i-1, 1);
			i -= 2;
		}
		if (copyArray[i] === '-') {
			copyArray[i] = (copyArray[i-1] as number) - (copyArray[i+1] as number);
			copyArray.splice(i+1, 1);
			copyArray.splice(i-1, 1);
			i -= 2;
		}
	}
	// return the result of the final remaining number, precision to 13 decimals
	return Number(Math.round(Number(copyArray[0]+'e13'))+'e-13');
}

/**
 * Question, expected answer and solution generator
 * @param numberLength Number of numbers in the question
 * @param operators Array of string of operators
 * @param integerAnswer Boolean to set whether the answer must be integer or not
 */

export const generate = ({
	numberLength = 5,
	operators = ['+', '-', '*', '/'],
	integerAnswer = true
}: {
	numberLength? : number;
	operators? : string[];
	integerAnswer? : boolean
} = {}) : {
	question: number[],
	operators: string[],
	expectedAnswer: number,
	solution: NumOrStr[],
} => {
	let expression : NumOrStr[] = null;
	let numbers : number[] = null;
	let operations : string[] = null;
	let expectedAnswer : number = null;
	// check if the expression is generated and finite (not Infinity or NaN)
	while (!(expression !== null
		&& isFinite(expectedAnswer)
		&& (!integerAnswer || Math.floor(expectedAnswer) === expectedAnswer) // if integerAnswer is true, check whether the expectedAnswer is integer
		)
	) {		
		// generate random numbers from 1 to 9, into an array of numberLength numbers
		// example: [4, 2, 6, 9, 2]
		numbers = Array.from({length: numberLength}, () => Math.floor(Math.random() * 9 + 1));

		// generate random operations from OPERATORS, into an array of numberLength-1 operators
		// example: ['+', '-', '/', '*']
		operations = Array.from({length: numberLength-1}, () => operators[Math.floor(Math.random()*operators.length)]);

		// const numberBrackets = Math.floor(Math.random() * numberLength + 1);
		const numberBrackets = 1;
		let openBracketsFrequency = Array(numberLength);
		let closeBracketsFrequency = Array(numberLength);
		if (numberBrackets) {
			openBracketsFrequency = Array(numberLength).fill(0);
			closeBracketsFrequency = Array(numberLength).fill(0);
			let openBracketRemaining = numberBrackets;
			let closeBracketRemaining = numberBrackets;
			for (let i = 0; openBracketRemaining > 0; i = (i+1)%(numberLength-1)) {
				const random = Math.floor(openBracketRemaining*Math.random() + 0.5);
				const bracketInsertCount =  random < openBracketRemaining ? random : openBracketRemaining;
				openBracketsFrequency[i] += bracketInsertCount;
				openBracketRemaining -= bracketInsertCount;
			}
			let cumulativeBracketDiff = 0;
			for (let i = 1; closeBracketRemaining > 0; i = i%(numberLength-1)+1) {
				if (i === 1) {
					cumulativeBracketDiff = openBracketsFrequency[0];
				}
				cumulativeBracketDiff += openBracketsFrequency[i]
				const random = Math.round(Math.min(closeBracketRemaining, cumulativeBracketDiff)*Math.random()); 
				closeBracketsFrequency[i] += random;
				closeBracketRemaining -= random;
				cumulativeBracketDiff -= random;

			}
		}
		openBracketsFrequency = openBracketsFrequency.map(value => Array(value).fill('('));
		closeBracketsFrequency = closeBracketsFrequency.map(value => Array(value).fill(')'));

		expression = [];
		for (let i = 0 ; i < numberLength; i++) {
			expression = expression.concat(openBracketsFrequency[i], numbers[i], closeBracketsFrequency[i], operations[i])
		}
		// join numbers and operations into an array of numbers and operations
		// example: [4, '+', 2, '-', 6, '/', 9, '*', 2]
		// expression = [].concat(...numbers.map((v, i) => [v, operations[i]])); // returns [4, '+', 2, '-', 6, '/', 9, '*', 2, undefined]
		expression.pop(); // remove undefined element
		expectedAnswer = calculate(expression);
	}
	return {
		question: numbers,
		operators: operators,
		expectedAnswer: expectedAnswer,
		solution: expression
	};
}

// examples

// const {question, operators, expectedAnswer, solution} = generate({
//	numberLength: 5,
//	operators: ['+', '-', '*', '/'],
//	integerAnswer: true
// });

// console.log('question: ', question);
// console.log('valid operators', operators);
// console.log('expected answer: ', expectedAnswer);
// console.log('solution: ', solution);