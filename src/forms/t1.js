import React, { useState, useEffect } from "react";
import './form.css';
import { db, collection, addDoc, getDocs, query, where, updateDoc, doc, increment, getDoc, setDoc } from "../firebase";
import { Groq } from "groq-sdk";
import answerGroups from "./answerGroups";

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
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(10);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "18",
    firstyear: false,
    section: "A",
    bsustudent: false,
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
    if (scoreFromGroup !== null) return scoreFromGroup;

    const apiKey = process.env.REACT_APP_GROQ_API_KEY;
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a grading assistant evaluating a user's response based on similarity to expected answers. 
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
  };

  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const checkLimit = async () => {
      const q = query(collection(db, "formResponses"), where("treatmentlevel", "==", "T1"));
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
    setFormData((prevData) => ({
      ...prevData,
      responses: prevData.responses.map((resp, i) =>
        i === index ? { ...resp, response: value } : resp
      ),
    }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (
        !formData.name.trim() ||
        !formData.email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ||
        formData.age === "" ||
        !formData.bsustudent ||
        !formData.canunderstandandread ||
        !formData.firstyear
      ) {
        alert("Please fill in all required fields before proceeding.");
        return;
      }

      setFormData((prevData) => ({
        ...prevData,
        section: prevData.firstyear ? prevData.section : "N/A",
      }));

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
    if (step >= 2) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            markIncompleteSubmission();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
  
      return () => clearInterval(timer);
    }
  }, [step]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const checkAnswerGroup = (userResponse, answerGroup) => {
    if (!userResponse || !answerGroup || !answerGroups[answerGroup]) return 0;

    const { exact, related, unrelated } = answerGroups[answerGroup];

    const normalizedResponse = userResponse.toLowerCase();

    if (exact.some(ans => ans.toLowerCase() === normalizedResponse)) return 1.0;
    if (related.some(ans => ans.toLowerCase() === normalizedResponse)) return 0.5;
    if (unrelated.some(ans => ans.toLowerCase() === normalizedResponse)) return 0;

    return null;
  };

  const markIncompleteSubmission = async () => {
    try {
      const respondentsRef = doc(db, "analytics", "respondents");
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
        return fetchAIResponse(response, answerGroup);
      })
    );

    const finalData = {
      ...formData,
      responses: structuredResponses,
      scores
    };

    try {
      await addDoc(collection(db, "formResponses"), finalData);
      const analyticsRef = doc(db, "analytics", "formCount");
      const treatmentField = formData.treatmentlevel;
      await updateDoc(analyticsRef, {
        [treatmentField]: increment(1)
      });

      const respondentsRef = doc(db, "analytics", "respondents");
      const respondentsSnap = await getDoc(respondentsRef);
      const currentRespondents = respondentsSnap.exists() ? respondentsSnap.data().list || {} : {};

      const respondentId = Object.keys(currentRespondents).find(id =>
        currentRespondents[id].name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        currentRespondents[id].section === formData.section
      );

      if (respondentId) {
        currentRespondents[respondentId].status = "Submitted";
        currentRespondents[respondentId].treatmentLevel = treatmentField;
        await setDoc(respondentsRef, { list: currentRespondents }, { merge: true });
      } else {
        const newId = `resp_${Date.now()}`;
        const updatedRespondents = {
          ...currentRespondents,
          [newId]: { name: formData.name, section: formData.section, treatmentLevel: treatmentField, status: "Submitted" },
        };

        await setDoc(respondentsRef, { list: updatedRespondents }, { merge: true });
      }

    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit the form. Please try again.");
    }
  };

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

              <div>
                <label>
                  <input type="checkbox" name="firstyear" checked={formData.firstyear} onChange={handleChange} required />
                  I am a first-year Psychology student
                </label>
              </div>

              {formData.firstyear && (
                <div>
                  <label>Select your section:</label>
                  <select name="section" value={formData.section} onChange={handleChange} required>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
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
            <input
              type="text"
              placeholder="Your response"
              value={formData.responses[step - 2]?.response || ""}
              onChange={(e) => handleResponseChange(step - 2, e.target.value)}
            />
            <div className="response-buttons">
              {step > 2 && <button onClick={prevStep}>Back</button>}
              <button onClick={nextStep}>{step === questionData.length + 1 ? "Submit" : "Next"}</button>
            </div>
          </div>
        )}

        {step === questionData.length + 2 && (
          <>
            <h2 style={{ marginBottom: "0" }}>Thank you!</h2>
            <p style={{ textAlign: "center", marginBottom: "10px" }}>Your response have been submitted.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default T1Form;
