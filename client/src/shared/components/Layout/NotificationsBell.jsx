import React, { useState } from "react";
import {
  Badge,
  Divider,
  IconButton,
  Popover,
  Tooltip,
  Button,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import moment from "moment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import useNotificationActions from "../../hooks/api/notification";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router";

const NotificationsBell = ({ notifications }) => {
  const { state, dispatch } = useAppContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElNotiAction, setAnchorElNotiAction] = useState(null);
  const { acceptNotification, declineNotification } = useNotificationActions();
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotiActionClick = (event) => {
    setAnchorElNotiAction(event.currentTarget);
  };

  const handleNotiActionClose = () => {
    setAnchorElNotiAction(null);
  };

  const handleAccept = async (notificationId) => {
    // Handle project acceptance logic here
    // For example, update the project status and then redirect to the projects page
    console.log(`Accepted notification ${notificationId}`);
    try {
      const data = await acceptNotification(notificationId);

      if (data && data.projectId) {
        navigate({ to: `/dashboard/${data.projectId}` });
      }
    } catch (error) {
      console.error("Error updating notification status:", error);
    } finally {
      handleNotiActionClose();
      handleClose();
    }
    // Redirect to projects page

    // window.location.href = '/projects'; // Adjust the URL as needed
  };

  const handleDecline = async (notificationId) => {
    // Update notification status to 'read' upon decline
    try {
      const data = await declineNotification(notificationId);
      //   fetchNotifications(); // Re-fetch notifications to update the UI
    } catch (error) {
      console.error("Error updating notification status:", error);
    } finally {
      handleNotiActionClose();
      handleClose();
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "notification-container" : undefined;
  const idNotiAction = open ? "notification-action-container" : undefined;

  const openNotiAction = Boolean(anchorElNotiAction);

  // Function to return a meaningful title based on notifications count
  const getNotificationTitle = (unreadNotificationsCount) => {
    if (unreadNotificationsCount > 0) {
      return `${unreadNotificationsCount} new notifications`;
    }
    return "No new notifications";
  };

  // Assuming `notifications` is an array of notification objects
  const unreadNotificationsCount = notifications.filter(
    (notification) => notification.status === "unread"
  ).length;

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Tooltip title={getNotificationTitle(unreadNotificationsCount)}>
          <Badge badgeContent={unreadNotificationsCount} color="primary">
            <NotificationsIcon />
          </Badge>
        </Tooltip>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box p={1}>
          <Typography fontWeight="bold" color="text.secondary">
            Notifications
          </Typography>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box p={2} sx={{ textAlign: "center" }}>
            <Typography variant="body2">No Notifications</Typography>
          </Box>
        ) : (
          <Box p={0} maxHeight={600}>
            {notifications
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <Box p={1}>
                    <Box width={320} display="flex" flexDirection="column">
                      <Typography variant="body2" fontWeight="bold">
                        {notification.sender.username} invited you to join{" "}
                        {notification.project.name}
                      </Typography>
                      <Typography variant="body2">
                        {!["unread", "read"].includes(notification.status)
                          ? `You ${notification.status} this invitation.`
                          : "Click the menu icon to accept or decline this invitation."}
                      </Typography>
                    </Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="caption">
                        {notification.type} sent{" "}
                        {moment(notification.createdAt).fromNow()}
                      </Typography>
                      <IconButton
                        onClick={handleNotiActionClick}
                        disabled={notification.status === "accepted"}
                      >
                        <MoreHorizIcon />
                      </IconButton>
                      <Popover
                        id={idNotiAction}
                        open={openNotiAction}
                        anchorEl={anchorElNotiAction}
                        onClose={handleNotiActionClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                      >
                        <Stack direction="column">
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => handleAccept(notification._id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            color="secondary"
                            onClick={() => handleDecline(notification._id)}
                            disabled={notification.status === "declined"}
                          >
                            Decline
                          </Button>
                        </Stack>
                      </Popover>
                    </Stack>
                  </Box>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationsBell;
