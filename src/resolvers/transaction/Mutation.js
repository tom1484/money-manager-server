import { Types } from "mongoose";

import { addTransaction, updateTransaction, deleteTransaction } from "@utils/transaction";

const Mutation = {
  async createTransaction(_, { input }, { AppUserModel }, __) {
    const {
      token,
      type, date,
      accountSource, accountDestination,
      category, amount, description
    } = input;

    let response = {
      status: "-1",
    }

    const appUser = await AppUserModel.findOne({ token: token }).exec();

    if (appUser) {
      const newTransaction = {
        type, date,
        accountSource, accountDestination,
        category, amount, description,
        _id: new Types.ObjectId()
      };

      await addTransaction(appUser, newTransaction).then(() => {
        response = {
          status: "1",
          transaction: newTransaction,
        };
      }).catch((err) => {
        // console.log(err);
      });
    }

    return response;
  },
  async updateTransaction(_, { input }, { AppUserModel }, __) {
    const {
      token, _id,
      type, date,
      accountSource, accountDestination,
      category, amount, description
    } = input;

    // console.log(input);

    let response = {
      status: "-1",
    }

    const appUser = await AppUserModel.findOne({ token: token }).exec();

    if (appUser) {
      const newTransactionInfo = {
        type, date,
        accountSource, accountDestination,
        category, amount, description,
      };

      await updateTransaction(_id, newTransactionInfo).then((transaction) => {
        response = {
          status: "1",
          transaction: transaction,
        };
      }).catch((err) => {
        // console.log(err);
      });


    }

    return response;
  },
  async deleteTransaction(_, { input }, { AppUserModel }, __) {
    const { token, _id } = input;

    let response = {
      status: "-1",
    }

    const appUser = await AppUserModel.findOne({ token: token }).exec();

    if (appUser) {
      await deleteTransaction(_id).then(() => {
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