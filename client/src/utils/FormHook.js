import { useState } from 'react';

/**
 * @description Custom hook inspired by Ethan Schultz from https://rangle.io/blog/simplifying-controlled-inputs-with-hooks/. Allows easily usable form implementation and accessing of value, bind and reset functionality
 * 
 * @param {*} initialValue
 */
export const useInput = initialValue => {
	const [value, setValue] = useState(initialValue);
	const [checked, setChecked] = useState(initialValue);
	const [color, setColor] = useState(initialValue);

	return {
		value,
    	setValue,
    	reset: () => setValue(initialValue),
    	bind: {
      		value,
      		onChange: event => {
        		setValue(event.target.value);
      		}
    	},
		checked,
    	setChecked,
    	resetChecked: () => setChecked(initialValue),
    	bindChecked: {
      		checked,
      		onChange: () => {
        		setChecked(!checked);
      		}
    	},
		color,
    	setColor,
    	resetColor: () => setColor(initialValue),
    	bindColor: {
      		color,
      		onChange: event => {
        		setColor(event.hex);
      		}
    	}
  	};
};
