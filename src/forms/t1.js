import React, { useState, useEffect } from "react";
import './form.css';
import { db, collection, addDoc, getDocs, query, where, updateDoc, doc, increment, getDoc, setDoc } from "../firebase";
import { Groq } from "groq-sdk";
import Courses from "./courses";
import answerGroups from "./answerGroups";
import stringSimilarity from "string-similarity";
import { useLocation } from "react-router-dom";

const questionData = [
  { questionId: 1, src: "/images/local1.jpg", answerGroup: "Happiness" },
  { questionId: 2, src: "/images/local2.jpg", answerGroup: "Disgust" },
  { questionId: 3, src: "/images/local3.jpg", answerGroup: "Surprise" },
  { questionId: 4, src: "/images/local4.jpg", answerGroup: "Fear" },
  { questionId: 5, src: "/images/local5.jpg", answerGroup: "Anger" },
  { questionId: 6, src: "/images/local6.jpg", answerGroup: "Surprise" },
  { questionId: 7, src: "/images/local7.jpg", answerGroup: "Sadness" },
  { questionId: 8, src: "/images/local8.jpg", answerGroup: "Sadness" },
  { questionId: 9, src: "/images/local9.jpg", answerGroup: "Disgust" },
  { questionId: 10, src: "/images/local10.jpg", answerGroup: "Happiness" },
  { questionId: 11, src: "/images/local11.jpg", answerGroup: "Fear" },
  { questionId: 12, src: "/images/local12.jpg", answerGroup: "Anger" },
];

const T1Form = () => {
  const location = useLocation();
  const sessionId = location.state?.sessionId || null;
  const [haveSubmitted, setHaveSubmitted] = useState(false);
  const [isIncompleteSubmission, setIsIncompleteSubmission] = useState(false);
  const [step, setStep] = useState(1);
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
    treatmentlevel: "T1",
  });

  const fetchAIResponse = async (userAnswer, answerGroup) => {
    if (!userAnswer || !answerGroup) return 0;

    const scoreFromGroup = checkAnswerGroup(userAnswer, answerGroup);
    if (scoreFromGroup === 0 || scoreFromGroup === null) {
      const apiKey = process.env.REACT_APP_GROQ_API_KEY;
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

      try {
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are a grading assistant evaluating a user's response based on similarity to expected answers. If the user's response appears to be a **typographical error** of a term found in the expected answers, treat it as a close match and assign an appropriate score from three options: **1.0**, **0.5**, or **0.0**.
          - Assign **1.0** if the answer is an **exact match** (not case-sensitive), a **translation** (English/Filipino, note that expected answers compared to the user's response in a different tense should be treated as the same), or very closely similar to the expected answers.
          - Assign **0.5** based on **semantic similarity, synonyms, or contextual relevance**.  
          - Assign **0.0** if the answer is **unrelated** or has no meaningful connection.  
          - Return only a **single number between 0 and 1** (no explanations or text).`,
            },
            { role: "user", content: `User's answer: "${userAnswer}", Expected answers/category: "${answerGroups}"` },
          ],
        });
        return parseFloat(completion.choices[0]?.message?.content || "0");
      } catch (error) {
        console.error("Error fetching AI response:", error);
        return 0;
      }
    }
    return (scoreFromGroup !== null) ? scoreFromGroup : 0;
  };

  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const checkLimit = async () => {
      try {
        const q = query(collection(db, "formResponses"), where("treatmentlevel", "==", "T1"));
        const querySnapshot = await getDocs(q);
    
        if (querySnapshot.size >= 32) {
          setIsDisabled(true);
        }
      } catch (error) {
        console.error("Error checking form limit:", error);
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
    setFormData((prevData) => ({
      ...prevData,
      responses: prevData.responses.map((resp, i) =>
        i === index ? { ...resp, response: value } : resp
      ),
    }));
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
      if (!formData.responses[step - 2]?.response.trim()) {
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

  const checkAnswerGroup = (userResponse, answerGroup) => {
    if (!userResponse || !answerGroup || !answerGroups[answerGroup]) return 0;

    const { exact, related, unrelated } = answerGroups[answerGroup];
    const normalizedResponse = userResponse.toLowerCase().trim();

    if (exact.some(ans => ans.toLowerCase() === normalizedResponse)) return 1.0;
    if (related.some(ans => ans.toLowerCase() === normalizedResponse)) return 0.5;

    const allAnswers = [...exact, ...related];
    const bestMatch = stringSimilarity.findBestMatch(normalizedResponse, allAnswers);
    if (bestMatch.bestMatch.rating >= 0.8) {
      return bestMatch.bestMatch.rating >= 0.9 ? 1.0 : 0.5;
    }

    if (unrelated.some(ans => ans.toLowerCase() === normalizedResponse)) return 0;

    return null;
  };

  const markIncompleteSubmission = async () => {
    try {
      const respondentsRef = doc(db, "analytics", "respondents");
      const notificationsRef = doc(db, "analytics", "notifications");
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
            message: `Did not finish in time`,
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
    const structuredResponses = formData.responses.reduce((acc, { questionId, response }) => {
      acc[questionId] = response;
      return acc;
    }, {});

    const scores = await Promise.all(
      formData.responses.map(({ response }, index) => {
        const answerGroup = questionData[index].answerGroup;
        const AIResponse = fetchAIResponse(response, answerGroup);
        return AIResponse;
      })
    );

    const treatmentField = formData.treatmentlevel;

    const finalData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      section: formData.section.trim(),
      responses: structuredResponses,
      scores,
      submittedAt: new Date().toISOString(),
    };

    try {
      const respondentsRef = doc(db, "analytics", "respondents");
      const notificationsRef = doc(db, "analytics", "notifications");
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
          localStorage.removeItem("assignedForm");

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

      await addDoc(collection(db, "formResponses"), finalData);
      localStorage.removeItem("assignedForm");
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
            <p style={{ textAlign: "center", marginTop: "5px" }}>Reminder: Please avoid typographical errors.</p>
          </div>
        )}

        {step > 1 && step <= questionData.length + 1 && (
          <div>
            <h2>{step - 1}. What do you think this person is feeling?</h2>
            <img src={questionData[step - 2]?.src} alt={`Question ${step - 1}`} width="250" />
            <input
              type="text"
              placeholder="Your response"
              value={formData.responses[step - 2]?.response || ""}
              onChange={(e) => handleResponseChange(step - 2, e.target.value)}
            />
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
    </div>
  );
};

export default T1Form;
