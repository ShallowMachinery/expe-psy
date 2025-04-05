import React from "react";

const NotFound = () => {
    return (
        <div className="not-found-parent-container">
            <div className="not-found-overlay">
                <div className="not-found-container">
                    <h1 style={{ textAlign: "center" }}>Sorry!</h1>
                    <p>We cannot find the page you're looking for.</p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
