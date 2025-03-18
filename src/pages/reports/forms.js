import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const Forms = ({ formCounts, respondents, getSectionText }) => {

    const [expandedRows, setExpandedRows] = useState({});

    const toggleExpandRow = (treatmentLevel) => {
        setExpandedRows((prev) => ({
            ...prev,
            [treatmentLevel]: !prev[treatmentLevel],
        }));
    };

    const treatments = {
        T1: { label: "Treatment Level 1", description: "Free-Labeling (Local/In-group)", formLink: "/fyhczhbuwq" },
        T2: { label: "Treatment Level 2", description: "Free-Labeling (Foreign/Out-group)", formLink: "/rqyckfzpjn" },
        T3: { label: "Treatment Level 3", description: "Discrete Emotion (Local/In-group)", formLink: "/mwzspvqvva" },
        T4: { label: "Treatment Level 4", description: "Discrete Emotion (Foreign/Out-group)", formLink: "/lgrpyjbylo" },
    };

    return (
        <div className="card" id="forms-card">
            <h2 className="card-title">Forms</h2>
            <table className="forms-table">
                <thead>
                    <tr>
                        <th>Treatment Level</th>
                        <th>Treatment Description</th>
                        <th>Taker Count</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(treatments).map(([key, { label, description, formLink }]) => (
                        <React.Fragment key={key}>
                            <tr onClick={() => toggleExpandRow(key)} className="expandable-row">
                                <td>
                                    <span style={{ marginTop: "0px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        {label}
                                        {expandedRows[key] ? <FaChevronUp /> : <FaChevronDown />}
                                    </span>
                                </td>
                                <td>{description}</td>
                                <td>{formCounts[key] || 0} / 45</td>
                                <td><a href={formLink} target="_blank" rel="noopener noreferrer">Go to the form</a></td>
                            </tr>

                            {expandedRows[key] && (
                                <tr className="expanded-row">
                                    <td colSpan={4}>
                                        <strong>Takers:</strong>
                                        <ul className="survey-takers-list">
                                            {respondents.filter(r => r.treatmentLevel === key).length > 0 ? (
                                                respondents
                                                    .filter(r => r.treatmentLevel === key)
                                                    .map(r => (
                                                        <li key={r.id}>
                                                            {r.name} - {getSectionText(r.section)}
                                                        </li>
                                                    ))
                                            ) : (
                                                <li>No respondents yet.</li>
                                            )}
                                        </ul>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Forms;
