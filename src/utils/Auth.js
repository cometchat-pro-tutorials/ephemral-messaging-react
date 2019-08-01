import { CometChat } from '@cometchat-pro/chat';

export function getToken(key) {
  const authToken = JSON.parse(localStorage.getItem(key));
  return authToken;
}

export function setToken(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function clearToken(key) {
  localStorage.removeItem(key);
}

export async function loginUser(uid) {
  return await CometChat.login(uid, process.env.REACT_APP_API_KEY);
}

export async function loginUserWithToken(authToken) {
  return await CometChat.login(authToken);
}

export async function getCurrentUser() {
  return await CometChat.getLoggedinUser();
}

export async function sendTextMessage(messageText) {
  const textMessage = new CometChat.TextMessage(
    'supergroup',
    messageText,
    CometChat.MESSAGE_TYPE.TEXT,
    CometChat.RECEIVER_TYPE.GROUP
  );
  return await CometChat.sendMessage(textMessage);
}

export async function sendCustomMessage(customData) {
  const customMessage = new CometChat.CustomMessage(
    'supergroup',
    CometChat.RECEIVER_TYPE.GROUP,
    customData
  );
  return await CometChat.sendCustomMessage(customMessage);
}

export async function fetchMessages() {
  const messagesRequest = await new CometChat.MessagesRequestBuilder()
    .setGUID('supergroup')
    .setLimit(100)
    .build();

  return messagesRequest.fetchPrevious();
}

export async function createUser(uid, name, email) {
  const response = await fetch('https://api.cometchat.com/v1/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      appid: process.env.REACT_APP_APP_ID,
      apikey: process.env.REACT_APP_API_KEY
    },
    body: JSON.stringify({
      uid,
      name,
      email
    })
  });

  const json = await response.json();
  return json;
}

export async function getGroupMembers() {
  const GUID = 'supergroup';
  const limit = 100;
  const groupMemberRequest = await new CometChat.GroupMembersRequestBuilder(
    GUID
  )
    .setLimit(limit)
    .build();

  return await groupMemberRequest.fetchNext();
}

export async function joinGroup() {
  return await CometChat.joinGroup(
    'supergroup',
    CometChat.GROUP_TYPE.PUBLIC,
    ''
  );
}

export async function logoutUser() {
  return await CometChat.logout();
}
