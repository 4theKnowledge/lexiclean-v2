import React, { useContext } from "react";
import { ProjectContext } from "../../../shared/context/project-context";
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  alpha,
} from "@mui/material";
import axiosInstance from "../../../shared/api/axiosInstance";

const EntitySelector = () => {
  const [state, dispatch] = useContext(ProjectContext);

  const disabled = !state.selectedToken || !state.selectedToken.value;

  const tokenTags = state.selectedToken
    ? Object.entries(state.selectedToken.tags)
        .filter(([key, active]) => active)
        .map(([key, _]) => key)
    : [];

  console.log(state);

  const handleApply = async ({ tokenId, entityLabelId }) => {
    /**
     * Each token has a `tags` field which contains details of applied token-level entity labels (tags).
     */

    console.log("tokenId", tokenId);
    console.log("entityLabel", entityLabelId);

    try {
      const response = await axiosInstance.patch("/api/token/meta/add/single", {
        tokenId,
        entityLabelId,
      });

      if (response.status === 200) {
        console.log("response.data: ", response.data);
        dispatch({
          type: "APPLY_TAG",
          payload: {
            applyAll: false,
            tokenId,
            tags: response.data,
            textId: state.selectedTextId,
          },
        });
      }
    } catch (error) {}
  };

  return (
    <Box
      as={Paper}
      sx={{ backgroundColor: "background.default" }}
      p={2}
      elevation={0}
    >
      <Box>
        <Typography fontWeight="bold" color="text.secondary" gutterBottom>
          Entity Labels
        </Typography>
        <Divider />
        {!state.project || state.project.tags.length === 0 ? (
          <Box p={1}>
            <Typography variant="body2">No tags available.</Typography>
            <Typography variant="body2">
              Visit project dashboard to create.
            </Typography>
          </Box>
        ) : (
          <List>
            {state.project.tags.map((t, index) => (
              <ListItemButton
                key={`tag-${index}`}
                sx={{
                  border: "1px solid",
                  borderColor: t.color,
                  backgroundColor: alpha(t.color, 0.25),
                  "&:hover": {
                    backgroundColor: alpha(t.color, 0.5),
                  },
                }}
                disabled={disabled || tokenTags.includes(t._id)}
                onClick={() =>
                  handleApply({
                    tokenId: state.selectedToken._id,
                    entityLabelId: t._id,
                  })
                }
              >
                <ListItemText primary={t.name} />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default EntitySelector;
