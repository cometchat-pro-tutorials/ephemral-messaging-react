import { CometChat } from '@cometchat-pro/chat'

export function getToken(key) {
  const authToken = JSON.parse(localStorage.getItem(key))
  return authToken
}

export function setToken(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function clearToken(key) {
  localStorage.removeItem(key)
}

export async function loginUser(uid) {
  return await CometChat.login(uid, process.env.REACT_APP_API_KEY)
}

export async function loginUserWithToken(authToken) {
  return await CometChat.login(authToken)
}

export async function getCurrentUser() {
  return await CometChat.getLoggedinUser()
}

export async function sendTextMessage(messageText) {
  const textMessage = new CometChat.TextMessage(
    'supergroup',
    messageText,
    CometChat.MESSAGE_TYPE.TEXT,
    CometChat.RECEIVER_TYPE.GROUP
  )
  return await CometChat.sendMessage(textMessage)
}

export async function fetchMessages() {
  const messagesRequest = await new CometChat.MessagesRequestBuilder()
    .setGUID('supergroup')
    .setLimit(100)
    .build()

  return messagesRequest.fetchPrevious()
}

export async function logoutUser() {
  return await CometChat.logout()
}
