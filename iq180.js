"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
/**
 * Function highlightWrongLocation
 * highlights the location where the expression is invalid
 * @param array Array to highlight
 */
exports.highlightWrongLocation = function (_a) {
    var array = _a.array;
    // highlights brackets when there are unequal amount of brackets
    // ex: (,(,(,),) should highlight (,(,*(*,),)
    var invalidBracketUnequal = [];
    var bracketsDifference = array.filter(function (item) { return item === '('; }).length - array.filter(function (item) { return item === ')'; }).length;
    if (bracketsDifference) {
        if (bracketsDifference > 0) {
            invalidBracketUnequal = array.map(function (value, index) {
                if (value === '(') {
                    return index;
                }
            }).filter(function (value) { return value !== undefined; }).filter(function (_, index) { return index > bracketsDifference; });
        }
        else {
            invalidBracketUnequal = array.map(function (value, index) {
                if (value === ')') {
                    return index;
                }
            }).filter(function (value) { return value !== undefined; }).filter(function (_, index, indexArr) { return index > indexArr.length + bracketsDifference - 1; });
        }
    }
    // highlights brackets when each position has negative difference between brackets
    // ex: (,(,),),),( should highlight (,(,),),*)*,*(*
    var currentBracketDifference = 0;
    var invalidBracketNegDiff = [];
    for (var i = 0; i < array.length; i++) {
        if ((array[i] === '(' || array[i] === ')') && currentBracketDifference < 0) {
            invalidBracketNegDiff.push(i);
        }
        if (array[i] === '(') {
            currentBracketDifference++;
        }
        else if (array[i] === ')') {
            currentBracketDifference--;
        }
    }
    var invalidBracket = __spreadArrays(invalidBracketUnequal, invalidBracketNegDiff);
    var invalidAdjacent = array.map(function (_, index, array) {
        if (!(
        // same logic as validateForDisplay, except checking operators
        (array[index] === '(' &&
            (array[index + 1] === '(' || typeof (array[index + 1]) === 'number') &&
            (array[index - 1] !== ')')) ||
            (array[index] === ')' &&
                (array[index - 1] === ')' || typeof (array[index - 1]) === 'number') &&
                (array[index + 1] !== '(')) ||
            (array[index] !== '(' && array[index] !== ')' && typeof (array[index]) === 'string' &&
                (array[index - 1] === ')' || typeof (array[index - 1]) === 'number') &&
                (array[index + 1] === '(' || typeof (array[index + 1]) === 'number')) ||
            (typeof (array[index]) === 'number' && ((index === 0 && typeof (array[index + 1]) !== 'number') ||
                (index === array.length - 1 && typeof (array[index - 1]) !== 'number') ||
                (typeof (array[index + 1]) !== 'number' && typeof (array[index - 1]) !== 'number')) &&
                array[index + 1] !== '(' && array[index - 1] !== ')'))) {
            return index;
        }
    }).filter(function (value) { return value !== undefined; });
    return Array.from(new Set(__spreadArrays(invalidBracket, invalidAdjacent)));
};
/**
 * Function calculate
 * performs calculation over the array using the PEMDAS
 * this is done to avoid using eval() function as it is very dangerous and very not cool UwU
 * this method assumes that the array is valid, verified by validateForDisplay
 * @param array Array of expressions that contain numbers and strings
 */
exports.calculate = function (array) {
    var copyArray = __spreadArrays(array);
    // calculates what is in the brackets first, using recursion
    for (var i = 0; i < copyArray.length; i++) {
        if (copyArray[i] === '(') {
            var openBracketCount = 0;
            for (var j = i + 1; j < copyArray.length; j++) {
                if (copyArray[j] === '(') {
                    openBracketCount++;
                }
                else if (copyArray[j] === ')') {
                    if (openBracketCount === 0) { // content between i and j is valid expression
                        var subArray = copyArray.slice(i + 1, j);
                        var subArrayResult = exports.calculate(subArray); // calculate recursively
                        if (!isFinite(subArrayResult)) {
                            return Infinity; // early exit for Infinity or NaN
                        }
                        copyArray[i] = subArrayResult;
                        copyArray.splice(i + 1, j - i);
                        break;
                    }
                    else {
                        openBracketCount--;
                    }
                }
            }
        }
    }
    // loops over an array to calculate exponents
    for (var i = copyArray.length - 2; i > 0; i -= 2) { // reverse lookup for only exponents
        if (copyArray[i] === '**') { // if encountered an operation
            // perform that operation on the number before and after operator
            // and replace the results on the operator
            copyArray[i] = Math.pow(copyArray[i - 1], copyArray[i + 1]);
            // then remove the numbers on the left and right
            copyArray.splice(i + 1, 1);
            copyArray.splice(i - 1, 1);
        }
    }
    // loops over an array to calculate multiply and divide
    for (var i = 1; i < copyArray.length; i += 2) {
        if (copyArray[i] === '*') {
            copyArray[i] = copyArray[i - 1] * copyArray[i + 1];
            copyArray.splice(i + 1, 1);
            copyArray.splice(i - 1, 1);
            // shift the iterator back by 2
            i -= 2;
        }
        if (copyArray[i] === '/') {
            copyArray[i] = copyArray[i - 1] / copyArray[i + 1];
            copyArray.splice(i + 1, 1);
            copyArray.splice(i - 1, 1);
            i -= 2;
        }
    }
    // loops over an array to calculate add and subtract
    for (var i = 1; i < copyArray.length; i += 2) {
        if (copyArray[i] === '+') {
            copyArray[i] = copyArray[i - 1] + copyArray[i + 1];
            copyArray.splice(i + 1, 1);
            copyArray.splice(i - 1, 1);
            i -= 2;
        }
        if (copyArray[i] === '-') {
            copyArray[i] = copyArray[i - 1] - copyArray[i + 1];
            copyArray.splice(i + 1, 1);
            copyArray.splice(i - 1, 1);
            i -= 2;
        }
    }
    // return the result of the final remaining number, precision to 13 decimals
    return Number(Math.round(Number(copyArray[0] + 'e13')) + 'e-13');
};
/**
 * Question, expected answer and solution generator
 * @param numberLength Number of numbers in the question
 * @param operators Array of string of operators
 * @param integerAnswer Boolean to set whether the answer must be integer or not
 */
exports.generate = function (_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.numberLength, numberLength = _c === void 0 ? 5 : _c, _d = _b.operators, operators = _d === void 0 ? ['+', '-', '*', '/'] : _d, _e = _b.integerAnswer, integerAnswer = _e === void 0 ? true : _e;
    var expression = null;
    var numbers = null;
    var operations = null;
    var expectedAnswer = null;
    // check if the expression is generated and finite (not Infinity or NaN)
    while (!(expression !== null
        && isFinite(expectedAnswer)
        && (!integerAnswer || Math.floor(expectedAnswer) === expectedAnswer) // if integerAnswer is true, check whether the expectedAnswer is integer
    )) {
        // generate random numbers from 1 to 9, into an array of numberLength numbers
        // example: [4, 2, 6, 9, 2]
        numbers = Array.from({ length: numberLength }, function () { return Math.floor(Math.random() * 9 + 1); });
        // generate random operations from OPERATORS, into an array of numberLength-1 operators
        // example: ['+', '-', '/', '*']
        operations = Array.from({ length: numberLength - 1 }, function () { return operators[Math.floor(Math.random() * operators.length)]; });
        // const numberBrackets = Math.floor(Math.random() * numberLength + 1);
        var numberBrackets = 1;
        var openBracketsFrequency = Array(numberLength);
        var closeBracketsFrequency = Array(numberLength);
        if (numberBrackets) {
            openBracketsFrequency = Array(numberLength).fill(0);
            closeBracketsFrequency = Array(numberLength).fill(0);
            var openBracketRemaining = numberBrackets;
            var closeBracketRemaining = numberBrackets;
            for (var i = 0; openBracketRemaining > 0; i = (i + 1) % (numberLength - 1)) {
                var random = Math.floor(openBracketRemaining * Math.random() + 0.5);
                var bracketInsertCount = random < openBracketRemaining ? random : openBracketRemaining;
                openBracketsFrequency[i] += bracketInsertCount;
                openBracketRemaining -= bracketInsertCount;
            }
            var cumulativeBracketDiff = 0;
            for (var i = 1; closeBracketRemaining > 0; i = i % (numberLength - 1) + 1) {
                if (i === 1) {
                    cumulativeBracketDiff = openBracketsFrequency[0];
                }
                cumulativeBracketDiff += openBracketsFrequency[i];
                var random = Math.round(Math.min(closeBracketRemaining, cumulativeBracketDiff) * Math.random());
                closeBracketsFrequency[i] += random;
                closeBracketRemaining -= random;
                cumulativeBracketDiff -= random;
            }
        }
        openBracketsFrequency = openBracketsFrequency.map(function (value) { return Array(value).fill('('); });
        closeBracketsFrequency = closeBracketsFrequency.map(function (value) { return Array(value).fill(')'); });
        expression = [];
        for (var i = 0; i < numberLength; i++) {
            expression = expression.concat(openBracketsFrequency[i], numbers[i], closeBracketsFrequency[i], operations[i]);
        }
        // join numbers and operations into an array of numbers and operations
        // example: [4, '+', 2, '-', 6, '/', 9, '*', 2]
        // expression = [].concat(...numbers.map((v, i) => [v, operations[i]])); // returns [4, '+', 2, '-', 6, '/', 9, '*', 2, undefined]
        expression.pop(); // remove undefined element
        expectedAnswer = exports.calculate(expression);
    }
    return {
        question: numbers,
        operators: operators,
        expectedAnswer: expectedAnswer,
        solution: expression
    };
};
/**
 * Function validateForDisplay
 * performs validation of the array given the conditions
 * for showing the results of the expressions only
 * @param array Array to validate
 * @param operators Array of string of operators
 */
exports.validateForDisplay = function (_a) {
    var array = _a.array, operators = _a.operators;
    return array.length === 0 || // if no input, pass
        // number of opening brackets == number of closing brackets
        array.filter(function (item) { return item === '('; }).length === array.filter(function (item) { return item === ')'; }).length &&
            array.every(function (_, index, array) {
                // '(' must be followed by '(' or number, and not follow ')'
                return (array[index] === '(' &&
                    (array[index + 1] === '(' || typeof (array[index + 1]) === 'number') &&
                    (array[index - 1] !== ')')) ||
                    // ')' must follow ')' or number, and not be followed by '('
                    (array[index] === ')' &&
                        (array[index - 1] === ')' || typeof (array[index - 1]) === 'number') &&
                        (array[index + 1] !== '(')) ||
                    // operators must follow ')' or number, and be followed by '(' or number
                    (array[index] !== '(' && array[index] !== ')' && typeof (array[index]) === 'string' &&
                        operators.includes(array[index].toString()) &&
                        (array[index - 1] === ')' || typeof (array[index - 1]) === 'number') &&
                        (array[index + 1] === '(' || typeof (array[index + 1]) === 'number')) ||
                    // numbers must not be adjacent to another number,
                    // and must not follow ')', and not be followed by '('
                    (typeof (array[index]) === 'number' && ((index === 0 && typeof (array[index + 1]) !== 'number') ||
                        (index === array.length - 1 && typeof (array[index - 1]) !== 'number') ||
                        (typeof (array[index + 1]) !== 'number' && typeof (array[index - 1]) !== 'number')) &&
                        array[index + 1] !== '(' && array[index - 1] !== ')');
            });
};
/**
 * Function validateForSubmission
 * performs validation of the array given the conditions, including the length of question
 * in order to submit the answer
 * @param array Array to validate
 * @param numberLength Number of numbers in the question
 * @param operators Array of string of operators
 */
exports.validateForSubmission = function (_a) {
    var array = _a.array, operators = _a.operators, question = _a.question, expectedAnswer = _a.expectedAnswer;
    return exports.validateForDisplay({ array: array, operators: operators })
        && array.filter(function (item) { return typeof (item) === 'number'; }).sort().toString() === question.sort().toString()
        && exports.calculate(array) === expectedAnswer;
};
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
