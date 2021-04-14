import React, { useState, useRef } from 'react';
import classnames from 'classnames';
import Button from 'components/atoms/Button';
import useOutsideClick from 'hooks/useOutsideClick';
import Icon from 'components/atoms/Icon';

import s from './Filters.module.css'

export interface FiltersProps {
  maxMessages: number
  chunkSize: number
  minEmoteThreshold: number
  maxEmoteThreshold: number
  filterText: string
  onChange: (filters: any) => void,
  onClone: (filters: any) => void,
}

const Filters = React.memo((props: FiltersProps) => {
  const {
    maxMessages,
    chunkSize,
    minEmoteThreshold,
    maxEmoteThreshold,
    filterText,
    onChange,
    onClone,
  } = props;
  
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  useOutsideClick(filtersRef, () => {
    if (!showFilters) return;

    setShowFilters(false);
  });

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  }

  const handleActionChange = (value: any) => {
    onChange({
      maxMessages,
      chunkSize,
      minEmoteThreshold,
      maxEmoteThreshold,
      filterText,
      ...value,
    })
  };

  const onChangeMinThreshold = (e: React.FormEvent<HTMLInputElement>) => {
    const val = parseInt(e.currentTarget.value);

    if (val >= maxEmoteThreshold) return;

    handleActionChange({ minEmoteThreshold: val });
  };

  const onChangeMaxThreshold = (e: React.FormEvent<HTMLInputElement>) => {
    const val = parseInt(e.currentTarget.value);

    if (val <= minEmoteThreshold) return;

    handleActionChange({ maxEmoteThreshold: val });
  };

  const onChangeMaxMessages = (e: React.FormEvent<HTMLInputElement>) => {
    const maxMessages = parseInt(e.currentTarget.value) || 1;

    handleActionChange({ maxMessages });
  };

  const onChangeChunkSize = (e: React.FormEvent<HTMLInputElement>) => {
    const chunkSize = parseInt(e.currentTarget.value) || 1;

    handleActionChange({ chunkSize });
  };

  const onChangeFilterText = (e: React.FormEvent<HTMLInputElement>) => {
    const filterText = e.currentTarget.value || '';

    handleActionChange({ filterText });
  };

  const handleClone = () => {
    onClone({
      maxMessages,
      chunkSize,
      minEmoteThreshold,
      maxEmoteThreshold,
      filterText,
    });
  };

  return (
    <div className={s.filtersWrapper}>
      <Button onClick={handleClone} type="wrapper">
        <Icon name="clone" />
      </Button>

      <Button onClick={toggleFilters} type="wrapper">
        <Icon name="filter" />
      </Button>

      <div className={classnames(s.filters, { [s.isVisible]: showFilters })} ref={filtersRef}>
        <div>
          MAX:
          <input
            type="number"
            value={maxMessages}
            onChange={onChangeMaxMessages}
          />
        </div>
        <div>
          CHUNK SIZE:
          <input
            type="number"
            value={chunkSize}
            onChange={onChangeChunkSize}
          />
          </div>
        <div>
          Emote threshold:
          <div>
            Min:
              <input
              type="range"
              value={minEmoteThreshold}
              min={0}
              max={10}
              onChange={onChangeMinThreshold}
              step={1}
            />
          </div>
          <div>
            Max:
              <input
              type="range"
              value={maxEmoteThreshold}
              min={0}
              max={10}
              onChange={onChangeMaxThreshold}
              step={1}
            />
          </div>
        </div>
        <div>
          Chat Filter:
          <input value={filterText} onChange={onChangeFilterText} />
        </div>
      </div>
    </div>
  )
});

export default Filters;
