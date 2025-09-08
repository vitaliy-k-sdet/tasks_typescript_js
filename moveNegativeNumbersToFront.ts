// Given an array containing both positive and negative numbers in random order. 
// The task is to rearrange the array elements while maintaining the order so that all 
// negative numbers appear before all positive numbers.

// void moveNegativeNumbersToFront(int[] array) 

// For example:
// Input : [1,-2,3,-4,5,-6] 
// Output: [-2,-4,-6,1,3,5]

// ⚠️ You are not allowed to use any built-in or library functions such 
// as sort() or similar. The logic must be implemented manually.

const fullArray: number[] = [1, -2, 3, -4, 5, -6];

function moveNegativeNumbersToFront(array: number[]): number[] {
  const negativeValues: number[] = [];
  const positiveValues: number[] = [];

  for (const number of array) {
    if (number < 0) {
      negativeValues.push(number);
    } else {
      positiveValues.push(number);
    }
  }

  return [...negativeValues, ...positiveValues];
}

console.log('Filtered array:', moveNegativeNumbersToFront(fullArray));

