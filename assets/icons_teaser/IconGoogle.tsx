import React from 'react';
import { Svg, Path } from 'react-native-svg';
const IconGoogle = (props): JSX.Element => {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <Path
        d="M19.0625 9.91406C19.0625 15.4414 15.2773 19.375 9.6875 19.375C4.32812 19.375 0 15.0469 0 9.6875C0 4.32812 4.32812 0 9.6875 0C12.2969 0 14.4922 0.957031 16.1836 2.53516L13.5469 5.07031C10.0977 1.74219 3.68359 4.24219 3.68359 9.6875C3.68359 13.0664 6.38281 15.8047 9.6875 15.8047C13.5234 15.8047 14.9609 13.0547 15.1875 11.6289H9.6875V8.29688H18.9102C19 8.79297 19.0625 9.26953 19.0625 9.91406Z"
        fill="#ECEAE8"
      />
    </Svg>
  );
};
export default IconGoogle;
