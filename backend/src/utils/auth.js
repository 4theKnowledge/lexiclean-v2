import { jwtDecode } from "jwt-decode";
import User from "../models/User.js";
import axios from "axios";

const getAuth0ManagementToken = async () => {
  const domain = process.env.AUTH0_DOMAIN;
  const mgmtClientId = process.env.AUTH0_MGMT_CLIENT_ID;
  const mgmtSecret = process.env.AUTH0_MGMT_SECRET;

  const options = {
    method: "POST",
    url: `https://${domain}/oauth/token`,
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: mgmtClientId,
      client_secret: mgmtSecret,
      audience: `https://${domain}/api/v2/`,
    }),
  };

  try {
    const response = await axios.request(options);
    // console.log(response.data);
    return response.data.access_token; // Return the access token
  } catch (error) {
    console.error(error);
    throw new Error("Failed to obtain Auth0 Management API Token");
  }
};

export const tokenGetUserId = async (authHeader) => {
  // Decode the JWT from the Authorization header
  // console.log(authHeader);
  const userDecoded = jwtDecode(authHeader.replace("Bearer ", ""));

  // Attempt to find the user in the database
  let userResponse = await User.findOne({ auth0Id: userDecoded.sub }).lean();

  // If the user doesn't exist, create them
  if (!userResponse) {
    try {
      // Get Auth0 management token
      const auth0MgmtToken = await getAuth0ManagementToken(); // Implement this function based on your Auth0 setup

      // console.log("auth0MgmtToken: ", auth0MgmtToken);

      // Fetch user details from auth0
      const { data: auth0UserDetails } = await axios.get(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userDecoded.sub}`,
        {
          headers: { authorization: `Bearer ${auth0MgmtToken}` },
        }
      );

      // console.log("auth0UserDetails: ", auth0UserDetails);

      // console.log("creating new user");
      const newUser = new User({
        username: auth0UserDetails.username.toLowerCase(),
        email: auth0UserDetails.email,
        name: auth0UserDetails.nickname,
        auth0Id: auth0UserDetails.user_id,
      });
      const savedUser = await newUser.save();

      // Adjust this to match how your User schema is defined
      return savedUser._id;
    } catch (error) {
      console.error("error creating new user: ", error);
      throw new Error("Failed to create user"); // It's important to handle or throw the error so calling functions can react accordingly
    }
  }

  // If the user already exists, return their ID
  return userResponse._id;
};
