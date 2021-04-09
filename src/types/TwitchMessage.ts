import React from "react";

export interface TwitchMessage {
  id?: string
  text: string
  emoteText: React.ReactNode
  username: string | undefined
  usernameColor?: string
}
