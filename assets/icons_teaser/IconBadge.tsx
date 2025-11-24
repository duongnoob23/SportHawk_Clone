import React from 'react';
import { Svg, Path } from 'react-native-svg';
const IconBadge = (props): JSX.Element => {
  return (
    <Svg width="36" height="44" viewBox="0 0 36 44" fill="none" {...props}>
      <Path
        d="M18 42C18 42 34 34 34 22V8L18 2L2 8V22C2 34 18 42 18 42Z"
        stroke="#9E9B97"
        strokeWidth="4"
      />
    </Svg>
  );
};
export default IconBadge;
