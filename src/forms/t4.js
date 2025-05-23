import React, { useState, useEffect } from "react";
import './form.css';
import { db, collection, addDoc, getDocs, query, where, updateDoc, doc, increment, getDoc, setDoc } from "../firebase";
import Courses from "./courses";
import { useLocation } from "react-router-dom";

const questionData = [
  { questionId: 1, src: "/images/foreign1.jpg", correctAnswer: "Happiness" },
  { questionId: 2, src: "/images/foreign2.jpg", correctAnswer: "Disgust" },
  { questionId: 3, src: "/images/foreign3.jpg", correctAnswer: "Surprised" },
  { questionId: 4, src: "/images/foreign4.jpg", correctAnswer: "Fear" },
  { questionId: 5, src: "/images/foreign5.jpg", correctAnswer: "Anger" },
  { questionId: 6, src: "/images/foreign6.jpg", correctAnswer: "Surprised" },
  { questionId: 7, src: "/images/foreign7.jpg", correctAnswer: "Sadness" },
  { questionId: 8, src: "/images/foreign8.jpg", correctAnswer: "Sadness" },
  { questionId: 9, src: "/images/foreign9.jpg", correctAnswer: "Disgust" },
  { questionId: 10, src: "/images/foreign10.jpg", correctAnswer: "Happiness" },
  { questionId: 11, src: "/images/foreign11.jpg", correctAnswer: "Fear" },
  { questionId: 12, src: "/images/foreign12.jpg", correctAnswer: "Anger" },
];

const T4Form = () => {
  const location = useLocation();
  const sessionId = location.state?.sessionId || null;
  const [haveSubmitted, setHaveSubmitted] = useState(false);
  const [isIncompleteSubmission, setIsIncompleteSubmission] = useState(false);
  const [step, setStep] = useState(1);
  const [isDisabled, setIsDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(360);

  useEffect(() => {
    let submitted;
    if (localStorage.getItem("submitted") === "incomplete") {
      setIsIncompleteSubmission(true);
    }
    if (localStorage.getItem("submitted") === "true") {
      submitted = true;
    }
    setHaveSubmitted(submitted);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "18",
    bsustudent: false,
    yearLevel: "",
    course: "",
    section: "",
    canunderstandandread: false,
    responses: questionData.map((q) => ({
      questionId: q.questionId,
      response: "",
    })),
    treatmentlevel: "T4",
  });

  useEffect(() => {
    const checkLimit = async () => {
      const q = query(collection(db, "formResponses"), where("treatmentlevel", "==", "T4"));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.size >= 32) {
        setIsDisabled(true);
      }
    };

    checkLimit();
  }, []);

  useEffect(() => {
    if (step === questionData.length + 2) {
      handleSubmit();
    }
  }, [step]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleResponseChange = (index, value) => {
    setFormData((prevData) => {
      const updatedResponses = [...prevData.responses];
      updatedResponses[index].response = value;
      return { ...prevData, responses: updatedResponses };
    });
  };

  const nextStep = async () => {
    if (step === 1) {
      if (
        !formData.name.trim() ||
        !formData.email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ||
        formData.age === "" ||
        !formData.bsustudent ||
        !formData.canunderstandandread ||
        !formData.yearLevel ||
        !formData.course ||
        !formData.section.trim()
      ) {
        alert("Please fill in all required fields before proceeding.");
        return;
      }

      setFormData((prevData) => ({
        ...prevData,
      }));

      if (sessionId) {
        try {
          const notificationsRef = doc(db, "analytics", "notifications");
          await updateDoc(notificationsRef, {
            [`${sessionId}.name`]: formData.name.trim()
          });
          console.log("Name successfully sent to Firestore.");
        } catch (error) {
          console.error("Error sending name to Firestore:", error);
        }
      }

    } else if (step > 1 && step <= questionData.length + 1) {
      if (!formData.responses[step - 2]?.response) {
        alert("Please provide a response before proceeding.");
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  useEffect(() => {
    let timer;

    if (step >= 2 && step <= questionData.length + 1) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            markIncompleteSubmission();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    if (step === questionData.length + 2) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [step]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const markIncompleteSubmission = async () => {
    try {
      const respondentsRef = doc(db, "analytics", "respondents");
      const notificationsRef = doc(db, "analytics", "notifications");
      const formCountRef = doc(db, "analytics", "formCount");
      const respondentsSnap = await getDoc(respondentsRef);
      const currentRespondents = respondentsSnap.exists() ? respondentsSnap.data().list || {} : {};

      const respondentId = Object.keys(currentRespondents).find(id =>
        currentRespondents[id].name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        currentRespondents[id].section === formData.section
      );

      if (respondentId) {
        currentRespondents[respondentId].status = "Incomplete submission";
        await setDoc(respondentsRef, { list: currentRespondents }, { merge: true });
      }

      const notificationId = `submission_${Date.now()}`;
      const platform = navigator.userAgentData?.platform || navigator.userAgent;
      await setDoc(
        notificationsRef,
        {
          [notificationId]: {
            message: `Did not finish in time answering ${formData.treatmentlevel}`,
            timestamp: new Date().toISOString(),
            name: formData.name.trim(),
            browser: navigator.userAgent,
            platform: platform,
            relatedId: sessionId,
          }
        },
        { merge: true }
      );

      localStorage.setItem("submitted", "incomplete");
      window.location.href = "/time-up";
    } catch (error) {
      console.error("Error marking incomplete submission:", error);
    }
  };

  const handleSubmit = async () => {
    const treatmentField = formData.treatmentlevel;

    const finalData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      section: formData.section.trim(),
      scores: formData.responses.map(({ questionId, response }) => {
        const correctAnswer = questionData.find(q => q.questionId === questionId)?.correctAnswer || "";
        return response.trim().toLowerCase() === correctAnswer.toLowerCase() ? 1 : 0;
      }),
      submittedAt: new Date().toISOString(),
    };

    try {
      const respondentsRef = doc(db, "analytics", "respondents");
      const notificationsRef = doc(db, "analytics", "notifications");
      const formCountRef = doc(db, "analytics", "formCount");
      const respondentsSnap = await getDoc(respondentsRef);
      const currentRespondents = respondentsSnap.exists() ? respondentsSnap.data().list || {} : {};

      const respondentId = Object.keys(currentRespondents).find(id =>
        currentRespondents[id].name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        currentRespondents[id].course === formData.course &&
        currentRespondents[id].yearLevel === formData.yearLevel &&
        currentRespondents[id].section === formData.section
      );

      if (respondentId) {
        if (currentRespondents[respondentId].status === "Submitted") {

          const analyticsRef = doc(db, "analytics", "formCount");
          await updateDoc(analyticsRef, {
            [treatmentField]: increment(-1)
          });

          localStorage.setItem("submitted", true);
          window.location.href = "/already-submitted";
          return;
        } else {
          currentRespondents[respondentId].status = "Submitted";
          currentRespondents[respondentId].treatmentLevel = formData.treatmentlevel;
          await setDoc(respondentsRef, { list: currentRespondents }, { merge: true });
        }
      } else {
        const newId = `resp_${Date.now()}`;
        const updatedRespondents = {
          ...currentRespondents,
          [newId]: { name: formData.name, course: formData.course, yearLevel: formData.yearLevel, section: formData.section, treatmentLevel: treatmentField, status: "Submitted" },
        };

        await setDoc(respondentsRef, { list: updatedRespondents }, { merge: true });

        const notificationId = `submission_${Date.now()}`;
        const platform = navigator.userAgentData?.platform || navigator.userAgent;
        await setDoc(
          notificationsRef,
          {
            [notificationId]: {
              message: `Finished answering ${formData.treatmentlevel}`,
              timestamp: new Date().toISOString(),
              name: formData.name.trim(),
              browser: navigator.userAgent,
              platform: platform,
              relatedId: sessionId,
            }
          },
          { merge: true }
        );
      }

      await updateDoc(formCountRef, {
        [treatmentField]: increment(1),
      });

      await addDoc(collection(db, "formResponses"), finalData);
      localStorage.setItem("submitted", true);

    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit the form. Please try again.");
    }
  };

  if (haveSubmitted) {
    return (
      <div className="parent-form-container">
        <div className="container">
          <h2 style={{ marginBottom: "0" }}>Sorry!</h2>
          <p style={{ textAlign: "center", marginBottom: "10px" }}>You have already submitted your response.</p>
        </div>
      </div>
    );
  };

  if (isIncompleteSubmission) {
    return (
      <div className="parent-form-container">
        <div className="container">
          <h2 style={{ marginBottom: "0" }}>Sorry!</h2>
          <p style={{ textAlign: "center", marginBottom: "10px" }}>You had an incomplete submission. You can't submit a response anymore.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-form-container">
      <div className="container">
        {isDisabled ? (
          <p>Sorry, this form is already maxed out.</p>
        )
          :
          step === 1 && (
            <div>
              <h2>Tell us about yourself first</h2>

              <label>Full name (SURNAME, First Name M.I.)</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              <label>Age</label>
              <select name="age" value={formData.age} onChange={handleChange} required>
                {[...Array(8)].map((_, i) => (
                  <option key={i} value={18 + i}>
                    {18 + i}
                  </option>
                ))}
              </select>

              <div>
                <label>
                  <input type="checkbox" name="bsustudent" checked={formData.bsustudent} onChange={handleChange} required />
                  I am a bona fide student of Bulacan State University
                </label>
              </div>

              {formData.bsustudent && (
                <>
                  <div>
                    <label>Select your college:</label>
                    <select name="college" value={formData.college || ""} onChange={handleChange} required>
                      <option value="" disabled>Select college</option>
                      {Courses.map(({ college }) => (
                        <option key={college} value={college}>
                          {college}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.college && (
                    <div>
                      <label>Select your program:</label>
                      <select
                        name="course"
                        value={formData.course || ""}
                        onChange={handleChange}
                        required
                        disabled={!formData.college}
                      >
                        <option value="" disabled>Select program</option>
                        {Courses.find(({ college }) => college === formData.college)?.courses.map(({ name, code }) => (
                          <option key={code} value={code}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.course && (
                    <div>
                      <label>Select your year level:</label>
                      <select
                        name="yearLevel"
                        value={formData.yearLevel || ""}
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

                  {formData.course && (
                    <div>
                      <label>Enter your section:</label>
                      <div style={{ display: "flex", alignItems: "center", verticalAlign: "middle" }}>
                        <input type="text" value={formData.yearLevel} disabled style={{ width: "37px", textAlign: "right" }}></input>
                        <input
                          type="text"
                          name="section"
                          disabled={formData.yearLevel === ""}
                          value={formData.section || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              section: e.target.value.toUpperCase(),
                            })
                          }
                          maxLength={8}
                          required
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <label>
                  <input type="checkbox" name="canunderstandandread" checked={formData.canunderstandandread} onChange={handleChange} required />
                  I can read and understand English and Filipino at a basic level
                </label>
              </div>

              <button className="step-1-next" onClick={nextStep}>Next</button>
            </div>
          )}

        {step >= 2 && step <= questionData.length + 1 && (
          <div>
            <p style={{ color: timeLeft <= 60 ? "red" : "black", textAlign: "end" }}>
              Please complete under {formatTime(timeLeft)}
            </p>
          </div>
        )}

        {step > 1 && step <= questionData.length + 1 && (
          <div>
            <h2>{step - 1}. What do you think this person is feeling?</h2>
            <img src={questionData[step - 2]?.src} alt={`Question ${step - 1}`} width="250" />

            <div className="choices-grid">
              <div className="choice-row">
                <label className="choice-option">
                  <input
                    type="radio"
                    name={`question-${step - 2}`}
                    value="Anger"
                    checked={formData.responses[step - 2]?.response === "Anger"}
                    onChange={(e) => handleResponseChange(step - 2, e.target.value)}
                  />
                  Anger
                </label>
                <label className="choice-option">
                  <input
                    type="radio"
                    name={`question-${step - 2}`}
                    value="Happiness"
                    checked={formData.responses[step - 2]?.response === "Happiness"}
                    onChange={(e) => handleResponseChange(step - 2, e.target.value)}
                  />
                  Happiness
                </label>
              </div>
              <div className="choice-row">
                <label className="choice-option">
                  <input
                    type="radio"
                    name={`question-${step - 2}`}
                    value="Disgust"
                    checked={formData.responses[step - 2]?.response === "Disgust"}
                    onChange={(e) => handleResponseChange(step - 2, e.target.value)}
                  />
                  Disgust
                </label>
                <label className="choice-option">
                  <input
                    type="radio"
                    name={`question-${step - 2}`}
                    value="Sadness"
                    checked={formData.responses[step - 2]?.response === "Sadness"}
                    onChange={(e) => handleResponseChange(step - 2, e.target.value)}
                  />
                  Sadness
                </label>
              </div>
              <div className="choice-row">
                <label className="choice-option">
                  <input
                    type="radio"
                    name={`question-${step - 2}`}
                    value="Fear"
                    checked={formData.responses[step - 2]?.response === "Fear"}
                    onChange={(e) => handleResponseChange(step - 2, e.target.value)}
                  />
                  Fear
                </label>
                <label className="choice-option">
                  <input
                    type="radio"
                    name={`question-${step - 2}`}
                    value="Surprised"
                    checked={formData.responses[step - 2]?.response === "Surprised"}
                    onChange={(e) => handleResponseChange(step - 2, e.target.value)}
                  />
                  Surprised
                </label>
              </div>
            </div>

            <div className="response-buttons">
              <button onClick={nextStep}>{step === questionData.length + 1 ? "Submit" : "Next"}</button>
            </div>
          </div>
        )}

        {step === questionData.length + 2 && (
          <>
            <h2 style={{ marginBottom: "0" }}>Thank you!</h2>
            <p style={{ textAlign: "center", marginBottom: "10px" }}>Your response have been submitted. You may now close this tab.</p>
          </>
        )}
      </div>
    </div >
  );
};

export default T4Form;
