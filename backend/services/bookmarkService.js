const mongoose = require("mongoose");
const Bookmark = require("../models/Bookmark");
const BookmarkFolder = require("../models/BookmarkFolder");

const addBookmark = async (userId, data) => {
  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb");
    const bookmarks = readCollection("bookmarks") || [];
    
    // Check duplicate
    const exists = bookmarks.find(b => String(b.userId) === String(userId) && String(b.itemId) === String(data.itemId));
    if (exists) {
      return exists;
    }

    const newB = {
      _id: "book_" + Math.random().toString(36).substr(2, 9),
      userId,
      ...data,
      savedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    bookmarks.push(newB);
    writeCollection("bookmarks", bookmarks);
    return newB;
  } else {
    // Check duplicate in MongoDB
    const exists = await Bookmark.findOne({ userId, itemId: data.itemId });
    if (exists) {
      return exists;
    }
    const newB = new Bookmark({ userId, ...data });
    return await newB.save();
  }
};

const removeBookmark = async (userId, id) => {
  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb");
    let bookmarks = readCollection("bookmarks") || [];
    
    const initialLen = bookmarks.length;
    bookmarks = bookmarks.filter(b => 
      !(String(b.userId) === String(userId) && (String(b._id) === String(id) || String(b.itemId) === String(id)))
    );
    writeCollection("bookmarks", bookmarks);
    return bookmarks.length < initialLen;
  } else {
    const res = await Bookmark.deleteOne({
      userId,
      $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { itemId: id }]
    });
    return res.deletedCount > 0;
  }
};

const getBookmarks = async (userId, filter = {}) => {
  if (global.dbMode === "json") {
    const { readCollection } = require("../utils/jsonDb");
    let bookmarks = readCollection("bookmarks") || [];
    bookmarks = bookmarks.filter(b => String(b.userId) === String(userId));
    
    if (filter.bookmarkType) {
      bookmarks = bookmarks.filter(b => b.bookmarkType === filter.bookmarkType);
    }
    if (filter.itemId) {
      bookmarks = bookmarks.filter(b => b.itemId === filter.itemId);
    }
    return bookmarks;
  } else {
    const query = { userId, isDeleted: false };
    if (filter.bookmarkType) {
      query.bookmarkType = filter.bookmarkType;
    }
    if (filter.itemId) {
      query.itemId = filter.itemId;
    }
    return await Bookmark.find(query).sort({ savedAt: -1 }).lean();
  }
};

const getFolders = async (userId) => {
  if (global.dbMode === "json") {
    const { readCollection } = require("../utils/jsonDb");
    let folders = readCollection("bookmark_folders") || [];
    folders = folders.filter(f => String(f.userId) === String(userId));
    
    // Populate simple bookmarks
    const bookmarks = readCollection("bookmarks") || [];
    folders.forEach(f => {
      f.bookmarksData = (f.bookmarks || []).map(bId => bookmarks.find(b => String(b._id) === String(bId))).filter(Boolean);
    });
    return folders;
  } else {
    return await BookmarkFolder.find({ userId }).populate("bookmarks").lean();
  }
};

const createFolder = async (userId, folderName, description = "") => {
  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb");
    const folders = readCollection("bookmark_folders") || [];
    
    const exists = folders.find(f => String(f.userId) === String(userId) && f.folderName.toLowerCase() === folderName.toLowerCase());
    if (exists) {
      throw new Error("Folder already exists");
    }

    const newF = {
      _id: "fold_" + Math.random().toString(36).substr(2, 9),
      userId,
      folderName,
      description,
      bookmarks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    folders.push(newF);
    writeCollection("bookmark_folders", folders);
    return newF;
  } else {
    const exists = await BookmarkFolder.findOne({ userId, folderName });
    if (exists) {
      throw new Error("Folder already exists");
    }
    const newF = new BookmarkFolder({ userId, folderName, description });
    return await newF.save();
  }
};

const deleteFolder = async (userId, folderName) => {
  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb");
    let folders = readCollection("bookmark_folders") || [];
    const initialLen = folders.length;
    folders = folders.filter(f => !(String(f.userId) === String(userId) && f.folderName.toLowerCase() === folderName.toLowerCase()));
    writeCollection("bookmark_folders", folders);
    return folders.length < initialLen;
  } else {
    const res = await BookmarkFolder.deleteOne({ userId, folderName });
    return res.deletedCount > 0;
  }
};

const updateFolder = async (userId, oldName, newName, description) => {
  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb");
    const folders = readCollection("bookmark_folders") || [];
    const folder = folders.find(f => String(f.userId) === String(userId) && f.folderName.toLowerCase() === oldName.toLowerCase());
    if (!folder) {
      throw new Error("Folder not found");
    }
    if (newName) folder.folderName = newName;
    if (description !== undefined) folder.description = description;
    folder.updatedAt = new Date();
    writeCollection("bookmark_folders", folders);
    return folder;
  } else {
    const folder = await BookmarkFolder.findOne({ userId, folderName: oldName });
    if (!folder) {
      throw new Error("Folder not found");
    }
    if (newName) folder.folderName = newName;
    if (description !== undefined) folder.description = description;
    return await folder.save();
  }
};

const addBookmarkToFolder = async (userId, folderName, bookmarkId) => {
  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb");
    const folders = readCollection("bookmark_folders") || [];
    const folder = folders.find(f => String(f.userId) === String(userId) && f.folderName.toLowerCase() === folderName.toLowerCase());
    if (!folder) {
      throw new Error("Folder not found");
    }
    if (!folder.bookmarks.includes(String(bookmarkId))) {
      folder.bookmarks.push(String(bookmarkId));
      folder.updatedAt = new Date();
      writeCollection("bookmark_folders", folders);
    }
    return folder;
  } else {
    const folder = await BookmarkFolder.findOne({ userId, folderName });
    if (!folder) {
      throw new Error("Folder not found");
    }
    if (!folder.bookmarks.includes(bookmarkId)) {
      folder.bookmarks.push(bookmarkId);
      await folder.save();
    }
    return folder;
  }
};

const removeBookmarkFromFolder = async (userId, folderName, bookmarkId) => {
  if (global.dbMode === "json") {
    const { readCollection, writeCollection } = require("../utils/jsonDb");
    const folders = readCollection("bookmark_folders") || [];
    const folder = folders.find(f => String(f.userId) === String(userId) && f.folderName.toLowerCase() === folderName.toLowerCase());
    if (!folder) {
      throw new Error("Folder not found");
    }
    folder.bookmarks = folder.bookmarks.filter(bId => String(bId) !== String(bookmarkId));
    folder.updatedAt = new Date();
    writeCollection("bookmark_folders", folders);
    return folder;
  } else {
    const folder = await BookmarkFolder.findOne({ userId, folderName });
    if (!folder) {
      throw new Error("Folder not found");
    }
    folder.bookmarks = folder.bookmarks.filter(bId => String(bId) !== String(bookmarkId));
    return await folder.save();
  }
};

module.exports = {
  addBookmark,
  removeBookmark,
  getBookmarks,
  getFolders,
  createFolder,
  deleteFolder,
  updateFolder,
  addBookmarkToFolder,
  removeBookmarkFromFolder
};
