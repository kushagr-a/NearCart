"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("./userController");
const verifyAuth_1 = require("./verifyAuth");
const userRoutes = (0, express_1.Router)();
// all routes those used for users
// register user
userRoutes.route("/register").post(userController_1.registerUser);
//login user
userRoutes.route("/login").post(userController_1.login);
// forgot password user
userRoutes.route("/forgotPassword").post(userController_1.forgotPassword);
//--------------------- Protected Routes from here all goes into protected routes ---------------------------------------------------------
// logout user
userRoutes.route("/logout").post(verifyAuth_1.isAuthenticated, userController_1.logout);
// logout from all devices user
userRoutes.route("/logoutAll").post(verifyAuth_1.isAuthenticated, userController_1.logoutAllDevice);
// // reset password user
// userRoutes.route("/resetPassword").post()
// change password user
userRoutes.route("/changePassword").post(verifyAuth_1.isAuthenticated, userController_1.changePassword); // For logged-in users
// Viewing own profile user
// userRoutes.route("/me").get()
// update user profile
// userRoutes.route("/updateProfile").post()
// upload user profile picture
// userRoutes.route("/uploadProfilePicture").post()
// delete own account user
// userRoutes.route("/deleteAccount").post()
exports.default = userRoutes;
