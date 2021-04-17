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

const getGlobalBadges = async (channelId: String) => {
  try {
    const globalBadges = await fetch(`https://badges.twitch.tv/v1/badges/global/display?language=en`).then((res) => res.json());

    if (!globalBadges.badge_sets) return [];

    const badges = Object.keys(globalBadges.badge_sets).reduce((accumulator: any, badgeCode: any) => {
      const versions: any = Object.values(globalBadges.badge_sets[badgeCode].versions);

      versions.forEach((version: any, index: number) => {
        accumulator.push({
          code: badgeCode,
          version: index + 1,
          url: version.image_url_1x,
        });
      });

      return accumulator;
    }, []);

    return badges;
  } catch {
    console.error(`Error loading global badges.`);
    return [];
  }
};

const badgeFetcher = async (channelName: string): Promise<any> => {
  const channelId = await getChannelId(channelName);

  const globalBadges = getGlobalBadges(channelId);

  return Promise.all([globalBadges]).then((badges) => {
    return badges[0];
  });
};

export default badgeFetcher;
