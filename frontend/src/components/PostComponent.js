import axios from "axios";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "../css/post.css";
import deleteComment from "../images/image.png";

const PostComponent = ({ userData }) => {
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);
  const [author, setAuthor] = useState({});
  const [input, setInput] = useState("");
  const [liked, setLiked] = useState(false);
  const [viewImage, setViewImage] = useState(null); // State for viewing image
  const params = useParams();
  const commentsRef = useRef(null);

  const token = JSON.parse(localStorage.getItem("token"))?.token;
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    handleBlog();
  }, []);

  const handleBlog = async () => {
    if (!params.id) {
      console.log("params.id is not defined");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:2000/api/posts/${params.id}`,
        config
      );
      setPost(response.data);

      // Check localStorage to see if the user has liked this post
      const hasLiked = await localStorage.getItem(`${response.data._id}-${userData._id}`);
      setLiked(hasLiked === 'true'); // Set liked state based on localStorage

      handleUser(response.data.userId);
      const res = await axios.get(
        `http://localhost:2000/api/posts/comments/${params.id}`,
        config
      );
      setComments(
        res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );

      // Fetch image
      if (response.data.image) {
        const imageResponse = await axios.get(`http://localhost:2000/api/posts/image`, {
          params: { id: response.data.image },
          responseType: 'blob' // Ensure the response is treated as a Blob
        });

        if (imageResponse && imageResponse.data) {
          const blob = new Blob([imageResponse.data], { type: imageResponse.data.type || 'image/jpeg' });
          const urlImage = URL.createObjectURL(blob);
          setViewImage(urlImage);
        }
      }
    } catch (err) {
      console.error("Error fetching blog data:", err);
    }
  };

  const scrollToComments = () => {
    commentsRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleUser = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:2000/api/users/${id}`,
        config
      );
      setAuthor(response.data);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const handleLikeToggle = async () => {
    try {
      setLiked(!liked);
      const apiUrl = liked 
        ? `http://localhost:2000/api/posts/unlike/${params.id}` 
        : `http://localhost:2000/api/posts/like/${params.id}`;
    
      const response = await axios.post(apiUrl, { username: userData.username }, config);
    
      setPost((prevPost) => ({
        ...prevPost,
        likes: liked ? prevPost.likes - 1 : prevPost.likes + 1,
        likedBy: liked 
          ? prevPost.likedBy.filter(user => user !== userData.username)
          : [...prevPost.likedBy, userData.username]
      }));
    
      // Store the liked state in localStorage
      localStorage.setItem(`${post._id}-${userData._id}`, (!liked).toString());
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleComment = async () => {
    try {
      await axios.post(
        `http://localhost:2000/api/posts/comments/${params.id}`,
        {
          userName: userData.username,
          content: input,
          createdAt: new Date().toISOString(),
        },
        config
      );
      setInput("");
      handleBlog();
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:2000/api/posts/comments/${params.id}/${id}`,
        config
      );
      setComments(comments.filter((comm) => comm._id !== id));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <div className="container d-flex flex-column p-3">
      <div className="post-header mb-4">
        <div className="post-info container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center" style={{ marginLeft: "-14px" }}>
            <img
              src="https://pbs.twimg.com/media/GBMkWGbbUAA6zvs.jpg"
              alt={author.username}
              className="author-avatar"
              style={{ marginRight: "10px" }}
            />
            <h1 className="post-title">{author.username}</h1>
          </div>
          <p className="mt-3" style={{ fontSize: "15px", marginRight: "-10px" }}>
            Posted on {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <p className="post-meta" style={{ fontWeight: "bolder", fontSize: "25px", marginLeft: "-1px" }}>
            {post.title}
          </p>
          <div className="likes-comments-count d-flex ">
            <button
              className={`like-button ${liked ? "liked" : ""}`}
              onClick={handleLikeToggle}
              style={{ marginRight: "10px" }}
            >
              👍 {post.likes}
            </button>
            <button className="comments-button" onClick={scrollToComments}>
              💬 {comments.length}
            </button>
          </div>
        </div>
      </div>
      <figure className="figure text-center">
        <img
          src={viewImage || post.image || "https://pbs.twimg.com/media/GBMkWGbbUAA6zvs.jpg"}
          className="figure-img img-fluid rounded"
          alt="Post"
          style={{ width: "100%", height: "auto", aspectRatio: "16/9" }}
        />
        <figcaption className="figure-caption mt-4" style={{ fontSize: "20px" }}>
          {post.content}
        </figcaption>
      </figure>
      <div
        className="container commentBox p-3 d-flex justify-content-center align-items-center"
        style={{ gap: "20px" }}
      >
        <textarea
          rows="2"
          placeholder="Type your thoughts here..."
          value={input}
          className="comm"
          onChange={(e) => setInput(e.target.value)}
          style={{
            border: "1px solid rgba(0, 0, 0, 0.1)",
            width: "75%",
          }}
        ></textarea>
        <button
          className="btn btn-info"
          onClick={handleComment}
        >
          Comment
        </button>
      </div>
      <div
        ref={commentsRef}
        className="container d-flex flex-column my-5"
        style={{ gap: "20px" }}
      >
        {comments.map((comm, index) => (
          <div
            className="container"
            style={{
              border: "1px solid rgba(0, 0, 0, 0.1)",
              backgroundColor: "whitesmoke",
            }}
            key={index}
          >
            <div
              className="container commentBox p-2 d-flex align-items-center"
              style={{ border: "none" }}
            >
              <img
                src="https://pbs.twimg.com/media/GBMkWGbbUAA6zvs.jpg"
                className="img img-fluid"
                alt="User"
                style={{ borderRadius: "50%", width: "30px" }}
              />
              <p className="ml-2 mb-0" style={{ fontSize: "13px" }}>
                {comm.userName}
              </p>
              <span className="ml-2" style={{ fontSize: "13px" }}>
                {new Date(comm.createdAt).toLocaleDateString()}
              </span>
              <button
                disabled={!(userData._id === comm.userId)}
                onClick={() => handleDelete(comm._id)}
                style={{
                  marginLeft: "auto",
                  border: "none",
                  background: "none",
                }}
              >
                <img
                  src={deleteComment}
                  alt="deleteComment"
                  width={"20px"}
                  height={"20px"}
                />
              </button>
            </div>
            <div className="container">
              <p style={{ fontSize: "15px" }}>{comm.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostComponent;
