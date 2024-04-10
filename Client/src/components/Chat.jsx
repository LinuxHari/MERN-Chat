import React, { useContext, useEffect, useRef, useState } from "react";
import lodash from "lodash";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import Contact from "./Contact";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState([]);
  const [offlinePeople, setOfflinePeople] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const { username, id, setId, setUsername } = useContext(UserContext);
  const scrollBottomRef = useRef();

  useEffect(() => {
    connectToWs();
  }, []);

  function connectToWs() {
    const ws = new WebSocket("ws://localhost:8000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("clones", () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect.");
        connectToWs();
      }, 1000);
    });
  }

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    console.log(messageData, "messageData");
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      if(messageData.sender === selectedUser){
        setMessages((prev) => [...prev, { ...messageData }]);
      }
    }
  }

  function sendMessage(e, file = null) {
    e.preventDefault();
    ws.send(
      JSON.stringify({
        message: {
          recipient: selectedUser,
          text: newMessageText,
          file,
        },
      })
    );

    if (file) {
      axios.get(`/messages/${selectedUser}`).then((res) => {
        setMessages((prev) => [...prev, ...res.data]);
      });
    } else {
      setNewMessageText("");
      setMessages((prev) => [
        ...prev,
        {
          text: newMessageText,
          sender: id,
          recipient: selectedUser,
          _id: Date.now(),
        },
      ]);
    }
  }

  function sendFile(e) {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        name: e.target.files[0].name,
        data: reader.result,
      });
    };
  }

  function logout() {
    axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  }

  useEffect(() => {
    const div = scrollBottomRef.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    axios.get("/people").then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== id)
        .filter((p) => Object.keys(onlinePeople).includes(p._id));
      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._];
      });
      setOfflinePeople(offlinePeople);
    });
  }, []);

  useEffect(() => {
    if (selectedUser) {
      axios.get(`/messages/${selectedUser}`).then((res) => {
        setMessages((prev) => [...prev, ...res.data]);
      });
    }
  }, [selectedUser]);

  const onlinePeopleExclOurUser = { ...onlinePeople };

  delete onlinePeopleExclOurUser[id];

  console.log(onlinePeopleExclOurUser, "exclude user", onlinePeople);

  const messageWithoutDupes = lodash.uniqBy(messages, "_id");

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 flex flex-col">
        <div className="flex-grow">
          <Logo />
          {Object.keys(onlinePeopleExclOurUser).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              username={onlinePeopleExclOurUser[userId]}
              onClick={() => setSelectedUser(userId)}
              selected={userId === selectedUser}
              online={true}
            />
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              username={offlinePeople[userId].username}
              onClick={() => setSelectedUser(userId)}
              selected={userId === selectedUser}
              online={false}
            />
          ))}
        </div>
        <div className="p-2 text-center">
          <span className="mr-2 text-sm text-gray-600 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            {username}
          </span>
          <button
            onClick={logout}
            className="text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="bg-blue-100 w-2/3  flex flex-col justify-between p-4">
        <div className="flex-grow">
          {!selectedUser && (
            <p className="flex h-full items-center justify-center text-gray-400">
              &larr; Selected a person
            </p>
          )}
          {!!selectedUser && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolut top-0 left-0 right-0 bottom-2">
                <div className="overflow-y-scoll absolute inset-0">
                  {messageWithoutDupes.map((message) => (
                    <div className="" key={message._id}>
                      <p
                        className={
                          "text-left inline-block p-2 m-2 rounded-md text-sm" +
                          (message.sender === id
                            ? "bg-blue-50 text-white"
                            : "bg-white text-gray-400")
                        }
                      >
                        sender
                        {message.text}
                        {message.file && (
                          <div className="">
                            <a
                              target="_blank"
                              className="flex items-center gap-1 border-b"
                              href={
                                axios.defaults.baseURL +
                                "/uploads/" +
                                message.file
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                                />
                              </svg>
                              {message.file}
                            </a>
                          </div>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={scrollBottomRef}></div>
        </div>
        {!!selectedUser && (
          <form className="flex gap-2 mx-2" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Type your message here"
              className="bg-white flex-grow border rounded-full p-2 px-4"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
            />
            <label className="bg-blue-200 p-2 text-gray-600 cursor-pointer rounded-sm border border-blue-200">
              <input type="file" className="hidden" onChange={sendFile} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                />
              </svg>
            </label>
            <button
              className="bg-blue-500 p-2 text-white rounded-full"
              type="submit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
