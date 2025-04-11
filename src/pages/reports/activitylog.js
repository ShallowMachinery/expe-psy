import React from "react";

const ActivityLog = ({ activityLogs }) => {

    const logsCopy = [...activityLogs];

    const logMap = new Map();
    logsCopy.forEach(log => {
        log.extraMessages = [];
        logMap.set(log.id, log);
    });

    logsCopy.forEach(log => {
        if (log.id.startsWith("submission_")) {
            if (!log.relatedId) {
                console.warn(`Missing relatedID for submission log: ${log.id}`);
                return;
            }

            const relatedLog = logMap.get(log.relatedId);
            if (relatedLog) {
                if (relatedLog.message === "Did not finish in time") {
                    relatedLog.extraMessages.push("Did not finish in time");
                } else {
                    const finishedTime = new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    const timeDiff = Math.abs(new Date(log.timestamp) - new Date(relatedLog.timestamp));
                    const minutesDiff = Math.floor((timeDiff / 1000) / 60);
                    const secondsDiff = Math.floor((timeDiff / 1000) % 60);

                    const minutes = minutesDiff > 0 ? `${minutesDiff} minute${minutesDiff > 1 ? 's' : ''}` : '';
                    const seconds = secondsDiff > 0 ? `${secondsDiff} second${secondsDiff > 1 ? 's' : ''}` : '';
                    const timeTaken = minutes || seconds ? `${minutes}${minutes && seconds ? ' and ' : ''}${seconds}` : '';

                    relatedLog.extraMessages.push(`Finished answering in ${timeTaken} — ${finishedTime}`);
                }

                // Remove submission log to avoid rendering it separately
                logMap.delete(log.id);
            } else {
                console.warn(`Related session not found for: ${log.id}`);
            }
        }
    });

    const processedLogs = [...logMap.values()];

    return (
        <div className="card" id="activity-log-card">
            <div className="card-header">
                <h2 className="card-title">Activity Log</h2>
            </div>
            <div className="card-body">
                {processedLogs.length > 0 ? (
                    <div className="notification-list">
                        {processedLogs
                            .slice()
                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                            .map(log => {
                                const dateObj = new Date(log.timestamp);
                                const dateOnly = dateObj.toLocaleDateString();
                                const timeOnly = dateObj.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                });

                                return (
                                    <div
                                        key={log.id}
                                        className="notification-item"
                                        style={{
                                            backgroundColor: log.extraMessages.some(msg => msg.includes("Finished answering"))
                                                ? "#d4edda"
                                                : "#faeade",
                                            display: "flex",
                                            alignItems: "center",
                                            verticalAlign: "middle",
                                            gap: "10px",
                                            padding: "10px",
                                            borderRadius: "6px"
                                        }}>
                                        <div style={{ fontSize: "1.5rem", marginLeft: "10px", marginRight: "10px" }}>
                                            {log.extraMessages.some(msg => msg.includes("Finished")) ? "✅" : "⚠️"}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="notif-header">
                                                <strong style={{ color: log.name === null ? "red" : "inherit" }}>{log.name !== null ? log.name : "Someone"}</strong>
                                                <span className="notif-time">{dateOnly}</span>
                                            </div>
                                            <div className="notif-message">
                                                {log.message || "No message"} — {timeOnly}
                                                {log.extraMessages?.map((msg, idx) => (
                                                    <div key={idx} className="notif-message-extra">{msg}</div>
                                                ))}
                                            </div>
                                            <div className="notif-meta">
                                                {log.platform || "N/A"} &middot; {log.browser || "N/A"}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                ) : (
                    <p style={{ textAlign: "center", padding: "10px" }}>No activity logs found.</p>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;