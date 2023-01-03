import { loadTransactions, loadTrasactionsByIDs } from "@utils/transaction";

const Query = {
  async loadTransactionTable(_, fields, { AppUserModel }, __) {
    const {
      token, startDate, endDate, filters, filterKeys, limit
    } = fields;

    let response = {
      status: "-1",
    }

    const appUser = await AppUserModel.findOne({ token: token }).exec();
    if (appUser) {
      await loadTransactions(appUser.transactionTable, startDate, endDate, filters, filterKeys)
        .then((transactions) => {
          response = {
            status: "1",
            transactions: transactions,
          };
        })
        .catch((error) => {
        });
    }

    return response;
  },
  async loadTransactionsByIDs(_, fields, { AppUserModel }, __) {
    const {
      token, transactionIDs
    } = fields;

    let response = {
      status: "-1",
    }

    const appUser = await AppUserModel.findOne({ token: token }).exec();
    if (appUser) {
      await loadTrasactionsByIDs(transactionIDs)
        .then((transactions) => {
          response = {
            status: "1",
            transactions: transactions,
          };
        })
        .catch((error) => {
        });
    }

    return response;
  },
};

export default Query;