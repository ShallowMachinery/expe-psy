import React from "react";

const TimeUp = () => {
    return (
        <div className="parent-container">
            <div className="timeup-overlay">
                <div className="timeup-container">
                    <h1 style={{ textAlign: "center" }}>Time's up!</h1>
                    <p>We won't be able to accept your response anymore.</p>
                </div>
            </div>
        </div>
    );
};

export default TimeUp;
