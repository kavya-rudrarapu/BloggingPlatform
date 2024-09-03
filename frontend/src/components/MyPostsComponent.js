import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "font-awesome/css/font-awesome.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../css/home.css"; // Reuse the CSS file

const categoryImages = {
  travel: "https://e0.pxfuel.com/wallpapers/298/983/desktop-wallpaper-travel-around-world-travel-laptop-background-travel-and-tourism.jpg",
  food: "https://static.vecteezy.com/system/resources/thumbnails/021/939/720/small_2x/fast-food-set-hamburger-cheeseburger-cola-french-fries-burger-and-hamburger-ai-photo.jpg",
  health: "https://etimg.etb2bimg.com/thumb/103580468.cms?width=400&height=300",
  music: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEuhMn5PzmvIhYOtIO_pi73wgB_yH5L9IjOg&s",
  fitness: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbfDAWy8FhkWk5-3",
  motivation: "https://www.usatoday.com/gcdn/authoring/images/motleyfool/2023/11/05/U",
  others: "https://i.pngimg.me/thumb/f/720/comdlpng6938797.jpg",
  study: "https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg?cs=sr",
  cooking: "https://www.justwords.in/blog/wp-content/uploads/2020/10/indian-food-i"
};

export default function MyPostsComponent({ searchQuery, setUserData }) {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [postId, setPostId] = useState("");
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserDataState] = useState(null);
  const [postImages, setPostImages] = useState({}); // State for images

  const navigate = useNavigate();

  // Retrieve and set user data from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserDataState(user);
      setUserData(user); // Update parent component or global state if needed
    }
  }, [setUserData]);

  // Fetch posts when userData changes
  useEffect(() => {
    if (userData?._id) {
      fetch(`http://localhost:2000/api/posts/post/${userData._id}`)
        .then((response) => response.json())
        .then((data) => {
          setPosts(data.myposts);
          fetchPostImages(data.myposts); // Fetch images for the posts
        })
        .catch((error) => console.error("Error fetching posts:", error));
    }
  }, [userData, isEditing]);

  const fetchPostImages = async (posts) => {
    try {
      const imagePromises = posts.map(async (post) => {
        if (post.image) {
          const imageResponse = await fetch(`http://localhost:2000/api/posts/image?id=${post.image}`);
          const blob = await imageResponse.blob();
          const urlImage = URL.createObjectURL(blob);
          return { id: post._id, url: urlImage };
        }
        return { id: post._id, url: categoryImages[post.category.toLowerCase()] || "https://example.com/default-image.jpg" }; // Default to category image
      });

      const images = await Promise.all(imagePromises);
      const imageMap = images.reduce((acc, { id, url }) => {
        acc[id] = url;
        return acc;
      }, {});
      setPostImages(imageMap);
    } catch (err) {
      console.error('Error fetching images:', err);
    }
  };

  const handlePosts = (id) => {
    navigate(`/post/${id}`);
  };

  const handleEditClick = (post) => {
    setIsEditing(true);
    setPostId(post._id);
  };

  const handleCloseClick = () => {
    setIsEditing(false);
  };

  const handleEdit = (post) => {
    setTitle(post.title);
    setContent(post.content);
    handleEditClick(post);
  };

  const handleSaveClick = () => {
    fetch(`http://localhost:2000/api/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    })
      .then((response) => response.json())
      .then((data) => {
        setIsEditing(false);
        // Optionally, you could re-fetch posts or update the state directly here
      })
      .catch((error) => console.error("Error updating post:", error));
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:2000/api/posts/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then(() => {
        setPosts(posts.filter((post) => post._id !== id));
      })
      .catch((error) => console.error("Error deleting post:", error));
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPostImage = (postId) => {
    return postImages[postId] || "https://example.com/default-image.jpg"; // Default image URL
  };

  return (
    <>
      <div className="content-section">
        <div className="all-posts">
          <h2>My Posts</h2>
          <div className="posts-container">
            {filteredPosts.map((post, index) => (
              <div className="card" key={index}>
                <div
                  className="card-image"
                  style={{
                    backgroundImage: `url(${getPostImage(post._id)})`,
                  }}
                >
                  <div className="card-category">{post.category}</div>
                </div>
                <div className="card-details">
                  <div className="card-title">{post.title}</div>
                  <div className="card-description">
                    {post.content.substring(0, 100)}...
                  </div>
                  
                  <div className="card-actions">
                    <button className="styled-button" onClick={() => handlePosts(post._id)}>
                      Read More
                    </button>
                    <br />
                    <button className="styled-button">
                      <i className="fa fa-heart"> {post.likes}</i>
                    </button>
                    <button className="styled-button">
                      <i className="fa fa-regular fa-comment fa-lg icon1">
                        &nbsp;{post.comments.length}
                      </i>
                    </button>
                    <button className="styled-button" onClick={() => handleEdit(post)}>
                      <i className="fas fa-pen-to-square fa-lg"></i>
                    </button>
                    <button className="styled-button" onClick={() => handleDelete(post._id)}>
                      <i className="fas fa-trash-alt fa-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isEditing && (
        <>
          <div className="blur-background" onClick={handleCloseClick}></div>
          <div className="modal-container">
            <button onClick={handleCloseClick} className="close-button">
              <i className="fa fa-thin fa-xmark fa-lg"></i>
            </button>
            <br />
            <input
              placeholder="Write the title of your post..."
              type="text"
              className="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <br />
            <br />
            <textarea
              placeholder="Write the content of your post..."
              className="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <br />
            <center>
              <button onClick={handleSaveClick} className="save-button">
                Save
              </button>
            </center>
          </div>
        </>
      )}
    </>
  );
}
