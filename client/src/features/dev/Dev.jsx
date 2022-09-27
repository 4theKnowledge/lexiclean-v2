import React, { useState, useEffect } from "react";

import { Grid, Typography, Stack } from "@mui/material";

import { getTokenDetails } from "./utils";

const textExample = "This is some text";

const Dev = () => {
  const [text, setText] = useState(textExample);
  const [currentInnerText, setCurrentInnerText] = useState(textExample);
  const [markup, setMarkup] = useState([{ start: 0, end: 4 }]);
  const [cursorPos, setCursorPos] = useState();

  const goodWords = ["this", "is", "some", "text"];

  // useEffect(() => {
  //   markup.forEach((m) => {
  //     var span = document.getElementById("element").innerHTML;
  //     // console.log(span);
  //     document.getElementById("element").innerHTML =
  //       span.substring(0, m.start) +
  //       "<mark style='text-decoration: underline; cursor: pointer; background-color: lightskyblue;'>" +
  //       span.substring(m.start, m.end) +
  //       "</mark>" +
  //       span.substring(m.end);
  //   });
  // }, [text]);

  const handleEdit = (value) => {
    console.log("editing", value);
  };

  const compareTexts = () => {
    console.log("comparing texts");
    // Get inner text irrespective of mark/span elements
    const _text = Array.from(document.querySelectorAll("#element")).map(
      (el) => el.innerText
    )[0];
    // console.log("_text", _text);

    const _text_chars = _text.split("");

    const ref_text_chars = text.split("");
    // Get position of modified character
    if (text !== _text) {
      _text_chars.some((char, index) => {
        console.log(index, char);

        if (char !== ref_text_chars[index]) {
          setCursorPos(index);
          return true;
        }

        // return char !== _text_chars[index];
      });
    }
    setText(_text);
  };

  // 1. Capture changes made
  // 2. Ask user if they want to save changes / propagate changes

  const [changes, setChanges] = useState();
  const [textChanged, setChanged] = useState(false);
  const [originalTokens, setOriginalTokens] = useState(
    getTokenDetails(textExample)
  );
  const [currentToken, setCurrentToken] = useState();

  const handleCaret = (e) => {
    let caretPosition = null;
    const selection = document.getSelection();
    const range = document.createRange();

    if (range.collapsed) {
      const temp = document.createTextNode("\0");
      selection.getRangeAt(0).insertNode(temp);
      caretPosition = e.target.innerText.indexOf("\0");
      temp.parentNode.removeChild(temp);

      range.setStart(selection.focusNode, selection.focusOffset);
      range.collapse(false);

      selection.removeAllRanges();
      selection.addRange(range);
    }
    setCursorPos(caretPosition);
    setCurrentInnerText(e.target.innerText);

    // Set current token
    const tokenIndex = originalTokens
      .map((t, index) => ({ ...t, index: index }))
      .filter(
        (t) => t.start <= caretPosition && caretPosition <= t.end
      )[0].index;
    setCurrentToken(tokenIndex);
  };

  useEffect(() => {
    if (text !== currentInnerText) {
      console.log("change made");
      setChanged(true);
    } else {
      setChanged(false);
    }
  }, [currentInnerText]);

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ width: "100vw", height: "100vh" }}
    >
      <Stack direction="column">
        <Stack direction="column" justifyContent="space-between">
          <Typography variant="caption">Cursor: {cursorPos}</Typography>
          <Typography variant="caption">Token: {currentToken}</Typography>
          <Typography variant="caption">
            Text Changed: {textChanged ? "yes" : "no"}
          </Typography>
        </Stack>
        <Typography
          contentEditable={true}
          suppressContentEditableWarning={true}
          sx={{ outline: "none", backgroundColor: "ivory" }}
          id="element"
          p={4}
          onClick={(e) => {
            e.preventDefault();
            handleCaret(e);
          }}
          onKeyUp={(e) => {
            e.preventDefault();
            handleCaret(e);
          }}
        >
          {text}
        </Typography>
      </Stack>
    </Grid>
  );
};

export default Dev;
