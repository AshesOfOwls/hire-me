import React from 'react';
import classnames from 'classnames';
import { TwitchMessage } from 'types/TwitchMessage';
import Emote from 'components/atoms/Emote';

import s from './Message.module.css';

export interface MessageProps {
  message: TwitchMessage
}

const Message = React.memo((props: MessageProps) => {
  const { message } = props;

  const text = message.emoteText ? message.emoteText.map((fragment: any, index: number) => {
    if (fragment.type === 'emote') {
      return <Emote url={fragment.url} key={`${fragment.code}${index}`} />
    }

    if (fragment.type === 'url') {
      return (
        <a href={fragment.text} key={`${fragment.text}${index}`} target="_blank" rel="noreferrer">
          { fragment.text }
        </a>
      );
    }

    return <span key={`${fragment.text}${index}`}>{ fragment.text }</span>;
  }) : message.text;

  const isAction = message.messageType === 'action';
  const isReply = message.replyName;
  const isSubOnlyReply = message.messageId === 'skip-subs-mode-message';

  const badges = message.formattedBadges || [];

  const showAltText = isReply || isSubOnlyReply;

  return (
    <div className={classnames(s.message, { [s.showAltText]: showAltText, [s.largeAlt]: isSubOnlyReply })}>
      <div className={s.altText}>
        { isSubOnlyReply && "Redeemed Send a Message in Sub-Only Mode" }
        { isReply && `Replying to @${message.replyName}: ${message.replyMessage}`}
      </div>
      <div>
        <span className={s.timestamp}>{ message.time }</span>
        <span className={s.badges}>
          {badges.map((badge: any) => (
            <span className={s.badge} key={badge.url}><Emote url={badge.url} /></span>
          ))}
        </span>
        <div className={s.username} style={{ color: message.usernameColor }}>
          { message.username }
        </div>
        <span className={s.separator}>{!isAction && ':'} </span>
        <span style={{ color: isAction ? message.usernameColor : 'inherit' }}>
          { text }
        </span>
      </div>
    </div>
  );
});

export default Message;
