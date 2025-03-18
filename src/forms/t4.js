import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './form.css';
import { db, collection, addDoc, getDocs, query, where, updateDoc, doc, increment, getDoc, setDoc } from "../firebase";

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
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isDisabled, setIsDisabled] = useState(false);

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
    treatmentlevel: "T4",
  });

  useEffect(() => {
    const checkLimit = async () => {
      const q = query(collection(db, "formResponses"), where("treatmentlevel", "==", "T4"));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.size >= 45) {
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
              <h2>Tell us about yourself first.</h2>

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
                  I am a bona fide BSU student
                </label>
              </div>

              <div>
                <label>
                  <input type="checkbox" name="firstyear" checked={formData.firstyear} onChange={handleChange} required />
                  I am a first-year student
                </label>
              </div>

              {formData.firstyear && (
                <div>
                  <label>Select your section:</label>
                  <select name="section" value={formData.section} onChange={handleChange} required>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
              )}

              <div>
                <label>
                  <input type="checkbox" name="canunderstandandread" checked={formData.canunderstandandread} onChange={handleChange} required />
                  I can understand and read English and Filipino on a basic level
                </label>
              </div>

              <button className="step-1-next" onClick={nextStep}>Next</button>
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

export default T4Form;
