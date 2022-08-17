import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../../Create.css";
import {
  addReplacement,
  deleteReplacement,
  selectActiveStep,
  selectCorpus,
  selectReplacements,
  selectSteps,
  setStepData,
  setStepValid,
} from "../../createStepSlice";
import { CorpusEditor } from "./CorpusEditor";
import { ReplacementEditor } from "./ReplacementEditor";
import { readFile } from "./utils";

import { Grid, Stack, Typography, Button, Box } from "@mui/material"

import HelpIcon from '@mui/icons-material/Help';

const infoContent = {
  raw_text: {
    title: "Corpus",
    content:
      "Corpus of newline separated texts that will be annotated for lexical normalisation.",
    format:
      "Corpus (no identifiers) (.txt)\n...\nhelo wor\nhello worl\n...\n\nCorpus (with identifiers) (.csv)\n...\nid1,helo wor\nid2,hello worl\n...",
  },
  replacements: {
    title: "Replacements",
    content: "Replacements should be in the form of a 1:1 (OOV:IV) mapping.",
    format:
      '.csv\n...\nhelo,hello\nwor,world\n...\n\n.json\n...\n{"helo":"hello", "wor":"world"}\n...',
  },
};

const Upload = () => {
  const dispatch = useDispatch();
  const steps = useSelector(selectSteps);
  const activeStep = useSelector(selectActiveStep);
  const corpus = useSelector(selectCorpus);
  const replacements = useSelector(selectReplacements);

  useEffect(() => {
    if (corpus && corpus === "") {
      // console.log("erased corpus paste bin");

      // Reset corpus and remove file meta data if user erases all contents of corpus paste bin
      dispatch(
        setStepData({
          corpus: [],
          corpusFileName: null,
        })
      );
    }
  }, [corpus]);

  useEffect(() => {
    const valid = steps[activeStep].valid;

    if (!valid && corpus.length !== 0 && corpus[0] !== "") {
      dispatch(setStepValid(true));
    }
    if (valid && (corpus.length < 1 || corpus[0] === "")) {
      dispatch(setStepValid(false));
    }
  }, [steps]);

  // const infoPopover = (content, format) => {
  //   return (
  //     <Popover id="popover-info">
  //       <Popover.Title>Information</Popover.Title>
  //       <Popover.Content>
  //         <p>{content}</p>
  //         <code style={{ whiteSpace: "pre-wrap" }}>{format}</code>
  //       </Popover.Content>
  //     </Popover>
  //   );
  // };

  // const infoOverlay = (info) => {
  //   return (
  //     <OverlayTrigger
  //       trigger="click"
  //       placement="right"
  //       overlay={infoPopover(info.content, info.format)}
  //       rootClose
  //     >
  //       <HelpIcon
  //         // id="info-label"
  //         style={{ marginRight: "0.25rem", cursor: "pointer" }}
  //       />
  //     </OverlayTrigger>
  //   );
  // };

  // const handleUpload = () => {
  //   inputRef1.current?.click();
  // };

  return (
    <React.Fragment>
      <Stack direction="column" spacing={2} sx={{ width: '100vw' }}>
        <Box>
          <Stack direction="row" justifyContent="space-between" pb={2} alignItems="center">
            <Typography variant="button">
              Corpus ({Object.keys(corpus).length})
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" component="label" disableElevation="true" size="small">
                Upload File without Identifiers
                {steps[activeStep].data.corpusFileName
                  && `(${steps[activeStep].data.corpusFileName})`}
                <input
                  id="corpus"
                  type="file"
                  onChange={(e) =>
                    readFile(
                      dispatch,
                      e.target.files[0],
                      "corpus_no_ids"
                    )
                  }
                  accept=".txt"
                />
              </Button>
              <Button variant="contained" component="label" disableElevation="true" size="small">
                Upload File with identifiers
                {steps[activeStep].data.corpusFileName
                  && `(${steps[activeStep].data.corpusFileName})`}
                <input
                  id="corpus"
                  type="file"
                  onChange={(e) =>
                    readFile(
                      dispatch,
                      e.target.files[0],
                      "corpus_w_ids"
                    )
                  }
                  accept=".csv"
                />
              </Button>
            </Stack>
          </Stack>
          <CorpusEditor corpus={corpus} />
        </Box>
        <Box>
          <Stack direction="row" justifyContent="space-between" pb={2} alignItems="center">
            <Typography variant="button">
              Replacements ({Object.keys(replacements).length})
            </Typography>
            <Button variant="contained" component="label" disableElevation="true" size="small">
              Upload File
              <input
                id="replacements"
                type="file"
                onChange={(e) =>
                  readFile(
                    dispatch,
                    e.target.files[0],
                    "replacements"
                  )
                }
                accept=".csv,.json"
              />
            </Button>
          </Stack>
          <ReplacementEditor />
        </Box>
      </Stack>
    </React.Fragment >
  );
};

export default Upload;