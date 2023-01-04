import { Types } from "mongoose";

import { addAccount, updateAccount, deleteAccount } from "@utils/account";

const Mutation = {
  async createAccount(_, { input }, { AppUserModel }, __) {
    const { token, group, name, deposit } = input;

    let response = {
      status: "-1",
    }

    const appUser = await AppUserModel.findOne({ token: token }).exec();
    if (appUser) {
      const newAccount = {
        group, name,
        balances: [], accessRecords: [],
        _id: new Types.ObjectId(),
      };
      await addAccount(appUser, newAccount, deposit)
        .then(() => {
          response = {
            status: "1",
            account: newAccount,
          };
        }).catch((err) => {
          response = { status: err.status };
        });
    }

    return response;
  },
  async updateAccount(_, { input }, { AppUserModel }, __) {
    const { token, _id, group, name } = input;

    let response = {
      status: "-1",
    }

    const appUser = await AppUserModel.findOne({ token: token }).exec();
    if (appUser) {
      const newAccountInfo = {
        group, name,
      };
      await updateAccount(_id, newAccountInfo)
        .then((account) => {
          response = {
            status: "1",
            account: account,
          };
        }).catch((err) => {
          // console.log(err);
        });
    }

    return response;
  },

  async deleteAccount(_, { input }, { AppUserModel }, __) {
    const { token, _id } = input;

    let response = {
      status: "-1",
    }

    const appUser = await AppUserModel.findOne({ token: token }).exec();
    if (appUser) {
      await deleteAccount(_id)
        .then(() => {
          response = {
            status: "1",
          };
        }).catch((err) => {
          // console.log(err);
        });
    }

    return response;
  },
};

export default Mutation;