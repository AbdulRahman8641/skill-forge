import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import { auth, db } from "../utils/firebaseConfig"; // Import Firestore
import { doc, setDoc } from "firebase/firestore"; // Firestore functions
import "./index.scss";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
  const playerRef = useRef(null);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState(""); // User input for playlist URL
  const [playlistId, setPlaylistId] = useState(""); // Extracted Playlist ID
  const [isApiLoaded, setIsApiLoaded] = useState(false); // Track API load status

  useEffect(() => {
    // Debugging: Check if YouTube API is loading
    console.log("Checking if YT API is available...", window.YT);

    if (window.YT && window.YT.Player) {
      setIsApiLoaded(true);
    } else {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        setIsApiLoaded(true);
        console.log("✅ YouTube API Loaded");
      };
    }
  }, []);

  useEffect(() => {
    if (!playlistId || !isApiLoaded) return;

    // Destroy previous player if exists
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    console.log("🎥 Creating YouTube Player for playlist:", playlistId);

    // Create a new YouTube player instance
    playerRef.current = new window.YT.Player("youtube-player", {
      height: "360",
      width: "640",
      playerVars: {
        listType: "playlist",
        list: playlistId,
        controls: 1,
        rel: 0,
      },
      events: {
        onReady: (event) => {
          console.log("✅ Player Ready");
          event.target.playVideo(); // Auto-play the first video
        },
        onStateChange: handleStateChange,
      },
    });
  }, [playlistId, isApiLoaded]);

  // Track when the last video of the playlist ends
  const handleStateChange = async (event) => {
    if (event.data === window.YT.PlayerState.ENDED) {
      const totalVideos = await getTotalVideos();
      const currentIndex = playerRef.current.getPlaylistIndex();

      if (currentIndex === totalVideos - 1) {
        setVideoCompleted(true);
        console.log("✅ All videos completed! Quiz unlocked.");
      }

      // Save watched video to Firestore
      saveWatchedVideo();
    }
  };

  // Function to save watched videos to Firestore
  const saveWatchedVideo = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.log("❌ User not logged in. Cannot save watched videos.");
      return;
    }

    const videoId = playerRef.current.getVideoData().video_id;
    const videoTitle = playerRef.current.getVideoData().title;

    try {
      const watchedRef = doc(db, "watchedVideos", user.uid);
      await setDoc(
        watchedRef,
        {
          videos: {
            [videoId]: { title: videoTitle, watched: true },
          },
        },
        { merge: true }
      );
      console.log("✅ Watched video saved:", videoTitle);
    } catch (error) {
      console.error("❌ Error saving watched video:", error);
    }
  };

  // Get total videos in the playlist
  const getTotalVideos = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(playerRef.current.getPlaylist()?.length || 0);
      }, 1000);
    });
  };

  // Function to extract Playlist ID from URL
  const extractPlaylistId = (url) => {
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  // Handle Playlist Search
  const handleSearch = async (e) => {
    e.preventDefault();
    const extractedId = extractPlaylistId(playlistUrl);
    if (!extractedId) {
      alert("Invalid Playlist URL. Please enter a valid YouTube playlist link.");
      return;
    }

    setPlaylistId(extractedId);
    console.log("✅ Loaded Playlist:", extractedId);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Navbar />
      <h1 className="text-4xl font-bold text-blue-600 mt-10">
        Welcome to Skill Forge 🚀
      </h1>
      <p className="text-lg text-gray-700 mt-4">
        Your self-learning verification platform.
      </p>

      {/* Playlist Search Box */}
      <form onSubmit={handleSearch} className="mt-6 flex space-x-4">
        <input
          type="text"
          placeholder="Enter YouTube Playlist URL..."
          className="px-4 py-2 border rounded-lg w-96"
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Load Playlist
        </button>
      </form>

      {/* YouTube Player */}
      <div className="player-wrapper mt-6">
        <div id="youtube-player"></div>
      </div>

      {/* Show Quiz Unlock Message if Last Video is Completed */}
      {videoCompleted && (
        <p className="quiz-message text-green-600 font-bold mt-4">
          ✅ All videos watched! Quiz unlocked.
        </p>
      )}
    </div>
  );
}
