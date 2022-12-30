const Query = {
    async userAccount(_, { }, { }, info) {
        console.log("Query In");
        return { ID: "123", name: "123" };
    },
};

export default Query;