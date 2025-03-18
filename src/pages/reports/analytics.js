import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import * as XLSX from "xlsx";

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

const Analytics = ({ useScreenSize, }) => {
    const isMobile = useScreenSize();

    const [respondentCounts, setRespondentCounts] = useState({});
    const [responsesData, setResponsesData] = useState({});
    const [excelResponseData, setExcelResponseData] = useState({});
    const [selectedTreatment, setSelectedTreatment] = useState("T1");
    const [selectedQuestion, setSelectedQuestion] = useState(0);

    useEffect(() => {
        const fetchResponses = async () => {
            const db = getFirestore();
            const responsesRef = collection(db, "formResponses");
            const snapshot = await getDocs(responsesRef);

            let responseMap = {};
            let counts = {};
            let excelData = {};

            TREATMENT_LEVELS.forEach((level) => {
                responseMap[level] = Array.from({ length: QUESTION_COUNT }, () => ({
                    exact: 0,
                    similar: 0,
                    unrelated: 0,
                    correct: 0,
                    incorrect: 0,
                }));
                counts[level] = 0;
                excelData[level] = {};
            });

            const participantCounters = {};

            snapshot.forEach((doc) => {
                const data = doc.data();
                const treatmentLevel = data.treatmentlevel;
                if (!participantCounters[treatmentLevel]) {
                    participantCounters[treatmentLevel] = 1;
                }
                const participantId = `P${String(participantCounters[treatmentLevel]++).padStart(2, "0")}`;

                if (TREATMENT_LEVELS.includes(treatmentLevel) && data.scores && data.responses) {
                    counts[treatmentLevel] += 1;

                    if (!excelData[treatmentLevel][participantId]) {
                        excelData[treatmentLevel][participantId] = Array(QUESTION_COUNT).fill("");
                    }

                    data.scores.forEach((score, index) => {
                        if (treatmentLevel === "T1" || treatmentLevel === "T2") {
                            if (score === 1) {
                                responseMap[treatmentLevel][index].exact++;
                                excelData[treatmentLevel][participantId][index] = "1";
                            } else if (score === 0.5) {
                                responseMap[treatmentLevel][index].similar++;
                                excelData[treatmentLevel][participantId][index] = "0.5";
                            } else {
                                responseMap[treatmentLevel][index].unrelated++;
                                excelData[treatmentLevel][participantId][index] = "0";
                            }
                        } else {
                            if (score === 1) {
                                responseMap[treatmentLevel][index].correct++;
                                excelData[treatmentLevel][participantId][index] = "1";
                            } else {
                                responseMap[treatmentLevel][index].incorrect++;
                                excelData[treatmentLevel][participantId][index] = "0";
                            }
                        }
                    });
                }
            });


            setResponsesData(responseMap);
            setRespondentCounts(counts);

            setExcelResponseData(excelData);
        };

        fetchResponses();
    }, []);

    const exportToExcel = () => {
        try {
            if (!responsesData || Object.keys(responsesData).length === 0) {
                alert("No data to export.");
                return;
            }

            let data = [];

            let headerRow1 = ["Participant"];
            let headerRow2 = [""];

            for (let i = 0; i < QUESTION_COUNT; i++) {
                headerRow1.push(`Item ${i + 1}`, "", "", "");
                headerRow2.push("T1", "T2", "T3", "T4");
            }

            data.push(headerRow1);
            data.push(headerRow2);

            for (let i = 1; i <= 45; i++) {
                let participantId = `P${String(i).padStart(2, "0")}`;
                let row = [participantId];
                
                for (let q = 0; q < QUESTION_COUNT; q++) {
                    for (let t = 0; t < TREATMENT_LEVELS.length; t++) {
                        const treatment = TREATMENT_LEVELS[t];
                        let score = "";
                        
                        if (excelResponseData[treatment] && 
                            excelResponseData[treatment][participantId] && 
                            excelResponseData[treatment][participantId][q] !== undefined) {
                            score = excelResponseData[treatment][participantId][q];
                        }
                        
                        row.push(score);
                    }
                }
                
                data.push(row);
            }

            let f1Row = ["F1 score"];
            for (let q = 0; q < QUESTION_COUNT; q++) {
                for (let t = 0; t < TREATMENT_LEVELS.length; t++) {
                    f1Row.push({ f: "" });
                }
            }
            data.push(f1Row);

            const ws = XLSX.utils.aoa_to_sheet(data);

            ws['!merges'] = [];
            ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 1, c: 0 } });

            for (let i = 0; i < QUESTION_COUNT; i++) {
                ws['!merges'].push({ s: { r: 0, c: 1 + i * 4 }, e: { r: 0, c: 4 + i * 4 } });
            }

            const f1RowIndex = data.length - 1;
            for (let q = 0; q < QUESTION_COUNT; q++) {
                for (let t = 0; t < TREATMENT_LEVELS.length; t++) {
                    const col = 1 + q * 4 + t;
                    const colLetter = XLSX.utils.encode_col(col);
                    const startRow = 2;
                    const endRow = f1RowIndex - 1;
                    
                    const formula = `=(2 * ((COUNTIF(${colLetter}${startRow + 1}:${colLetter}${endRow + 1}, 1)) / ((COUNTIF(${colLetter}${startRow + 1}:${colLetter}${endRow + 1}, 1) + (COUNTIF(${colLetter}${startRow + 1}:${colLetter}${endRow + 1}, 0.5))))) * ((COUNTIF(${colLetter}${startRow + 1}:${colLetter}${endRow + 1}, 1)) / ((COUNTIF(${colLetter}${startRow + 1}:${colLetter}${endRow + 1}, 1) + (COUNTIF(${colLetter}${startRow + 1}:${colLetter}${endRow + 1}, 0)))))) / (((COUNTIF(${colLetter}${startRow + 1}:${colLetter}${endRow + 1}, 1)) / ((COUNTIF(${colLetter}${startRow + 1}:${colLetter}${endRow + 1}, 1) + (COUNTIF(${colLetter}${startRow + 1}:${colLetter}${endRow + 1}, 0.5))))) + ((COUNTIF(${colLetter}${startRow + 1}:${colLetter}${endRow + 1}, 1)) / ((COUNTIF(${colLetter}${startRow + 1}:${colLetter}${endRow + 1}, 1) + (COUNTIF(${colLetter}${startRow + 1}:${colLetter}${endRow + 1}, 0))))))`;
                    
                    ws[XLSX.utils.encode_cell({ r: f1RowIndex, c: col })] = { f: formula };
                }
            }

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Survey Results");
            XLSX.writeFile(wb, "Survey_Results.xlsx");
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            alert("Error exporting to Excel: " + error.message);
        }
    };


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
                <button onClick={exportToExcel} style={isMobile ? { width: "100%" } : {}} className="export-button">Download Report as Excel</button>
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
