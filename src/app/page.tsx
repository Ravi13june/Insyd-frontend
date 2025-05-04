"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";

export default function Home() {
  interface INotification {
    userId: string,
    message: String,
    type: String,
    read: Boolean,
    createdAt:string | number | Date
    _id:String
  }
  const baseApiUrl = process.env.NEXT_APP_BASE_API_URL
  const [notifications, setNotifications] = useState<Array<INotification>>([]);
  const currentUser = "user1";
  const socket = io(baseApiUrl, {
    query: {
      userId: currentUser,
    },
    transports: ["websocket"],
  });
  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await fetch(
        `${baseApiUrl}/api/notifications/${currentUser}`
      );
      const data = await res.json();
      setNotifications(data);
    };

    socket.emit("subscribe", currentUser);
    socket.on("new-notification", (notification) => {
      console.log("notification",notification);
      //setNotifications((prev: INotification) => [notification, ...prev]);
    });

    fetchNotifications();

    return () => {
      socket.off("new-notification");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Architecture Social Platform- Logged User: {currentUser}</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Actions</h2>
        <div className="space-y-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            onClick={() => {
              fetch(`${baseApiUrl}/api/follow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  followerId: currentUser,
                  followingId: "user1",
                }),
              });
            }}
          >
            Follow Expert
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            onClick={() => {
              fetch(`${baseApiUrl}/api/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: currentUser,
                  postId: "post1",
                  postOwnerId: "user1",
                }),
              });
            }}
          >
            Like Post
          </button>

          <button
            className="bg-purple-500 text-white px-4 py-2 rounded"
            onClick={() => {
              const comment = prompt("Enter your comment:");
              if (comment) {
                fetch(`${baseApiUrl}/api/comment`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId: currentUser,
                    postId: "post1",
                    postOwnerId: "user1",
                    text: comment,
                  }),
                });
              }
            }}
          >
            Add Comment
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <div className="space-y-2">
          {notifications.map((notif: INotification,index:number) => (
            <div
              key={index}
              className="p-4 border rounded shadow-sm bg-white"
            >
              <p className="font-medium text-black">{notif.message}</p>
              <p className="text-sm text-gray-500">
                {new Date(notif.createdAt).toLocaleString()}
              </p>
              {notif.type === "comment" && (
                <button
                  className="text-blue-500 hover:underline mt-2"
                  onClick={() =>
                    console.log("Comment ID:")
                  }
                >
                  View Comment
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
