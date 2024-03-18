import { useParams } from "react-router";
import useApi from "../useApi";
// import { useSnackbar } from "../../context/SnackbarContext";

const useNotificationActions = () => {
  const callApi = useApi();
  const { projectId } = useParams();

  //   const { dispatch: snackbarDispatch } = useSnackbar();

  const inviteNotification = async (usernames) => {
    try {
      const data = await callApi("/api/notification/invite", {
        method: "POST",
        data: { usernames, projectId },
      });

      if (data) {
        //
        return data;
      }
    } catch (error) {
      //
    }
  };

  const uninviteNotification = async (notificationId) => {
    try {
      const data = await callApi("/api/token/add", {
        method: "PATCH",
        data: {},
      });

      if (data) {
        //
      }
    } catch (error) {
      //
    }
  };

  const acceptNotification = async (notificationId) => {
    try {
      const data = await callApi(`/api/notification/${notificationId}`, {
        method: "PATCH",
        data: { accepted: true },
      });

      if (data) {
        return data;
      }
    } catch (error) {
      //
    }
  };

  const declineNotification = async (notificationId) => {
    try {
      const data = await callApi(`/api/notification/${notificationId}`, {
        method: "PATCH",
        data: { accepted: false },
      });

      if (data) {
        //
        console.log(data);
        return data;
      }
    } catch (error) {
      //
    }
  };

  return {
    inviteNotification,
    uninviteNotification,
    acceptNotification,
    declineNotification,
  };
};

export default useNotificationActions;
