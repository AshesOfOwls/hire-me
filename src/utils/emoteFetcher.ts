const getChannelId: any = async (channel: string) => {
  const userMeta = await fetch(`https://api.frankerfacez.com/v1/_room/${channel}`).then((res) => res.json());

  if (!userMeta.room) return '';

  return userMeta.room.twitch_id;
};

const getFFZEmotes = async (channel: String) => {
  const emoteList = await fetch(`https://api.frankerfacez.com/v1/room/${channel}`).then((res) => res.json());
  if (!emoteList.sets) return [];
  const emoteSets = Object.keys(emoteList.sets);
  let ffzEmotesArr: any = [];
  emoteSets.map((e: any) => emoteList.sets[e].emoticons.map((em: any) => ffzEmotesArr.push({ code: em.name, url: `https:${em.urls[1]}` })));

  return ffzEmotesArr;
};

const getTTVGlobalEmotes = async () => {
  const global_chan_id = 0;
  const emoteList = await fetch(`https://api.twitchemotes.com/api/v4/channels/${global_chan_id}`).then((res) => res.json());
  let globalTTVEmotesArr: any = [];
  emoteList.emotes.map((e: any) => globalTTVEmotesArr.push({ code: e.code, url: `https://static-cdn.jtvnw.net/emoticons/v1/${e.id}/1.0` }));
  return globalTTVEmotesArr;
};

const getTTVEmotes = async (channelId: String) => {
  const emoteList = await fetch(`https://api.twitchemotes.com/api/v4/channels/${channelId}`).then((res) => res.json());
  let twitchEmotesArr: any = [];
  emoteList.emotes.map((e: any) => twitchEmotesArr.push({ code: e.code, url: `https://static-cdn.jtvnw.net/emoticons/v1/${e.id}/1.0` }));
  return twitchEmotesArr;
};

const getBTTVEmotes = async (channelId: String) => {
  const emoteList = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${channelId}`).then((res) => res.json());
  if (!emoteList.channelEmotes) return [];
  let bttvEmotesArr: any = [];
  emoteList.channelEmotes.map((data: any) =>
    bttvEmotesArr.push({
      code: data.code,
      url: `https://cdn.betterttv.net/emote/${data.id}/1x`,
    })
  );
  return bttvEmotesArr;
};

const emoteFetcher = async (channelName: string): Promise<any> => {
  const channelId = await getChannelId(channelName);

  const ttvEmotes = getTTVEmotes(channelId);
  const bttvEmotes = getBTTVEmotes(channelId);
  const ffzEmotes = getFFZEmotes(channelId);
  const ttvGlobalEmotes = getTTVGlobalEmotes();

  return Promise.all([ttvGlobalEmotes, ttvEmotes, bttvEmotes, ffzEmotes]).then((emotes) => {
    const parsedEmotes: any = [];
    emotes.map((emotes: any) => parsedEmotes.push(...emotes));
    return parsedEmotes;
  });
};

export default emoteFetcher;
