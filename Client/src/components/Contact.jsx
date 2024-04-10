import React from "react";
import Avatar from "./Avatar";

const Contact = ({id, username,onClick, selected, online}) => {
  return (
    <p
      onClick={() => onClick(id)}
      className={
        "border-b border-gray-100 py-2 pl-4 flex items-center gap-2 cursor-pointer " +
        (selected ? "bg-blue-50" : "")
      }
      key={userId}
    >
      {selected && (
        <div className="w-1 bg-blue-500 h-12 rounded-r-md "></div>
      )}
      <div className="flex gap-2 py-2 pl-4 items-center">
        <Avatar online={online} username={onlinePeople[userId]} />
        <span>{onlinePeople[userId]}</span>
      </div>
    </p>
  );
};

export default Contact;
