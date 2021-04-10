import React from 'react';
import Emote from 'components/atoms/Emote';

export interface Props {
  text: string
  emoteList: any
};

const emoteText = (props: Props): { formatted: React.ReactNode[], emoteCount: number, wordCount: number } => {
  const { text, emoteList } = props;

  let emoteCount = 0;
  let wordCount = 0;

  const withEmotes = text.split(' ').map((word, i) => {
    const emote = emoteList.find((emote: any) => emote.code === word);

    if (emote) {
      emoteCount++;
      return <Emote src={emote.url} key={i + emote.code} />;
    }

    wordCount++
    return word;
  });

  const withSpaces: any[] = [];
  withEmotes.forEach((word, i) => {
    withSpaces.push(word);
    if (i === withEmotes.length - 1) return;
    withSpaces.push(' ');
  })
  
  return { formatted: withSpaces, emoteCount, wordCount };
};

export default emoteText;
