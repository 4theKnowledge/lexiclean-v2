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
      snackbarDispatch({
        type: "SHOW",
        message: `Unable to fetch project dashboard information`,
        severity: "error",
      });

      error.message = error.response.data.message;

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

  const downloadReplacementData = async (id) => {
    try {
      const data = await callApi(`/api/project/download/${id}/replacements`, {
        method: "GET",
      });

      return data;
    } catch (error) {
      console.error(`Error downloading project replacements: ${error}`);
      snackbarDispatch({
        type: "SHOW",
        message: `Error downloading project replacements`,
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
        data: { tags: newTags, projectId },
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

  const updateProjectFlags = async ({ projectId, flags, isDelete = false }) => {
    try {
      const data = await callApi(`/api/project/${projectId}/flags`, {
        method: "PATCH",
        data: {
          projectId,
          flags,
          isDelete,
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

  const removeAnnotator = async ({ projectId, annotatorId }) => {
    try {
      const data = await callApi("/api/project/annotator/remove", {
        method: "PATCH",
        data: { projectId, annotatorId },
      });

      if (data) {
        snackbarDispatch({
          type: "SHOW",
          message: `Successfully removed annotator`,
          severity: "success",
        });
        return data;
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to remove annotator: ${error}`,
        severity: "error",
      });
      return;
    }
  };

  const getAdjudication = async ({ projectId, page }) => {
    try {
      const data = await callApi(
        `/api/project/${projectId}/adjudication/${page}`,
        {
          method: "GET",
        }
      );

      if (data) {
        return data;
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to get adjudicated text: ${error}`,
        severity: "error",
      });
      return;
    }
  };

  return {
    fetchProjectSummaryById,
    downloadProjectData,
    deleteProjectById,
    updateProjectSchema,
    updateProjectDetail,
    updateProjectFlags,
    removeAnnotator,
    getAdjudication,
    downloadReplacementData,
  };
};

export default useDashboardActions;
