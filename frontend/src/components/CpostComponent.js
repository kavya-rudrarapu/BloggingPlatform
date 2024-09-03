import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/home.css';
import 'font-awesome/css/font-awesome.min.css';

const CpostComponent = ({ category }) => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [authors, setAuthors] = useState({});
    const [like, setLike] = useState({});
    const [postImages, setPostImages] = useState({});

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

    const handlePosts = (id) => {
        navigate(`/post/${id}`);
    };

    useEffect(() => {
        console.log('Category:', category);
        const storedPosts = localStorage.getItem(`posts-${category}`);
        if (storedPosts) {
            try {
                const posts = JSON.parse(storedPosts);
                setData(posts);

                const userIds = posts.map(post => post.userId);
                Promise.all(userIds.map(id => axios.get(`http://localhost:2000/api/users/${id}`)))
                    .then(userResponses => {
                        const authorsMap = userResponses.reduce((acc, { data }, index) => {
                            acc[userIds[index]] = data;
                            return acc;
                        }, {});
                        setAuthors(authorsMap);
                    })
                    .catch(err => console.log('Error fetching users:', err));

                const likeStates = posts.reduce((acc, post) => {
                    acc[post._id] = post.likedByUser;
                    return acc;
                }, {});
                setLike(likeStates);

                fetchPostImages(posts);
            } catch (err) {
                console.log('Error parsing local storage data:', err);
                fetchData();
            }
        } else {
            fetchData();
        }
    }, [category]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:2000/api/categories/${category}`);
            const posts = response.data;

            localStorage.setItem(`posts-${category}`, JSON.stringify(posts));
            setData(posts);

            const userIds = posts.map(post => post.userId);
            const userResponses = await Promise.all(userIds.map(id => axios.get(`http://localhost:2000/api/users/${id}`)));
            const authorsMap = userResponses.reduce((acc, { data }, index) => {
                acc[userIds[index]] = data;
                return acc;
            }, {});
            setAuthors(authorsMap);

            const likeStates = posts.reduce((acc, post) => {
                acc[post._id] = post.likedByUser;
                return acc;
            }, {});
            setLike(likeStates);

            fetchPostImages(posts);
        } catch (err) {
            console.log('Error fetching data:', err);
        }
    };

    const fetchPostImages = async (posts) => {
        try {
            const imagePromises = posts.map(async (post) => {
                if (post.image) {
                    const imageResponse = await axios.get(`http://localhost:2000/api/posts/image`, {
                        params: { id: post.image },
                        responseType: 'blob'
                    });
                    const blob = new Blob([imageResponse.data], { type: imageResponse.data.type || 'image/jpeg' });
                    const urlImage = URL.createObjectURL(blob);
                    return { id: post._id, url: urlImage };
                }
                return { id: post._id, url: "" };
            });

            const images = await Promise.all(imagePromises);
            const imageMap = images.reduce((acc, { id, url }) => {
                acc[id] = url;
                return acc;
            }, {});
            setPostImages(imageMap);
        } catch (err) {
            console.log('Error fetching images:', err);
        }
    };

    const getPostImage = (postId) => {
        const postImage = postImages[postId];
        if (postImage) return postImage;

        const postCategory = data.find(post => post._id === postId)?.category.toLowerCase();
        return categoryImages[postCategory] || "";
    };

    const handleLike = async (id) => {
        try {
            if (like[id]) {
                await axios.post(`http://localhost:2000/api/posts/unlike/${id}`);
                setLike(prevLike => ({ ...prevLike, [id]: false }));
            } else {
                await axios.post(`http://localhost:2000/api/posts/like/${id}`);
                setLike(prevLike => ({ ...prevLike, [id]: true }));
            }

            const updatedPosts = data.map(post => post._id === id
                ? { ...post, likedByUser: !like[id], likes: post.likes + (like[id] ? -1 : 1) }
                : post
            );
            localStorage.setItem(`posts-${category}`, JSON.stringify(updatedPosts));
            setData(updatedPosts);
        } catch (err) {
            console.log('Error handling like:', err);
        }
    };

    const getAuthorAvatar = (authorId) => {
        const author = authors[authorId];
        if (author && author.avatar) {
            return author.avatar;
        }
        return "https://pbs.twimg.com/media/GBMkWGbbUAA6zvs.jpg";
    };

    return (
        <div className="content-section">
            <div className="all-posts">
                <h2>{category}</h2>
                <div className="posts-container">
                    {data.length === 0 ? (
                        <p>No posts available.</p>
                    ) : (
                        data.map((post, index) => (
                            <div
                                className="card"
                                key={index}
                                onClick={() => handlePosts(post._id)}
                            >
                                <div
                                    className="card-image"
                                    style={{
                                        backgroundImage: `url(${getPostImage(post._id)})`,
                                    }}
                                >
                                    {!post.image && (
                                        <img
                                            src={getPostImage(post._id)}
                                            alt="Post"
                                            width={"100%"}
                                            height={"100%"}
                                        />
                                    )}
                                </div>
                                <div className="card-details">
                                    <div className="card-title">{post.title}</div>
                                    <div className="card-description">
                                        {post.content.substring(0, 100)}...
                                    </div>
                                    {authors[post.userId] && (
                                        <div className="card-author">
                                            <img
                                                src={getAuthorAvatar(post.userId)}
                                                alt="author-avatar"
                                                className="author-avatar"
                                            />
                                            <span>{authors[post.userId].username}</span>
                                        </div>
                                    )}
                                    <div className="card-actions">
                                        <button className="btn like-button" onClick={() => handleLike(post._id)}>
                                            <i className={`fa ${like[post._id] ? 'fa-heart' : 'fa-heart-o'} icon fa-lg`}> {post.likes}</i>
                                        </button>
                                        <button className="btn comment-button">
                                            <i className="fa fa-comment fa-lg icon1"> {post.comments.length}</i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CpostComponent;
