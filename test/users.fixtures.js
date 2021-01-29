function makeUsersArray() {
  return [
    {
      id: 1,
      email: "bensoni@augsburg.edu",
      password: "$2a$12$iRKeOBB4oD.dNzvl4Gt8L.d07QKI1yIIrfuKGcOInx4F9Vh3qoNei",
      datecreated: "01/03/2021",
      name: null,
    },
    {
      id: 3,
      email: "demodemo2@demo.com",
      password: "$2a$12$yZ0bkAGE6CI12.92ceswaexNMESHQ63jfAfur3FTnJ8fyUmMTpFyW",
      datecreated: "01/04/2021",
      name: null,
    },
    {
      id: 4,
      email: "demo77@demo.com",
      password: "$2a$12$EPEvWNP.HNPD86mwTvplT.zEWjgdw6NcfrtTRYsarOg97H/E15npi",
      datecreated: "01/05/2021",
      name: null,
    },
  ];
}

module.exports = {
  makeUsersArray,
};
