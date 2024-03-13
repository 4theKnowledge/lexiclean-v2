import useApi from "../useApi";
import { useSnackbar } from "../../context/SnackbarContext";

const useDashboardActions = () => {
  const callApi = useApi();
  const { dispatch: snackbarDispatch } = useSnackbar();

  const fetchProjectSummaryById = async (id) => {
    try {
      const data = await callApi(`/api/project/summary/${id}`, {
        method: "GET",
      });

      return data;
    } catch (error) {
      console.error(`Error fetching project dashboard info: ${error}`);
      snackbarDispatch({
        type: "SHOW",
        message: `Unable to fetch project dashboard information`,
        severity: "error",
      });

      throw error;
    }
  };

  const downloadProjectData = async (id) => {
    try {
      const data = await callApi(`/api/project/download/${id}`, {
        method: "GET",
      });

      return data;
    } catch (error) {
      console.error(`Error downloading project data: ${error}`);
      snackbarDispatch({
        type: "SHOW",
        message: `Error downloading project data`,
        severity: "error",
      });

      throw error;
    }
  };

  const deleteProjectById = async (id) => {
    try {
      const data = await callApi(`/api/project/${id}`, {
        method: "DELETE",
      });

      return data;
    } catch (error) {
      console.error(`Error deleting project: ${error}`);
      snackbarDispatch({
        type: "SHOW",
        message: "Error deleting project.",
        severity: "error",
      });

      throw error;
    }
  };

  const updateProjectSchema = async ({ projectId, newTags }) => {
    // Update value associated with project (name, description) including schema.

    try {
      const data = await callApi(`/api/schema/${projectId}`, {
        method: "POST",
        data: { tags: newTags },
      });

      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to modify project schema: ${error}`,
        severity: "error",
      });
    }
  };

  const updateProjectDetail = async ({ projectId, name, description }) => {
    try {
      const data = await callApi("/api/project", {
        method: "PATCH",
        data: {
          projectId,
          name,
          description,
        },
      });

      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to modify project details: ${error}`,
        severity: "error",
      });
    }
  };

  const updateProjectFlags = async ({ projectId, flags }) => {
    try {
      const data = await callApi(`/api/project/${projectId}/flags`, {
        method: "PATCH",
        data: {
          projectId,
          flags,
        },
      });

      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to modify project flags: ${error}`,
        severity: "error",
      });
    }
  };

  return {
    fetchProjectSummaryById,
    downloadProjectData,
    deleteProjectById,
    updateProjectSchema,
    updateProjectDetail,
    updateProjectFlags,
  };
};

export default useDashboardActions;
