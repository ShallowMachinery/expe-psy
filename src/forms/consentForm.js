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
                            <h2>Informed Consent Form</h2>

                            <p>
                                A pleasant day!<br></br><br></br>

                                We, the 2nd year students of Bachelor of Science in Psychology (BSP 2E) from College of Social Sciences and Philosophy (CSSP) of Bulacan State University-Main Campus, are conducting a research study which aims to observe how participants' emotion perception can be affected by the context of language and racial categorization. With these, we kindly request your time and participation in order to help the researchers in conducting the experiment mentioned. We would need approximately 180 first-year psychology students to participate and perform in this experiment. You will be instructed by the researchers to answer the provided form containing the questionnaire, that will last for approximately thirty to forty minutes to complete.<br></br><br></br>

                                Take note that your participation is entirely voluntary and if you agree to these terms, please click the button below. However, if you wish to quit during the experiment, have the right to withdraw anytime. The researchers ensure that the experiment involves minimal risk, and the magnitude of harm or discomfort anticipated is not significantly greater than those ordinarily encountered in daily life. Still, should you choose not to participate or choose to withdraw, be informed that this will have no repercussions on your academic and extracurricular engagements.<br></br><br></br>

                                The data that will be collected in this form is password-protected, therefore, only the researchers have the login credentials to access these. Rest assured that your responses and all of the data that you will input in this form will remain confidential and are protected by the rules and regulations of the Republic Act 10173 or the Data Privacy Act of 2012.<br></br><br></br>

                                Additionally, any data that will be collected from you will be strictly confidential and will only be shared with the course instructor. No identifiable information about you will be shared as all data collected from you is completely anonymous. Furthermore, data collected from all of the participants will only be used for research purposes only, and will be deleted once the semester has ended.<br></br><br></br>

                                We extend our heartfelt appreciation for your participation. In return, the researchers will give a little token of appreciation after the experiment. Rest assured that everything stated in this letter will be strictly followed and adhered to.<br></br><br></br>

                                Should you have any questions, you may contact the researchers with the information provided below:
                            </p>

                            <div className="contact-persons">
                                <div className="contact-persons-left">
                                    <div className="contact-person">
                                        <p className="contact-person-name">
                                            Janelle D. Barayoga
                                        </p>
                                        <p className="contact-person-email">
                                            <a href="mailto:barayogajanelle@gmail.com">barayogajanelle@gmail.com</a>
                                        </p>
                                    </div>
                                    <div className="contact-person">
                                        <p className="contact-person-name">
                                            Althea Lyn G. Calalang
                                        </p>
                                        <p className="contact-person-email">
                                            <a href="mailto:altheacalalang@gmail.com">altheacalalang@gmail.com</a>
                                        </p>
                                    </div>
                                    <div className="contact-person">
                                        <p className="contact-person-name">
                                            Majandra B. Cerillo
                                        </p>
                                        <p className="contact-person-email">
                                            <a href="mailto:mmevangelista324@gmail.com">mmevangelista324@gmail.com</a>
                                        </p>
                                    </div>
                                    <div className="contact-person">
                                        <p className="contact-person-name">
                                            Janna Diana Marie S. Con-ui
                                        </p>
                                        <p className="contact-person-email">
                                            <a href="mailto:jannadianemarie2005@gmail.com">jannadianemarie2005@gmail.com</a>
                                        </p>
                                    </div>
                                    <div className="contact-person">
                                        <p className="contact-person-name">
                                            Norielyn D.G. de Leon
                                        </p>
                                        <p className="contact-person-email">
                                            <a href="mailto:deleonnorielyn28@gmail.com">deleonnorielyn28@gmail.com</a>
                                        </p>
                                    </div>
                                </div>
                                <div className="contact-persons-right">
                                    <div className="contact-person">
                                        <p className="contact-person-name">
                                            Faith Bernadette G. Jimenez
                                        </p>
                                        <p className="contact-person-email">
                                            <a href="mailto:faithjimenez722@gmail.com">faithjimenez722@gmail.com</a>
                                        </p>
                                    </div>
                                    <div className="contact-person">
                                        <p className="contact-person-name">
                                            Rhizziel Avril L. Principe
                                        </p>
                                        <p className="contact-person-email">
                                            <a href="mailto:rhizzielprincipe2@gmail.com">rhizzielprincipe2@gmail.com</a>
                                        </p>
                                    </div>
                                    <div className="contact-person">
                                        <p className="contact-person-name">
                                            Franzchesca Marie B. Reyes
                                        </p>
                                        <p className="contact-person-email">
                                            <a href="mailto:franzchescareyes0203@gmail.com">franzchescareyes0203@gmail.com</a>
                                        </p>
                                    </div>
                                    <div className="contact-person">
                                        <p className="contact-person-name">
                                            Sophia Michaella R. Valdez
                                        </p>
                                        <p className="contact-person-email">
                                            <a href="mailto:michaellasophia96@gmail.com">michaellasophia96@gmail.com</a>
                                        </p>
                                    </div>
                                </div>
                            </div>

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
