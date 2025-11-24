import React from 'react';
import { Svg, Path } from 'react-native-svg';
const IconCheckboxInactive = (props): JSX.Element => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </Svg>
  );
};
export default IconCheckboxInactive;
