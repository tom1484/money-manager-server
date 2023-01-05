import { TransactionTableModel, TransactionModel } from '@models/transaction';

import { addAccessRecord, updateAccountBalance, deleteAccessRecord } from '@utils/account';
import { updateAccessRecord } from './account';

const loadTransactions = (transactionTableID, startDate, endDate, filters, filterKeys) => {

  return new Promise(async (resolve, reject) => {
    const transactionTable = await TransactionTableModel.findOne({ _id: transactionTableID }).exec()
      .catch((error) => {
        reject(error);
      });

    let filter = { _id: { $in: transactionTable.transactions } };

    if (startDate || endDate) {
      filter.date = {};
    }
    if (startDate) {
      filter.date.$gt = new Date(startDate);
    }
    if (endDate) {
      filter.date.$lt = new Date(endDate);
    }

    if (filters) {
      for (let i = 0; i < filters.length; i++) {
        switch (filters[i]) {
          case "accountSource":
            filter.accountSource = { $in: filterKeys[i] };
            break;
          case "accountDestination":
            filter.accountDestination = { $in: filterKeys[i] };
            break;
          case "type":
            filter.type = { $in: filterKeys[i] };
            break;
          case "category":
            filter.category = { $in: filterKeys[i] };
            break;
          default:
            break;
        }
      }
    }

    await TransactionModel.find(filter)
      .then((transactions) => {
        resolve(transactions);
      }).catch((error) => {
        reject(error);
      });
  });
}

const loadTrasactionsByIDs = (transactionIDs) => {
  return new Promise(async (resolve, reject) => {
    await TransactionModel.find({ _id: { $in: transactionIDs } })
      .then((transactions) => {
        resolve(transactions);
      }).catch((error) => {
        reject(error);
      });
  });
};

const addTransaction = (appUser, newTransaction) => {
  return new Promise(async (resolve, reject) => {
    await TransactionModel.create(newTransaction)
      .catch((error) => {
        reject(error);
      });

    await TransactionTableModel.updateOne(
      { _id: appUser.transactionTable }, { $push: { transactions: newTransaction._id } }
    ).then((updateResponse) => {
      if (!updateResponse.acknowledged) {
        reject();
      }
    }).catch((error) => {
      reject(error);
    });

    if (newTransaction.accountSource) {
      await addAccessRecord(newTransaction.accountSource, "SOURCE", newTransaction)
        .catch((error) => {
          reject(error);
        });

      await updateAccountBalance(newTransaction.accountSource, newTransaction.date)
        .catch((error) => {
          reject(error);
        });
    }

    if (newTransaction.accountDestination) {
      await addAccessRecord(newTransaction.accountDestination, "DESTINATION", newTransaction)
        .catch((error) => {
          reject(error);
        });

      await updateAccountBalance(newTransaction.accountDestination, newTransaction.date)
        .catch((error) => {
          reject(error);
        });
    }

    resolve();
  });
};

const updateTransaction = (transactionID, newTransactionInfo) => {
  return new Promise(async (resolve, reject) => {
    let updateRule = { $set: {}, $unset: {} };
    if (newTransactionInfo.type) {
      updateRule.$set.type = newTransactionInfo.type;
    }
    if (newTransactionInfo.date) {
      updateRule.$set.date = newTransactionInfo.date;
    }
    if (newTransactionInfo.accountSource) {
      updateRule.$set.accountSource = newTransactionInfo.accountSource;
    } else {
      updateRule.$unset.accountSource = "";
    }
    if (newTransactionInfo.accountDestination) {
      updateRule.$set.accountDestination = newTransactionInfo.accountDestination;
    } else {
      updateRule.$unset.accountDestination = "";
    }
    if (newTransactionInfo.type) {
      updateRule.$set.type = newTransactionInfo.type;
    }
    if (newTransactionInfo.category) {
      updateRule.$set.category = newTransactionInfo.category;
    }
    if (newTransactionInfo.amount) {
      updateRule.$set.amount = newTransactionInfo.amount;
    }
    updateRule.$set.description = newTransactionInfo.description;

    console.log(updateRule);


    const transaction = await TransactionModel.findOneAndUpdate(
      { _id: transactionID },
      updateRule, { new: false }
    ).exec().catch((error) => {
      reject(error);
    });
    if (!transaction) {
      reject();
    } else {
      // console.log(newTransactionInfo);
      // console.log(transaction);
      if (transaction.accountSource !== newTransactionInfo.accountSource) {
        if (transaction.accountSource) {
          await deleteAccessRecord(transaction.accountSource, transactionID)
            .catch((error) => {
              reject(error);
            });

          await updateAccountBalance(transaction.accountSource, transaction.date)
            .catch((error) => {
              reject(error);
            });
        }

        if (newTransactionInfo.accountSource) {
          await addAccessRecord(newTransactionInfo.accountSource, "SOURCE", transaction)
            .catch((error) => {
              reject(error);
            });

          await updateAccountBalance(newTransactionInfo.accountSource, transaction.date)
            .catch((error) => {
              reject(error);
            });
        }
      } else {
        if (transaction.accountSource) {
          await updateAccessRecord(transaction.accountSource, transactionID, newTransactionInfo)
            .catch((error) => {
              reject(error);
            });
          await updateAccountBalance(transaction.accountSource, transaction.date)
            .catch((error) => {
              reject(error);
            });
          await updateAccountBalance(transaction.accountSource, newTransactionInfo.date)
            .catch((error) => {
              reject(error);
            });
        }
      }

      if (transaction.accountDestination !== newTransactionInfo.accountDestination) {
        if (transaction.accountDestination) {
          await deleteAccessRecord(transaction.accountDestination, transactionID)
            .catch((error) => {
              reject(error);
            });

          await updateAccountBalance(transaction.accountDestination, transaction.date)
            .catch((error) => {
              reject(error);
            });
        }

        if (newTransactionInfo.accountDestination) {
          await addAccessRecord(newTransactionInfo.accountDestination, "DESTINATION", transaction)
            .catch((error) => {
              reject(error);
            });

          await updateAccountBalance(newTransactionInfo.accountDestination, transaction.date)
            .catch((error) => {
              reject(error);
            });
        }
      } else {
        if (transaction.accountDestination) {
          await updateAccessRecord(transaction.accountDestination, transactionID, newTransactionInfo)
            .catch((error) => {
              reject(error);
            });
          await updateAccountBalance(transaction.accountDestination, transaction.date)
            .catch((error) => {
              reject(error);
            });
          await updateAccountBalance(transaction.accountDestination, newTransactionInfo.date)
            .catch((error) => {
              reject(error);
            });
        }
      }

      resolve(transaction);
    }

  });
};

const deleteTransaction = (transactionID) => {
  return new Promise(async (resolve, reject) => {
    const transaction = await TransactionModel.findOneAndDelete({ _id: transactionID })
      .exec().catch((error) => {
        reject(error);
      });
    if (!transaction) {
      reject();
    } else {
      if (transaction.accountSource) {
        await deleteAccessRecord(transaction.accountSource, transactionID)
          .catch((error) => {
            reject(error);
          });

        await updateAccountBalance(transaction.accountSource, transaction.date)
          .catch((error) => {
            reject(error);
          });
      }

      if (transaction.accountDestination) {
        await deleteAccessRecord(transaction.accountDestination, transactionID)
          .catch((error) => {
            reject(error);
          });

        await updateAccountBalance(transaction.accountDestination, transaction.date)
          .catch((error) => {
            reject(error);
          });
      }

      resolve();
    }
  });
};

export {
  addTransaction,
  loadTransactions, loadTrasactionsByIDs,
  updateTransaction, deleteTransaction
};