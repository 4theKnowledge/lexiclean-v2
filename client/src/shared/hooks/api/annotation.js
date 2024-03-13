import useApi from "../useApi";
import { useSnackbar } from "../../context/SnackbarContext";
import { useContext } from "react";
import { ProjectContext } from "../../context/ProjectContext";
import { useParams } from "react-router-dom";

const useAnnotationActions = () => {
  const callApi = useApi();
  const [state, dispatch] = useContext(ProjectContext);
  const { projectId } = useParams();

  const { dispatch: snackbarDispatch } = useSnackbar();

  const applyTokenTransformAction = async ({
    tokenId,
    textId,
    replacement,
    applyAll,
    suggestion,
    textIds,
    tokenIndex,
    originalValue,
    currentValue,
  }) => {
    try {
      const payload = {
        projectId,
        tokenId,
        textId,
        replacement,
        applyAll,
        suggestion,
        textIds,
        originalValue,
      };

      const data = await callApi("/api/token/add", {
        method: "PATCH",
        data: payload,
      });

      if (data) {
        dispatch({
          type: "TOKEN_APPLY",
          payload: {
            ...payload,
            ...data,
            tokenIndex: tokenIndex,
            originalValue: originalValue,
          },
        });

        const successMessage =
          data.matches === 0
            ? "No changes made."
            : applyAll
            ? `Updated '${originalValue}' to '${currentValue}' for ${data.matches} instances successfully.`
            : `Updated '${originalValue}' to '${currentValue}' for ${data.matches} for the current instance successfully.`;

        snackbarDispatch({
          type: "SHOW",
          message: successMessage,
          severity: "success",
        });
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Error occurred applying token replacement ${error}`,
        severity: "error",
      });
    }
  };

  const deleteTokenTransformAction = async ({
    textId,
    tokenId,
    applyAll,
    textIds,
    tokenIndex,
    originalValue,
    currentValue,
  }) => {
    try {
      const payload = {
        textId,
        tokenId,
        applyAll,
        textIds,
        originalValue,
        projectId,
      };

      const data = await callApi("/api/token/delete", {
        method: "PATCH",
        data: payload,
      });

      if (data) {
        dispatch({
          type: "TOKEN_DELETE",
          payload: {
            ...payload,
            ...data,
            tokenIndex: tokenIndex,
            originalValue: originalValue,
            currentValue: currentValue,
          },
        });

        const successMessage = applyAll
          ? `Token '${originalValue}' deleted for ${data.matches} instances successfully.`
          : `Token '${originalValue}' deleted for the current instance successfully.`;

        snackbarDispatch({
          type: "SHOW",
          message: successMessage,
          severity: "success",
        });
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Error occurred deleting token: ${error}`,
        severity: "error",
      });
    }
  };

  const acceptTokenTransformAction = async ({
    tokenId,
    textId,
    applyAll,
    textIds,
    tokenIndex,
    originalValue,
    currentValue,
  }) => {
    try {
      const payload = {
        projectId,
        tokenId,
        textId,
        applyAll,
        textIds,
        originalValue,
      };
      const data = await callApi("/api/token/accept", {
        method: "PATCH",
        data: payload,
      });

      if (data) {
        dispatch({
          type: "TOKEN_ACCEPT",
          payload: {
            ...payload,
            ...data,
            tokenIndex: tokenIndex,
            originalValue: originalValue,
            currentValue: currentValue,
          },
        });

        const successMessage = applyAll
          ? `Token '${originalValue}' accepted for ${data.matches} instances successfully.`
          : `Token '${originalValue}' accepted for the current instance successfully.`;

        snackbarDispatch({
          type: "SHOW",
          message: successMessage,
          severity: "success",
        });
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Error occurred accepting token: ${error.message}`,
        severity: "error",
      });
    }
  };

  const splitTokenAction = async ({
    textId,
    tokenId,
    tokenIndex,
    currentValue,
  }) => {
    try {
      const payload = { textId, tokenId, tokenIndex, currentValue };

      const data = await callApi("/api/token/split", {
        method: "PATCH",
        data: payload,
      });
      if (data) {
        dispatch({ type: "TOKEN_SPLIT", payload: data });
        snackbarDispatch({
          type: "SHOW",
          message: "Token split successfully.",
          severity: "success",
        });
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Error splitting token: ${error}`,
        severity: "error",
      });
    }
  };

  const removeTokenAction = async ({
    textId,
    tokenId,
    applyAll,
    texIds,
    originalValue,
  }) => {
    try {
      const payload = {
        textId,
        tokenId,
        applyAll,
        texIds,
      };

      const data = await callApi("/api/token/remove", {
        method: "PATCH",
        data: payload,
      });
      if (data) {
        dispatch({
          type: "TOKEN_REMOVE",
          payload: {
            ...payload,
            ...data,
            originalValue,
          },
        });
        snackbarDispatch({
          type: "SHOW",
          message: `Permanently removed token ${originalValue} ${
            applyAll ? "in all texts" : "occurrence"
          }`,
          severity: "success",
        });
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Erorr deleting token(s): ${error}`,
        severity: "error",
      });
    }
  };

  const tokenizeTokensAction = async ({ textId, tokenIndexGroups }) => {
    try {
      const data = await callApi("/api/text/tokenize", {
        method: "PATCH",
        data: { textId, indexGroupsTC: tokenIndexGroups },
      });

      if (data) {
        dispatch({ type: "TOKENIZE", payload: data });
        snackbarDispatch({
          type: "SHOW",
          message: `Succesfully tokenized phrase.`,
          severity: "success",
        });
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to tokenize phrase: ${error}`,
        severity: "error",
      });
    }
  };

  const applyLabelAction = async ({
    textId,
    tokenId,
    entityLabelId,
    applyAll,
  }) => {
    /**
     * Each token has a `tags` field which contains details of applied token-level entity labels (tags).
     */

    try {
      const data = await callApi("/api/token/label/add", {
        method: "PATCH",
        data: {
          projectId,
          textId,
          tokenId,
          entityLabelId,
          applyAll,
        },
      });

      if (data) {
        dispatch({
          type: "APPLY_TAG",
          payload: {
            ...data,
            applyAll,
            tokenId,
            entityLabelId,
            textId: state.selectedTextId,
          },
        });
      }
      const labelDetails = state.project.schemaMap[entityLabelId];

      const successMessage = applyAll
        ? `Applied '${labelDetails.name}' to ${data.matches} instances successfully.`
        : `Applied '${labelDetails.name}' to the current instance successfully.`;

      snackbarDispatch({
        type: "SHOW",
        message: successMessage,
        severity: "success",
      });
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Error occurred applying label: ${error}`,
        severity: "error",
      });
    }
  };

  // const acceptLabelAction = async () => {

  // }

  const deleteLabelAction = async ({
    textId,
    tokenId,
    entityLabelId,
    applyAll,
  }) => {
    try {
      const data = await callApi(`/api/token/label/delete`, {
        method: "PATCH",
        data: { textId, tokenId, entityLabelId, applyAll, projectId },
      });

      if (data) {
        dispatch({
          type: "DELETE_TAG",
          payload: {
            ...data,
            applyAll,
            tokenId,
            entityLabelId,
            textId,
          },
        });

        const labelDetails = state.project.schemaMap[entityLabelId];

        const successMessage = applyAll
          ? `Deleted '${labelDetails.name}' on ${data.matches} instances successfully.`
          : `Deleted '${labelDetails.name}' on the current instance successfully.`;

        snackbarDispatch({
          type: "SHOW",
          message: successMessage,
          severity: "success",
        });
      } else {
        throw new Error("Failed to delete label.");
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: error,
        severity: "error",
      });
    }
  };

  return {
    applyTokenTransformAction,
    deleteTokenTransformAction,
    acceptTokenTransformAction,
    splitTokenAction,
    removeTokenAction,
    tokenizeTokensAction,
    applyLabelAction,
    deleteLabelAction,
  };
};

export default useAnnotationActions;
