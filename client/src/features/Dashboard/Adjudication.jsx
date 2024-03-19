import { useState, useEffect } from "react";
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
  return (
    <>
      <TextContainer
        title="Input"
        tokens={filteredData.input}
        maxTokenSizes={maxTokenSizes}
      />
      <Divider />
      {Object.keys(filteredData.annotations).map((user) => {
        return (
          <TextContainer
            title={user}
            tokens={filteredData.annotations[user].tokens}
            tags={filteredData.annotations[user].tags}
            flags={filteredData.annotations[user].flags}
            showTags={showTags}
            showFlags={showFlags}
            maxTokenSizes={maxTokenSizes}
            showAvatar={true}
          />
        );
      })}
      <Divider />
      <TextContainer
        title="Compiled"
        tokens={filteredData.compiled.tokens}
        showTags={showTags}
        showFlags={showFlags}
        tokenScores={filteredData.scores.tokens}
        maxTokenSizes={maxTokenSizes}
      />
    </>
  );
};

const TextContainer = ({
  title,
  tokens,
  tags = [],
  flags = [],
  showTags,
  showFlags,
  tokenScores = [],
  maxTokenSizes,
  showAvatar = false,
}) => {
  const theme = useTheme();

  return (
    <Grid container alignItems="center" p={1}>
      <Grid item xs={2} justifyContent="right" display="flex" pr={4}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {/* {showAvatar && (
            <Avatar sx={{ width: 24, height: 24 }}>
              {title[0].toUpperCase()}
            </Avatar>
          )} */}
          <Typography gutterBottom>{title}</Typography>
        </Stack>
        {showFlags && (
          <Stack direction="row" spacing={1}>
            {flags.map((flag) => (
              <Chip label={flag} size="small" />
            ))}
          </Stack>
        )}
      </Grid>
      <Grid item xs={10}>
        <Stack direction="row" spacing={1}>
          {tokens.map((token, index) => {
            const tokenTags = tags.slice(index, index + 1);
            const hasTags = tokenTags.length > 0;

            const tokenIAA = Math.round(tokenScores.slice(index, index + 1));
            const tokenIAABgColor = getColor(tokenIAA);
            const tokenIAATextColor = getContrastYIQ(tokenIAABgColor);

            return (
              <Stack
                direction="column"
                spacing={0.5}
                sx={{ textAlign: "center" }}
              >
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
      </Grid>
    </Grid>
  );
};

export default Adjudication;
