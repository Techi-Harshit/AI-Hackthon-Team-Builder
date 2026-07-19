const cleanBookmarkData = (bookmark) => {
  if (!bookmark) return null;
  return {
    id: bookmark._id || bookmark.id,
    bookmarkType: bookmark.bookmarkType,
    itemId: bookmark.itemId,
    itemName: bookmark.itemName,
    itemImage: bookmark.itemImage,
    itemDescription: bookmark.itemDescription,
    category: bookmark.category,
    savedAt: bookmark.savedAt,
    tags: bookmark.tags || [],
    folderName: bookmark.folderName,
    hackathonId: bookmark.hackathonId,
    teamId: bookmark.teamId,
    projectId: bookmark.projectId,
    organizerId: bookmark.organizerId,
    companyId: bookmark.companyId,
    profileId: bookmark.profileId,
    skillName: bookmark.skillName,
    status: bookmark.status
  };
};

module.exports = {
  cleanBookmarkData
};
