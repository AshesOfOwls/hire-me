import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Icons from './iconList';

import s from './Icon.module.css';

export interface IconProps {
  name: string,
}

const Icon = (props: IconProps) => {
  const { name } = props;

  const faIcon = Icons[name];

  return (
    <div className={s.icon}>
      <FontAwesomeIcon icon={faIcon} />
    </div>
  );
};

export default Icon;
