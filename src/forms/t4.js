import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './form.css';
import { db, collection, addDoc, getDocs, query, where } from "../firebase";
import { Groq } from "groq-sdk";

const questionChoices = [
  "Happiness", "Sadness", "Surprised", "Anger", "Fear", "Disgust"
];

const questionData = [
  { questionId: 1, src: "/images/foreign1.jpg", correctAnswer: "Happiness" },
  { questionId: 2, src: "/images/foreign2.jpg", correctAnswer: "Sadness" },
  { questionId: 3, src: "/images/foreign3.jpg", correctAnswer: "Surprised" },
  { questionId: 4, src: "/images/foreign4.jpg", correctAnswer: "Anger" },
  { questionId: 5, src: "/images/foreign5.jpg", correctAnswer: "Fear" },
  { questionId: 6, src: "/images/foreign6.jpg", correctAnswer: "Disgust" },
  { questionId: 7, src: "/images/foreign7.jpg", correctAnswer: "Happiness" },
  { questionId: 8, src: "/images/foreign8.jpg", correctAnswer: "Sadness" },
  { questionId: 9, src: "/images/foreign9.jpg", correctAnswer: "Surprised" },
  { questionId: 10, src: "/images/foreign10.jpg", correctAnswer: "Anger" },
  { questionId: 11, src: "/images/foreign11.jpg", correctAnswer: "Fear" },
  { questionId: 12, src: "/images/foreign12.jpg", correctAnswer: "Disgust" },
];

const shuffleArray = (array) => {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const T4Form = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "18",
    firstyear: false,
    section: "A",
    bsustudent: false,
    canunderstandandread: false,
    responses: shuffledQuestions.slice(1, 12).map((q) => ({
      questionId: q.questionId,
      response: q.questionId,
    })),
    treatmentlevel: "T4",
  });

  useEffect(() => {
    const shuffled = shuffleArray(questionData);
    setShuffledQuestions(shuffled);
  }, []);

  useEffect(() => {
    if (shuffledQuestions.length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        responses: shuffledQuestions.map((q) => ({
          questionId: q.questionId,
          response: "",
        })),
      }));
    }
  }, [shuffledQuestions]);

  useEffect(() => {
    const shuffled = shuffleArray(questionData).map((q) => ({
      ...q,
      options: getChoicesForQuestion(q.correctAnswer),
    }));
    setShuffledQuestions(shuffled);
  }, []);

  const getChoicesForQuestion = (correctAnswer) => {
    let choices = shuffleArray(
      [correctAnswer, ...questionChoices.filter(choice => choice !== correctAnswer)].slice(0, 3)
    );
    return shuffleArray(choices);
  };

  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const checkLimit = async () => {
      const q = query(collection(db, "formResponses"), where("treatmentlevel", "==", "T2"));
      const querySnapshot = await getDocs(q);

      console.log(querySnapshot.size);
      if (querySnapshot.size >= 45) {
        setIsDisabled(true);
      }
    };

    checkLimit();
  }, []);

  useEffect(() => {
    if (step === shuffledQuestions.length + 2) {
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

      if (!updatedResponses[index]) {
        updatedResponses[index] = { questionId: shuffledQuestions[index]?.questionId || "", response: "" };
      }

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

      console.log(formData);

      console.log("Demographic Data Submitted:", {
        name: formData.name,
        email: formData.email,
        age: formData.age,
        firstyear: formData.firstyear,
        section: formData.section,
        bsustudent: formData.bsustudent,
        canunderstandandread: formData.canunderstandandread,
      });
    } else if (step > 1 && step <= shuffledQuestions.length + 1) {
      if (!formData.responses[step - 2]?.response) {
        alert("Please provide a response before proceeding.");
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    console.log("Final Data:", formData);

    const finalData = {
      ...formData,
      scores: formData.responses.map(({ questionId, response }) => {
        const correctAnswer = questionData.find(q => q.questionId === questionId)?.correctAnswer || "";
        return response.trim().toLowerCase() === correctAnswer.toLowerCase() ? 1 : 0;
      }),
    };

    try {
      await addDoc(collection(db, "formResponses"), finalData);
      console.log("Form submitted successfully.");
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

              <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />

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

              <button onClick={nextStep}>Next</button>
            </div>
          )}

        {step > 1 && step <= shuffledQuestions.length + 1 && (
          <div>
            <h2>What emotion best describes the person in the picture?</h2>
            <img src={shuffledQuestions[step - 2]?.src} alt={`Question ${step - 1}`} width="250" />
            {shuffledQuestions[step - 2]?.options.map((option, i) => (
              <div key={i} className="response-options">
                <label>
                  <input
                    type="radio"
                    name={`question-${step - 2}`}
                    value={option}
                    checked={formData.responses[step - 2]?.response === option}
                    onChange={(e) => handleResponseChange(step - 2, e.target.value)}
                  />
                  {option}
                </label>
              </div>
            ))}
            <div className="response-buttons">
              {step > 2 && <button onClick={prevStep}>Back</button>}
              <button onClick={nextStep}>{step === shuffledQuestions.length + 1 ? "Submit" : "Next"}</button>
            </div>
          </div>
        )}

        {step === shuffledQuestions.length + 2 && (
          <>
            <h2 style={{ marginBottom: "0" }}>Thank you!</h2>
            <p style={{ textAlign: "center", marginBottom: "10px" }}>Your response have been submitted.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default T4Form;
