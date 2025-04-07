import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import Courses from "../../forms/courses";

const treatments = {
    T1: { label: "Treatment Level 1", description: "Free-Labeling (Local/In-group)" },
    T2: { label: "Treatment Level 2", description: "Free-Labeling (Foreign/Out-group)" },
    T3: { label: "Treatment Level 3", description: "Discrete Emotion (Local/In-group)" },
    T4: { label: "Treatment Level 4", description: "Discrete Emotion (Foreign/Out-group)" },
};

const findCourseName = (code) => {
    for (const college of Courses) {
        const course = college.courses.find(c => c.code === code);
        if (course) return course.name;
    }
    return "Unknown";
};

const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleString(undefined, options);
}

const questionData = [
    { questionId: 1, srcLocal: "/images/local1.jpg", srcForeign: "/images/foreign1.jpg", answer: "Happiness" },
    { questionId: 2, srcLocal: "/images/local2.jpg", srcForeign: "/images/foreign2.jpg", answer: "Disgust" },
    { questionId: 3, srcLocal: "/images/local3.jpg", srcForeign: "/images/foreign3.jpg", answer: "Surprise" },
    { questionId: 4, srcLocal: "/images/local4.jpg", srcForeign: "/images/foreign4.jpg", answer: "Fear" },
    { questionId: 5, srcLocal: "/images/local5.jpg", srcForeign: "/images/foreign5.jpg", answer: "Anger" },
    { questionId: 6, srcLocal: "/images/local6.jpg", srcForeign: "/images/foreign6.jpg", answer: "Surprise" },
    { questionId: 7, srcLocal: "/images/local7.jpg", srcForeign: "/images/foreign7.jpg", answer: "Sadness" },
    { questionId: 8, srcLocal: "/images/local8.jpg", srcForeign: "/images/foreign8.jpg", answer: "Sadness" },
    { questionId: 9, srcLocal: "/images/local9.jpg", srcForeign: "/images/foreign9.jpg", answer: "Disgust" },
    { questionId: 10, srcLocal: "/images/local10.jpg", srcForeign: "/images/foreign10.jpg", answer: "Happiness" },
    { questionId: 11, srcLocal: "/images/local11.jpg", srcForeign: "/images/foreign11.jpg", answer: "Fear" },
    { questionId: 12, srcLocal: "/images/local12.jpg", srcForeign: "/images/foreign12.jpg", answer: "Anger" },
];

const Response = ({ respondent, isMobile }) => {
    const navigate = useNavigate();
    const [responses, setResponses] = useState([]);

    useEffect(() => {
        const fetchResponses = async () => {
            const db = getFirestore();

            try {
                const formResponsesRef = collection(db, "formResponses");
                const q = query(
                    formResponsesRef,
                    where("name", "==", respondent.name.trim()),
                    where("yearLevel", "==", respondent.yearLevel),
                    where("course", "==", respondent.course)
                );

                const querySnapshot = await getDocs(q);
                const fetchedResponses = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setResponses(fetchedResponses[0]);
            } catch (error) {
                console.error("Error fetching data:", error);
                navigate("/not-found");
            }
        };

        fetchResponses();
    }, [navigate]);

    if (!respondent) {
        return <div>No respondent data available.</div>;
    }

    return (
        <div className="response-page">
            <h2>Respondent Details</h2>
            <div className="response-details-container">
                <div className="respondent-details">
                    <div className="left-side">
                        <p style={{ fontSize: "larger" }}>{respondent.name}</p>
                        <p>{findCourseName(respondent.course)} - {respondent.yearLevel}{respondent.section}</p>
                    </div>
                    <div className="right-side">
                        <p>{treatments[respondent.treatmentLevel]?.label || "Unknown"} - {treatments[respondent.treatmentLevel]?.description || ""}</p>
                        <p>{formatDateTime(responses?.submittedAt)}</p>
                    </div>
                </div>
                {isMobile && <h2>Responses</h2>}
                <div className="responses">
                    <table className="response-table">
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Image</th>
                                <th>Answer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questionData.map((question) => {
                                const questionId = question.questionId;
                                let answer = "No answer";
                                let score = "N/A";

                                if (respondent.treatmentLevel === "T1" || respondent.treatmentLevel === "T2") {
                                    answer = responses?.responses?.[questionId] || "No answer";
                                    score = responses?.scores?.[questionId - 1] ?? "N/A";
                                } else {
                                    const answerObj = responses?.responses?.find((item) => item.questionId === questionId);
                                    answer = answerObj?.response || "No answer";
                                    score = responses?.scores?.[questionId - 1] ?? "N/A";
                                }

                                const imageSrc =
                                    respondent.treatmentLevel === "T1" || respondent.treatmentLevel === "T3"
                                        ? question.srcLocal
                                        : question.srcForeign;

                                return (
                                    <tr key={questionId}>
                                        <td>{questionId}</td>
                                        <td>
                                            <img style={{ height: "100px" }} src={imageSrc} alt={`Question ${questionId}`} />
                                        </td>
                                        <td>{answer}<br></br><strong>Score: </strong>{score}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Response;