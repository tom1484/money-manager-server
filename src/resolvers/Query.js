const Query = {
  async userSignIn(_, { name, password }, { }, info) {
    console.log("Query In");
    return {
      status: "1",
      token: "123123123123",
      appUser: {
        name: "Test",
        email: "Test",
      }
    };
  },
};

export default Query;