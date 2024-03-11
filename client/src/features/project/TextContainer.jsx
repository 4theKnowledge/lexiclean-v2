import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Grid, Stack, Box, Typography, Button, Paper } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { grey, green, yellow } from "@mui/material/colors";
import { Text } from "./Text";
import { ProjectContext } from "../../shared/context/project-context";
import { getTokenWidth } from "../../shared/utils/token";
import ActionTray from "./ActionTray";

export const TextContainer = (props) => {
  const { text, textId, textIndex } = props;
  const [state, dispatch] = useContext(ProjectContext);

  return (
    <Grid
      container
      item
      as={Paper}
      variant="outlined"
      m="1rem 0rem"
      xs={12}
      id={`text-container-${textIndex}`}
      sx={{
        display: "flex",
        flexDirection: "row",
        userSelect: "none",
        minHeight: 140,
        backgroundColor: "background.light",
      }}
    >
      <Grid item xs={12} p={2}>
        <ActionTray textId={textId} textIndex={textIndex} />
      </Grid>
      <Grid item xs={12} p={2}>
        <Box
          component="div"
          key={textIndex}
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          <Box display="flex" flexDirection="column">
            {state.showReferences && (
              <Typography variant="caption" sx={{ color: grey[500] }} pb={1}>
                {text.reference}
              </Typography>
            )}
            {state.tokenizeTextId == textId ? (
              <TokenizedText textId={textId} tokens={text.tokens} />
            ) : (
              <Text text={text} textId={textId} />
            )}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

const TokenizedText = ({ textId, tokens }) => {
  const [state, dispatch] = useContext(ProjectContext);

  const [valid, setValid] = useState(false);
  const [tokenIndexes, setTokenIndexes] = useState(new Set());
  const [tokenIndexGroups, setTokenIndexGroups] = useState([]);

  const handleIndex = (index) => {
    if (tokenIndexes.has(index)) {
      setTokenIndexes((prev) => new Set([...prev].filter((x) => x !== index)));
    } else {
      setTokenIndexes((prev) => new Set(prev.add(index)));
    }
  };

  useEffect(() => {
    const indexes = Array.from(tokenIndexes).sort((a, b) => {
      return a - b;
    });

    // console.log("indexes", indexes);

    const groups = indexes.reduce((r, n) => {
      // https://stackoverflow.com/questions/47906850/javascript-group-the-numbers-from-an-array-with-series-of-consecutive-numbers
      const lastSubArray = r[r.length - 1];
      if (!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n - 1) {
        r.push([]);
      }
      r[r.length - 1].push(n);
      return r;
    }, []);
    setTokenIndexGroups(groups);
    // console.log("groups", groups);
    // Check all sub arrays are greater than 1 in length
    const validSelection = groups.filter((l) => l.length === 1).length === 0;
    // console.log("validSelection", validSelection);
    setValid(validSelection);
  }, [tokenIndexes]);

  const handleReset = () => {
    setTokenIndexes(new Set());
  };

  const handleTokenize = async () => {
    axios
      .patch("/api/text/tokenize", {
        textId: textId,
        indexGroupsTC: tokenIndexGroups,
      })
      .then((response) => {
        if (response.status === 200) {
          dispatch({ type: "TOKENIZE", payload: response.data });
        }
      })
      .catch((error) => console.log(`Error: ${error}`));

    handleReset();
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="left">
      <Box
        key={`tokenize-text-${textId}`}
        sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
      >
        {tokens &&
          Object.keys(tokens).map((tokenIndex) => {
            const token = tokens[tokenIndex];
            const color = tokenIndexes.has(parseInt(tokenIndex))
              ? green[500]
              : yellow[500];
            const width = getTokenWidth(token.currentValue);

            return (
              <Typography
                sx={{
                  textAlign: "center",
                  backgroundColor: alpha(color, 0.75),
                  width: width,
                }}
                onClick={() => handleIndex(parseInt(tokenIndex))}
              >
                {token.currentValue}
              </Typography>
            );
          })}
      </Box>
      <Stack direction="row" mt={2} spacing={2}>
        <Button
          size="small"
          disabled={tokenIndexes.size <= 1 || !valid}
          onClick={handleTokenize}
          variant="outlined"
        >
          Apply
        </Button>
        <Button
          size="small"
          disabled={tokenIndexes.size === 0}
          onClick={handleReset}
          variant="outlined"
        >
          Clear
        </Button>
      </Stack>
    </Box>
  );
};
