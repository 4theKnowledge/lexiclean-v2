import { useContext } from "react";
import { ProjectContext } from "../../context/ProjectContext";
import useApi from "../useApi";
import { useSnackbar } from "../../context/SnackbarContext";
import { useNavigate } from "react-router-dom";

const useProjectActions = () => {
  const [state, dispatch] = useContext(ProjectContext);
  const callApi = useApi();
  const { dispatch: snackbarDispatch } = useSnackbar();
  const navigate = useNavigate();

  const createProject = async (payload) => {
    // TODO: put some validation on the payload...
    try {
      const data = await callApi("/api/project/create", {
        method: "POST",
        data: payload,
      });

      if (data) {
        navigate("/projects");
      } else {
        throw new Error("Failed to create project");
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: error,
        severity: "error",
      });
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await callApi("/api/project/feed");
      return data;
    } catch (error) {
      console.log(`error fetching projects: ${error}`);
      throw error;
    }
  };

  const getProjectProgress = async ({ projectId }) => {
    try {
      const data = await callApi(`/api/project/progress/${projectId}`, {
        method: "GET",
      });

      if (data) {
        dispatch({ type: "SET_VALUE", payload: data });
      }
    } catch (error) {
      console.log(`error fetching project progress: ${error}`);
      snackbarDispatch({
        type: "SHOW",
        message: `Unable to fetch project progress`,
        severity: "error",
      });
      throw error;
    }
  };

  const getProject = async ({ projectId }) => {
    try {
      const data = await callApi(`/api/project/${projectId}`, {
        method: "GET",
      });

      if (data) {
        dispatch({ type: "SET_PROJECT", payload: data });
      }
    } catch (error) {
      console.log(`error fetching project: ${error}`);
      throw error; // Rethrow to handle it in the calling function
    }
  };

  const getProjectName = async ({ projectId }) => {
    try {
      const data = await callApi(`/api/project/${projectId}`, {
        method: "GET",
      });
      if (data) {
        return data.name;
      }
    } catch (error) {
      console.log(`error fetching project: ${error}`);
      throw error; // Rethrow to handle it in the calling function
    }
  };

  const getTexts = async ({ projectId, filters = {}, page, limit }) => {
    /**
     * projectId : project id
     * filters: object of filters (not implemented)
     * page : page number
     * limit : page limit
     */
    try {
      const data = await callApi("/api/text/filter", {
        method: "POST",
        data: { projectId, filters },
        params: { page, limit },
      });

      if (data) {
        dispatch({ type: "SET_TEXTS", payload: data });
      }
    } catch (error) {
      console.log(`error fetching texts: ${error}`);
    }
  };

  const saveTexts = async ({ projectId, textIds, isSaved }) => {
    try {
      const data = await callApi("/api/text/save", {
        method: "PATCH",
        data: { textIds, saved: isSaved, projectId },
      });

      if (data) {
        dispatch({
          type: "SAVE_TEXTS",
          payload: { textIds: textIds, saveState: isSaved },
        });
        // Update progress
        snackbarDispatch({
          type: "SHOW",
          message: "Successfully updated save state.",
          severity: "success",
        });
        await getProjectProgress({ projectId });
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: "Failed to update save state.",
        severity: "error",
      });
    }
  };

  return {
    createProject,
    fetchProjects,
    getProjectProgress,
    getProject,
    getTexts,
    saveTexts,
    getProjectName,
  };
};

export default useProjectActions;
