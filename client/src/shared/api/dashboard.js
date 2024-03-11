import axiosInstance from "./axiosInstance";

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

export const deleteProjectById = async (projectId) => {
  try {
    const response = await axiosInstance.delete(`/api/project/${projectId}`);
    return response; // Return the response to handle status outside
  } catch (error) {
    console.error(`Error deleting project: ${error}`);
    throw error; // Rethrow to handle it in the calling function
  }
};
export const fetchProjectSummaryById = async (projectId) => {
  try {
    const response = await axiosInstance.get(
      `/api/project/summary/${projectId}`
    );
    // Directly return the data or response as needed
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to fetch project summary");
    }
  } catch (error) {
    console.error(`Error fetching project summary: ${error}`);
    throw error; // Propagate the error to be handled by the caller
  }
};
