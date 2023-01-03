import { Types } from 'mongoose';
import { AccountTableModel, AccountModel } from '@models/account';

import { addTransaction } from '@utils/transaction';

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

    const account = await AccountModel.findOne({ _id: accountID }).exec();
    if (!account) {
      reject();
    }

    const accessRecords = account.accessRecords.filter((accessRecord) => {
      const accessRecordDate = new Date(accessRecord.date);
      const accessRecordYear = accessRecordDate.getFullYear();
      const accessRecordMonth = accessRecordDate.getMonth();
      const accessRecordDay = accessRecordDate.getDate();
      return accessRecordYear === year && accessRecordMonth === month && accessRecordDay === day;
    })

    let deposit = 0;
    let withdrawal = 0;

    for (let accessRecord of accessRecords) {
      if (accessRecord.type === "SOURCE") {
        withdrawal += accessRecord.amount;
      } else if (accessRecord.type === "DESTINATION") {
        deposit += accessRecord.amount;
      }
    }

    const balance = account.balances.find((balance) => {
      return balance.year === year && balance.month === month && balance.day === day;
    });

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
          reject();
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
          reject();
        }
      });
    }


    resolve();
  });
};

const addAccount = (appUser, newAccount, deposit) => {
  return new Promise(async (resolve, reject) => {
    const accountTable = await AccountTableModel.findOne({
      group: newAccount.group,
      name: newAccount.name,
    }).exec();

    if (accountTable) {
      reject();
    } else {
      await AccountModel.create(newAccount)
        .catch((error) => {
          reject(error);
        });

      await AccountTableModel.updateOne(
        { _id: appUser.accountTable }, { $push: { accounts: newAccount._id } }
      ).then((updateResponse) => {
        if (!updateResponse.acknowledged) {
          reject();
        }
      });

      await addTransaction(appUser, {
        type: "INCOME", date: new Date(),
        accountDestination: newAccount._id,
        category: "Initial", amount: deposit,
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
    await AccountModel.deleteOne({ _id: accountID })
      .then((deleteResponse) => {
        if (!deleteResponse.acknowledged) {
          reject();
        } else {
          resolve();
        }
      }).catch((error) => {
        reject(error);
      });

    // TODO delete all transactions related to this account
    // TODO update all balances related those deleted transactions
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
  addAccessRecord, deleteAccessRecord,
};