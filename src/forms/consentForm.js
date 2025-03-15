import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./consentForm.css";
import T1Form from "../forms/t1";
import T2Form from "../forms/t2";
import T3Form from "../forms/t3";
import T4Form from "../forms/t4";

const ConsentForm = () => {
    const [agreed, setAgreed] = useState(false);
    const [showConsent, setShowConsent] = useState(true);
    const [currentForm, setCurrentForm] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;

        // Match the path to the correct form
        switch (path) {
              case "/fyhczhbuwq":
                setCurrentForm(<T1Form />);
                break;
            case "/rqyckfzpjn":
                setCurrentForm(<T2Form />);
                break;
              case "/mwzspvqvva":
                setCurrentForm(<T3Form />);
                break;
            case "/lgrpyjbylo":
                setCurrentForm(<T4Form />);
                break;
            default:
                setCurrentForm(null);
        }
    }, [location.pathname]);

    const handleAgreeChange = () => {
        setAgreed(!agreed);
    };

    const handleProceed = () => {
        if (agreed) {
            setShowConsent(false);
        }
    };

    return (
        <>
            {showConsent && (
                <div className="parent-container">
                    <div className="consent-overlay">
                        <div className="consent-container">
                            <h1 style={{ textAlign: "center" }}>Examining the Interaction Effect of Language and Racial Categorization on Emotion Perception</h1>
                            <h2>Consent Form</h2>

                            <p>
                                <b>Purpose:</b> This study aims to examine how language and racial categorization influence emotion perception.<br></br>
                                <b>Procedure:</b> You will be shown images and asked to identify emotions based on your perception.<br></br>
                                <b>Duration:</b> The study will take approximately 2-5 minutes.
                            </p>

                            <h2>Confidentiality & Data Protection</h2>
                            <p>
                                In compliance with the <b>Data Privacy Act of 2012 (Republic Act No. 10173)</b> of the Philippines, we ensure that:
                                <li>All responses and demographic information collected will be <b>strictly confidential</b> and used <b>solely for research purposes</b>.</li>
                                <li>Your data will be <b>securely stored</b> and will not be shared with unauthorized parties.</li>
                                <li>Participation is <b>voluntary</b>, and you may withdraw at any time without any consequences.</li>
                            </p>

                            <div className="checkbox-container">
                                <label>
                                    <input type="checkbox" checked={agreed} onChange={handleAgreeChange} />
                                    I agree to participate in this study.
                                </label>
                            </div>

                            <button className="proceed-button" onClick={handleProceed} disabled={!agreed}>
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!showConsent && currentForm}
        </>
    );
};

export default ConsentForm;
