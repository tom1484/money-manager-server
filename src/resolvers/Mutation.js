import generateToken from '../utils/generateToken';

const Mutation = {
  async userSignUp(_, { input }, { AppUserModel }, info) {
    const { name, password, email } = input;

    let response = { status: "-1" };

    let appUserByName = await AppUserModel.findOne({ name }).exec();
    let appUserByEmail = await AppUserModel.findOne({ email }).exec();

    if (appUserByName) {
      response = { status: "0-0" };
    } else if (appUserByEmail) {
      response = { status: "0-1" };
    } else {
      const token = generateToken();
      appUserByName = {
        name,
        password,
        email,
      }
      await AppUserModel.create({ ...appUserByName, token })
        .then(() => {
          response = {
            status: "1",
            token: token,
            appUser: appUserByName
          };
        })
    }

    return response;
  },
};

export default Mutation;