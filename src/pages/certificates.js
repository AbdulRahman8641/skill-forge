import { useEffect, useState } from "react";
import { auth, db } from "../utils/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // Generates unique certificate ID
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Certificate() {
  const [user, setUser] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [issuedDate, setIssuedDate] = useState(null);
  const [course, setCourse] = useState("Java Basics"); // Course Name

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log("User not authenticated.");
          return;
        }

        setUser(currentUser);
        console.log("✅ User Found:", currentUser.uid);

        // ✅ Fetch user's latest certificate
        const certRef = doc(db, "certificates", currentUser.uid);
        const certSnap = await getDoc(certRef);

        if (certSnap.exists()) {
          console.log("✅ Certificate Found:", certSnap.data());
          setCertificate(certSnap.data());
          setIssuedDate(certSnap.data().issuedDate);
        } else {
          console.log("❌ No Certificate Found. Generating New One...");

          const resultRef = doc(db, "results", currentUser.uid);
          const resultSnap = await getDoc(resultRef);

          if (!resultSnap.exists()) {
            console.log("❌ No result data found for this user.");
            return;
          }

          const userScore = resultSnap.data().score;
          if (userScore < 70) {
            console.log("❌ User did not pass. No certificate generated.");
            return;
          }

          const certificateId = `cert_${uuidv4().slice(0, 8)}`;
          const issuedAt = new Date().toISOString();
          setIssuedDate(issuedAt);

          const newCertificate = {
            userId: currentUser.uid,
            userName: currentUser.displayName,
            course: course,
            score: userScore,
            certificateId: certificateId,
            issuedDate: issuedAt,
          };

          await setDoc(certRef, newCertificate);
          console.log("🎉 Certificate Stored Successfully:", certificateId);
          setCertificate(newCertificate);
        }
      } catch (error) {
        console.error("🔥 Firestore Error:", error);
      }
    };

    fetchCertificate();
  }, []);

  const downloadCertificate = () => {
    const certificateElement = document.getElementById("certificate");
    html2canvas(certificateElement).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape");
      pdf.addImage(imgData, "PNG", 10, 10, 270, 190);
      pdf.save(`Certificate_${certificate.certificateId}.pdf`);
    });
  };

  if (!user) return <p className="text-center p-10">Please log in to view your certificate.</p>;

  return (
    <div className="flex flex-col items-center p-10">
      {certificate ? (
        <div id="certificate" className="border p-8 bg-gray-100 shadow-lg text-center w-2/3">
          <h1 className="text-3xl font-bold">Certificate of Achievement</h1>
          <p className="text-xl mt-4">This is to certify that</p>
          <h2 className="text-2xl font-semibold mt-2">{certificate.userName}</h2>
          <p className="mt-4">has successfully completed the course</p>
          <h2 className="text-2xl font-bold mt-2">{certificate.course}</h2>
          <p className="mt-4">with a score of <strong>{certificate.score}%</strong></p>
          <p className="mt-4"><strong>Certificate ID:</strong> {certificate.certificateId}</p>
          <p className="mt-4"><strong>Issued on:</strong> {new Date(certificate.issuedDate).toDateString()}</p>
          <p className="mt-4">Congratulations!</p>
        </div>
      ) : (
        <p className="text-xl text-red-500 mt-6">No certificate available. Please complete an assessment.</p>
      )}

      {certificate && (
        <button
          onClick={downloadCertificate}
          className="mt-6 bg-green-500 text-white px-6 py-2 rounded"
        >
          Download Certificate
        </button>
      )}
    </div>
  );
}
