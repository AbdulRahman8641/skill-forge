import { useState } from "react";
import { db } from "../utils/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function VerifyCertificate() {
  const [certId, setCertId] = useState("");
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState(null);

  const verifyCertificate = async () => {
    setCertData(null);
    setError(null);

    try {
      // 🔹 Query Firestore where "certificateId" matches user input
      const certCollection = collection(db, "certificates");
      const certQuery = query(certCollection, where("certificateId", "==", certId));
      const certSnapshot = await getDocs(certQuery);

      if (!certSnapshot.empty) {
        const certDoc = certSnapshot.docs[0].data(); // Get first matching document
        setCertData(certDoc);
      } else {
        setError("Certificate not found. Please check the ID.");
      }
    } catch (error) {
      console.error("🔥 Firestore Error:", error);
      setError("An error occurred while verifying the certificate.");
    }
  };

  return (
    <div className="flex flex-col items-center p-10">
      <h1 className="text-3xl font-bold">Certificate Verification</h1>
      <p className="text-lg mt-2">Enter a Certificate ID to verify its authenticity.</p>

      <input
        type="text"
        placeholder="Enter Certificate ID"
        value={certId}
        onChange={(e) => setCertId(e.target.value)}
        className="border p-2 mt-4 w-80 text-center"
      />

      <button
        onClick={verifyCertificate}
        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded"
      >
        Verify
      </button>

      {certData && (
        <div className="mt-6 p-4 border bg-gray-100">
          <h2 className="text-2xl font-semibold">Certificate Details</h2>
          <p><strong>Name:</strong> {certData.userName}</p>
          <p><strong>Course:</strong> {certData.course}</p>
          <p><strong>Score:</strong> {certData.score}%</p>
          <p><strong>Issued On:</strong> {new Date(certData.issuedDate).toDateString()}</p>
          <p><strong>Certificate ID:</strong> {certData.certificateId}</p>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
