export interface TwitchMessage {
  id?: string
  text: string
  emoteText: any
  username: string | undefined
  usernameColor?: string
  time: string
  emotePercentage: number
  channel: string
}
