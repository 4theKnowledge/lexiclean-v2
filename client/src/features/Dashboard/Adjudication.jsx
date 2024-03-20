import React, { useState, useEffect } from "react";
import StyledCard from "./StyledCard";
import {
  Chip,
  Divider,
  Grid,
  Pagination,
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  Tooltip,
  Avatar,
  AlertTitle,
  Alert,
} from "@mui/material";
import { getColor, getContrastYIQ } from "../../shared/utils/dashboard";
import { useTheme, alpha } from "@mui/material/styles";

const getMaxTokenSizes = (data) => {
  // Iterates over input tokens and annotations to find the max token widths for each token index
  const maxSizes = data.input.map((token) => token.length); // Initialize with lengths of input tokens

  // Iterate through each annotator
  Object.values(data.annotations).forEach((annotator) => {
    annotator.tokens.forEach((token, index) => {
      // Ensure we don't go out of bounds if annotator.tokens is longer than input
      if (index < maxSizes.length) {
        maxSizes[index] = Math.max(maxSizes[index], token.length);
      } else {
        // Handle the case where annotator.tokens has more tokens than input
        maxSizes.push(token.length);
      }
    });
  });

  return maxSizes;
};

const Adjudication = ({ data }) => {
  const [showFlags, setShowFlags] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [page, setPage] = useState(1);
  const [filteredData, setFilteredData] = useState(data[page - 1]);
  const [maxTokenSizes, setMaxTokenSizes] = useState([]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setFilteredData(data[newPage - 1]);
  };

  useEffect(() => {
    if (filteredData) {
      setMaxTokenSizes(getMaxTokenSizes(filteredData));
    }
  }, [filteredData]);

  if (!data) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <StyledCard title="Adjudication">
      <Box p={"0rem 0.5rem 1rem 0.5rem"}>
        <Alert severity="info">
          <AlertTitle>Project Adjudication Overview</AlertTitle>
          Adjudication plays a pivotal role in the process of natural language
          annotation, providing a platform to assess the consensus among
          annotators. This feature allows you to peruse project texts,
          inspecting annotations to discern consensus levels, identify areas
          needing refinement, and recognise successfully aligned annotations.
          Use the pagination controls to navigate through documents. The "input"
          denotes the original text, while "compiled" indicates the
          consensus-derived text. Use the toggle buttons to reveal or hide
          annotator flags and tags for further insights.
        </Alert>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        m="0rem 0.5rem"
      >
        <Chip
          label={`Document IAA: ${Math.round(filteredData.scores.doc)}%`}
          size="large"
          color="primary"
          variant="outlined"
        />
        <Stack
          direction="row"
          justifyContent="right"
          alignItems="center"
          spacing={1}
          mb={2}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={() => setShowFlags(!showFlags)}
          >
            {showFlags ? "Hide" : "Show"} Flags
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setShowTags(!showTags)}
          >
            {showTags ? "Hide" : "Show"} Tags
          </Button>
        </Stack>
      </Box>
      <Paper sx={{ width: "100%", overflow: "hidden" }} variant="outlined">
        <AnnotationGrid
          filteredData={filteredData}
          showTags={showTags}
          showFlags={showFlags}
          maxTokenSizes={maxTokenSizes}
        />
        <Divider />
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={data.length}
            page={page}
            onChange={handleChangePage}
          />
        </Box>
      </Paper>
    </StyledCard>
  );
};

const AnnotationGrid = ({
  filteredData,
  showTags,
  showFlags,
  maxTokenSizes,
}) => {
  console.log(filteredData);

  return (
    <>
      <Grid container spacing={1}>
        {/* User Cells Column */}
        <Grid item xs={2}>
          <React.Fragment key={"input"}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              sx={{ height: 64 }}
            >
              <UserCell title={"Input"} />
            </Box>
          </React.Fragment>

          {Object.keys(filteredData.annotations).map((user, index) => (
            <React.Fragment key={index}>
              <Divider />
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                sx={{ height: 64 }}
              >
                <UserCell
                  title={user}
                  flags={filteredData.annotations[user].flags}
                  showFlags={showFlags}
                />
              </Box>
            </React.Fragment>
          ))}
          <React.Fragment key={"output"}>
            <Divider />
            <Box
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              sx={{ height: 64 }}
            >
              <UserCell title={"Output"} />
            </Box>
          </React.Fragment>
        </Grid>
        {/* Annotation Cells Column */}
        <Grid item xs={10} sx={{ width: "100%", overflowX: "auto" }}>
          <React.Fragment key={"annotation-cell-input"}>
            <Divider />
            <Box
              display="flex"
              alignItems="center"
              sx={{
                height: 64,
              }}
            >
              <AnnotationCell
                key={"annotation-cell-input"}
                tokens={filteredData.input}
                maxTokenSizes={maxTokenSizes}
              />
            </Box>
          </React.Fragment>

          {Object.keys(filteredData.annotations).map((user, index) => (
            <React.Fragment key={`annotation-cell-${index}`}>
              <Divider />
              <Box
                display="flex"
                alignItems="center"
                sx={{
                  height: 64,
                }}
              >
                <AnnotationCell
                  key={`annotation-cell-${index}`}
                  tokens={filteredData.annotations[user].tokens}
                  tags={filteredData.annotations[user].tags}
                  showTags={showTags}
                  maxTokenSizes={maxTokenSizes}
                />
              </Box>
            </React.Fragment>
          ))}
          <React.Fragment key={"annotation-cell-compiled"}>
            <Divider />
            <Box
              display="flex"
              alignItems="center"
              sx={{
                height: 64,
              }}
            >
              <AnnotationCell
                key={"annotation-cell-compiled"}
                tokens={filteredData.compiled.tokens}
                showTags={showTags}
                tokenScores={filteredData.scores.tokens}
                maxTokenSizes={maxTokenSizes}
              />
            </Box>
          </React.Fragment>
        </Grid>
      </Grid>
    </>
  );
};

const UserCell = ({
  title,
  flags = [],
  showFlags = false,
  showAvatar = false,
}) => {
  return (
    <React.Fragment key={`user-cell-${title}`}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography gutterBottom>{title}</Typography>
      </Stack>
      {showFlags && (
        <Stack direction="row" spacing={1}>
          {flags.map((flag) => (
            <Chip label={flag} size="small" />
          ))}
        </Stack>
      )}
    </React.Fragment>
  );
};

const AnnotationCell = ({
  tokens,
  tags = [],
  showTags,
  tokenScores = [],
  maxTokenSizes,
}) => {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1}>
      {tokens.map((token, index) => {
        const tokenTags = tags.slice(index, index + 1);
        const hasTags = tokenTags.length > 0;

        const tokenIAA = Math.round(tokenScores.slice(index, index + 1));
        const tokenIAABgColor = getColor(tokenIAA);
        const tokenIAATextColor = getContrastYIQ(tokenIAABgColor);

        return (
          <Stack direction="column" spacing={0.5} sx={{ textAlign: "center" }}>
            <Box
              sx={{
                border: "1px solid lightgrey",
                borderRadius: 1,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  border: tokenIAA ? 1 : 0,
                  borderColor: "lightgrey",
                  borderStyle: "solid",
                  borderTopLeftRadius: 1,
                  borderTopRightRadius: 1,
                  backgroundColor: tokenIAABgColor,
                  color: tokenIAATextColor,
                }}
              >
                {tokenScores.length > 0 && (
                  <Tooltip
                    placement="top"
                    arrow
                    title={`This token has an average IAA of ${tokenIAA}`}
                  >
                    <Typography fontSize={10} sx={{ cursor: "help" }}>
                      {tokenIAA}
                    </Typography>
                  </Tooltip>
                )}
              </Box>
              <Box
                p={0.5}
                sx={{
                  width: `${maxTokenSizes[index] + 1 || 0}ch`,
                  minWidth: "4ch",
                  height: 32,
                  backgroundColor:
                    token === "" && alpha(theme.palette.token.empty, 0.5),
                  borderBottomRightRadius: 1,
                  borderBottomLeftRadius: 1,
                }}
              >
                <Typography sx={{ fontFamily: "monospace" }}>
                  {token}
                </Typography>
              </Box>
            </Box>
            {showTags && hasTags
              ? tokenTags.map((t) => (
                  <Typography variant="caption">{t}</Typography>
                ))
              : null}
          </Stack>
        );
      })}
    </Stack>
  );
};

export default Adjudication;
