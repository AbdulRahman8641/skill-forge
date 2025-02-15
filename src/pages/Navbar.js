import Link from "next/link";
import { signInWithGoogle, auth } from "../utils/firebaseConfig"; // ✅ Correct import path
import { useState, useEffect } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);

  return (
    <nav className="flex justify-between p-4 bg-gray-200">
      <div className="flex gap-4">
        <Link href="/" className="text-blue-500">Home</Link>
        <Link href="/dashboard" className="text-blue-500">Dashboard</Link>
        <Link href="/assessment" className="text-blue-500">Assessment</Link>
        <Link href="/certificates" className="text-blue-500">Certificates</Link>
        <Link href="/verify" className="text-blue-500">Verify Certificate</Link>
      </div>
      {user ? (
        <div className="flex gap-4 items-center">
          <p>Welcome, {user.displayName}!</p>
          <img src={user.photoURL} alt="User Avatar" className="w-8 h-8 rounded-full" />
          <button
            onClick={() => auth.signOut()}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Sign In with Google
        </button>
      )}
    </nav>
  );
}
