const getChannelId: any = async (channel: string) => {
  try {
    const userMeta = await fetch(`https://api.frankerfacez.com/v1/_room/${channel}`).then((res) => res.json());
  
    if (!userMeta.room) return '';
  
    return userMeta.room.twitch_id;
  } catch {
    console.error(`Error loading user meta from FFZ.`);
    return '0';
  }
};

const getFFZEmotes = async (channel: String) => {
  try {
    const globalEmoteList = await fetch(`https://api.frankerfacez.com/v1/set/global`).then((res) => res.json());
    const channelEmoteList = await fetch(`https://api.frankerfacez.com/v1/room/${channel}`).then((res) => res.json());
    if (!channelEmoteList.sets || !globalEmoteList.sets) return [];
    const emoticons: any = Object.values({...globalEmoteList.sets, ...channelEmoteList.sets})
      .reduce((accumulator: any, current: any) => (
        accumulator = [...accumulator, ...current.emoticons]
      ), []);

      let ffzEmotesArr = emoticons.map((emote: any) => ({
      code: emote.name,
      url: `https:${emote.urls[1]}`,
    }));

    return ffzEmotesArr;
  } catch {
    console.error(`Error loading FFZ global emotes.`);
    return [];
  }
};

const getTTVEmotes = async (channelId: String) => {
  try {
    const emoteList = await fetch(`https://api.twitchemotes.com/api/v4/channels/${channelId}`).then((res) => res.json());
    let twitchEmotesArr: any = [];
    emoteList.emotes.map((e: any) => twitchEmotesArr.push({ code: e.code, url: `https://static-cdn.jtvnw.net/emoticons/v1/${e.id}/1.0` }));
    return twitchEmotesArr;
  } catch {
    console.error(`Error loading TTV emotes for ${channelId}`);
    return [];
  }
};

const getBTTVEmotes = async (channelId: String) => {
  try {
    const channelEmoteList = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${channelId}`).then((res) => res.json());
    const globalEmoteList = await fetch(`https://api.betterttv.net/3/cached/emotes/global`).then((res) => res.json());

    if (!channelEmoteList.channelEmotes || !globalEmoteList.length) return [];
    const emoteList = [...channelEmoteList.channelEmotes, ...globalEmoteList];
    let bttvEmotesArr: any = [];

    emoteList.map((data: any) =>
      bttvEmotesArr.push({
        code: data.code,
        url: `https://cdn.betterttv.net/emote/${data.id}/1x`,
      })
    );
    return bttvEmotesArr;
  } catch {
    console.error(`Error loading BetterTTV emotes for ${channelId}`);
    return [];
  }
};

const emoteFetcher = async (channelName: string): Promise<any> => {
  const channelId = await getChannelId(channelName);

  const ttvEmotes = getTTVEmotes(channelId);
  const bttvEmotes = getBTTVEmotes(channelId);
  const ffzEmotes = getFFZEmotes(channelName);

  return Promise.all([ttvEmotes, bttvEmotes, ffzEmotes]).then((emotes) => {
    const parsedEmotes: any = [];
    emotes.map((emotes: any) => parsedEmotes.push(...emotes));
    return parsedEmotes;
  });
};

export default emoteFetcher;
