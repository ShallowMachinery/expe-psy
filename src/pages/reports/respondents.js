import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Respondents = ({ respondents, setRespondents, getSectionText, getTreatmentText, useScreenSize }) => {
    const isMobile = useScreenSize();

    const [addRespondentButtonEnabled, setAddRespondentButtonEnabled] = useState(true);
    const [newRespondent, setNewRespondent] = useState(null);
    const [respondentsEmpty, setRespondentsEmpty] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const respondentsPerPage = 20;

    useEffect(() => {
        setRespondentsEmpty(respondents.length === 0);
    }, [respondents]);

    const handleAddRespondent = () => {
        if (respondentsEmpty) {
            setRespondentsEmpty(false);
        }
        setAddRespondentButtonEnabled(false);
        setNewRespondent({ name: "", section: "A", treatmentLevel: "", status: "" });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setNewRespondent((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveRespondent = async () => {
        if (!newRespondent || !newRespondent.name?.trim()) return;

        const db = getFirestore();
        const respondentsRef = doc(db, "analytics", "respondents");

        try {
            const respondentsSnap = await getDoc(respondentsRef);
            const currentRespondents = respondentsSnap.exists() ? respondentsSnap.data().list || {} : {};

            const newId = `resp_${Date.now()}`;
            const updatedRespondents = {
                ...currentRespondents,
                [newId]: { name: newRespondent.name, section: newRespondent.section, treatmentLevel: newRespondent.treatmentLevel, status: "Expected" },
            };

            await setDoc(respondentsRef, { list: updatedRespondents }, { merge: true });

            setRespondents(Object.entries(updatedRespondents).map(([id, details]) => ({
                id,
                name: details.name,
                section: details.section,
                treatmentLevel: details.treatmentLevel,
                status: details.status
            })));

            setAddRespondentButtonEnabled(true);
            setNewRespondent(null);
        } catch (error) {
            console.error("Error saving respondent:", error);
        }
    };

    const handleCancel = () => {
        setNewRespondent(null);
        setAddRespondentButtonEnabled(true);
        setRespondentsEmpty(respondents.length === 0);
    };

    const totalPages = Math.ceil(respondents.length / respondentsPerPage);
    const paginatedRespondents = respondents.slice((currentPage - 1) * respondentsPerPage, currentPage * respondentsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const { treatmentCounts, statusCounts } = respondents.reduce(
        (acc, resp) => {
            acc.treatmentCounts[resp.treatmentLevel] = (acc.treatmentCounts[resp.treatmentLevel] || 0) + 1;
            acc.statusCounts[resp.status] = (acc.statusCounts[resp.status] || 0) + 1;
            return acc;
        },
        { treatmentCounts: {}, statusCounts: {} }
    );

    return (
        <div className="card" id="respondents-card">
            <div className="card-header">
                <div className="card-mobile-header">
                    <h2 className="card-title">Respondents</h2>
                    <div className="respondent-counts">
                        <p><strong>T1:</strong> {treatmentCounts["T1"] || 0}</p>
                        <p><strong>T2:</strong> {treatmentCounts["T2"] || 0}</p>
                        <p><strong>T3:</strong> {treatmentCounts["T3"] || 0}</p>
                        <p><strong>T4:</strong> {treatmentCounts["T4"] || 0}</p>
                        <p><strong>Total:</strong> {respondents.length}</p>
                        <p><strong>Expected:</strong> {statusCounts["Expected"] || 0}</p>
                        <p><strong>Submitted:</strong> {statusCounts["Submitted"] || 0}</p>
                    </div>
                </div>
                <button className="add-respondents-btn" onClick={handleAddRespondent} disabled={!addRespondentButtonEnabled}>
                    Add Respondent
                </button>
            </div>

            <table className="respondents-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Section</th>
                        <th>Treatment Level Assigned</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {respondentsEmpty ? (
                        <tr>
                            <td style={{ textAlign: "center" }} colSpan={4}><i>No respondents yet.</i></td>
                        </tr>
                    ) : (
                        respondents.map((resp, index) => (
                            <tr key={resp.id || index}>
                                <td>{resp.name}</td>
                                <td>{getSectionText(resp.section)}</td>
                                <td>{getTreatmentText(resp.treatmentLevel)}</td>
                                <td>{resp.status}</td>
                            </tr>
                        ))
                    )}
                    {newRespondent && (
                        <tr>
                            <td colSpan={5}>
                                <input type="text" name="name" value={newRespondent?.name || ""} onChange={handleChange} placeholder="Enter name (SURNAME, First Name, M.I.)" required />
                                <select name="section" value={newRespondent?.section || "A"} onChange={handleChange} required>
                                    <option value="A">1A</option>
                                    <option value="B">1B</option>
                                    <option value="C">1C</option>
                                    <option value="D">1D</option>
                                    <option value="E">1E</option>
                                </select>
                                <div className="respondents-table-add-respondents-btn-div">
                                    <button className="save-btn" onClick={handleSaveRespondent}>Save</button>
                                    <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="pagination">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>{isMobile ? <FaChevronLeft style={{ marginBottom: "-4px" }} /> : "Previous"}</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>{isMobile ? <FaChevronRight style={{ marginBottom: "-4px" }} /> : "Next"}</button>
            </div>
        </div>
    );
};

export default Respondents;
