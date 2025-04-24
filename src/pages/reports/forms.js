import React, { useState } from "react";
import { FaCheck, FaChevronDown, FaChevronUp, FaClipboard, FaClipboardCheck, FaExclamationTriangle, FaRedo, FaRegHandPointRight } from "react-icons/fa";
import Response from "./response";

const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleString('en-US', options);
}

const Forms = ({ formCounts, respondents, useScreenSize, experimentDone }) => {
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

    const treatmentCounts = respondents.reduce((acc, resp) => {
        acc[resp.treatmentLevel] = (acc[resp.treatmentLevel] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="card" id="forms-card">
            <h2 className="card-title">Forms</h2>
            <button onClick={(e) => { e.stopPropagation(); handleCopyRandomLink(); }} style={isMobile ? { width: "100%" } : {}} className="get-random-form-link-btn" disabled={experimentDone}>
                {!experimentDone ? 
                (copiedRandomLink ? (
                    <>
                        <FaClipboardCheck /> Copied!
                    </>
                ) : (
                    <>
                        <FaClipboard /> Get and copy randomized form link
                    </>
                )) : (
                    <>
                        <FaCheck /> Experiment is done!
                    </>
                )}
                </button>
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
                                <td title={treatmentCounts[key] !== formCounts[key] ? "Form counts are not matching in the database, please report this to us." : ""}><div style={{ display: "flex", justifyContent: "space-between", verticalAlign: "middle", alignItems: "center" }}>{treatmentCounts[key] || 0} / 32 {treatmentCounts[key] !== formCounts[key] ? <FaExclamationTriangle style={{ color: "red" }}/> : ""}</div></td>
                                <td>
                                    {!experimentDone ?
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
                                    :
                                    <span style={{ marginTop: "0px", gap: "5px", display: "flex", justifyContent: "space-between", alignItems: "center", verticalAlign: "middle" }}>Experiment is done!</span>}
                                </td>
                            </tr>

                            {expandedRows[key] && (
                                <tr className="expanded-row">
                                    <td colSpan={4}>
                                        <strong>Takers:</strong>
                                        <div className="survey-takers-list">
                                            {respondents.filter(r => r.treatmentLevel === key).length > 0 ? (
                                                <table className="respondents-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Name</th>
                                                            <th>Submitted</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {respondents
                                                            .filter(r => r.treatmentLevel === key)
                                                            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                                                            .map((r, index) => (
                                                                <tr key={r.name + index}>
                                                                    <td onClick={() => { handleOpenModal(r) }} style={{ cursor: "pointer" }}>{r.name}</td>
                                                                    <td>{formatDate(r.submittedAt)}</td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
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
