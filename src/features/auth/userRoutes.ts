import { Router } from "express";

const userRoutes = Router();

// all routes those used for users

// register user
userRoutes.route("/register").post()

//login user
userRoutes.route("/login").post()

// logout user
userRoutes.route("/logout").post()

// logout from all devices user
userRoutes.route("/logoutAll").post()

// forgot password user
userRoutes.route("/forgotPassword").post()

// reset password user
userRoutes.route("/resetPassword").post()

// Viewing own profile user
userRoutes.route("/viewProfile").get()

// delete own account user
userRoutes.route("/deleteAccount").post()

// upload user profile picture
userRoutes.route("/uploadProfilePicture").post()

export default userRoutes;
