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

const treatmentToMeta = {
  T1: { Language: "Free-labeling", Race: "Filipino" },
  T2: { Language: "Free-labeling", Race: "Foreign" },
  T3: { Language: "Discrete", Race: "Filipino" },
  T4: { Language: "Discrete", Race: "Foreign" },
};

const Analytics = ({ useScreenSize }) => {
    const isMobile = useScreenSize();

    const [respondentCounts, setRespondentCounts] = useState({});
    const [responsesData, setResponsesData] = useState({});
    const [excelResponseData, setExcelResponseData] = useState({});
    const [selectedTreatment, setSelectedTreatment] = useState("T1");
    const [selectedQuestion, setSelectedQuestion] = useState(0);
    const [showModal, setShowModal] = useState(false);

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
            console.log("Excel Data:", excelData);
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

            let headerRow = ["Participant", "Language", "Race", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11", "Q12", "F1 Score"];

            data.push(headerRow);

            let rowIndex = 2;

            Object.entries(excelResponseData).forEach(([treatmentKey, participants]) => {
                const meta = treatmentToMeta[treatmentKey];
    
                Object.entries(participants).forEach(([participantID, answers]) => {
                    const row = [
                        `P${String(rowIndex - 1).padStart(3, "0")}`,
                        meta.Language,
                        meta.Race,
                        ...answers.map(val => typeof val === "number" ? val : parseFloat(val)),
                    ];
    
                    const TP = answers.filter(val => val === 1 || parseFloat(val) === 1).length;
                    const FP = answers.filter(val => val === 0.5 || parseFloat(val) === 0.5).length;
                    const FN = answers.filter(val => val === 0 || parseFloat(val) === 0).length;
                    
                    const precision = TP / (TP + FP);
                    const recall = TP / (TP + FN);
                    
                    const f1Score = 2 * (precision * recall) / (precision + recall);
                    
                    const roundedF1 = f1Score.toFixed(2);
                    
                    row.push(roundedF1 === "NaN" ? 0 : roundedF1);
    
                    data.push(row);
                    console.log("Row Data:", row);
                    rowIndex++;
                });
            });
        
            const ws = XLSX.utils.aoa_to_sheet(data);

            ws['!cols'] = [
                {wch: 15}, // A - Participant
                {wch: 15}, // B - Language
                {wch: 15}, // C - Race
                {wch: 8},  // D - Q1
                {wch: 8},  // E - Q2
                {wch: 8},  // F - Q3
                {wch: 8},  // G - Q4
                {wch: 8},  // H - Q5
                {wch: 8},  // I - Q6
                {wch: 8},  // J - Q7
                {wch: 8},  // K - Q8
                {wch: 8},  // L - Q9
                {wch: 8},  // M - Q10
                {wch: 8},  // N - Q11
                {wch: 8},  // O - Q12
                {wch: 10}  // P - F1 Score
            ];
            
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let row = range.s.r; row <= range.e.r; row++) {
                for (let col = range.s.c; col <= range.e.c; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                    if (!ws[cellAddress]) continue;
            
                    if (!ws[cellAddress].s) ws[cellAddress].s = {};
                    ws[cellAddress].z = '@';
                    ws[cellAddress].s.alignment = { horizontal: 'left' };
                }
            }

            const wb = XLSX.utils.book_new();
            const timestamp = new Date().toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            }).replace(/[/:, ]/g, "-"); // sanitize for filename
            
            XLSX.utils.book_append_sheet(wb, ws, "Survey Results");
            XLSX.writeFile(wb, `Survey_Results_${timestamp}.xlsx`);
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            alert("Error exporting to Excel: " + error.message);
        }
    };

    const checkResponsesAndExport = () => {
        const insufficientLevels = Object.entries(respondentCounts)
            .filter(([_, count]) => count < 32)
            .map(([level]) => level);
    
        if (insufficientLevels.length === 0) {
            exportToExcel();
        } else {
            setShowModal(true);
        }
    };

    const handleProceedDownload = () => {
        setShowModal(false);
        exportToExcel();
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
                <button onClick={checkResponsesAndExport} style={isMobile ? { width: "100%" } : {}} className="export-button">Export Scores</button>
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
            {showModal && (
            <div className="modal-overlay">
                <div className="modal download">
                    <p>The number of responses for each treatment level has not yet reached the required amount. If you choose to proceed with exporting, the F1 scores for each item in each treatment level may be inaccurate.</p>
                    <div className="modal-buttons">
                        <button onClick={() => setShowModal(false)} className="go-back-button">
                            Go back
                        </button>
                        <button onClick={handleProceedDownload} className="download-anyway-button">
                            Export anyway
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default Analytics;
