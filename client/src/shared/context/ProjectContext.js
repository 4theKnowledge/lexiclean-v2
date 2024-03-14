import * as React from "react";
import { updateTextTokenTags, updateTexts } from "../utils/project-context";

const initialState = {
  filters: {
    searchTerm: "",
    referenceSearchTerm: "",
    saved: "all",
    candidates: "all",
    rank: 1,
  },
  savePending: false,
  projectLoading: true,
  project: null,
  projectId: null,
  progress: { value: 0, title: "" },
  totalTexts: null,
  pageLimit: 10,
  pageNumber: 1,
  textsLoading: true,
  texts: null,
  showReferences: false,
  showToast: false,
  toastInfo: null,
  operationLoading: false,
  tokenizeTextId: null,
  currentTextSelected: null,
  tokenIdsSelected: [],
  selectedTokenValue: null,
  showFilterModel: false,
  selectedToken: null,
};

export const ProjectContext = React.createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_PROJECTID": {
      return { ...state, projectId: action.payload };
    }
    case "SET_PROJECT": {
      // Sets textsLoading to ensure documents are loaded correctly.
      return {
        ...state,
        projectId: state.projectId,
        project: action.payload,
        projectLoading: false,
        textsLoading: true,
      };
    }
    case "SET_PROJECT_METRICS": {
      return state;
    }
    case "SET_TEXTS": {
      return {
        ...state,
        texts: action.payload.texts,
        totalTexts: action.payload.totalTexts,
        textsLoading: false,
      };
    }
    case "SET_TEXTS_LOADING": {
      return { ...state, textsLoading: true };
    }
    case "SET_PAGE": {
      return { ...state, pageNumber: action.payload, textsLoading: true };
    }
    case "SAVE_TEXTS": {
      let updatedTexts = state.texts;

      action.payload.textIds.map((textId) => {
        updatedTexts = {
          ...updatedTexts,
          [textId]: {
            ...updatedTexts[textId],
            saved: action.payload.saveState,
          },
        };
      });

      return { ...state, texts: updatedTexts };
    }
    case "SET_VALUE": {
      return { ...state, ...action.payload };
    }
    case "RESET_FILTERS": {
      return { ...state, filters: initialState.filters };
    }
    case "UPDATE_TOKEN_VALUE": {
      // console.log("UPDATE_TOKEN_VALUE", action.payload);

      const text = state.texts[action.payload.textId];
      const newTokens = {
        ...text.tokens,
        [action.payload.tokenIndex]: {
          ...text.tokens[action.payload.tokenIndex],
          currentValue: action.payload.newValue,
        },
      };

      return {
        ...state,
        texts: {
          ...state.texts,
          [action.payload.textId]: { ...text, tokens: newTokens },
        },
      };
    }
    case "TOKEN_APPLY": {
      const updatedTexts = updateTexts(
        "apply",
        state.texts,
        action.payload.textTokenIds,
        action.payload.tokenId,
        action.payload.replacement
      );

      return {
        ...state,
        texts: updatedTexts,
      };
    }
    case "TOKEN_DELETE": {
      const updatedTexts = updateTexts(
        "delete",
        state.texts,
        action.payload.textTokenIds,
        action.payload.tokenId,
        action.payload.replacement
      );
      return {
        ...state,
        texts: updatedTexts,
      };
    }
    case "TOKEN_ACCEPT": {
      const updatedTexts = updateTexts(
        "accept",
        state.texts,
        action.payload.textTokenIds,
        action.payload.tokenId,
        action.payload.replacement
      );

      return {
        ...state,
        texts: updatedTexts,
      };
    }
    case "TOKEN_SPLIT": {
      return { ...state, texts: { ...state.texts, ...action.payload } };
    }
    case "TOKEN_REMOVE": {
      // Removes token from text
      return {
        ...state,
        texts: { ...state.texts, ...action.payload.textTokenObjects },
      };
    }
    case "TOKENIZE": {
      // Joins contiguous n-grams on a given text
      return {
        ...state,
        texts: { ...state.texts, ...action.payload },
        tokenizeTextId: null,
      };
    }

    case "APPLY_TAG": {
      const { tokenId, entityLabelId, textTokenIds } = action.payload;
      const updatedState = { ...state };
      const updatedTexts = updateTextTokenTags({
        action: "apply",
        texts: updatedState.texts,
        textTokenIds,
        focusTokenId: tokenId,
        entityLabelId,
      });
      return { ...updatedState, texts: updatedTexts };
    }
    case "DELETE_TAG": {
      const { tokenId, entityLabelId, textTokenIds } = action.payload;
      const updatedState = { ...state };
      const updatedTexts = updateTextTokenTags({
        action: "delete",
        texts: updatedState.texts,
        textTokenIds,
        focusTokenId: tokenId,
        entityLabelId,
      });
      return { ...updatedState, texts: updatedTexts };
    }

    case "ADD_FLAG": {
      const { textId, flagId } = action.payload;
      const updatedState = { ...state };
      updatedState.texts[textId].flags.push(flagId);
      return updatedState;
    }
    case "DELETE_FLAG": {
      const { textId, flagId } = action.payload;
      const updatedState = { ...state };
      updatedState.texts[textId].flags = updatedState.texts[
        textId
      ].flags.filter((f) => f !== flagId);
      return updatedState;
    }

    case "SET_SHOW_TOAST": {
      return { ...state, showToast: action.payload };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return (
    <ProjectContext.Provider value={[state, dispatch]}>
      {children}
    </ProjectContext.Provider>
  );
};
