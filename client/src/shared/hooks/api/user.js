import { useAppContext } from "../../context/AppContext";
import useApi from "../useApi";
import { useSnackbar } from "../../context/SnackbarContext";

const useUserActions = () => {
  const { state, dispatch } = useAppContext();
  const callApi = useApi();
  const { dispatch: snackbarDispatch } = useSnackbar();

  const updateUserDetails = async ({ name, openAIKey }) => {
    try {
      const data = await callApi(`/api/user/${state.user._id}`, {
        method: "PATCH",
        data: { name, openAIKey },
      });

      dispatch({
        type: "SET_USER",
        payload: data,
      });

      snackbarDispatch({
        type: "SHOW",
        message: "Successfully updated account details.",
        severity: "success",
      });

      return data;
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: "Unable to update account details.",
        severity: "error",
      });
    }
  };

  return {
    updateUserDetails,
  };
};

export default useUserActions;
