import { useContext } from "react";
import { ProjectContext } from "../../../shared/context/ProjectContext";
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
import useAnnotationActions from "../../../shared/hooks/api/annotation";

const EntitySelector = () => {
  const [state] = useContext(ProjectContext);
  const { applyLabelAction } = useAnnotationActions();

  const disabled = !state.selectedToken || !state.selectedToken.value;

  const tokenTags = state?.selectedToken?.tags ?? [];

  const handleApply = async ({ tokenId, entityLabelId }) => {
    await applyLabelAction({
      textId: state.selectedTextId,
      tokenId,
      entityLabelId,
    });
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
