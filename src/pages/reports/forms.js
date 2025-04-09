import React, { useState } from "react";
import { FaChevronDown, FaChevronUp, FaClipboard, FaClipboardCheck, FaRegHandPointRight } from "react-icons/fa";
import Courses from "../../forms/courses";
import Response from "./response";

const formatCourseName = (courseCode) => {
    const courseNames = Object.fromEntries(
        Courses.flatMap(({ courses }) => courses.map(({ name, code }) => [code, name]))
    );
    return courseNames[courseCode] || courseCode;
};

const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleString(undefined, options);
}

const Forms = ({ formCounts, respondents, useScreenSize }) => {
    const isMobile = useScreenSize();
    const [expandedRows, setExpandedRows] = useState({});
    const [copiedLink, setCopiedLink] = useState(null);
    const [copiedRandomLink, setCopiedRandomLink] = useState(null);
    const [selectedRespondent, setSelectedRespondent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const toggleExpandRow = (treatmentLevel) => {
        setExpandedRows((prev) => ({
            ...prev,
            [treatmentLevel]: !prev[treatmentLevel],
        }));
    };

    const handleCopyLink = (link) => {
        const fullUrl = `${window.location.origin}${link}`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(fullUrl)
                .then(() => {
                    setCopiedLink(link);
                    setTimeout(() => setCopiedLink(null), 2000);
                })
                .catch((err) => console.error("Failed to copy:", err));
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = fullUrl;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand("copy");
                setCopiedLink(link);
                setTimeout(() => setCopiedLink(null), 2000);
            } catch (err) {
                console.error("Fallback copy failed:", err);
            }
            document.body.removeChild(textArea);
        }
    };

    const handleCopyRandomLink = () => {
        const fullUrl = `${window.location.origin}/7q7fbmQylOjPCmnJzFO5`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(fullUrl)
                .then(() => {
                    setCopiedRandomLink(fullUrl);
                    setTimeout(() => setCopiedRandomLink(null), 2000);
                })
                .catch((err) => console.error("Failed to copy:", err));
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = fullUrl;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand("copy");
                setCopiedRandomLink(fullUrl);
                setTimeout(() => setCopiedRandomLink(null), 2000);
            } catch (err) {
                console.error("Fallback copy failed:", err);
            }
            document.body.removeChild(textArea);
        }
    };

    const handleOpenModal = (respondent) => {
        setSelectedRespondent(respondent);
        setShowModal(true);
        setIsClosing(false);
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowModal(false);
            setSelectedRespondent(null);
        }, 600);
    };

    const treatments = {
        T1: { label: "Treatment Level 1", description: "Free-Labeling (Local/In-group)", formLink: "/XfN4pu0g3lSGXCbwqW4U" },
        T2: { label: "Treatment Level 2", description: "Free-Labeling (Foreign/Out-group)", formLink: "/h9BVtFjY5EpI3s2Jj1eA" },
        T3: { label: "Treatment Level 3", description: "Discrete Emotion (Local/In-group)", formLink: "/DNf1XbrdcE5vgxiEmv13" },
        T4: { label: "Treatment Level 4", description: "Discrete Emotion (Foreign/Out-group)", formLink: "/lcSkgVKARcdUIRUw25j9" },
    };

    return (
        <div className="card" id="forms-card">
            <h2 className="card-title">Forms</h2>
            <button onClick={(e) => { e.stopPropagation(); handleCopyRandomLink(); }} style={isMobile ? { width: "100%" } : {}} className="get-random-form-link-btn">
                {copiedRandomLink ? (
                    <>
                        <FaClipboardCheck /> Copied!
                    </>
                ) : (
                    <>
                        <FaClipboard /> Get and copy randomized form link
                    </>
                )}</button>
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
                                <td>{formCounts[key] || 0} / 32</td>
                                <td>
                                    <span style={{ marginTop: "0px", gap: "5px", display: "flex", justifyContent: "space-between", alignItems: "center", verticalAlign: "middle" }}>
                                        {isMobile
                                            ? <button
                                                className="visit-button"
                                                onClick={() => window.open(`${window.location.origin}${formLink}`, "_blank")}
                                            >
                                                <FaRegHandPointRight /> Visit
                                            </button>
                                            : <a
                                                style={{ width: "100%" }}
                                                href={`${window.location.origin}${formLink}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Go to the form
                                            </a>
                                        }

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopyLink(formLink);
                                            }}
                                            className="copy-button"
                                        >
                                            {copiedLink === formLink ? (
                                                <>
                                                    <FaClipboardCheck /> Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <FaClipboard /> Copy
                                                </>
                                            )}
                                        </button>
                                    </span>
                                </td>
                            </tr>

                            {expandedRows[key] && (
                                <tr className="expanded-row">
                                    <td colSpan={4}>
                                        <strong>Takers:</strong>
                                        <div className="survey-takers-list">
                                            {respondents.filter(r => r.treatmentLevel === key).length > 0 ? (
                                                respondents
                                                    .filter(r => r.treatmentLevel === key)
                                                    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                                                    .map((r, index) => (
                                                        <button
                                                            key={r.name + index}
                                                            className="open-respondent-details-btn"
                                                            onClick={() => handleOpenModal(r)}
                                                        >
                                                            {index + 1}. {r.name} - {formatCourseName(r.course)} {r.yearLevel}{r.section} - {formatDateTime(r.submittedAt)}
                                                        </button>
                                                    ))
                                            ) : (
                                                <p>No respondents yet.</p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal-overlay">
                    <div className={`modal ${isClosing ? "slide-down" : ""}`}>
                        {isMobile && <div className="close-button-container-mobile">
                            <button className="close-modal-btn" onClick={handleCloseModal}>
                                X
                            </button>
                        </div>}
                        <Response respondent={selectedRespondent} isMobile={isMobile} />
                        {!isMobile && <div className="close-button-container">
                            <button className="close-modal-btn" onClick={handleCloseModal}>
                                Close
                            </button>
                        </div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Forms;
