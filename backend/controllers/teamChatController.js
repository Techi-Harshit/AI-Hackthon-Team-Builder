const TeamMessage = require("../models/TeamMessage");

// GET /api/teams/:id/chats
const getTeamChats = async (req, res) => {
  try {
    const teamId = req.params.id;
    let chats = [];

    if (global.dbMode === "json") {
      const { readCollection } = require("../utils/jsonDb");
      chats = readCollection("team_messages") || [];
      chats = chats.filter(c => String(c.teamId) === String(teamId));
    } else {
      chats = await TeamMessage.find({ teamId }).sort({ createdAt: 1 }).lean();
    }

    // If chats are empty, seed default ones
    if (chats.length === 0) {
      const defaultSeeds = [
        {
          teamId,
          sender: "Aman Raj",
          senderId: "aman_raj_seed",
          avatar: "33",
          text: "Hey guys! Did we finalize the API endpoints for Auth?",
          time: "10:32 AM",
          isMe: false,
          type: "text",
          createdAt: new Date(Date.now() - 3600000)
        },
        {
          teamId,
          sender: "Priya Sharma",
          senderId: "priya_sharma_seed",
          avatar: "44",
          text: "Yes, they are documented in the Figma workspace under designs.",
          time: "10:35 AM",
          isMe: false,
          replyTo: "Auth API endpoints",
          type: "text",
          createdAt: new Date(Date.now() - 3300000)
        },
        {
          teamId,
          sender: "Aman Raj",
          senderId: "aman_raj_seed",
          avatar: "33",
          duration: "0:18",
          time: "10:42 AM",
          isMe: false,
          type: "voice",
          createdAt: new Date(Date.now() - 2800000)
        },
        {
          teamId,
          sender: "Aman Raj",
          senderId: "aman_raj_seed",
          avatar: "33",
          type: "poll",
          question: "Finalize tech stack?",
          options: [
            { id: "a", text: "React + NestJS + Docker", votes: 3 },
            { id: "b", text: "NextJS + Flask + MongoDB", votes: 1 }
          ],
          totalVotes: 4,
          time: "10:45 AM",
          createdAt: new Date(Date.now() - 2500000)
        }
      ];

      if (global.dbMode === "json") {
        const { readCollection, writeCollection } = require("../utils/jsonDb");
        const allMsgs = readCollection("team_messages") || [];
        defaultSeeds.forEach(s => {
          s._id = "msg_" + Math.random().toString(36).substr(2, 9);
          allMsgs.push(s);
        });
        writeCollection("team_messages", allMsgs);
        chats = defaultSeeds;
      } else {
        chats = await TeamMessage.insertMany(defaultSeeds);
      }
    }

    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("getTeamChats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/teams/:id/chats
const createTeamChat = async (req, res) => {
  try {
    const teamId = req.params.id;
    const { text, type, replyTo, time, duration, repo, link, fileName, fileSize, options } = req.body;
    
    // Automatically extract authenticated sender profile details from req.user
    const sender = req.user.name || "Developer";
    const senderId = String(req.user._id || req.user.id);
    const avatar = req.user.avatar || "12";

    const newMsgData = {
      teamId,
      sender,
      senderId,
      avatar,
      text,
      type: type || "text",
      replyTo,
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration,
      repo,
      link,
      fileName,
      fileSize,
      options: options || [],
      totalVotes: options ? options.reduce((sum, o) => sum + (o.votes || 0), 0) : 0
    };

    let savedMsg;
    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const allMsgs = readCollection("team_messages") || [];
      newMsgData._id = "msg_" + Math.random().toString(36).substr(2, 9);
      newMsgData.createdAt = new Date();
      allMsgs.push(newMsgData);
      writeCollection("team_messages", allMsgs);
      savedMsg = newMsgData;
    } else {
      const newMsg = new TeamMessage(newMsgData);
      savedMsg = await newMsg.save();
    }

    res.status(201).json({ success: true, chat: savedMsg });
  } catch (error) {
    console.error("createTeamChat error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/teams/:id/chats/vote
const voteTeamChatPoll = async (req, res) => {
  try {
    const { chatId, optionId } = req.body;

    if (global.dbMode === "json") {
      const { readCollection, writeCollection } = require("../utils/jsonDb");
      const allMsgs = readCollection("team_messages") || [];
      const msg = allMsgs.find(m => String(m._id) === String(chatId));
      if (!msg) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }
      msg.options = msg.options.map(opt => {
        if (opt.id === optionId) {
          return { ...opt, votes: (opt.votes || 0) + 1 };
        }
        return opt;
      });
      msg.totalVotes = (msg.totalVotes || 0) + 1;
      writeCollection("team_messages", allMsgs);
      return res.status(200).json({ success: true, chat: msg });
    }

    const msg = await TeamMessage.findById(chatId);
    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }
    msg.options = msg.options.map(opt => {
      if (opt.id === optionId) {
        opt.votes += 1;
      }
      return opt;
    });
    msg.totalVotes += 1;
    await msg.save();

    res.status(200).json({ success: true, chat: msg });
  } catch (error) {
    console.error("voteTeamChatPoll error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTeamChats,
  createTeamChat,
  voteTeamChatPoll
};
