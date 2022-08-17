import React, { useEffect } from "react";
// import { Col, Container, Row, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
// import "./AnnotationTable.css";
// import { ContextToast } from "./contexttoast";
// import { Paginator } from "./paginator";
import {
  fetchProject,
  fetchProjectMaps,
  selectBgColourMap,
  selectProject,
  fetchMetrics,
  selectFilter,
} from "./projectSlice";
// import { Sidebar } from "./sidebar";
import { Text } from "./text";
// import { Tokenize } from "./tokenize";
import {
  getTotalPages,
  selectPage,
  selectPageLimit,
  setPage,
} from "./textSlice";
import {
  fetchTokens,
  selectShowToast,
  selectTextTokenMap,
  selectTokenizeTextId,
  setTokenizeTextId,
  setIdle,
  updateAllTokenDetails,
  patchSingleAnnotationState,
} from "./tokenSlice";

import { Grid } from "@mui/material"

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SearchIcon from '@mui/icons-material/Search';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

const Project = () => {
  const dispatch = useDispatch();

  const { projectId: activeProjectId } = useParams();
  let { pageNumber } = useParams();

  const project = useSelector(selectProject);
  const projectStatus = useSelector((state) => state.project.status);
  const projectError = useSelector((state) => state.project.error);
  const bgColourMap = useSelector(selectBgColourMap);
  const showToast = useSelector(selectShowToast);
  const filter = useSelector(selectFilter);

  const pageLimit = useSelector(selectPageLimit);
  const page = useSelector(selectPage);
  const textsError = useSelector((state) => state.texts.error);
  const tokenizeTextId = useSelector(selectTokenizeTextId);

  const tokensStatus = useSelector((state) => state.tokens.status);
  const tokensError = useSelector((state) => state.tokens.error);

  const textTokenMap = useSelector(selectTextTokenMap);

  // useEffect(() => {
  //   // Updates texts whenever page is changed...
  //   dispatch(setPage(pageNumber));
  //   dispatch(setIdle());
  // }, [pageNumber]);

  // useEffect(() => {
  //   // Loader for project information
  //   if (activeProjectId && projectStatus === "idle") {
  //     dispatch(fetchProject({ projectId: activeProjectId }));
  //     dispatch(fetchProjectMaps({ projectId: activeProjectId }));
  //   }
  // }, [activeProjectId, projectStatus, dispatch]);

  // useEffect(() => {
  //   if (
  //     activeProjectId &&
  //     projectStatus === "succeeded" &&
  //     tokensStatus === "idle"
  //   ) {
  //     // Fetches the count of total pages based on current settings
  //     // and the tokens associated with the texts on the current page.
  //     dispatch(
  //       getTotalPages({
  //         project_id: project._id,
  //         get_pages: true,
  //         filter: filter,
  //         page_limit: pageLimit,
  //       })
  //     );
  //     dispatch(
  //       fetchTokens({
  //         project_id: project._id,
  //         filter: filter,
  //         page_limit: pageLimit,
  //         page: page,
  //       })
  //     );
  //   }
  //   if (tokensStatus === "succeeded") {
  //     dispatch(
  //       updateAllTokenDetails({
  //         token_ids: textTokenMap.map((text) => text.token_ids).flat(),
  //         bgColourMap: bgColourMap,
  //       })
  //     );
  //   }
  // }, [tokensStatus, projectStatus, dispatch]);

  // let textsContent;
  // if (tokensStatus === "loading") {
  //   textsContent = <Spinner />;
  // } else if (tokensStatus === "succeeded" && textTokenMap.length === 0) {
  //   textsContent = (
  //     <div
  //       style={{
  //         marginTop: "25vh",
  //         textAlign: "center",
  //         fontSize: "2rem",
  //         fontWeight: "bold",
  //         color: "#607d8b",
  //       }}
  //     >
  //       <SearchIcon style={{ fontSize: "5rem", textAlign: "center" }} />
  //       <p>Sorry, no results were found</p>
  //     </div>
  //   );
  // } else if (tokensStatus === "succeeded") {
  //   textsContent = (
  //     <div>
  //       <div className="annotation-table">
  //         {textTokenMap &&
  //           textTokenMap.map((text, id) => {
  //             return (
  //               <div
  //                 id="container"
  //                 tokenize={tokenizeTextId === text._id && "true"}
  //                 waiting={
  //                   tokenizeTextId !== text._id && tokenizeTextId && "true"
  //                 }
  //               >
  //                 <div id="index-column" annotated={text.annotated && "true"}>
  //                   <div id="icon">{id + 1 + (page - 1) * pageLimit}</div>
  //                 </div>
  //                 <div id="row" key={id} annotated={text.annotated && "true"}>
  //                   <div id="text-column">
  //                     {tokenizeTextId === text._id ? (
  //                       <Tokenize tokenIds={text.token_ids} textId={text._id} />
  //                     ) : (
  //                       <Text tokenIds={text.token_ids} textId={text._id} />
  //                     )}
  //                   </div>
  //                   <div id="actions">
  //                     {text.annotated ? (
  //                       <CheckCircleIcon
  //                         id="icon"
  //                         annotated="true"
  //                         onClick={() => {
  //                           dispatch(
  //                             patchSingleAnnotationState({
  //                               textId: text._id,
  //                               value: false,
  //                             })
  //                           );
  //                           dispatch(fetchMetrics({ projectId: project._id }));
  //                         }}
  //                       />
  //                     ) : (
  //                       <CloseIcon
  //                         id="icon"
  //                         onClick={() => {
  //                           dispatch(
  //                             patchSingleAnnotationState({
  //                               textId: text._id,
  //                               value: true,
  //                             })
  //                           );
  //                           dispatch(fetchMetrics({ projectId: project._id }));
  //                         }}
  //                       />
  //                     )}
  //                     {tokenizeTextId === text._id ? (
  //                       <MoreHorizIcon
  //                         id="icon-tokenize"
  //                         active="true"
  //                         title="Go to replacement view"
  //                         onClick={() => {
  //                           dispatch(
  //                             setTokenizeTextId(
  //                               tokenizeTextId === text._id ? null : text._id
  //                             )
  //                           );
  //                         }}
  //                       />
  //                     ) : (
  //                       <ModeEditIcon
  //                         id="icon-tokenize"
  //                         title="Go to tokenization view"
  //                         onClick={() => {
  //                           dispatch(
  //                             setTokenizeTextId(
  //                               tokenizeTextId === text._id ? null : text._id
  //                             )
  //                           );
  //                         }}
  //                       />
  //                     )}
  //                   </div>
  //                 </div>
  //               </div>
  //             );
  //           })}
  //       </div>
  //       <Paginator />
  //     </div>
  //   );
  // } else if (tokensStatus === "failed") {
  //   textsContent = <div>{textsError}</div>;
  // }

  return (
    // {/* {showToast && <ContextToast />} */ }
    <Grid>
      {/* <Sidebar /> */}
      <Grid className="annotation-col">
        {/* <>{textsContent}</> */}

        {textTokenMap &&
          textTokenMap.map((text, id) => {
            return <Text tokenIds={text.token_ids} textId={text._id} />
          })}

      </Grid>
    </Grid>
  );
};

export default Project;