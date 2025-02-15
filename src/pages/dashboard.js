import { useState, useEffect } from "react";
import { auth, db } from "../utils/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        console.log("Logged-in User UID:", user.uid);  // ✅ Debug log

        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            console.log("Fetched User Data:", userSnap.data());  // ✅ Debug log
            setUserData(userSnap.data());
          } else {
            console.log("User data not found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="flex flex-col items-center p-10">
      <h1 className="text-3xl font-bold">User Dashboard</h1>
      {user ? (
        <div className="mt-4 text-center">
          <p><strong>Name:</strong> {userData?.name || "Not Available"}</p>
          <p><strong>Email:</strong> {userData?.email || "Not Available"}</p>
          {userData?.photo ? (
            <img src={userData.photo} alt="User Avatar" className="w-16 h-16 rounded-full mt-2" />
          ) : (
            <p>No Profile Image</p>
          )}
          <p><strong>Joined:</strong> {userData?.joined ? new Date(userData.joined.seconds * 1000).toDateString() : "Unknown"}</p>
          <button
            onClick={() => auth.signOut()}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Please sign in to view your dashboard.</p>
      )}
    </div>
  );
}
