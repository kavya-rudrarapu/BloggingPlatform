import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/newpost.css";

const NewPostComponent = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [opt, setOpt] = useState([]);
  const token = JSON.parse(localStorage.getItem("token")).token;
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const validate = () => {
    const titleRegex = /^.{2,50}$/;
    const contentRegex = /^.{5,2000}$/;
    const imageRegex = /\.(jpg|jpeg|png)$/i;

    if (!title) {
      setError("*Title must be provided.");
      return false;
    } else if (!titleRegex.test(title)) {
      setError("*Title must be between 2 and 50 characters.");
      return false;
    }

    if (!content) {
      setError("*Content must be provided.");
      return false;
    } else if (!contentRegex.test(content)) {
      setError("*Content must be between 5 and 2000 characters.");
      return false;
    }

    if (image && !imageRegex.test(image.name)) {
      setError("*Image must be a jpg, jpeg, or png file.");
      return false;
    }

    if (!category) {
      setError("*Category must be selected.");
      return false;
    }

    setError("");
    return true;
  };

  const options = async () => {
    try {
      const response = await axios.get("http://localhost:2000/api/categories/");
      setOpt(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    options();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("tags", tags.split(","));
        formData.append("category", category);
        formData.append("createdAt", new Date().toISOString().split("T")[0]);
        if (image) formData.append("image", image);

        await axios.post(
          `http://localhost:2000/api/posts`,
          formData,
          config
        );
        navigate("/home");
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className="new-post-container" style={{backgroundColor:"whitesmoke"}}>
      <div className="container">
        <h2 className="title-header" style={{ color: "hsl(256,26%,52%)" }}>
          Create a New Post
        </h2>
        <select
          className="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{border:"0.5px solid black",borderRadius:"10px"}}
        >
          <option value="">Select a category</option>
          {opt.map((option) => (
            <option key={option.name} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
        <br/>
        <br/>
        <input
          placeholder="Write the title of your post..."
          type="text"
          className="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{border:"0.5px solid black",borderRadius:"10px"}}
        />
        <br/>
        <br/>
        <textarea
          placeholder="Write the content of your post..."
          className="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{border:"0.5px solid black",borderRadius:"10px"}}
        />
        <br/>
        <br/>
        <input
          placeholder="Add tags (separated by commas)..."
          type="text"
          className="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          style={{border:"0.5px solid black",borderRadius:"10px"}}
        />
        <br/>
        <br/>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={{border:"0.5px solid black",borderRadius:"10px"}}
        />
        <br/>
        <br/>
        <button
          className="submit-btn"
          onClick={handlePost}
          style={{ marginBottom: "10px" }}
        >
          Add Post
        </button>
        {error && (
          <div
            className="error"
            style={{
              color: "red",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewPostComponent;
