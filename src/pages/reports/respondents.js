import { getFirestore, doc, getDoc, setDoc, increment, deleteField, collection, query, where, getDocs, writeBatch, updateDoc, deleteDoc } from "firebase/firestore";
import React, { useState, useEffect, useMemo } from "react";
import { FaChevronLeft, FaChevronRight, FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

const Respondents = ({ respondents, setRespondents, getSectionText, getTreatmentText, useScreenSize }) => {
    const isMobile = useScreenSize();

    const [addRespondentButtonEnabled, setAddRespondentButtonEnabled] = useState(true);
    const [newRespondent, setNewRespondent] = useState(null);
    const [editingRespondent, setEditingRespondent] = useState(null);
    const [respondentsEmpty, setRespondentsEmpty] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const respondentsPerPage = 20;
    const [sortField, setSortField] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [sectionFilter, setSectionFilter] = useState("all");
    const [treatmentFilter, setTreatmentFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [respondentToDelete, setRespondentToDelete] = useState(null);

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

    const handleChange = (e, forEdit = false) => {
        const { name, value } = e.target;

        if (forEdit) {
            setEditingRespondent((prev) => ({
                ...prev,
                [name]: value,
            }));
        } else {
            setNewRespondent((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
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

    const handleEditRespondent = (respondent) => {
        setEditingRespondent({ ...respondent });
    };

    const handleSaveEdit = async () => {
        if (!editingRespondent || !editingRespondent.name?.trim()) return;

        const db = getFirestore();
        const respondentsRef = doc(db, "analytics", "respondents");
        const formResponsesRef = collection(db, "formResponses");

        try {
            const respondentsSnap = await getDoc(respondentsRef);
            const currentRespondents = respondentsSnap.exists() ? respondentsSnap.data().list || {} : {};

            const oldRespondent = currentRespondents[editingRespondent.id];

            if (!oldRespondent) {
                console.error("Old respondent data not found.");
                return;
            }

            const updatedRespondents = {
                ...currentRespondents,
                [editingRespondent.id]: {
                    name: editingRespondent.name,
                    section: editingRespondent.section,
                    treatmentLevel: editingRespondent.treatmentLevel,
                    status: editingRespondent.status
                },
            };

            await setDoc(respondentsRef, { list: updatedRespondents }, { merge: true });

            const q = query(
                formResponsesRef,
                where("name", "==", oldRespondent.name),
                where("section", "==", oldRespondent.section)
            );

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const batch = writeBatch(db);
                querySnapshot.forEach((docSnap) => {
                    const responseRef = doc(db, "formResponses", docSnap.id);
                    batch.update(responseRef, {
                        name: editingRespondent.name,
                        section: editingRespondent.section
                    });
                });

                await batch.commit();
            }

            setRespondents(Object.entries(updatedRespondents).map(([id, details]) => ({
                id,
                name: details.name,
                section: details.section,
                treatmentLevel: details.treatmentLevel,
                status: details.status
            })));

            setEditingRespondent(null);
        } catch (error) {
            console.error("Error updating respondent:", error);
        }
    };

    const handleDeleteClick = (respondent) => {
        setRespondentToDelete(respondent);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!respondentToDelete) return;

        const db = getFirestore();
        const respondentsRef = doc(db, "analytics", "respondents");
        const formCountRef = doc(db, "analytics", "formCount");
        const formResponsesCollectionRef = collection(db, "formResponses");

        try {
            const respondentsSnap = await getDoc(respondentsRef);
            if (!respondentsSnap.exists()) {
                console.error("Respondents document does not exist.");
                return;
            }

            const updateObj = {};
            updateObj[`list.${respondentToDelete.id}`] = deleteField();

            await updateDoc(respondentsRef, updateObj).catch((error) =>
                console.error("Error deleting field:", error)
            );

            if (respondentToDelete.status === "Submitted") {
                const formResponsesQuery = query(
                    formResponsesCollectionRef,
                    where("name", "==", respondentToDelete.name),
                    where("section", "==", respondentToDelete.section)
                );

                const formResponsesSnap = await getDocs(formResponsesQuery);

                if (!formResponsesSnap.empty) {
                    const deletePromises = formResponsesSnap.docs.map((doc) =>
                        deleteDoc(doc.ref)
                    );
                    await Promise.all(deletePromises);
                }

                if (respondentToDelete.treatmentLevel) {
                    const formCountSnap = await getDoc(formCountRef);
                    if (formCountSnap.exists()) {
                        const formCountData = formCountSnap.data();
                        const treatmentLevelField = respondentToDelete.treatmentLevel;

                        if (formCountData[treatmentLevelField] !== undefined) {
                            const formCountUpdateObj = {};
                            formCountUpdateObj[treatmentLevelField] = increment(-1);
                            await updateDoc(formCountRef, formCountUpdateObj).catch((error) =>
                                console.error("Error updating form count:", error)
                            );
                        } else {
                            console.warn(`Treatment level ${treatmentLevelField} not found in formCount.`);
                        }
                    }
                }
            }

            setRespondents((prev) =>
                prev.filter((resp) => resp.id !== respondentToDelete.id)
            );

            setShowDeleteModal(false);
            setRespondentToDelete(null);
        } catch (error) {
            console.error("Error deleting respondent:", error);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setRespondentToDelete(null);
    };

    const handleCancel = () => {
        setNewRespondent(null);
        setEditingRespondent(null);
        setAddRespondentButtonEnabled(true);
        setRespondentsEmpty(respondents.length === 0);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
        setCurrentPage(1);
    };

    const handleFilterChange = (filterType, value) => {
        switch (filterType) {
            case "section":
                setSectionFilter(value);
                break;
            case "treatment":
                setTreatmentFilter(value);
                break;
            case "status":
                setStatusFilter(value);
                break;
            default:
                break;
        }
        setCurrentPage(1);
    };

    const filteredAndSortedRespondents = useMemo(() => {
        let filtered = [...respondents];
        if (sectionFilter !== "all") {
            filtered = filtered.filter(resp => resp.section === sectionFilter);
        }
        if (treatmentFilter !== "all") {
            filtered = filtered.filter(resp => resp.treatmentLevel === treatmentFilter);
        }
        if (statusFilter !== "all") {
            filtered = filtered.filter(resp => resp.status === statusFilter);
        }

        return filtered.sort((a, b) => {
            if (a[sortField] < b[sortField]) {
                return sortDirection === "asc" ? -1 : 1;
            }
            if (a[sortField] > b[sortField]) {
                return sortDirection === "asc" ? 1 : -1;
            }
            return 0;
        });
    }, [respondents, sortField, sortDirection, sectionFilter, treatmentFilter, statusFilter]);

    const totalPages = Math.ceil(filteredAndSortedRespondents.length / respondentsPerPage);
    const paginatedRespondents = filteredAndSortedRespondents.slice(
        (currentPage - 1) * respondentsPerPage,
        currentPage * respondentsPerPage
    );

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

    const renderSortIcon = (field) => {
        if (sortField === field) {
            return sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />;
        }
        return <FaSort />;
    };

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
                <button className="add-respondents-btn" style={isMobile ? { width: "100%" } : {}} onClick={handleAddRespondent} disabled={!addRespondentButtonEnabled}>
                    Add Respondent
                </button>
            </div>

            <table className="respondents-table">
                <thead>
                    <tr>
                        <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                            Name {renderSortIcon("name")}
                        </th>
                        <th>
                            Section
                            <select
                                value={sectionFilter}
                                onChange={(e) => handleFilterChange("section", e.target.value)}
                                className="filter-dropdown"
                            >
                                <option value="all">All Sections</option>
                                <option value="A">1A</option>
                                <option value="B">1B</option>
                                <option value="C">1C</option>
                                <option value="D">1D</option>
                                <option value="E">1E</option>
                            </select>
                        </th>
                        <th>
                            Treatment Level
                            <select
                                value={treatmentFilter}
                                onChange={(e) => handleFilterChange("treatment", e.target.value)}
                                className="filter-dropdown"
                            >
                                <option value="all">All Treatments</option>
                                <option value="T1">T1</option>
                                <option value="T2">T2</option>
                                <option value="T3">T3</option>
                                <option value="T4">T4</option>
                                <option value="N/A">N/A</option>
                            </select>
                        </th>
                        <th>
                            Status
                            <select
                                value={statusFilter}
                                onChange={(e) => handleFilterChange("status", e.target.value)}
                                className="filter-dropdown"
                            >
                                <option value="all">All Statuses</option>
                                <option value="Expected">Expected</option>
                                <option value="Submitted">Submitted</option>
                            </select>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAndSortedRespondents.length === 0 ? (
                        <tr>
                            <td style={{ textAlign: "center" }} colSpan={4}>
                                <i>{respondentsEmpty ? "No respondents yet." : "No matching respondents found."}</i>
                            </td>
                        </tr>
                    ) : (
                        paginatedRespondents.map((resp, index) => (
                            editingRespondent && editingRespondent.id === resp.id ? (
                                <tr key={resp.id || index} className="editing-row">
                                    <td colSpan={2}>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editingRespondent.name || ""}
                                            onChange={(e) => handleChange(e, true)}
                                            placeholder="Enter name"
                                        />
                                        <select
                                            name="section"
                                            value={editingRespondent.section || "A"}
                                            onChange={(e) => handleChange(e, true)}
                                        >
                                            <option value="A">1A</option>
                                            <option value="B">1B</option>
                                            <option value="C">1C</option>
                                            <option value="D">1D</option>
                                            <option value="E">1E</option>
                                        </select>
                                        <div className="actions-div">
                                            <button className="save-btn edit-btn" onClick={handleSaveEdit}><FaSave /></button>
                                            <button className="cancel-btn" onClick={handleCancel}><FaTimes /></button>
                                        </div>
                                    </td>
                                    <td>{getTreatmentText(resp.treatmentLevel)}</td>
                                    <td>{resp.status}</td>
                                </tr>
                            ) : (
                                <tr key={resp.id || index}>
                                    <td>
                                        <span style={{ display: "flex", verticalAlign: "middle", justifyContent: "space-between" }}>
                                            {resp.name}
                                            <div className="actions-div not-editing">
                                                <button
                                                    className="edit-btn action-btn"
                                                    onClick={() => handleEditRespondent(resp)}
                                                    title="Edit respondent"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="delete-btn action-btn"
                                                    onClick={() => handleDeleteClick(resp)}
                                                    title="Delete respondent"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </span>
                                    </td>
                                    <td>{getSectionText(resp.section)}</td>
                                    <td>{getTreatmentText(resp.treatmentLevel)}</td>
                                    <td>{resp.status}</td>
                                </tr>
                            )
                        ))
                    )}
                    {newRespondent && (
                        <tr>
                            <td colSpan={4}>
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

            <div className="table-info">
                <div className="filter-summary">
                    Showing {paginatedRespondents.length} of {filteredAndSortedRespondents.length}
                    {filteredAndSortedRespondents.length !== respondents.length ? ` (filtered from ${respondents.length} total)` : ''}
                </div>
                {filteredAndSortedRespondents.length > 0 && <div className="pagination">
                    <button onClick={handlePrevPage} disabled={currentPage === 1}>{isMobile ? <FaChevronLeft style={{ marginBottom: "-4px" }} /> : "Previous"}</button>
                    <span>{isMobile ? `${currentPage}/${totalPages}` : `Page ${currentPage} of ${totalPages}`}</span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>{isMobile ? <FaChevronRight style={{ marginBottom: "-4px" }} /> : "Next"}</button>
                </div>}
            </div>
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal delete">
                        <h3>Delete Respondent</h3><br></br>
                        <p>Are you sure you want to delete <strong>{respondentToDelete?.name}</strong>?</p><br></br>

                        {respondentToDelete?.status === "Submitted" && (
                            <div className="warning-message">
                                <p><strong>Warning:</strong> This respondent has already submitted responses. Deleting this respondent will also delete their responses from the system.</p>
                            </div>
                        )}

                        <div className="modal-buttons">
                            <button className="cancel-btn" onClick={handleDeleteCancel}>Cancel</button>
                            <button className="delete-btn" onClick={handleDeleteConfirm}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Respondents;
