import React from "react";

const NotFound = () => {
    return (
        <div className="not-found-parent-container">
            <div className="not-found-overlay">
                <div className="not-found-container">
                    <h1 style={{ textAlign: "center" }}>Sorry!</h1>
                    <p>This form is now closed. Thank you for your interest!</p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
