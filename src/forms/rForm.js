import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { dotSpinner } from 'ldrs';

dotSpinner.register();

const RForm = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFormCountsAndNavigate = async () => {
      try {
        const formCountRef = doc(db, "analytics", "formCount");
        const formCountSnap = await getDoc(formCountRef);

        if (formCountSnap.exists()) {
          const formCounts = formCountSnap.data();
          const forms = [];

          if (formCounts.T1 < 32) forms.push("/fyhczhbuwq");
          if (formCounts.T2 < 32) forms.push("/rqyckfzpjn");
          if (formCounts.T3 < 32) forms.push("/mwzspvqvva");
          if (formCounts.T4 < 32) forms.push("/lgrpyjbylo");

          if (forms.length > 0) {
            const randomForm = forms[Math.floor(Math.random() * forms.length)];
            navigate(randomForm);
          } else {
            console.error("All forms have reached the limit of 32.");
            navigate("/");
          }
        } else {
          console.error("Form count data does not exist in Firebase.");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching form counts:", error);
        navigate("/");
      }
    };

    fetchFormCountsAndNavigate();
  }, [navigate]);

  return <>
    <div className="loading-spinner">
      <l-dot-spinner size="70" speed="0.7" color="black" />
      <p>Loading...</p>
    </div >
  </>;
};

export default RForm;