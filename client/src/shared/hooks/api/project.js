import { useContext } from "react";
import { ProjectContext } from "../../context/ProjectContext";
import useApi from "../useApi";

const useProjectActions = () => {
  const [state, dispatch] = useContext(ProjectContext);
  const callApi = useApi();

  const getProgress = async (id) => {
    try {
      const response = await callApi(`/api/project/progress/${id}`);
      if (response.status === 200) {
        dispatch({ type: "SET_VALUE", payload: response.data });
      } else {
        throw new Error();
      }
    } catch (error) {
      console.log(`error fetching project progress: ${error}`);
      throw error; // Rethrow to handle it in the calling function
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

  return {
    getProgress,
    fetchProjects,
  };
};

export default useProjectActions;
