import React from 'react';
import { Svg, Path } from 'react-native-svg';
const IconBackArrow2 = (props): JSX.Element => {
  return (
    <Svg width="18" height="16" viewBox="0 0 18 16" fill="none" {...props}>
      <Path d="M8 1L1 8L8 15" stroke="#ECEAE8" strokeWidth="2" />
      <Path d="M1 8H17" stroke="#ECEAE8" strokeWidth="2" />
    </Svg>
  );
};
export default IconBackArrow2;
