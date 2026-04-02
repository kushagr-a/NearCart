import { Router } from "express";
import { login, logout, registerUser } from "./userController";

const userRoutes = Router();

// all routes those used for users

// register user
userRoutes.route("/register").post(registerUser)

//login user
userRoutes.route("/login").post(login)

// // forgot password user
// userRoutes.route("/forgotPassword").post()

// //--------------------- Protected Routes from here all goes into protected routes

// // logout user
userRoutes.route("/logout").post(logout)

// // logout from all devices user
// userRoutes.route("/logoutAll").post()

// // reset password user
// userRoutes.route("/resetPassword").post()

// // change password user
// userRoutes.route("/changePassword").post() // For logged-in users

// // Viewing own profile user
// userRoutes.route("/me").get()

// // update user profile
// userRoutes.route("/updateProfile").post()

// // upload user profile picture
// userRoutes.route("/uploadProfilePicture").post()

// // delete own account user
// userRoutes.route("/deleteAccount").post()


export default userRoutes;
