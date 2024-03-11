import { useContext, useState, useEffect } from "react";
import { Stack, IconButton, Typography, Divider, Tooltip } from "@mui/material";
import { teal, red, orange, grey } from "@mui/material/colors";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSweep from "@mui/icons-material/DeleteSweep";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AddTaskIcon from "@mui/icons-material/AddTask";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import TextRotateVerticalIcon from "@mui/icons-material/TextRotateVertical";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import UndoIcon from "@mui/icons-material/Undo";
import RestoreIcon from "@mui/icons-material/Restore";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { ProjectContext } from "../../shared/context/ProjectContext";
import { useNavigate } from "react-router-dom";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useSnackbar } from "../../shared/context/SnackbarContext";
import { useTheme } from "@mui/material/styles";
import useAnnotationActions from "../../shared/hooks/api/annotation";

const EditPopover = (props) => {
  const {
    textId,
    tokenId,
    tokenIndex,
    handlePopoverClose,
    setAnchorEl,
    originalValue,
    currentValue,
    hasSuggestion,
    hasReplacement,
    editing,
  } = props;
  const [state, dispatch] = useContext(ProjectContext);
  const navigate = useNavigate();
  const [showExtraOptions, setShowExtraOptions] = useState(false);
  const [quickFilterApplied, setQuickFilterApplied] = useState(false);
  const theme = useTheme();
  const {
    applyTokenTransformAction,
    deleteTokenTransformAction,
    acceptTokenTransformAction,
    splitTokenAction,
    removeTokenAction,
  } = useAnnotationActions();

  const handleApplyAction = async (applyAll) => {
    try {
      await applyTokenTransformAction({
        tokenId,
        textId,
        replacement: currentValue,
        applyAll,
        suggestion: false,
        textIds: Object.keys(state.texts),
        tokenIndex,
        originalValue,
        currentValue,
      });
    } finally {
      setAnchorEl(null);
    }
  };

  const handleDeleteAction = async (applyAll) => {
    try {
      await deleteTokenTransformAction({
        tokenId,
        applyAll,
        textId,
        textIds: Object.keys(state.texts),
        tokenIndex,
        originalValue,
        currentValue,
      });
    } finally {
      setAnchorEl(null);
    }
  };

  const handleAcceptAction = async (applyAll) => {
    try {
      await acceptTokenTransformAction({
        tokenId,
        textId,
        applyAll,
        textIds: Object.keys(state.texts),
        tokenIndex,
        originalValue,
        currentValue,
      });
    } finally {
      setAnchorEl(null);
    }
  };

  const handleSplitAction = async (applyAll = false) => {
    await splitTokenAction({
      textId,
      tokenId,
      tokenIndex,
      currentValue,
      applyAll,
    });
  };

  const handleRemoveTokenAction = async (applyAll) => {
    await removeTokenAction({
      textId,
      tokenId,
      applyAll,
      textIds: Object.keys(state.texts),
      originalValue,
    });
  };

  const handleRemoveTokenCase = () => {
    dispatch({
      type: "UPDATE_TOKEN_VALUE",
      payload: {
        textId: textId,
        tokenIndex: tokenIndex,
        newValue: currentValue.toLowerCase(),
      },
    });
  };

  const handleQuickFilter = () => {
    // Set filter and trigger reload of texts...
    dispatch({
      type: "SET_VALUE",
      payload: {
        filters: {
          ...state.filters,
          searchTerm: quickFilterApplied ? "" : state.selectedTokenValue,
        },
      },
    });
    dispatch({ type: "SET_PAGE", payload: 1 });
    navigate(`/project/${state.projectId}/page=1`);
    setQuickFilterApplied(!quickFilterApplied);
  };

  useEffect(() => {
    // Allows user to jump between selections
    setQuickFilterApplied(false);
  }, [state.selectedTokenValue]);

  const showOperations = editing || hasReplacement || hasSuggestion;
  const showSplitTokenOperation = /\s/.test(currentValue);
  const showReplacementOperations = editing || hasReplacement;
  const showSuggestionOperations = hasSuggestion && !showReplacementOperations;
  const showDeleteOperations =
    originalValue !== currentValue ||
    (originalValue === currentValue && hasReplacement);
  const showCaseOperation = currentValue !== currentValue.toLowerCase();

  const popoverMenuInfo = [
    {
      name: "accept-all",
      icon: <AddTaskIcon fontSize="inherit" />,
      color: teal[300],
      title: `Accept all suggested corrections`,
      action: () => handleAcceptAction(true),
      show: showSuggestionOperations,
    },
    {
      name: "accept-one",
      icon: <CheckCircleOutlineIcon fontSize="inherit" />,
      color: teal[500],
      title: `Accept this suggested correction`,
      action: () => handleAcceptAction(false),
      show: showSuggestionOperations,
    },
    {
      name: "apply-all",
      icon: <ContentPasteIcon fontSize="inherit" />,
      color: teal[500],
      title: `Apply correction across entire project`,
      action: () => handleApplyAction(true),
      show: showReplacementOperations,
    },
    {
      name: "apply-one",
      icon: <CheckCircleOutlineIcon fontSize="inherit" />,
      color: teal[500],
      title: `Apply this correction to the current token only`,
      action: () => handleApplyAction(false),
      show: showReplacementOperations,
    },
    {
      name: "delete-one",
      icon: <UndoIcon fontSize="inherit" />,
      color: orange[500],
      title: `Undo this correction`,
      action: () => handleDeleteAction(false),
      show: showDeleteOperations,
    },
    {
      name: "delete-all",
      icon: <RestoreIcon fontSize="inherit" />,
      color: red[500],
      title: `Undo all corrections of this type`,
      action: () => handleDeleteAction(true),
      show: showDeleteOperations,
    },
  ];

  return (
    <Stack direction="column" sx={{ maxWidth: "100%" }}>
      {showOperations && (
        <>
          <Stack
            direction="row"
            justifyContent="space-evenly"
            alignItems="center"
            p={1}
          >
            <Typography
              variant="body2"
              sx={{
                textDecoration: "line-through",
                textDecorationColor: theme.palette.token.strike,
              }}
            >
              {originalValue}
            </Typography>
            <ArrowRightAltIcon sx={{ color: grey[500] }} />
            <Typography
              variant="body2"
              sx={{ color: theme.palette.token.editing }}
            >
              {currentValue}
            </Typography>
          </Stack>
          <Divider />
        </>
      )}
      <Stack
        direction="row"
        spacing={1}
        sx={{ p: "0.25rem 0.5rem 0.25rem 0.5rem" }}
      >
        {popoverMenuInfo
          .filter((i) => i.show)
          .map((item) => (
            <Tooltip title={item.title} disableFocusListener>
              <IconButton
                key={`entity-tooltip-btn-${item.name}`}
                size="small"
                onClick={item.action}
              >
                {item.icon}
              </IconButton>
            </Tooltip>
          ))}
        {showExtraOptions || !showOperations ? (
          <>
            {showOperations && <Divider orientation="vertical" />}
            {/* <Tooltip title="Click to perform a quick filter on this token">
              <IconButton size="small" onClick={handleQuickFilter}>
                <FilterListIcon size="small" sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Tooltip> */}
            {showSplitTokenOperation && (
              <Tooltip title="Click to split token">
                <IconButton size="small" onClick={handleSplitAction}>
                  <ContentCutIcon size="small" sx={{ fontSize: "1rem" }} />
                </IconButton>
              </Tooltip>
            )}
            {showCaseOperation && (
              <Tooltip title="Click to remove token casing">
                <IconButton size="small" onClick={handleRemoveTokenCase}>
                  <TextRotateVerticalIcon
                    size="small"
                    sx={{ fontSize: "1rem" }}
                  />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Click to remove this token">
              <IconButton
                size="small"
                onClick={() => handleRemoveTokenAction(false)}
              >
                <DeleteIcon size="small" sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Tooltip>
            {/* <Tooltip title="Click to remove this token from the corpus">
              <IconButton
                size="small"
                onClick={() => handleRemoveTokenAction(true)}
              >
                <DeleteSweep size="small" sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Tooltip> */}
          </>
        ) : (
          <Tooltip title="Click to show more options">
            <IconButton
              size="small"
              onClick={() => setShowExtraOptions(!showExtraOptions)}
            >
              <MoreHorizIcon size="small" sx={{ fontSize: "1rem" }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
};

export default EditPopover;
