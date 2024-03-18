import {
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import moment from "moment";
import { getReadableString } from "../../shared/utils/dashboard";
import StyledCard from "./StyledCard";
import { useEffect, useState } from "react";

const Details = ({ loading, data, handleUpdate, disabled }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isUnchanged, setIsUnchanged] = useState(true);

  useEffect(() => {
    if (!loading) {
      setName(data.details.name);
      setDescription(data.details.description);
    }
  }, [loading]);

  useEffect(() => {
    // Check if current state matches the initial data to determine button state
    setIsUnchanged(
      name === data.details.name && description === data.details.description
    );
  }, [name, description, data.details.name, data.details.description]);

  return (
    <StyledCard title="Details">
      <Box mb={2}>
        <Stack direction="column" spacing={2}>
          <Box
            key="textfield-details-name"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box width={120} mr={1}>
              <Typography fontWeight="bold" color="text.secondary">
                Name
              </Typography>
            </Box>
            <TextField
              value={name.toString()}
              onChange={(e) => setName(e.target.value)}
              size="small"
              fullWidth
              disabled={disabled}
              autoComplete="false"
            />
          </Box>
          <Box
            key={"textfield-details-description"}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box width={120} mr={1}>
              <Typography fontWeight="bold" color="text.secondary">
                Description
              </Typography>
            </Box>
            <TextField
              value={description.toString()}
              onChange={(e) => setDescription(e.target.value)}
              size="small"
              fullWidth
              disabled={disabled}
              autoComplete="false"
            />
          </Box>
          <Box
            key={"textfield-details-owner"}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box width={120} mr={1}>
              <Typography fontWeight="bold" color="text.secondary">
                Project Owner
              </Typography>
            </Box>
            <TextField
              value={data.details.ownerUsername}
              placeholder="Project owners username"
              size="small"
              fullWidth
              disabled
              autoComplete="false"
            />
          </Box>
        </Stack>
      </Box>
      <Box display="flex" justifyContent="right" mt={2}>
        <Tooltip title="Click to apply changes to the projects name and/or description">
          <Button
            variant="contained"
            onClick={() => handleUpdate(name, description)}
            disabled={isUnchanged || disabled}
          >
            Update
          </Button>
        </Tooltip>
      </Box>
      <Box mb={2}>
        <Typography fontWeight="bold" color="text.secondary" gutterBottom>
          Special Tokens
        </Typography>
        <Stack direction="row" flexWrap="wrap" spacing={1}>
          {data && data.details.specialTokens.length > 0 ? (
            data.details.specialTokens.map((t, index) => (
              <Chip key={index} label={t} size="small" />
            ))
          ) : (
            <Typography variant="caption">No special tokens defined</Typography>
          )}
        </Stack>
      </Box>
      <Box mb={2}>
        <Typography fontWeight="bold" color="text.secondary" gutterBottom>
          Preprocessing
        </Typography>
        <Stack direction="row" spacing={2}>
          {data &&
            Object.entries(data.details.preprocessing).map(([k, v], index) => (
              <Chip
                key={`preprocessing-chip-${index}`}
                label={`${getReadableString(k)}: ${v.toString()}`}
                sx={{ textTransform: "capitalize" }}
              />
            ))}
        </Stack>
      </Box>
      <Box>
        <Typography fontWeight="bold" color="text.secondary" gutterBottom>
          Other
        </Typography>
        <Stack direction="row" spacing={2}>
          {data &&
            ["createdAt", "parallelCorpus"].map((i, index) => (
              <Chip
                key={`detail-chip-${i}`}
                label={`${getReadableString(i)}: ${
                  i === "createdAt"
                    ? moment.utc(data.details[i]).format("Do MMM YY")
                    : data.details[i].toString()
                }`}
                sx={{ textTransform: "capitalize" }}
              />
            ))}
        </Stack>
      </Box>
    </StyledCard>
  );
};

export default Details;
