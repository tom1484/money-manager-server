import { Types } from 'mongoose';
import { AccountTableModel, AccountModel } from '@models/account';

import { addTransaction, deleteTransaction } from '@utils/transaction';

const loadAccounts = (accountTableID) => {
  return new Promise(async (resolve, reject) => {
    const accountTable = await AccountTableModel.findOne({ _id: accountTableID }).exec()
      .catch((error) => {
        reject(error);
      });

    await AccountModel.find({ _id: { $in: accountTable.accounts } })
      .then((accounts) => {
        resolve(accounts);
      }).catch((error) => {
        reject(error);
      });
  });
}

const updateAccountBalance = (accountID, dateRaw) => {
  return new Promise(async (resolve, reject) => {

    const date = new Date(dateRaw);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // console.log(dateRaw);

    const account = await AccountModel.findOne({ _id: accountID }).exec();
    if (!account) {
      reject({ status: "0" });
    }

    const accessRecords = account.accessRecords.filter((accessRecord) => {
      const accessRecordDate = new Date(accessRecord.date);
      const accessRecordYear = accessRecordDate.getFullYear();
      const accessRecordMonth = accessRecordDate.getMonth();
      const accessRecordDay = accessRecordDate.getDate();
      return accessRecordYear === year && accessRecordMonth === month && accessRecordDay === day;
    })

    const balance = account.balances.find((balance) => {
      return balance.year === year && balance.month === month && balance.day === day;
    });

    if (accessRecords.length > 0) {
      let deposit = 0;
      let withdrawal = 0;

      for (let accessRecord of accessRecords) {
        if (accessRecord.type === "SOURCE") {
          withdrawal += accessRecord.amount;
        } else if (accessRecord.type === "DESTINATION") {
          deposit += accessRecord.amount;
        }
      }

      const newBalance = {
        year, month, day,
        deposit, withdrawal,
        balance: deposit - withdrawal,
      };
      if (!balance) {
        await AccountModel.updateOne(
          { _id: accountID },
          {
            $push: {
              balances: newBalance,
            }
          }
        ).then((updateResponse) => {
          if (!updateResponse.acknowledged) {
            reject({ status: "-1" });
          }
        });
      } else {
        await AccountModel.updateOne(
          { _id: accountID },
          {
            $set: {
              "balances.$[balance]": newBalance,
            }
          },
          { arrayFilters: [{ "balance._id": balance._id }] }
        ).then((updateResponse) => {
          if (!updateResponse.acknowledged) {
            reject({ status: "-1" });
          }
        });
      }
    } else {
      if (balance) {
        await AccountModel.updateOne(
          { _id: accountID },
          {
            $pull: {
              balances: { _id: balance._id },
            }
          }
        ).then((updateResponse) => {
          if (!updateResponse.acknowledged) {
            reject({ status: "-1" });
          } else {
            console.log("delete balance");
          }
        }).catch((error) => {
          reject(error);
        });
      }
    }

    resolve();
  });
};

const addAccount = (appUser, newAccount, deposit) => {
  return new Promise(async (resolve, reject) => {
    const account = await AccountModel.findOne({
      // group: newAccount.group,
      name: newAccount.name,
    }).exec();

    if (account) {
      reject({ status: "0" });
    } else {
      await AccountModel.create(newAccount)
        .catch((error) => {
          reject({ status: "-1" });
        });

      await AccountTableModel.updateOne(
        { _id: appUser.accountTable }, { $push: { accounts: newAccount._id } }
      ).then((updateResponse) => {
        if (!updateResponse.acknowledged) {
          reject({ status: "-1" });
        }
      });

      await addTransaction(appUser, {
        type: "INCOME", date: new Date(),
        accountDestination: newAccount._id,
        category: "INITIAL", amount: deposit,
        description: "Initial deposit",
        _id: new Types.ObjectId(),
      });

      resolve();
    }
  });
};

const updateAccount = (accountID, newAccountInfo) => {
  return new Promise(async (resolve, reject) => {
    let updateRule = { $set: {} };
    if (newAccountInfo.group) {
      updateRule.$set.group = newAccountInfo.group;
    }
    if (newAccountInfo.name) {
      updateRule.$set.name = newAccountInfo.name;
    }

    await AccountModel.findOneAndUpdate(
      { _id: accountID },
      updateRule, { new: true }
    ).then((account) => {
      if (account) {
        resolve(account);
      } else {
        reject();
      }
    }).catch((error) => {
      reject(error);
    });
  });
};

const deleteAccount = (accountID) => {
  return new Promise(async (resolve, reject) => {
    const account = await AccountModel.findOne({ _id: accountID }).exec();
    if (!account) {
      reject();
    } else {
      for (let accessRecord of account.accessRecords) {
        await deleteTransaction(accessRecord.transaction)
          .then(() => {
            console.log("delete transaction");
          })
          .catch((error) => {
            reject(error);
          });
      }

      await AccountModel.findOneAndDelete({ _id: account._id })
        .exec().catch((error) => {
          reject(error);
        });

      resolve();
    }
  });
};

const addAccessRecord = (accountID, type, newTransaction) => {
  return new Promise(async (resolve, reject) => {
    await AccountModel.updateOne(
      { _id: accountID },
      {
        $push: {
          accessRecords: {
            date: newTransaction.date,
            type: type,
            amount: newTransaction.amount,
            transaction: newTransaction._id,
          }
        }
      }
    ).then((updateResponse) => {
      if (!updateResponse.acknowledged) {
        reject();
      }
    });

    resolve();
  });
};

const updateAccessRecord = (accountID, transactionID, newTransaction) => {
  return new Promise(async (resolve, reject) => {
    const { date, amount } = newTransaction;
    console.log(newTransaction);
    await AccountModel.updateOne(
      { _id: accountID },
      {
        $set: {
          "accessRecords.$[accessRecord].date": date,
          "accessRecords.$[accessRecord].amount": amount,
        }
      },
      { arrayFilters: [{ "accessRecord.transaction": transactionID }] }
    ).then((updateResponse) => {
      if (!updateResponse.acknowledged) {
        reject();
      } else {
        resolve();
      }
    }).catch((error) => {
      reject(error);
    });
  });
}

// Used when deleting a transaction
const deleteAccessRecord = (accountID, transactionID) => {
  return new Promise(async (resolve, reject) => {
    await AccountModel.updateOne({ _id: accountID }, {
      $pull: { accessRecords: { transaction: transactionID } }
    }).then((updateResponse) => {
      if (!updateResponse.acknowledged) {
        reject();
      } else {
        resolve();
      }
    }).catch((error) => {
      reject(error);
    });
  });
};

export {
  loadAccounts,
  updateAccountBalance,
  addAccount, updateAccount, deleteAccount,
  addAccessRecord, updateAccessRecord, deleteAccessRecord,
};