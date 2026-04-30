import React, { useState } from "react";
import { ThumbsUp, Users } from "lucide-react";

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  isTrainer: boolean;
}

export function TrainerChat() {
  // const [messages, setMessages] = useState<Message[]>([
  //   {
  //     id: "1",
  //     userId: "trainer1",
  //     userName: "John Smith",
  //     userAvatar: "https://api.dicebear.com/9.x/notionists/svg?seed=trainer1",
  //     content: "Welcome to today's session! Feel free to ask any questions.",
  //     timestamp: "2 hours ago",
  //     isTrainer: true,
  //   },
  //   {
  //     id: "2",
  //     userId: "current-user",
  //     userName: "You",
  //     userAvatar:
  //       "https://api.dicebear.com/9.x/notionists/svg?seed=current-user",
  //     content: "Thank you! Looking forward to learning more about JavaScript.",
  //     timestamp: "2 hours ago",
  //     isTrainer: false,
  //   },
  //   {
  //     id: "3",
  //     userId: "trainer1",
  //     userName: "John Smith",
  //     userAvatar: "https://api.dicebear.com/9.x/notionists/svg?seed=trainer1",
  //     content:
  //       "Great! We'll cover variables, functions, and scope today. Make sure to practice the examples.",
  //     timestamp: "1 hour ago",
  //     isTrainer: true,
  //   },
  // ]);
  // const [newMessage, setNewMessage] = useState("");

  // const handleSendMessage = () => {
  //   if (newMessage.trim()) {
  //     const message: Message = {
  //       id: Date.now().toString(),
  //       userId: "current-user",
  //       userName: "You",
  //       userAvatar:
  //         "https://api.dicebear.com/9.x/notionists/svg?seed=current-user",
  //       content: newMessage,
  //       timestamp: "Just now",
  //       isTrainer: false,
  //     };
  //     setMessages([...messages, message]);
  //     setNewMessage("");
  //   }
  // };
  return (
    <div className="text-center py-12 text-gray-500">
      <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
      <p className="text-sm">No trainer chat here</p>
    </div>
  );

  // return (
  //   <div className="my-8">
  //     <div className="mb-4">
  //       <h2 className="text-xl font-bold text-gray-900 mb-1">
  //         This space is just for you and your Trainer
  //       </h2>
  //       <p className="text-gray-600 text-sm">
  //         Ask questions, get clarity, and learn with personal guidance.
  //       </p>
  //     </div>

  //     <div className="mb-6">
  //       <div className="flex gap-3">
  //         <img
  //           src="https://api.dicebear.com/9.x/notionists/svg?seed=current-user"
  //           alt="You"
  //           className="w-8 h-8 rounded-full"
  //         />
  //         <div className="flex-1">
  //           <input
  //             type="text"
  //             value={newMessage}
  //             onChange={(e) => setNewMessage(e.target.value)}
  //             onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
  //             placeholder="Ask a question or share your thoughts..."
  //             className="w-full py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-[#00BF53] text-sm bg-transparent"
  //           />
  //         </div>
  //       </div>
  //     </div>

  //     <div className="space-y-6">
  //       {messages.map((message) => (
  //         <div key={message.id} className="flex items-start gap-3">
  //           <img
  //             src={message.userAvatar}
  //             alt={message.userName}
  //             className="w-8 h-8 rounded-full flex-shrink-0"
  //           />
  //           <div className="flex-1">
  //             <div className="flex items-center gap-2 mb-1">
  //               <span className="font-medium text-sm text-gray-900">
  //                 {message.userName}
  //               </span>
  //               {message.isTrainer && (
  //                 <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
  //                   Trainer
  //                 </span>
  //               )}
  //               <span className="text-xs text-gray-500">
  //                 {message.timestamp}
  //               </span>
  //             </div>
  //             <p className="text-sm text-gray-700 mb-2">{message.content}</p>
  //             <div className="flex items-center gap-4">
  //               <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#00BF53]">
  //                 <ThumbsUp className="w-3 h-3" /> Like
  //               </button>
  //               <button className="text-xs text-gray-600 hover:text-[#00BF53]">
  //                 Reply
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );
}
