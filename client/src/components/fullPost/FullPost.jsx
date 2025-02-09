import {
  UilCommentAltDots,
  UilEllipsisH,
  UilMultiply,
  UilShare
} from "@iconscout/react-unicons";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useContext } from "react";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import Comments from "../comments/Comments";

import "./fullPost.scss";

const FullPost = (post, onHidden) => {
  const { isLoading, error, data } = useQuery(["likes", post.post.id], () =>
    makeRequest.get("/likes?postId=" + post.post.id).then((res) => {
      return res.data;
    })
  );
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const mutation = useMutation(
    (liked) => {
      if (liked) return makeRequest.delete("/likes?postId=" + post.post.id);
      return makeRequest.post("/likes", { postId: post.post.id });
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["likes"]);
        if (!data.includes(currentUser?.id) && currentUser?.id != post.post.userId) {
          makeRequest.post("/notifications/add", {
            senderId: currentUser?.id,
            receiverId: post.post.userId,
            type: 1,
          });
        }
      },
    }
  );
  const deleteMutation = useMutation(
    (postId) => {
      return makeRequest.delete("/posts/" + postId);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["posts"]);
      },
    }
  );
  const handleLike = () => {
    mutation.mutate(data.includes(currentUser?.id));
  };

  const handleDelete = () => {
    deleteMutation.mutate(post.post.id);
  };

  console.log(post);
  return (
    <div className="fullPost">
      <div className="exit" onClick={post.onHidden}>
        <UilMultiply />
      </div>
      <div className="imagePost">
        <img src={"/upload/" + post.post.img} alt="" />
      </div>
      <div className="infoPost">
        <div className="info">
          <div className="user">
            <div className="profile_post">
              <img src={"/upload/" + post.post.profilePic} alt="" />
            </div>
            <div className="name">{post.post.name}</div>
            <div className="time">{moment(post.post.createdAt).fromNow()}</div>
          </div>
          <div className="option">
            <UilEllipsisH />
          </div>
        </div>
        <div className="description">{post.post.desc}</div>
        <div className="reactBar">
          <div className="item like">
          {isLoading ? (
              "loading"
            ) : data.includes(currentUser?.id) ? (
              <FavoriteOutlinedIcon
                style={{ color: "red" }}
                onClick={handleLike}
              />
            ) : (
              <FavoriteBorderOutlinedIcon onClick={handleLike} />
            )}
            {data?.length} Thích
          </div>
          <div className="item comment">
            <UilCommentAltDots size="30" />
            Bình luận
          </div>
          <div className="item share_post">
            <UilShare size="30" />
            Chia sẻ
          </div>
        </div>
        <Comments postId={post.post.id} userId={post.post.userId} />
      </div>
    </div>
  );
};

export default FullPost;
