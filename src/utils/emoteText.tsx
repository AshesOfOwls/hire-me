import React from 'react';
import Emote from 'components/atoms/Emote';

export interface Props {
  text: string
  emoteList: any
};

const emoteText = (props: Props): React.ReactNode[] => {
  const { text, emoteList } = props;

  const withEmotes = text.split(' ').map((word, i) => {
    const emote = emoteList.find((emote: any) => emote.code === word);

    if (emote) { return <Emote src={emote.url} key={i + emote.code} />; }

    return word;
  });

  const withSpaces: any[] = [];
  withEmotes.forEach((word, i) => {
    withSpaces.push(word);
    if (i === withEmotes.length - 1) return;
    withSpaces.push(' ');
  })
  
  return withSpaces;
};

export default emoteText;
