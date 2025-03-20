import React, { useState, useEffect } from "react";
import './form.css';
import { db, collection, addDoc, getDocs, query, where, updateDoc, doc, increment, getDoc, setDoc } from "../firebase";

const questionData = [
  { questionId: 1, src: "/images/local1.jpg", correctAnswer: "Happiness" },
  { questionId: 2, src: "/images/local2.jpg", correctAnswer: "Disgust" },
  { questionId: 3, src: "/images/local3.jpg", correctAnswer: "Surprised" },
  { questionId: 4, src: "/images/local4.jpg", correctAnswer: "Fear" },
  { questionId: 5, src: "/images/local5.jpg", correctAnswer: "Anger" },
  { questionId: 6, src: "/images/local6.jpg", correctAnswer: "Surprised" },
  { questionId: 7, src: "/images/local7.jpg", correctAnswer: "Sadness" },
  { questionId: 8, src: "/images/local8.jpg", correctAnswer: "Sadness" },
  { questionId: 9, src: "/images/local9.jpg", correctAnswer: "Disgust" },
  { questionId: 10, src: "/images/local10.jpg", correctAnswer: "Happiness" },
  { questionId: 11, src: "/images/local11.jpg", correctAnswer: "Fear" },
  { questionId: 12, src: "/images/local12.jpg", correctAnswer: "Anger" },
];

const T3Form = () => {
  const [step, setStep] = useState(1);
  const [isDisabled, setIsDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

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
    treatmentlevel: "T3",
  });

  useEffect(() => {
    const checkLimit = async () => {
      const q = query(collection(db, "formResponses"), where("treatmentlevel", "==", "T3"));
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
      if (!formData.responses[step - 2]?.response) {
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
    const finalData = {
      ...formData,
      scores: formData.responses.map(({ questionId, response }) => {
        const correctAnswer = questionData.find(q => q.questionId === questionId)?.correctAnswer || "";
        return response.trim().toLowerCase() === correctAnswer.toLowerCase() ? 1 : 0;
      }),
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
            <h2>What do you think this person is feeling?</h2>
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
    </div >
  );
};

export default T3Form;
