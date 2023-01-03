import { loadAccounts } from "@utils/account";

const Query = {
  async loadAccountTable(_, fields, { AppUserModel }, __) {
    const { token } = fields;

    let response = {
      status: "-1",
    }
    const appUser = await AppUserModel.findOne({ token: token }).exec();

    if (appUser) {
      await loadAccounts(appUser.accountTable)
        .then((accounts) => {
          response = {
            status: "1",
            accounts: accounts,
          };
        })
        .catch((error) => {
        });
    }

    return response;
  },
};

export default Query;