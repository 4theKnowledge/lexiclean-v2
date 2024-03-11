import useApi from "../useApi";
import { useSnackbar } from "../../context/SnackbarContext";
import { useContext } from "react";
import { ProjectContext } from "../../context/ProjectContext";

const useAnnotationActions = () => {
  const callApi = useApi();
  const [state, dispatch] = useContext(ProjectContext);

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
        tokenId,
        textId,
        replacement,
        applyAll,
        suggestion,
        textIds,
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
        snackbarDispatch({
          type: "SHOW",
          message: `Updated '${originalValue}' to '${currentValue}' ${data.matches} times`,
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
      const payload = { textId, tokenId, applyAll, textIds };

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
        snackbarDispatch({
          type: "SHOW",
          message: `Deleted '${originalValue}' (and similar ${
            applyAll ? "in all texts" : "occurrence"
          }) successfully.`,
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
        tokenId,
        textId,
        applyAll,
        textIds,
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
          ? `Token '${originalValue}' accepted for all instances successfully.`
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
        message: `Error occurred accepting token: ${error}`,
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
        message: `Failed to tokenize phrase.`,
        severity: "error",
      });
    }
  };

  const applyLabelAction = async ({ tokenId, entityLabelId }) => {
    /**
     * Each token has a `tags` field which contains details of applied token-level entity labels (tags).
     */

    console.log("tokenId", tokenId);
    console.log("entityLabel", entityLabelId);

    try {
      const data = await callApi("/api/token/meta/add/single", {
        method: "PATCH",
        data: {
          tokenId,
          entityLabelId,
        },
      });

      if (data) {
        console.log("data: ", data);
        dispatch({
          type: "APPLY_TAG",
          payload: {
            applyAll: false,
            tokenId,
            tags: data,
            textId: state.selectedTextId,
          },
        });
      }
      // snackbar
    } catch (error) {
      // snackbar
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
      const data = await callApi(`/api/token/meta/remove/one/${tokenId}`, {
        method: "PATCH",
        data: { entityLabelId },
      });

      if (data) {
        dispatch({
          type: "DELETE_TAG",
          payload: {
            applyAll,
            tokenId,
            tags: data,
            textId: textId,
          },
        });
        snackbarDispatch({
          type: "SHOW",
          message: `Successfully deleted label`,
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
