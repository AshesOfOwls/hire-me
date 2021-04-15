const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

export interface Props {
  text: string
  emoteList: any
};

const parseTwitchChat = (props: Props): { formatted: any[], emoteCount: number, wordCount: number } => {
  const { text, emoteList } = props;

  let emoteCount = 0;
  let wordCount = 0;

  const formatted = text.split(' ').map((word) => {
    const emote = emoteList.find((emote: any) => emote.code === word);

    if (emote) {
      emoteCount++;
      return {
        type: 'emote',
        code: emote.code,
        url: emote.url,
      };
    }

    if (word.match(URL_REGEX)) {
      return {
        type: 'url',
        text: word, 
      };
    }

    wordCount++;
    return {
      type: 'text',
      text: word,
    };
  });

  const withSpaces = formatted.reduce((accumulator: any, next: any, index: number, array: any) => {
    accumulator.push(next);
    if (index !== array.length - 1) {
      accumulator.push({
        type: 'text',
        text: ' ',
      });
    } 

    return accumulator;
  }, []);

  return { formatted: withSpaces, emoteCount, wordCount };
};

export default parseTwitchChat;
