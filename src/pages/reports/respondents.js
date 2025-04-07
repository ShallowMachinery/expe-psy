import { getFirestore, doc, getDoc, setDoc, increment, deleteField, collection, query, where, getDocs, writeBatch, updateDoc, deleteDoc } from "firebase/firestore";
import React, { useState, useEffect, useMemo } from "react";
import { FaChevronLeft, FaChevronRight, FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import Courses from "../../forms/courses";
import Response from "./response";

const formatCourseName = (courseCode) => {
    const courseNames = Object.fromEntries(
        Courses.flatMap(({ courses }) => courses.map(({ name, code }) => [code, name]))
    );
    return courseNames[courseCode] || courseCode;
};

const Respondents = ({ respondents, setRespondents, getTreatmentText, useScreenSize }) => {
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
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedRespondent, setSelectedRespondent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

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

    useEffect(() => {
        setRespondentsEmpty(respondents.length === 0);
    }, [respondents]);

    const handleAddRespondent = () => {
        if (respondentsEmpty) {
            setRespondentsEmpty(false);
        }
        setAddRespondentButtonEnabled(false);
        setNewRespondent({ name: "", college: "", course: "", yearLevel: "", section: "", treatmentLevel: "", status: "" });
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
                [newId]: { name: newRespondent.name, course: newRespondent.course, yearLevel: newRespondent.yearLevel, section: newRespondent.section, treatmentLevel: newRespondent.treatmentLevel, status: "Expected" },
            };

            await setDoc(respondentsRef, { list: updatedRespondents }, { merge: true });

            setRespondents(Object.entries(updatedRespondents).map(([id, details]) => ({
                id,
                name: details.name,
                course: details.course,
                yearLevel: details.yearLevel,
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
        setEditingRespondent({ ...respondent, college: Courses.find(({ courses }) => courses.some(({ code }) => code === respondent.course))?.college });
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
                    course: editingRespondent.course,
                    yearLevel: editingRespondent.yearLevel,
                    section: editingRespondent.section,
                    treatmentLevel: editingRespondent.treatmentLevel,
                    status: editingRespondent.status
                },
            };

            await setDoc(respondentsRef, { list: updatedRespondents }, { merge: true });

            const q = query(
                formResponsesRef,
                where("name", "==", oldRespondent.name),
                where("course", "==", oldRespondent.course),
                where("yearLevel", "==", oldRespondent.yearLevel),
                where("section", "==", oldRespondent.section)
            );

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const batch = writeBatch(db);
                querySnapshot.forEach((docSnap) => {
                    const responseRef = doc(db, "formResponses", docSnap.id);
                    batch.update(responseRef, {
                        name: editingRespondent.name,
                        course: editingRespondent.course,
                        yearLevel: editingRespondent.yearLevel,
                        section: editingRespondent.section
                    });
                });

                await batch.commit();
            }

            setRespondents(Object.entries(updatedRespondents).map(([id, details]) => ({
                id,
                name: details.name,
                course: details.course,
                yearLevel: details.yearLevel,
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
                    where("course", "==", respondentToDelete.course),
                    where("yearLevel", "==", respondentToDelete.yearLevel),
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

        if (searchQuery.trim() !== "") {
            filtered = filtered.filter((resp) =>
                resp.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

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
    }, [respondents, searchQuery, sortField, sortDirection, sectionFilter, treatmentFilter, statusFilter]);

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
                        <th style={{ cursor: "pointer" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <span onClick={() => handleSort("name")}>
                                    Name {renderSortIcon("name")}
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search by name"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        marginTop: "5px",
                                        padding: "5px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                    }}
                                />
                            </div>
                        </th>
                        <th style={{ width: "200px" }}>
                            Program, Year, Section
                        </th>
                        <th>
                            Treatment Level
                            <select
                                value={statusFilter !== "Incomplete submission" ? treatmentFilter : "N/A"}
                                disabled={statusFilter === "Incomplete submission"}
                                onChange={(e) => handleFilterChange("treatment", e.target.value)}
                                className="filter-dropdown"
                            >
                                <option value="all">All Treatments</option>
                                <option value="T1">T1 - Free-Labeling (Local/In-group)</option>
                                <option value="T2">T2 - Free-Labeling (Foreign/Out-group)</option>
                                <option value="T3">T3 - Discrete Emotion (Local/In-group)</option>
                                <option value="T4">T4 - Discrete Emotion (Foreign/Out-group)</option>
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
                                <option value="Incomplete submission">Incomplete submission</option>
                            </select>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {newRespondent && (
                        <tr>
                            <td colSpan={4}>
                                <input type="text" name="name" value={newRespondent?.name || ""} onChange={handleChange} placeholder="Enter name (SURNAME, First Name, M.I.)" required />
                                <div>
                                    <select name="college" value={newRespondent.college || ""} onChange={handleChange} required>
                                        <option value="" disabled>Select college</option>
                                        {Courses.map(({ college }) => (
                                            <option key={college} value={college}>
                                                {college}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {newRespondent.college && (
                                    <div>
                                        <select
                                            name="course"
                                            value={newRespondent.course || ""}
                                            onChange={handleChange}
                                            required
                                            disabled={!newRespondent.college}
                                        >
                                            <option value="" disabled>Select program</option>
                                            {Courses.find(({ college }) => college === newRespondent.college)?.courses.map(({ name, code }) => (
                                                <option key={code} value={code}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {newRespondent.course && (
                                    <div>
                                        <select
                                            name="yearLevel"
                                            value={newRespondent.yearLevel || ""}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="" disabled>
                                                Select year level
                                            </option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                            <option value="5">5th Year</option>
                                        </select>
                                    </div>
                                )}

                                {newRespondent.course && (
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", verticalAlign: "middle" }}>
                                            <input type="text" value={newRespondent.yearLevel} disabled style={{ width: "37px", textAlign: "right" }}></input>
                                            <input
                                                type="text"
                                                name="section"
                                                disabled={newRespondent.yearLevel === ""}
                                                value={newRespondent.section || ""}
                                                onChange={(e) =>
                                                    setNewRespondent({
                                                        ...newRespondent,
                                                        section: e.target.value.toUpperCase(),
                                                    })
                                                }
                                                maxLength={8}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="respondents-table-add-respondents-btn-div">
                                    <button className="save-btn" onClick={handleSaveRespondent}>Save</button>
                                    <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                                </div>
                            </td>
                        </tr>
                    )}
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
                                        <div>
                                            <label>Select college:</label>
                                            <select name="college" value={editingRespondent.college || ""} onChange={(e) => handleChange(e, true)} required>
                                                <option value="" disabled>Select college</option>
                                                {Courses.map(({ college }) => (
                                                    <option key={college} value={college}>
                                                        {college}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {editingRespondent.college && (
                                            <div>
                                                <select
                                                    name="course"
                                                    value={editingRespondent.course || ""}
                                                    onChange={(e) => handleChange(e, true)}
                                                    required
                                                    disabled={!editingRespondent.college}
                                                >
                                                    <option value="" disabled>Select program</option>
                                                    {Courses.find(({ college }) => college === editingRespondent.college)?.courses.map(({ name, code }) => (
                                                        <option key={code} value={code}>
                                                            {name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {editingRespondent.course && (
                                            <div>
                                                <select
                                                    name="yearLevel"
                                                    value={editingRespondent.yearLevel || ""}
                                                    onChange={(e) => handleChange(e, true)}
                                                    required
                                                >
                                                    <option value="" disabled>
                                                        Select year level
                                                    </option>
                                                    <option value="1">1st Year</option>
                                                    <option value="2">2nd Year</option>
                                                    <option value="3">3rd Year</option>
                                                    <option value="4">4th Year</option>
                                                    <option value="5">5th Year</option>
                                                </select>
                                            </div>
                                        )}

                                        {editingRespondent.course && (
                                            <div>
                                                <div style={{ display: "flex", alignItems: "center", verticalAlign: "middle" }}>
                                                    <input type="text" value={editingRespondent.yearLevel} disabled style={{ width: "37px", textAlign: "right" }}></input>
                                                    <input
                                                        type="text"
                                                        name="section"
                                                        disabled={editingRespondent.yearLevel === ""}
                                                        value={editingRespondent.section || ""}
                                                        onChange={(e) =>
                                                            setEditingRespondent({
                                                                ...editingRespondent,
                                                                section: e.target.value.toUpperCase(),
                                                            }, true)
                                                        }
                                                        maxLength={8}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div className="actions-div">
                                            <button className="save-btn edit-btn" onClick={handleSaveEdit}><FaSave /></button>
                                            <button className="cancel-btn" onClick={handleCancel}><FaTimes /></button>
                                        </div>
                                    </td>
                                    <td>{getTreatmentText(resp.treatmentLevel)}</td>
                                    <td>{resp.status}</td>
                                </tr>
                            ) : (
                                <tr
                                    key={resp.id || index}
                                    style={{
                                        color:
                                            resp.status === "Incomplete submission" || resp.section.trim() === ""
                                                ? "red"
                                                : "inherit",
                                    }}
                                >
                                    <td>
                                        <span style={{ display: "flex", verticalAlign: "middle", justifyContent: "space-between", marginTop: "0px" }}>
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
                                    <td>
                                        {resp.section
                                            ? `${formatCourseName(resp.course)} ${resp.yearLevel}${resp.section}`
                                            : "Incomplete data"}
                                    </td>
                                    <td>{getTreatmentText(resp.treatmentLevel)}</td>
                                    <td>
                                        {resp.status === "Submitted" ? (
                                            <a onClick={() => handleOpenModal(resp)}>{resp.status}</a>
                                        ) : (
                                            resp.status
                                        )}
                                    </td>
                                </tr>
                            )
                        ))
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

export default Respondents;
