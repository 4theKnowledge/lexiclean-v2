// Auth0UserAuth.js
import IUserAuth from "./IUserAuth.js";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import User from "../models/User.js";

export class Auth0UserAuth extends IUserAuth {
  async validateAndCreateUser(authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const userDecoded = jwtDecode(token);
    let user = await User.findOne({ authId: userDecoded.sub }).lean();

    if (!user) {
      const auth0MgmtToken = await this.getAuth0ManagementToken();
      const { data: auth0UserDetails } = await axios.get(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userDecoded.sub}`,
        {
          headers: { authorization: `Bearer ${auth0MgmtToken}` },
        }
      );

      const newUser = new User({
        username: auth0UserDetails.username
          ? auth0UserDetails.username.toLowerCase()
          : "",
        email: auth0UserDetails.email,
        name: auth0UserDetails.nickname,
        authId: auth0UserDetails.user_id,
      });

      const savedUser = await newUser.save();
      user = savedUser;
    }

    return user._id;
  }

  async getAuth0ManagementToken() {
    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_MGMT_CLIENT_ID;
    const clientSecret = process.env.AUTH0_MGMT_SECRET;
    const options = {
      method: "POST",
      url: `https://${domain}/oauth/token`,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        audience: `https://${domain}/api/v2/`,
      }),
    };

    try {
      const response = await axios.request(options);
      return response.data.access_token;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to obtain Auth0 Management API Token");
    }
  }
}
