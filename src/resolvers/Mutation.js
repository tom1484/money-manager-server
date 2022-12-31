import generateToken from '../utils/generateToken';

const Mutation = {
  async userSignUp(_, { input }, { AppUserModel }, info) {
    const { name, password, email } = input;

    let response = { status: "0" };
    let appUser = await AppUserModel.findOne({ name }).exec();
    console.log(appUser);

    if (!appUser) {
      const token = generateToken();
      appUser = {
        name,
        password,
        email,
      }
      await AppUserModel.create({ ...appUser, token })
        .then((result) => {
          console.log("Ok");
          response = {
            status: "1",
            token: token,
            appUser: appUser
          };
        })
        .catch((error) => {
          console.log(error);
          response = { status: "-1" };
        });

      return response;
    }
  },
};

export default Mutation;