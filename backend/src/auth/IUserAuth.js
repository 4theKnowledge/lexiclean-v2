// IUserAuth.js

export default class IUserAuth {
  /**
   * Validates the user's token and creates the user if not exists.
   * @param {string} authHeader The authorization header containing the token.
   * @return {Promise<string>} The user ID.
   */
  async validateAndCreateUser(authHeader) {
    throw new Error("Method not implemented.");
  }

  /**
   * Obtains a management API token from Auth0.
   * @return {Promise<string>} The management API token.
   */
  async getAuth0ManagementToken() {
    throw new Error("Method not implemented.");
  }
}
