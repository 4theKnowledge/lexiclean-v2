import axiosInstance from "./axiosInstance";

export const getProgress = async (id, dispatch) => {
  try {
    const response = await axiosInstance.get(`/api/project/progress/${id}`);

    if (response.status === 200) {
      dispatch({ type: "SET_VALUE", payload: response.data });
    } else {
      throw new Error();
    }
  } catch (error) {
    console.log(`error fetching project progresss: ${error}`);
    throw error; // Rethrow to handle it in the calling function
  }
};

export const getProject = async (id, dispatch) => {
  try {
    const response = await axiosInstance.get(`/api/project/${id}`);

    if (response.status === 200) {
      dispatch({ type: "SET_PROJECT", payload: response.data });
    } else {
      throw new Error();
    }
  } catch (error) {
    console.log(`error fetching project: ${error}`);
    throw error; // Rethrow to handle it in the calling function
  }
};

export const getTexts = async (id, filters, page, limit, dispatch) => {
  /**
   * id : project id
   * page : page number
   * limit : page limit
   */
  try {
    const response = await axiosInstance.post(
      "/api/text/filter",
      { projectId: id, filters: filters },
      { params: { page, limit } }
    );

    if (response.status === 200) {
      dispatch({ type: "SET_TEXTS", payload: response.data });
    } else {
      throw new Error();
    }
  } catch (error) {
    console.log(`error fetching texts: ${error}`);
  }
};

export const downloadProjectData = async (projectId) => {
  try {
    const response = await axiosInstance.get(
      `/api/project/download/${projectId}`
    );
    return response; // Return the full response to handle status and data outside
  } catch (error) {
    console.error("Error downloading project data:", error);
    throw error; // Rethrow to handle it in the calling function
  }
};

export const applyTokenAction = async (payload) => {
  try {
    const response = await axiosInstance.patch("/api/token/add", payload);
    return response; // Return the entire response to handle status checking outside
  } catch (error) {
    throw error; // Rethrow the error to be caught by the caller
  }
};

export const deleteTokenAction = async (payload) => {
  try {
    const response = await axiosInstance.patch("/api/token/delete", payload);
    return response; // Return the entire response to handle status checking outside
  } catch (error) {
    throw error; // Rethrow the error to be caught by the caller
  }
};

export const acceptTokenAction = async (payload) => {
  try {
    const response = await axiosInstance.patch("/api/token/accept", payload);
    return response; // Return the entire response to handle status checking outside
  } catch (error) {
    throw error; // Rethrow the error to be caught by the caller
  }
};

export const splitTokenAction = async (payload) => {
  try {
    const response = await axiosInstance.patch("/api/token/split", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const removeTokenAction = async (payload) => {
  try {
    const response = await axiosInstance.patch("/api/token/remove", payload);
    return response;
  } catch (error) {
    throw error;
  }
};
