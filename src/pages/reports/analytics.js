import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

const TREATMENT_LEVELS = ["T1", "T2", "T3", "T4"];
const QUESTION_COUNT = 12;
const QUESTION_DATA_LOCAL = [
    { questionId: 1, src: "/images/local1.jpg", correctAnswer: "Happiness" },
    { questionId: 2, src: "/images/local2.jpg", correctAnswer: "Disgust" },
    { questionId: 3, src: "/images/local3.jpg", correctAnswer: "Surprised" },
    { questionId: 4, src: "/images/local4.jpg", correctAnswer: "Fear" },
    { questionId: 5, src: "/images/local5.jpg", correctAnswer: "Anger" },
    { questionId: 6, src: "/images/local6.jpg", correctAnswer: "Surprised" },
    { questionId: 7, src: "/images/local7.jpg", correctAnswer: "Sadness" },
    { questionId: 8, src: "/images/local8.jpg", correctAnswer: "Sadness" },
    { questionId: 9, src: "/images/local9.jpg", correctAnswer: "Disgust" },
    { questionId: 10, src: "/images/local10.jpg", correctAnswer: "Happiness" },
    { questionId: 11, src: "/images/local11.jpg", correctAnswer: "Fear" },
    { questionId: 12, src: "/images/local12.jpg", correctAnswer: "Anger" },
]
const QUESTION_DATA_FOREIGN = [
    { questionId: 1, src: "/images/foreign1.jpg", correctAnswer: "Happiness" },
    { questionId: 2, src: "/images/foreign2.jpg", correctAnswer: "Disgust" },
    { questionId: 3, src: "/images/foreign3.jpg", correctAnswer: "Surprised" },
    { questionId: 4, src: "/images/foreign4.jpg", correctAnswer: "Fear" },
    { questionId: 5, src: "/images/foreign5.jpg", correctAnswer: "Anger" },
    { questionId: 6, src: "/images/foreign6.jpg", correctAnswer: "Surprised" },
    { questionId: 7, src: "/images/foreign7.jpg", correctAnswer: "Sadness" },
    { questionId: 8, src: "/images/foreign8.jpg", correctAnswer: "Sadness" },
    { questionId: 9, src: "/images/foreign9.jpg", correctAnswer: "Disgust" },
    { questionId: 10, src: "/images/foreign10.jpg", correctAnswer: "Happiness" },
    { questionId: 11, src: "/images/foreign11.jpg", correctAnswer: "Fear" },
    { questionId: 12, src: "/images/foreign12.jpg", correctAnswer: "Anger" },
]

const Analytics = ({ useScreenSize }) => {
    const isMobile = useScreenSize();

    const [respondentCounts, setRespondentCounts] = useState({});
    const [responsesData, setResponsesData] = useState({});
    const [selectedTreatment, setSelectedTreatment] = useState("T1");
    const [selectedQuestion, setSelectedQuestion] = useState(0);

    useEffect(() => {
        const fetchResponses = async () => {
            const db = getFirestore();
            const responsesRef = collection(db, "formResponses");
            const snapshot = await getDocs(responsesRef);

            let responseMap = {};
            let counts = {};

            TREATMENT_LEVELS.forEach((level) => {
                responseMap[level] = Array.from({ length: QUESTION_COUNT }, () => ({
                    exact: 0,
                    similar: 0,
                    unrelated: 0,
                    correct: 0,
                    incorrect: 0,
                }));
                counts[level] = 0;
            });

            snapshot.forEach((doc) => {
                const data = doc.data();
                const treatmentLevel = data.treatmentlevel;

                if (TREATMENT_LEVELS.includes(treatmentLevel) && data.scores && data.responses) {
                    counts[treatmentLevel] += 1;

                    data.scores.forEach((score, index) => {
                        if (treatmentLevel === "T1" || treatmentLevel === "T2") {
                            if (score === 1) {
                                responseMap[treatmentLevel][index].exact++;
                            } else if (score === 0.5) {
                                responseMap[treatmentLevel][index].similar++;
                            } else {
                                responseMap[treatmentLevel][index].unrelated++;
                            }
                        } else {
                            if (score === 1) {
                                responseMap[treatmentLevel][index].correct++;
                            } else {
                                responseMap[treatmentLevel][index].incorrect++;
                            }
                        }
                    });
                }
            });

            console.log("Response map:", responseMap);

            setResponsesData(responseMap);
            setRespondentCounts(counts);
        };

        fetchResponses();
    }, []);

    const chartData = responsesData[selectedTreatment]?.[selectedQuestion] || {
        exact: 0,
        similar: 0,
        unrelated: 0,
        correct: 0,
        incorrect: 0,
    };

    const labels =
        selectedTreatment === "T1" || selectedTreatment === "T2"
            ? ["Exact", "Similar", "Unrelated"]
            : ["Correct", "Incorrect"];

    const data =
        selectedTreatment === "T1" || selectedTreatment === "T2"
            ? [chartData.exact, chartData.similar, chartData.unrelated]
            : [chartData.correct, chartData.incorrect];

    const questionData =
        selectedTreatment === "T1" || selectedTreatment === "T3"
            ? QUESTION_DATA_LOCAL
            : QUESTION_DATA_FOREIGN;

    const selectedQuestionData = questionData[selectedQuestion];

    return (
        <div className="card" id="responses-card">
            <div className="card-header">
                <h2 className="card-title">Responses</h2>
            </div>

            {isMobile
                ? <div className="mobile-dropdowns">
                    <label>
                        <strong>Select Treatment Level:</strong>
                        <select
                            value={selectedTreatment}
                            onChange={(e) => setSelectedTreatment(e.target.value)}
                        >
                            {TREATMENT_LEVELS.map((level) => (
                                <option key={level} value={level}>
                                    {`Treatment Level ${level.slice(1)} - ${respondentCounts[level] || 0} ${respondentCounts[level] === 1 ? "response" : "responses"}`}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        <strong>Select Question:</strong>
                        <select
                            value={selectedQuestion}
                            onChange={(e) => setSelectedQuestion(Number(e.target.value))}
                        >
                            {Array.from({ length: QUESTION_COUNT }, (_, i) => (
                                <option key={i} value={i}>
                                    {`Question ${i + 1}`}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                : <>
                    <div className="tabs">
                        {TREATMENT_LEVELS.map((level) => (
                            <button
                                key={level}
                                className={selectedTreatment === level ? "active" : ""}
                                onClick={() => setSelectedTreatment(level)}
                            >
                                {`Treatment Level ${level.slice(1)} - ${respondentCounts[level] || 0} ${respondentCounts[level] === 1 ? "response" : "responses"}`}
                            </button>
                        ))}
                    </div>

                    <div className="tabs">
                        {Array.from({ length: QUESTION_COUNT }, (_, i) => (
                            <button
                                key={i}
                                className={selectedQuestion === i ? "active" : ""}
                                onClick={() => setSelectedQuestion(i)}
                            >
                                {`Question ${i + 1}`}
                            </button>
                        ))}
                    </div>
                </>}
            <div className="question-report">
                <div className="question-info">
                    <h3><strong>What do you think this person is feeling?</strong></h3>
                    <img className="stimulus-img" src={selectedQuestionData.src} alt="Stimulus" />
                    <p style={{ textAlign: "center" }}><strong>Correct Answer:</strong> {selectedQuestionData.correctAnswer}</p>
                </div>
                <div className="chart-container">
                    <div style={isMobile ? { width: "200px", height: "200px" } : { width: "300px", height: "300px" }}>
                        <Pie
                            data={{
                                labels: labels,
                                datasets: [
                                    {
                                        data: data,
                                        backgroundColor: selectedTreatment === "T1" || selectedTreatment === "T2"
                                            ? ["#4CAF50", "#FFC107", "#F44336"]
                                            : ["#4CAF50", "#F44336"],
                                    },
                                ],
                            }}
                        />
                    </div>

                    <div className="response-counts">
                        {selectedTreatment === "T1" || selectedTreatment === "T2" ? (
                            <>
                                <p><strong>Exact:</strong> {chartData.exact}</p>
                                <p><strong>Similar:</strong> {chartData.similar}</p>
                                <p><strong>Unrelated:</strong> {chartData.unrelated}</p>
                            </>
                        ) : (
                            <>
                                <p><strong>Correct:</strong> {chartData.correct}</p>
                                <p><strong>Incorrect:</strong> {chartData.incorrect}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
