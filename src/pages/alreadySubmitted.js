import React from "react";

const alreadySubmitted = () => {
    return (
        <div className="not-found-parent-container">
            <div className="not-found-overlay">
                <div className="not-found-container">
                    <h1 style={{ textAlign: "center" }}>Sorry!</h1>
                    <p>You have already submitted your response. Thank you for participating.</p>
                </div>
            </div>
        </div>
    );
};

export default alreadySubmitted;
