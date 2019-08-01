# React Ephemral Messaging

In this app, we're going to build a chat app that destroys messages after another user has read it.

### Screenshots

![Login Page](screenshots/login.png)
![Chat Page](screenshots/chat.jpg)

### Technologies

This demo app uses the following:

- [CometChat Pro](https://cometchat.com)
- [React.js](https://reactjs.org)
- [Bootstrap](https://getbootstrap.com)

### Running the demo application

In order to run the demo application locally, you'll need to follow the following steps:

1. Create an account with [CometChat Pro](https://cometchat.com)
2. Head over to the [CometChat Pro Dashboard](https://app.cometchat.com/#/apps), create a new app called **React Ephemral Chat** and click **Explore**
3. Go to the **API Keys** tab and you should see an already generated **App ID** and **API Key**
4. Copy the details from the list with **Full Access** as Scope.
5. Clone the repository by running `git clone https://github.com/cometchat-pro-tutorials/ephemral-messaging-react` in the terminal and open it with the code editor of your choice.
6. Create a `.env` file with the following details.

```
REACT_APP_APP_ID=YOUR_APP_ID
REACT_APP_API_KEY=YOUR_APIKEY
```

7. `cd` into the newly created folder and run `npm install` to install dependencies.
8. Run `npm start` and wait for the development server to start.
9. Open the page `http://localhost:3000` on two different browsers to see the app.
10. Use any of the default usernames **SUPERHERO1**, **SUPERHERO2**, **SUPERHERO3**, **SUPERHERO4**, **SUPERHERO5** to login and start chatting or optionally sign up with a new account.

### Useful Links

- [CometChat Pro JavaScript SDK Documentation](https://prodocs.cometchat.com/docs/js-quick-start)
- [CometChat Pro Dashboard](https://app.cometchat.com/#/apps)
- [Bootstrap](https://getbootstrap.com)
