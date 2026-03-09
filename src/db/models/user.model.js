import mongoose from "mongoose";

export let genderEnum = { male: "male", female: "female" };
export let roleEnum = { user: "User", admin: "Admin" };
export let providerEnum = { system: "System", google: "Google" };
const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true, //////
      minLength: 2,
      maxLength: [20, "first name max length is 20 and you entered {VALUE}"],
    },
    lastname: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: [20, "first name max length is 20 and you entered {VALUE}"],
    },
    age: {
      type: String,
      min: [10, "age must be greater than 10 years old"],
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === providerEnum.system ? true : false;
      },
    },
    gender: {
      type: String,
      enum: {
        values: Object.values(genderEnum),
        message: `only allowed genders are ${Object.values(genderEnum)}`,
      },
      default: genderEnum.male,

      // enum: {
      //     values: ["Male", "Female"],
      //     message:"gender only allow male or female"
      // },
      // default:"male"
    },
    role: {
      type: String,
      enum: {
        values: Object.values(roleEnum),
      },
      default: roleEnum.user,
    },
    phone: {
      type: String,
      function() {
        return this.provider === providerEnum.system ? true : false;
      },
    },
    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.system,
    },
    picture: {
      type: String,
    },
    confirmEmailOtp: {
      type: String,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    confirmedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    deletedAt: Date,
    restoredBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    restoredAt: Date,
  },
  {
    ///////////////////////////
    timestamps: true,
    toObject: true,
    toJSON: true,
  },
);

userSchema
  .virtual("fullname")
  .set(function (value) {
    const [firstname, lastname] = value?.split(" ") || [];
    this.set({ firstname, lastname });
  })
  .get(function () {
    return this.firstname + " " + this.lastname;
  });

export const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);
UserModel.syncIndexes();
