function makePostsArray() {
  return [
    {
      id: 1,
      character_id: 1,
      campagin_id: 2,
      datecreated: "01/12/2021",
      title: "character is good",
      content: "i like character",
      completed: true,
    },
    {
      id: 2,
      character_id: 1,
      campagin_id: 2,
      datecreated: "01/13/2021",
      title: "character is bad",
      content: "i don't like character",
      completed: true,
    },
    {
      id: 3,
      character_id: 2,
      campagin_id: 3,
      datecreated: "01/15/2021",
      title: "found dragon",
      content: "i like dragon",
      completed: true,
    },
  ];
}

module.exports = {
  makePostsArray,
};
