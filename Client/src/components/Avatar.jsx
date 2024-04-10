import React, { useState, useEffect } from "react";

const Avatar = ({ username, online }) => {
  const [color, setColor] = useState("");

  useEffect(() => {
    const colors = [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#F333FF",
      "#33FFF5",
      "#F5FF33",
    ];
    const generateColorForUsername = (username) => {
      let sum = 0;
      for (let i = 0; i < username.length; i++) {
        sum += username.charCodeAt(i);
      }
      return colors[sum % colors.length];
    };

    setColor(generateColorForUsername(username));
  }, [username]);

  return (
    <h2
      className={`w-8 h-8 relative rounded-full opacity-50 flex items-center justify-center`}
      style={{ backgroundColor: color }}
    >
      {username[0]}
      {online && (
        <div className="absolute h-2 w-2 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
    </h2>
  );
};
export default Avatar;
